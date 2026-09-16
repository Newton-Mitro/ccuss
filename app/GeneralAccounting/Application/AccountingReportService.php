<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AccountingReportService
{
    public function trialBalance(
        int $organizationId,
        ?int $fiscalPeriodId = null,
        ?string $from = null,
        ?string $to = null,
    ): Collection {
        $this->validatePeriod($organizationId, $fiscalPeriodId);
        $entries = $this->postedEntries($organizationId, $fiscalPeriodId, $from, $to)
            ->select(
                'voucher_entries.account_id',
                DB::raw('SUM(voucher_entries.debit) as debit'),
                DB::raw('SUM(voucher_entries.credit) as credit'),
            )
            ->groupBy('voucher_entries.account_id');

        return DB::table('accounts')
            ->leftJoinSub($entries, 'posted_entries', 'posted_entries.account_id', '=', 'accounts.id')
            ->where('accounts.organization_id', $organizationId)
            ->where('accounts.status', true)
            ->orderBy('accounts.code')
            ->get([
                'accounts.id',
                'accounts.code',
                'accounts.name',
                'accounts.type',
                'accounts.normal_balance',
                DB::raw('COALESCE(posted_entries.debit, 0) as debit'),
                DB::raw('COALESCE(posted_entries.credit, 0) as credit'),
            ])
            ->map(function ($row) {
                $row->debit = (float) $row->debit;
                $row->credit = (float) $row->credit;
                $row->balance = $row->normal_balance === 'DEBIT'
                    ? $row->debit - $row->credit
                    : $row->credit - $row->debit;

                return $row;
            });
    }

    public function generalLedger(
        int $organizationId,
        int $accountId,
        ?int $fiscalPeriodId = null,
        ?string $from = null,
        ?string $to = null,
    ): Collection {
        $account = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($accountId);
        $this->validatePeriod($organizationId, $fiscalPeriodId);

        $balance = 0.0;

        return $this->postedEntries($organizationId, $fiscalPeriodId, $from, $to)
            ->where('voucher_entries.account_id', $account->id)
            ->join('accounts', 'accounts.id', '=', 'voucher_entries.account_id')
            ->orderBy('vouchers.voucher_date')
            ->orderBy('vouchers.id')
            ->orderBy('voucher_entries.line_no')
            ->get([
                'voucher_entries.id',
                'voucher_entries.debit',
                'voucher_entries.credit',
                'voucher_entries.description as entry_description',
                'vouchers.voucher_no',
                'vouchers.voucher_type',
                'vouchers.voucher_date',
                'vouchers.description as voucher_description',
            ])
            ->map(function ($row) use (&$balance, $account) {
                $row->debit = (float) $row->debit;
                $row->credit = (float) $row->credit;
                $balance += $account->normal_balance === 'DEBIT'
                    ? $row->debit - $row->credit
                    : $row->credit - $row->debit;
                $row->running_balance = $balance;

                return $row;
            });
    }

    public function profitAndLoss(
        int $organizationId,
        ?int $fiscalPeriodId = null,
        ?string $from = null,
        ?string $to = null,
    ): array {
        $rows = $this->trialBalance($organizationId, $fiscalPeriodId, $from, $to);
        $income = $rows->where('type', 'INCOME')->values();
        $expenses = $rows->where('type', 'EXPENSE')->values();
        $totalIncome = $income->sum(fn($row) => (float) $row->balance);
        $totalExpenses = $expenses->sum(fn($row) => (float) $row->balance);

        return [
            'income' => $income,
            'expenses' => $expenses,
            'total_income' => (float) $totalIncome,
            'total_expenses' => (float) $totalExpenses,
            'net_income' => (float) ($totalIncome - $totalExpenses),
        ];
    }

    public function balanceSheet(
        int $organizationId,
        ?int $fiscalPeriodId = null,
        ?string $from = null,
        ?string $to = null,
    ): array {
        $rows = $this->trialBalance($organizationId, $fiscalPeriodId, $from, $to);
        $assets = $rows->where('type', 'ASSET')->values();
        $liabilities = $rows->where('type', 'LIABILITY')->values();
        $equity = $rows->where('type', 'EQUITY')->values();
        $income = $rows->where('type', 'INCOME')->sum(fn($row) => (float) $row->balance);
        $expenses = $rows->where('type', 'EXPENSE')->sum(fn($row) => (float) $row->balance);
        $netIncome = $income - $expenses;
        $totalAssets = $assets->sum(fn($row) => (float) $row->balance);
        $totalLiabilities = $liabilities->sum(fn($row) => (float) $row->balance);
        $totalEquity = $equity->sum(fn($row) => (float) $row->balance);

        return [
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $equity,
            'net_income' => (float) $netIncome,
            'total_assets' => (float) $totalAssets,
            'total_liabilities' => (float) $totalLiabilities,
            'total_equity' => (float) $totalEquity,
            'total_liabilities_and_equity' => (float) ($totalLiabilities + $totalEquity + $netIncome),
        ];
    }

    public function cashFlowStatement(
        int $organizationId,
        ?int $fiscalPeriodId = null,
        ?string $from = null,
        ?string $to = null,
    ): Collection {
        $this->validatePeriod($organizationId, $fiscalPeriodId);

        $cashAccountIds = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('is_cash_account', true)
            ->pluck('id');

        if ($cashAccountIds->isEmpty()) {
            return collect();
        }

        $rows = DB::table('voucher_entries as ve')
            ->join('vouchers as v', 'v.id', '=', 've.voucher_id')
            ->join('accounts as cash_account', 'cash_account.id', '=', 've.account_id')
            ->where('v.organization_id', $organizationId)
            ->where('v.status', 'POSTED')
            ->whereIn('ve.account_id', $cashAccountIds)
            ->when($fiscalPeriodId, fn($query) => $query->where('v.fiscal_period_id', $fiscalPeriodId))
            ->when($from, fn($query) => $query->whereDate('v.voucher_date', '>=', $from))
            ->when($to, fn($query) => $query->whereDate('v.voucher_date', '<=', $to))
            ->select(
                'v.id as voucher_id',
                'v.voucher_no',
                'v.voucher_date',
                'v.fiscal_period_id',
                've.debit as cash_debit',
                've.credit as cash_credit',
            )
            ->get();

        $periods = FiscalPeriod::query()
            ->whereIn('id', $rows->pluck('fiscal_period_id')->unique()->filter())
            ->with('fiscalYear')
            ->get()
            ->keyBy('id');

        $statement = collect();

        foreach ($rows as $row) {
            $voucherEntries = DB::table('voucher_entries as ve_other')
                ->join('accounts as a', 'a.id', '=', 've_other.account_id')
                ->where('ve_other.voucher_id', $row->voucher_id)
                ->where('ve_other.account_id', '!=', $row->account_id ?? $cashAccountIds->first())
                ->select('a.type')
                ->pluck('type');

            $category = 'Other';
            if ($voucherEntries->contains('INCOME') || $voucherEntries->contains('EXPENSE')) {
                $category = 'Operating';
            } elseif ($voucherEntries->contains('LIABILITY') || $voucherEntries->contains('EQUITY')) {
                $category = 'Financing';
            } elseif ($voucherEntries->contains('ASSET')) {
                $category = 'Investing';
            }

            $netCash = (float) $row->cash_debit - (float) $row->cash_credit;

            $statement->push((object) [
                'voucher_no' => $row->voucher_no,
                'period_name' => $periods[$row->fiscal_period_id]->name ?? null,
                'cash_category' => $category,
                'net_cash' => $netCash,
            ]);
        }

        $ordered = $statement
            ->groupBy('cash_category')
            ->map(fn($items) => (object) [
                'cash_category' => $items->first()->cash_category,
                'period_name' => $items->first()->period_name,
                'net_cash' => $items->sum('net_cash'),
            ])
            ->values();

        $order = ['Operating', 'Investing', 'Financing', 'Other'];

        return $ordered->sortBy(fn($item) => array_search($item->cash_category, $order, true) === false ? 99 : array_search($item->cash_category, $order, true))->values();
    }

    public function shareholdersEquity(
        int $organizationId,
        ?int $fiscalPeriodId = null,
        ?string $from = null,
        ?string $to = null,
    ): Collection {
        $this->validatePeriod($organizationId, $fiscalPeriodId);

        $period = $fiscalPeriodId ? FiscalPeriod::query()->findOrFail($fiscalPeriodId) : null;
        $profit = $this->profitAndLoss($organizationId, $fiscalPeriodId, $from, $to);

        $rows = $this->postedEntries($organizationId, $fiscalPeriodId, $from, $to)
            ->join('accounts', 'accounts.id', '=', 'voucher_entries.account_id')
            ->where('accounts.type', 'EQUITY')
            ->select(
                'accounts.id',
                'accounts.code as account_code',
                'accounts.name as account_name',
                DB::raw('SUM(voucher_entries.credit - voucher_entries.debit) as ending_balance'),
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name')
            ->get();

        return $rows->map(fn($row) => (object) [
            'account_code' => $row->account_code,
            'account_name' => $row->account_name,
            'period_name' => $period?->name,
            'opening_balance' => 0.0,
            'net_profit' => (float) $profit['net_income'],
            'ending_balance' => (float) $row->ending_balance,
        ]);
    }

    private function postedEntries(int $organizationId, ?int $fiscalPeriodId, ?string $from, ?string $to)
    {
        return DB::table('voucher_entries')
            ->join('vouchers', 'vouchers.id', '=', 'voucher_entries.voucher_id')
            ->where('vouchers.organization_id', $organizationId)
            ->where('vouchers.status', 'POSTED')
            ->when($fiscalPeriodId, fn($query) => $query->where('vouchers.fiscal_period_id', $fiscalPeriodId))
            ->when($from, fn($query) => $query->whereDate('vouchers.voucher_date', '>=', $from))
            ->when($to, fn($query) => $query->whereDate('vouchers.voucher_date', '<=', $to));
    }

    private function validatePeriod(int $organizationId, ?int $fiscalPeriodId): void
    {
        if ($fiscalPeriodId === null) {
            return;
        }

        if (
            !FiscalPeriod::query()
                ->whereKey($fiscalPeriodId)
                ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId))
                ->exists()
        ) {
            throw new InvalidArgumentException('The fiscal period is invalid for this organization.');
        }
    }
}
