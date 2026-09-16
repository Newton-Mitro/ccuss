<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\VoucherRepositoryInterface;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class VoucherService
{
    private const TYPES = ['JOURNAL', 'PAYMENT', 'RECEIPT', 'CONTRA', 'OPENING', 'ADJUSTMENT', 'CLOSING', 'SYSTEM'];

    public function __construct(
        private readonly VoucherRepositoryInterface $voucherRepository,
    ) {
    }

    public function createDraft(array $data, int $organizationId, int $userId): Voucher
    {
        $this->validateHeader($data, $organizationId);
        $entries = $this->validateEntries($data['entries'] ?? [], $organizationId);
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId))
            ->findOrFail($data['fiscal_period_id']);

        if ($period->status !== 'OPEN') {
            throw new RuntimeException('Vouchers cannot be created in a closed fiscal period.');
        }

        if ($data['voucher_date'] < $period->start_date->toDateString() || $data['voucher_date'] > $period->end_date->toDateString()) {
            throw new InvalidArgumentException('The voucher date must be within the fiscal period.');
        }

        $voucherData = [
            'organization_id' => $organizationId,
            'branch_id' => $data['branch_id'] ?? null,
            'fiscal_year_id' => $period->fiscal_year_id,
            'fiscal_period_id' => $period->id,
            'voucher_no' => $this->voucherRepository->nextNumber($organizationId, $data['voucher_type'], $period->fiscalYear->start_date->year),
            'voucher_type' => $data['voucher_type'],
            'voucher_date' => $data['voucher_date'],
            'description' => $data['description'] ?? null,
            'status' => 'DRAFT',
            'created_by' => $userId,
        ];

        return $this->voucherRepository->createWithEntries($voucherData, $entries);
    }

    public function post(Voucher $voucher, int $organizationId, int $userId): Voucher
    {
        $this->authorizeOrganization($voucher, $organizationId);

        if ($voucher->status !== 'DRAFT') {
            throw new RuntimeException('Only draft vouchers can be posted.');
        }

        if ($voucher->fiscalPeriod->status !== 'OPEN') {
            throw new RuntimeException('Vouchers cannot be posted in a closed fiscal period.');
        }

        $this->validateEntries($voucher->entries->toArray(), $organizationId);

        return $this->voucherRepository->updateStatus($voucher, 'POSTED', $userId);
    }

    public function updateDraft(Voucher $voucher, array $data, int $organizationId): Voucher
    {
        $this->authorizeOrganization($voucher, $organizationId);

        if ($voucher->status !== 'DRAFT') {
            throw new RuntimeException('Only draft vouchers can be edited.');
        }

        $this->validateHeader($data, $organizationId);
        $entries = $this->validateEntries($data['entries'] ?? [], $organizationId);
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId))
            ->findOrFail($data['fiscal_period_id']);

        if ($period->status !== 'OPEN') {
            throw new RuntimeException('Vouchers cannot be edited in a closed fiscal period.');
        }

        if ($data['voucher_date'] < $period->start_date->toDateString() || $data['voucher_date'] > $period->end_date->toDateString()) {
            throw new InvalidArgumentException('The voucher date must be within the fiscal period.');
        }

        return $this->voucherRepository->updateWithEntries($voucher, [
            'branch_id' => $data['branch_id'] ?? null,
            'fiscal_year_id' => $period->fiscal_year_id,
            'fiscal_period_id' => $period->id,
            'voucher_type' => $data['voucher_type'],
            'voucher_date' => $data['voucher_date'],
            'description' => $data['description'] ?? null,
        ], $entries);
    }

    public function cancel(Voucher $voucher, int $organizationId): Voucher
    {
        $this->authorizeOrganization($voucher, $organizationId);

        if ($voucher->status !== 'DRAFT') {
            throw new RuntimeException('Only draft vouchers can be cancelled.');
        }

        return $this->voucherRepository->updateStatus($voucher, 'CANCELLED');
    }

    public function reverse(Voucher $voucher, int $organizationId, int $userId): Voucher
    {
        $this->authorizeOrganization($voucher, $organizationId);

        if ($voucher->status !== 'POSTED') {
            throw new RuntimeException('Only posted vouchers can be reversed.');
        }

        if ($voucher->fiscalPeriod->status !== 'OPEN') {
            throw new RuntimeException('Posted vouchers cannot be reversed in a closed fiscal period.');
        }

        return DB::transaction(function () use ($voucher, $organizationId, $userId) {
            $reversal = $this->createDraft([
                'fiscal_period_id' => $voucher->fiscal_period_id,
                'voucher_type' => 'ADJUSTMENT',
                'voucher_date' => $voucher->voucher_date->toDateString(),
                'description' => 'Reversal of ' . $voucher->voucher_no,
                'entries' => $voucher->entries->map(fn($entry) => [
                    'account_id' => $entry->account_id,
                    'branch_id' => $entry->branch_id,
                    'cost_center_id' => $entry->cost_center_id,
                    'party_type' => $entry->party_type,
                    'party_id' => $entry->party_id,
                    'description' => $entry->description,
                    'debit' => $entry->credit,
                    'credit' => $entry->debit,
                    'reference' => $voucher->voucher_no,
                ])->all(),
            ], $organizationId, $userId);

            $reversal = $this->post($reversal, $organizationId, $userId);
            $this->voucherRepository->updateStatus($voucher, 'REVERSED');

            return $reversal->fresh('entries.account');
        });
    }

    private function validateHeader(array $data, int $organizationId): void
    {
        if (!in_array($data['voucher_type'] ?? null, self::TYPES, true)) {
            throw new InvalidArgumentException('The voucher type is invalid.');
        }

        if (empty($data['fiscal_period_id']) || empty($data['voucher_date'])) {
            throw new InvalidArgumentException('Fiscal period and voucher date are required.');
        }

        if ($organizationId <= 0) {
            throw new InvalidArgumentException('A valid organization is required.');
        }
    }

    private function validateEntries(array $entries, int $organizationId): array
    {
        if (count($entries) < 2) {
            throw new InvalidArgumentException('A voucher must contain at least two entries.');
        }

        $debitTotal = 0.0;
        $creditTotal = 0.0;
        $normalized = [];

        foreach (array_values($entries) as $index => $entry) {
            $debit = round((float) ($entry['debit'] ?? 0), 4);
            $credit = round((float) ($entry['credit'] ?? 0), 4);

            if ($debit < 0 || $credit < 0 || ($debit > 0 && $credit > 0) || ($debit == 0.0 && $credit == 0.0)) {
                throw new InvalidArgumentException('Each voucher entry must have a positive debit or credit, but not both.');
            }

            $account = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->find($entry['account_id'] ?? null);

            if (!$account) {
                throw new InvalidArgumentException('Every voucher entry must reference an active account in the active organization.');
            }

            $debitTotal += $debit;
            $creditTotal += $credit;
            $normalized[] = [
                'account_id' => $account->id,
                'branch_id' => $entry['branch_id'] ?? null,
                'cost_center_id' => $entry['cost_center_id'] ?? null,
                'party_type' => $entry['party_type'] ?? null,
                'party_id' => $entry['party_id'] ?? null,
                'description' => $entry['description'] ?? null,
                'debit' => $debit,
                'credit' => $credit,
                'reference' => $entry['reference'] ?? null,
                'line_no' => $index + 1,
            ];
        }

        if (round($debitTotal, 4) !== round($creditTotal, 4)) {
            throw new InvalidArgumentException('Voucher debit and credit totals must be equal.');
        }

        return $normalized;
    }

    private function authorizeOrganization(Voucher $voucher, int $organizationId): void
    {
        if ($voucher->organization_id !== $organizationId) {
            abort(404);
        }
    }
}
