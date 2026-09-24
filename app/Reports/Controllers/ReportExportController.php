<?php

namespace App\Reports\Controllers;

use App\Exports\ReportArrayExport;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Application\AccountingReportService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    public function __construct(private readonly AccountingReportService $accountingReports)
    {
    }

    public function export(Request $request, string $report, string $format)
    {
        abort_unless(in_array($format, ['pdf', 'xlsx', 'csv'], true), 404);
        $permission = in_array($report, [
            'trial-balance',
            'general-ledger',
            'profit-loss',
            'balance-sheet',
            'cash-flow',
            'shareholders-equity',
        ], true) ? 'accounting.reports.view' : ($report === 'account-statement' ? 'financial.accounts.view' : 'financial.reports.view');
        abort_unless($request->user()?->hasPermission($permission), 403);

        [$title, $headings, $rows] = $this->reportData($request, $report);
        $purpose = $this->purpose($report);
        $summary = $this->summary($report, $rows);
        $filename = str($report)->slug('_') . '_' . now()->format('Ymd_His');
        $organization = $request->attributes->get('active_organization');
        $organizationAddress = $organization->full_address;
        $organizationContact = collect([$organization->phone, $organization->email])
            ->filter()
            ->implode(' | ');
        $organizationInfo = collect([$organizationAddress, $organizationContact])
            ->filter()
            ->implode(' | ');
        $organizationLogoPath = $organization->logo_path
            ? Storage::disk('public')->path($organization->logo_path)
            : null;
        $orientation = in_array($report, [
            'trial-balance',
            'profit-loss',
            'balance-sheet',
            'cash-flow',
            'product-summary',
        ], true) ? 'portrait' : 'landscape';

        return match ($format) {
            'pdf' => Pdf::loadView("reports.exports.{$report}", [
                'title' => $title,
                'purpose' => $purpose,
                'headings' => $headings,
                'rows' => $rows,
                'summary' => $summary,
                'organizationName' => $organization->name,
                'organizationAddress' => $organizationAddress,
                'organizationContact' => $organizationContact,
                'organizationLogoPath' => $organizationLogoPath,
                'organizationFooter' => $organization->report_footer,
                'generatedAt' => now()->format('Y-m-d H:i'),
                'filters' => $this->filterSummary($request, (int) $organization->id),
                'pageNumberX' => $orientation === 'portrait' ? 540 : 760,
            ])->setPaper('a4', $orientation)->download($filename . '.pdf'),
            'xlsx' => Excel::download(new ReportArrayExport($title, $organization->name, $organizationInfo, $headings, $rows), $filename . '.xlsx'),
            default => $this->csv($filename, $title, $organization->name, $organizationInfo, $headings, $rows),
        };
    }

    private function reportData(Request $request, string $report): array
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $periodId = $request->integer('fiscal_period_id') ?: null;
        $from = $request->input('from');
        $to = $request->input('to');

        return match ($report) {
            'trial-balance' => [
                'Trial Balance',
                ['Account Code', 'Account', 'Type', 'Debit', 'Credit', 'Balance'],
                $this->accountingReports->trialBalance($organizationId, $periodId, $from, $to)
                    ->map(fn($row) => [$row->code, $row->name, $row->type, $row->debit, $row->credit, $row->balance])->all(),
            ],
            'general-ledger' => $this->generalLedger($request, $organizationId, $periodId, $from, $to),
            'profit-loss' => $this->profitAndLoss($organizationId, $periodId, $from, $to),
            'balance-sheet' => $this->balanceSheet($organizationId, $periodId, $from, $to),
            'cash-flow' => [
                'Cash Flow Statement',
                ['Category', 'Period', 'Net Cash'],
                $this->accountingReports->cashFlowStatement($organizationId, $periodId, $from, $to)
                    ->map(fn($row) => [$row->cash_category, $row->period_name ?? '-', $row->net_cash])->all(),
            ],
            'shareholders-equity' => [
                "Shareholders' Equity",
                ['Account Code', 'Account', 'Period', 'Opening Balance', 'Net Profit', 'Ending Balance'],
                $this->accountingReports->shareholdersEquity($organizationId, $periodId, $from, $to)
                    ->map(fn($row) => [$row->account_code ?? '-', $row->account_name ?? '-', $row->period_name ?? '-', $row->opening_balance, $row->net_profit, $row->ending_balance])->all(),
            ],
            'product-summary' => [
                'Product Summary',
                ['Code', 'Product', 'Category', 'Accounts', 'Balance'],
                FinancialProduct::where('organization_id', $organizationId)->withCount('financialAccounts')->withSum('financialAccounts', 'balance')->orderBy('category')->get()
                    ->map(fn($row) => [$row->code, $row->name, $row->category, $row->financial_accounts_count, $row->financial_accounts_sum_balance ?? 0])->all(),
            ],
            'account-balances' => [
                'Account Balances',
                ['Account', 'Product', 'Type', 'Status', 'Balance', 'Available Balance'],
                FinancialAccount::where('organization_id', $organizationId)
                    ->when($request->integer('product_id') > 0, fn($query) => $query->where('financial_product_id', $request->integer('product_id')))
                    ->with('product')->orderByDesc('balance')->get()
                    ->map(fn($row) => [$row->account_no, $row->product?->name ?? $row->account_type, $row->account_type, $row->status, $row->balance, $row->available_balance])->all(),
            ],
            'transactions' => [
                'Financial Transactions',
                ['Number', 'Account', 'Date', 'Type', 'Amount', 'Status'],
                FinancialTransaction::where('organization_id', $organizationId)
                    ->when(in_array($request->string('status')->toString(), ['PENDING', 'POSTED', 'REVERSED', 'CANCELLED'], true), fn($query) => $query->where('status', $request->string('status')->toString()))
                    ->with('entries.financialAccount')->latest('transaction_date')->get()
                    ->map(fn($row) => [$row->transaction_no, $row->entries->pluck('financialAccount.account_no')->filter()->join(', ') ?: '-', $row->transaction_date, $row->transaction_type, $row->amount, $row->status])->all(),
            ],
            'account-statement' => $this->accountStatement($request, $organizationId),
            default => abort(404),
        };
    }

    private function purpose(string $report): string
    {
        return match ($report) {
            'trial-balance' => 'Control report for validating debit and credit equality across the ledger.',
            'general-ledger' => 'Chronological account activity with running balances for audit and reconciliation.',
            'profit-loss' => 'Income and expense performance for the selected accounting period.',
            'balance-sheet' => 'Financial position showing assets, liabilities, and equity.',
            'cash-flow' => 'Cash movement grouped into operating, investing, financing, and other activity.',
            'shareholders-equity' => 'Movement from opening equity through profit to ending equity.',
            'product-summary' => 'Financial product coverage, account volume, and aggregate balances.',
            'account-balances' => 'Current and available balances across financial accounts.',
            'transactions' => 'Operational financial transactions across the organization.',
            'account-statement' => 'Period-specific activity statement for one financial account.',
            default => 'Operational report.',
        };
    }

    private function summary(string $report, array $rows): array
    {
        $sum = fn(int $index): float => array_sum(array_map(fn($row) => (float) ($row[$index] ?? 0), $rows));

        return match ($report) {
            'trial-balance' => [
                ['label' => 'Total Debit', 'value' => number_format($sum(3), 2)],
                ['label' => 'Total Credit', 'value' => number_format($sum(4), 2)],
                ['label' => 'Difference', 'value' => number_format($sum(3) - $sum(4), 2)],
            ],
            'profit-loss' => [
                ['label' => 'Income', 'value' => number_format($this->categoryTotal($rows, 'INCOME', 2), 2)],
                ['label' => 'Expenses', 'value' => number_format($this->categoryTotal($rows, 'EXPENSE', 2), 2)],
                ['label' => 'Net Result', 'value' => number_format($this->categoryTotal($rows, 'INCOME', 2) - $this->categoryTotal($rows, 'EXPENSE', 2), 2)],
            ],
            'balance-sheet' => [
                ['label' => 'Assets', 'value' => number_format($this->categoryTotal($rows, 'ASSET', 2), 2)],
                ['label' => 'Liabilities', 'value' => number_format($this->categoryTotal($rows, 'LIABILITY', 2), 2)],
                ['label' => 'Equity', 'value' => number_format($this->categoryTotal($rows, 'EQUITY', 2), 2)],
            ],
            'general-ledger' => [
                ['label' => 'Debit', 'value' => number_format($sum(4), 2)],
                ['label' => 'Credit', 'value' => number_format($sum(5), 2)],
                ['label' => 'Closing Balance', 'value' => number_format((float) (($rows[count($rows) - 1][6] ?? 0)), 2)],
            ],
            'cash-flow' => [['label' => 'Net Cash Movement', 'value' => number_format($sum(2), 2)], ['label' => 'Categories', 'value' => count($rows)]],
            'shareholders-equity' => [
                ['label' => 'Opening Equity', 'value' => number_format($sum(3), 2)],
                ['label' => 'Net Profit', 'value' => number_format($sum(4), 2)],
                ['label' => 'Ending Equity', 'value' => number_format($sum(5), 2)],
            ],
            'product-summary' => [['label' => 'Products', 'value' => count($rows)], ['label' => 'Accounts', 'value' => number_format($sum(3), 0)], ['label' => 'Balance', 'value' => number_format($sum(4), 2)]],
            'account-balances' => [['label' => 'Accounts', 'value' => count($rows)], ['label' => 'Balance', 'value' => number_format($sum(4), 2)], ['label' => 'Available', 'value' => number_format($sum(5), 2)]],
            'transactions' => [['label' => 'Transactions', 'value' => count($rows)], ['label' => 'Total Amount', 'value' => number_format($sum(4), 2)]],
            'account-statement' => [['label' => 'Transactions', 'value' => count($rows)], ['label' => 'Debit', 'value' => number_format($sum(3), 2)], ['label' => 'Credit', 'value' => number_format($sum(4), 2)]],
            default => [],
        };
    }

    private function categoryTotal(array $rows, string $category, int $valueIndex): float
    {
        return array_sum(array_map(
            fn($row) => ($row[0] ?? '') === $category ? (float) ($row[$valueIndex] ?? 0) : 0,
            $rows,
        ));
    }
    private function generalLedger(Request $request, int $organizationId, ?int $periodId, mixed $from, mixed $to): array
    {
        $account = LedgerAccount::where('organization_id', $organizationId)
            ->where('status', true)
            ->when($request->integer('account_id') > 0, fn($query) => $query->whereKey($request->integer('account_id')))
            ->orderBy('code')
            ->first();
        if (!$account) {
            return ['General Ledger', ['Date', 'Voucher', 'Type', 'Description', 'Debit', 'Credit', 'Running Balance'], []];
        }
        return [
            "General Ledger: {$account->code} - {$account->name}",
            ['Date', 'Voucher', 'Type', 'Description', 'Debit', 'Credit', 'Running Balance'],
            $this->accountingReports->generalLedger($organizationId, $account->id, $periodId, $from, $to)
                ->map(fn($row) => [$row->voucher_date, $row->voucher_no, $row->voucher_type, $row->entry_description ?? '-', $row->debit, $row->credit, $row->running_balance])->all(),
        ];
    }

    private function profitAndLoss(int $organizationId, ?int $periodId, mixed $from, mixed $to): array
    {
        $data = $this->accountingReports->profitAndLoss($organizationId, $periodId, $from, $to);
        return [
            'Profit & Loss',
            ['Category', 'Account', 'Amount'],
            collect($data['income'])->concat($data['expenses'])->map(fn($row) => [$row->type, $row->name, $row->balance])->all(),
        ];
    }

    private function balanceSheet(int $organizationId, ?int $periodId, mixed $from, mixed $to): array
    {
        $data = $this->accountingReports->balanceSheet($organizationId, $periodId, $from, $to);
        return [
            'Balance Sheet',
            ['Category', 'Account', 'Balance'],
            collect($data['assets'])->concat($data['liabilities'])->concat($data['equity'])->map(fn($row) => [$row->type, $row->name, $row->balance])->all(),
        ];
    }

    private function accountStatement(Request $request, int $organizationId): array
    {
        $account = FinancialAccount::where('organization_id', $organizationId)->find($request->integer('account_id'));
        if (!$account) {
            return ['Financial Account Statement', ['Date', 'Transaction', 'Type', 'Debit', 'Credit', 'Status'], []];
        }

        $date = CarbonImmutable::parse($request->input('date', now()->toDateString()));
        $period = $request->string('period')->lower()->value() ?: 'monthly';
        [$start, $end] = match ($period) {
            'quarterly' => [$date->startOfQuarter(), $date->endOfQuarter()],
            'half_yearly' => $date->month <= 6
                ? [$date->startOfYear(), $date->startOfYear()->addMonths(5)->endOfMonth()]
                : [$date->startOfYear()->addMonths(6), $date->endOfYear()],
            'yearly' => [$date->startOfYear(), $date->endOfYear()],
            default => [$date->startOfMonth(), $date->endOfMonth()],
        };

        $rows = $account->transactions()
            ->whereBetween('transaction_date', [$start->startOfDay(), $end->endOfDay()])
            ->with('entries')
            ->latest('transaction_date')
            ->get()
            ->map(fn($transaction) => [
                $transaction->transaction_date,
                $transaction->transaction_no,
                $transaction->transaction_type,
                $transaction->entries->where('direction', 'DEBIT')->sum('amount'),
                $transaction->entries->where('direction', 'CREDIT')->sum('amount'),
                $transaction->status,
            ])->all();

        return ["Financial Account Statement: {$account->account_no}", ['Date', 'Transaction', 'Type', 'Debit', 'Credit', 'Status'], $rows];
    }

    private function csv(
        string $filename,
        string $title,
        string $organizationName,
        string $organizationInfo,
        array $headings,
        array $rows
    ): StreamedResponse {
        return response()->streamDownload(function () use ($title, $organizationName, $organizationInfo, $headings, $rows) {
            $output = fopen('php://output', 'w');

            // UTF-8 BOM for Excel
            fwrite($output, "\xEF\xBB\xBF");

            fputcsv($output, [$organizationName]);

            if ($organizationInfo) {
                fputcsv($output, [$organizationInfo]);
            }

            fputcsv($output, [$title]);

            fputcsv($output, []);

            fputcsv($output, $headings);

            foreach ($rows as $row) {
                fputcsv($output, $row);
            }

            fclose($output);
        }, $filename . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function filterSummary(Request $request, int $organizationId): string
    {
        $fiscalYearId = $request->integer('fiscal_year_id');
        $fiscalPeriodId = $request->integer('fiscal_period_id');
        $fiscalYear = $fiscalYearId
            ? FiscalYear::query()->where('organization_id', $organizationId)->find($fiscalYearId)
            : null;
        $fiscalPeriod = $fiscalPeriodId
            ? FiscalPeriod::query()
                ->whereKey($fiscalPeriodId)
                ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId))
                ->first()
            : null;
        $labels = [
            'fiscal_year_id' => 'Fiscal year',
            'fiscal_period_id' => 'Fiscal period',
            'account_id' => 'Account',
            'status' => 'Status',
            'period' => 'Period',
            'date' => 'Date',
            'from' => 'From',
            'to' => 'To',
        ];

        return collect($request->only(['fiscal_year_id', 'fiscal_period_id', 'account_id', 'status', 'period', 'date', 'from', 'to']))
            ->filter(fn($value) => $value !== null && $value !== '')
            ->map(function ($value, $key) use ($fiscalYearId, $fiscalPeriodId, $fiscalYear, $fiscalPeriod, $labels) {
                $displayValue = match ($key) {
                    'fiscal_year_id' => $fiscalYear?->name ?? $value,
                    'fiscal_period_id' => $fiscalPeriod?->name ?? $value,
                    default => $value,
                };

                return ($labels[$key] ?? $key) . ': ' . $displayValue;
            })
            ->implode(', ');
    }
}
