import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem } from '../../../types';
import { FiscalPeriod, FiscalYear } from '../../../types/accounting';

/* ---------------- Types ---------------- */

interface TrialBalanceRow {
    ledger_account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    fiscal_year_id: number;
    fiscal_year_code: string;
    accounting_period_id: number;
    period_name: string;
    total_debit: number;
    total_credit: number;
    balance: number;
}

interface Props {
    trialBalance: TrialBalanceRow[];
    fiscalYears: FiscalYear[];
    fiscalPeriods: FiscalPeriod[];
    selectedFiscalYear?: number;
    selectedFiscalPeriod?: number;
}

/* ---------------- Page ---------------- */

export default function TrialBalancePage() {
    const {
        trialBalance,
        fiscalYears,
        fiscalPeriods,
        selectedFiscalYear,
        selectedFiscalPeriod,
    } = usePage().props as Props;

    const [fiscalYear, setFiscalYear] = useState<number>(
        selectedFiscalYear || 0,
    );
    const [fiscalPeriod, setFiscalPeriod] = useState<number>(
        selectedFiscalPeriod || 0,
    );

    const fiscalYearCode = fiscalYears.find((fy) => fy.id === fiscalYear)?.code;
    const fiscalPeriodName = fiscalPeriods.find(
        (fp) => fp.id === fiscalPeriod,
    )?.period_name;

    /* ---------------- Filter Handlers ---------------- */
    const handleFiscalYearChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const year = Number(e.target.value);
        setFiscalYear(year);
        router.get(
            '/reports/trial-balance',
            { fiscal_year_id: year, accounting_period_id: fiscalPeriod },
            { preserveState: true },
        );
    };

    const handleFiscalPeriodChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const period = Number(e.target.value);
        setFiscalPeriod(period);
        router.get(
            '/reports/trial-balance',
            { fiscal_year_id: fiscalYear, accounting_period_id: period },
            { preserveState: true },
        );
    };

    /* ---------------- Grouping & Totals ---------------- */
    // Optional: group by account_type
    const grouped = useMemo(() => {
        const map: Record<string, TrialBalanceRow[]> = {};
        trialBalance.forEach((row) => {
            const key = row.account_type || 'Other';
            if (!map[key]) map[key] = [];
            map[key].push(row);
        });
        return map;
    }, [trialBalance]);

    const groupTotal = (rows: TrialBalanceRow[]) => ({
        totalDebit: rows.reduce((sum, r) => sum + Number(r.total_debit), 0),
        totalCredit: rows.reduce((sum, r) => sum + Number(r.total_credit), 0),
        balance: rows.reduce((sum, r) => sum + Number(r.balance), 0),
    });

    const grandTotals = useMemo(() => {
        return trialBalance.reduce(
            (acc, row) => ({
                totalDebit: acc.totalDebit + Number(row.total_debit),
                totalCredit: acc.totalCredit + Number(row.total_credit),
                balance: acc.balance + Number(row.balance),
            }),
            { totalDebit: 0, totalCredit: 0, balance: 0 },
        );
    }, [trialBalance]);

    /* ---------------- Breadcrumbs ---------------- */
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title: 'Trial Balance', href: '/reports/trial-balance' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Trial Balance" />

            <div className="space-y-3 p-2 print:p-4 print:text-black">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <HeadingSmall
                        title="Trial Balance"
                        description="Debit, Credit & Balance Summary"
                    />

                    <div className="flex items-center gap-2">
                        <Select
                            value={fiscalYear}
                            onChange={handleFiscalYearChange}
                            className="rounded border px-2 py-1 text-sm"
                            options={fiscalYears.map((fy) => ({
                                value: fy.id.toString(),
                                label: fy.code,
                            }))}
                        />

                        <Select
                            value={fiscalPeriod}
                            onChange={handleFiscalPeriodChange}
                            className="rounded border px-2 py-1 text-sm"
                            options={fiscalPeriods.map((fp) => ({
                                value: fp.id.toString(),
                                label: fp.period_name,
                            }))}
                        />

                        <button
                            onClick={() => window.print()}
                            className="hover:bg-primary/80 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                        >
                            Print
                        </button>
                    </div>
                </div>

                {/* Print Header */}
                <div className="hidden text-center print:block">
                    <h1 className="text-xl font-bold">Trial Balance</h1>
                    {fiscalYearCode && (
                        <p className="text-sm">Fiscal Year: {fiscalYearCode}</p>
                    )}
                    {fiscalPeriodName && (
                        <p className="text-sm">Period: {fiscalPeriodName}</p>
                    )}
                    <hr className="my-2 border-t" />
                </div>

                {/* Table */}
                <div className="rounded-md border p-2 print:border-none">
                    <table className="w-full border-collapse text-sm print:text-base">
                        <thead>
                            <tr>
                                <th className="border-b px-2 py-1 text-left">
                                    Account
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Debit
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Credit
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Balance
                                </th>
                            </tr>
                        </thead>

                        {Object.entries(grouped).map(([group, rows]) => {
                            const totals = groupTotal(rows);

                            return (
                                <tbody key={group}>
                                    {/* Group Header */}
                                    <tr className="bg-muted font-semibold print:bg-transparent">
                                        <td colSpan={4} className="px-2 py-1">
                                            {group}
                                        </td>
                                    </tr>

                                    {/* Rows */}
                                    {rows.map((row, idx) => (
                                        <tr key={`${group}-${idx}`}>
                                            <td className="border px-2 py-1">
                                                {row.account_code} —{' '}
                                                {row.account_name}
                                            </td>
                                            <td className="border px-2 py-1 text-right">
                                                {formatBDTCurrency(
                                                    row.total_debit,
                                                )}
                                            </td>
                                            <td className="border px-2 py-1 text-right">
                                                {formatBDTCurrency(
                                                    row.total_credit,
                                                )}
                                            </td>
                                            <td className="border px-2 py-1 text-right">
                                                {formatBDTCurrency(row.balance)}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Group Total */}
                                    <tr className="font-bold">
                                        <td className="border px-2 py-1">
                                            Total {group}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(
                                                totals.totalDebit,
                                            )}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(
                                                totals.totalCredit,
                                            )}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(totals.balance)}
                                        </td>
                                    </tr>
                                </tbody>
                            );
                        })}

                        {/* Grand Total */}
                        <tfoot className="font-bold">
                            <tr>
                                <td className="border px-2 py-1 text-right">
                                    Grand Total
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotals.totalDebit)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotals.totalCredit)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotals.balance)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
