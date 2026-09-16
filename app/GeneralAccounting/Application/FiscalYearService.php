<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\FiscalYearRepositoryInterface;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class FiscalYearService
{
    public function __construct(
        private readonly FiscalYearRepositoryInterface $fiscalYearRepository,
    ) {
    }

    public function create(array $data): FiscalYear
    {
        $this->validateDateRange($data);

        $organizationId = (int) $data['organization_id'];
        if ($this->fiscalYearRepository->overlaps($organizationId, $data['start_date'], $data['end_date'])) {
            throw new RuntimeException('The fiscal year overlaps an existing fiscal year.');
        }

        return DB::transaction(function () use ($data, $organizationId) {
            if (($data['is_current'] ?? false) === true) {
                FiscalYear::query()
                    ->where('organization_id', $organizationId)
                    ->update(['is_current' => false]);
            }

            return $this->fiscalYearRepository->create($data);
        });
    }

    public function update(FiscalYear $fiscalYear, array $data): FiscalYear
    {
        $this->validateDateRange($data);

        if (
            $this->fiscalYearRepository->overlaps(
                $fiscalYear->organization_id,
                $data['start_date'],
                $data['end_date'],
                $fiscalYear->id,
            )
        ) {
            throw new RuntimeException('The fiscal year overlaps an existing fiscal year.');
        }

        return DB::transaction(function () use ($fiscalYear, $data) {
            if (($data['is_current'] ?? false) === true) {
                FiscalYear::query()
                    ->where('organization_id', $fiscalYear->organization_id)
                    ->where('id', '!=', $fiscalYear->id)
                    ->update(['is_current' => false]);
            }

            return $this->fiscalYearRepository->update($fiscalYear, $data);
        });
    }

    public function delete(FiscalYear $fiscalYear): bool
    {
        if ($fiscalYear->periods()->exists()) {
            throw new RuntimeException('A fiscal year with periods cannot be deleted.');
        }

        return $this->fiscalYearRepository->delete($fiscalYear);
    }

    public function closeYear(FiscalYear $fiscalYear): FiscalYear
    {
        if ($fiscalYear->status === 'CLOSED') {
            throw new RuntimeException('The fiscal year is already closed.');
        }

        if ($fiscalYear->periods()->where('status', '!=', 'CLOSED')->exists()) {
            throw new RuntimeException('all periods must be closed');
        }

        if ($fiscalYear->vouchers()->where('status', 'DRAFT')->exists()) {
            throw new RuntimeException('The fiscal year has draft vouchers that must be resolved first.');
        }

        return DB::transaction(function () use ($fiscalYear) {
            $fiscalYear->update(['status' => 'CLOSED']);

            return $fiscalYear->fresh();
        });
    }

    public function closeYearWithClosingVoucher(
        FiscalYear $fiscalYear,
        int $retainedEarningsAccountId,
        int $userId,
    ): FiscalYear {
        if ($fiscalYear->status === 'CLOSED') {
            throw new RuntimeException('The fiscal year is already closed.');
        }

        $periods = $fiscalYear->periods()->orderBy('start_date')->get();
        $closingPeriod = $periods->last();

        if (!$closingPeriod) {
            throw new RuntimeException('The fiscal year must have a closing period.');
        }

        if ($periods->slice(0, -1)->contains(fn($period) => $period->status !== 'CLOSED')) {
            throw new RuntimeException('All periods before the closing period must be closed.');
        }

        if ($closingPeriod->status !== 'OPEN') {
            throw new RuntimeException('The closing period must be open to post the closing voucher.');
        }

        if ($fiscalYear->vouchers()->where('voucher_type', 'CLOSING')->exists()) {
            throw new RuntimeException('A closing voucher already exists for this fiscal year.');
        }

        $retainedEarningsAccount = \App\GeneralAccounting\Models\LedgerAccount::query()
            ->where('organization_id', $fiscalYear->organization_id)
            ->where('type', 'EQUITY')
            ->where('status', true)
            ->find($retainedEarningsAccountId);

        if (!$retainedEarningsAccount) {
            throw new InvalidArgumentException('The retained earnings account must be an active equity account in this organization.');
        }

        $balances = DB::table('voucher_entries')
            ->join('vouchers', 'vouchers.id', '=', 'voucher_entries.voucher_id')
            ->join('accounts', 'accounts.id', '=', 'voucher_entries.account_id')
            ->where('vouchers.fiscal_year_id', $fiscalYear->id)
            ->where('vouchers.status', 'POSTED')
            ->whereIn('accounts.type', ['INCOME', 'EXPENSE'])
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name')
            ->get([
                'accounts.id',
                'accounts.code',
                'accounts.name',
                DB::raw('SUM(voucher_entries.debit) as debit'),
                DB::raw('SUM(voucher_entries.credit) as credit'),
            ]);

        $entries = [];
        $debitTotal = 0.0;
        $creditTotal = 0.0;

        foreach ($balances as $balance) {
            $netDebit = round((float) $balance->debit - (float) $balance->credit, 4);
            if ($netDebit === 0.0) {
                continue;
            }

            $debit = $netDebit < 0 ? abs($netDebit) : 0;
            $credit = $netDebit > 0 ? $netDebit : 0;
            $debitTotal += $debit;
            $creditTotal += $credit;
            $entries[] = [
                'account_id' => $balance->id,
                'debit' => $debit,
                'credit' => $credit,
                'description' => 'Year-end closing - ' . $balance->code . ' ' . $balance->name,
            ];
        }

        $difference = round($debitTotal - $creditTotal, 4);
        if ($difference > 0) {
            $entries[] = ['account_id' => $retainedEarningsAccount->id, 'debit' => 0, 'credit' => $difference, 'description' => 'Year-end closing retained earnings'];
        } elseif ($difference < 0) {
            $entries[] = ['account_id' => $retainedEarningsAccount->id, 'debit' => abs($difference), 'credit' => 0, 'description' => 'Year-end closing retained earnings'];
        }

        if (count($entries) < 2) {
            throw new RuntimeException('There is no income or expense activity to close for this fiscal year.');
        }

        return DB::transaction(function () use ($fiscalYear, $closingPeriod, $entries, $userId) {
            $voucherService = app(VoucherService::class);
            $closingVoucher = $voucherService->createDraft([
                'fiscal_period_id' => $closingPeriod->id,
                'voucher_type' => 'CLOSING',
                'voucher_date' => $closingPeriod->end_date->toDateString(),
                'description' => 'Year-end closing for ' . $fiscalYear->name,
                'entries' => $entries,
            ], $fiscalYear->organization_id, $userId);
            $voucherService->post($closingVoucher, $fiscalYear->organization_id, $userId);
            $closingPeriod->update(['status' => 'CLOSED']);
            $fiscalYear->update(['status' => 'CLOSED']);

            return $fiscalYear->fresh();
        });
    }

    private function validateDateRange(array $data): void
    {
        if (($data['start_date'] ?? '') >= ($data['end_date'] ?? '')) {
            throw new InvalidArgumentException('The fiscal year end date must be after the start date.');
        }
    }
}
