<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\VoucherRepositoryInterface;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use InvalidArgumentException;
use RuntimeException;

class OpeningBalanceService
{
    public function __construct(
        private readonly VoucherRepositoryInterface $voucherRepository,
        private readonly VoucherService $voucherService,
    ) {}

    public function apply(
        array $entries,
        int $organizationId,
        int $userId,
        int $fiscalPeriodId,
        ?int $offsetAccountId = null,
        ?string $voucherDate = null,
        ?int $financialTransactionId = null,
    ): Voucher {
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $organizationId))
            ->findOrFail($fiscalPeriodId);

        if ($period->status !== 'OPEN') {
            throw new RuntimeException('Opening balances can only be created in an open fiscal period.');
        }

        if ($offsetAccountId === null || $offsetAccountId <= 0) {
            throw new InvalidArgumentException('An offset account is required for opening balances.');
        }

        $offsetAccount = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->find($offsetAccountId);

        if (! $offsetAccount) {
            throw new InvalidArgumentException('The offset account is invalid for this organization.');
        }

        $normalized = [];
        $debitTotal = 0.0;
        $creditTotal = 0.0;

        foreach ($entries as $entry) {
            $account = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->find($entry['account_id'] ?? null);

            if (! $account) {
                throw new InvalidArgumentException('Each opening balance entry must reference an active ledger account.');
            }

            $amount = (float) ($entry['amount'] ?? 0);
            if ($amount <= 0) {
                throw new InvalidArgumentException('Opening balance amounts must be greater than zero.');
            }

            $amount = round($amount, 4);
            $debit = $account->normal_balance === 'DEBIT' ? $amount : 0;
            $credit = $account->normal_balance === 'CREDIT' ? $amount : 0;
            $debitTotal += $debit;
            $creditTotal += $credit;
            $normalized[] = [
                'account_id' => $account->id,
                'debit' => $debit,
                'credit' => $credit,
                'description' => $entry['description'] ?? 'Opening balance',
            ];
        }

        $difference = round($debitTotal - $creditTotal, 4);
        if ($difference !== 0.0) {
            $normalized[] = [
                'account_id' => $offsetAccount->id,
                'debit' => $difference < 0 ? abs($difference) : 0,
                'credit' => $difference > 0 ? $difference : 0,
                'description' => 'Opening balance offset',
            ];
        }

        $voucherDate ??= $period->start_date->toDateString();
        if ($voucherDate < $period->start_date->toDateString() || $voucherDate > $period->end_date->toDateString()) {
            throw new InvalidArgumentException('The opening balance date must be within the selected fiscal period.');
        }

        $voucher = $this->voucherService->createDraft([
            'fiscal_period_id' => $period->id,
            'voucher_type' => 'OPENING',
            'voucher_date' => $voucherDate,
            'description' => 'Opening balance',
            'entries' => $normalized,
        ], $organizationId, $userId);

        if ($financialTransactionId !== null) {
            $voucher->update(['financial_transaction_id' => $financialTransactionId]);
        }

        return $this->voucherService->post($voucher, $organizationId, $userId);
    }
}
