<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\GeneralAccounting\Application\Contracts\VoucherRepositoryInterface;
use InvalidArgumentException;
use RuntimeException;

class OpeningBalanceService
{
    public function __construct(
        private readonly VoucherRepositoryInterface $voucherRepository,
        private readonly VoucherService $voucherService,
    ) {
    }

    public function apply(array $entries, int $organizationId, int $userId, int $fiscalPeriodId, ?int $offsetAccountId = null): Voucher
    {
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId))
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

        if (!$offsetAccount) {
            throw new InvalidArgumentException('The offset account is invalid for this organization.');
        }

        $normalized = [];
        $total = 0.0;

        foreach ($entries as $entry) {
            $account = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->find($entry['account_id'] ?? null);

            if (!$account) {
                throw new InvalidArgumentException('Each opening balance entry must reference an active ledger account.');
            }

            $amount = (float) ($entry['amount'] ?? 0);
            if ($amount <= 0) {
                throw new InvalidArgumentException('Opening balance amounts must be greater than zero.');
            }

            $amount = round($amount, 4);
            $total += $amount;
            $normalized[] = [
                'account_id' => $account->id,
                'debit' => $account->normal_balance === 'DEBIT' ? $amount : 0,
                'credit' => $account->normal_balance === 'CREDIT' ? $amount : 0,
                'description' => $entry['description'] ?? 'Opening balance',
            ];
        }

        $openingEntry = [
            'account_id' => $offsetAccount->id,
            'debit' => $offsetAccount->normal_balance === 'DEBIT' ? $total : 0,
            'credit' => $offsetAccount->normal_balance === 'CREDIT' ? $total : 0,
            'description' => 'Opening balance offset',
        ];

        $voucher = $this->voucherService->createDraft([
            'fiscal_period_id' => $period->id,
            'voucher_type' => 'OPENING',
            'voucher_date' => $period->start_date->toDateString(),
            'description' => 'Opening balance',
            'entries' => array_merge($normalized, [$openingEntry]),
        ], $organizationId, $userId);

        return $this->voucherService->post($voucher, $organizationId, $userId);
    }
}
