import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem } from '../../../types';
import { FiscalYear } from '../../../types/accounting';

/* ---------------- Types ---------------- */

type EquityLine = {
    account_code: string;
    account_name: string;
    period_name: string | null;
    opening_balance: number | null;
    net_profit: number | null;
    ending_balance: number | null;
};

interface Props {
    equityStatement: EquityLine[];
    fiscalYears: FiscalYear[];
    selectedFiscalYear?: number;
}

/* ---------------- Page ---------------- */

export default function ShareholdersEquityPage() {
    const { equityStatement, fiscalYears, selectedFiscalYear } = usePage()
        .props as Props;

    const [fiscalYear, setFiscalYear] = useState<number>(
        selectedFiscalYear || 0,
    );

    const fiscalYearCode = fiscalYears.find(
        (fy) => fy.id === Number(fiscalYear),
    )?.code;

    const handleFiscalYearChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const year = Number(e.target.value);
        setFiscalYear(year);
        router.get(
            '/reports/shareholders-equity',
            { fiscal_year_id: year },
            { preserveState: true },
        );
    };

    /* ---------------- Grouping ---------------- */
    // Group by account name (or period_name if you prefer)
    const grouped = useMemo(() => {
        const map: Record<string, EquityLine[]> = {};
        equityStatement.forEach((row) => {
            const key = row.account_name || 'Other';
            if (!map[key]) map[key] = [];
            map[key].push(row);
        });
        return map;
    }, [equityStatement]);

    /* ---------------- Totals ---------------- */
    const groupTotal = (rows: EquityLine[]) => {
        return {
            opening: rows.reduce((sum, r) => sum + (r.opening_balance ?? 0), 0),
            netProfit: rows.reduce((sum, r) => sum + (r.net_profit ?? 0), 0),
            ending: rows.reduce((sum, r) => sum + (r.ending_balance ?? 0), 0),
        };
    };

    const grandTotals = useMemo(() => {
        return equityStatement.reduce(
            (acc, row) => {
                const opening = Number(row.opening_balance ?? 0);
                const netProfit = Number(row.net_profit ?? 0);
                const ending = Number(row.ending_balance ?? 0);

                return {
                    opening: acc.opening + opening,
                    netProfit: acc.netProfit + netProfit,
                    ending: acc.ending + ending,
                };
            },
            { opening: 0, netProfit: 0, ending: 0 },
        );
    }, [equityStatement]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '#' },
        { title: 'Shareholders’ Equity', href: '/reports/shareholders-equity' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Statement of Shareholders’ Equity" />

            <div className="space-y-3 p-2 print:p-4 print:text-black">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <HeadingSmall
                        title="Statement of Shareholders’ Equity"
                        description="Opening Balance + Net Profit = Closing Balance"
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

                        <button
                            onClick={() => window.print()}
                            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                        >
                            Print
                        </button>
                    </div>
                </div>

                {/* Print Header */}
                <div className="hidden text-center print:block">
                    <h1 className="text-xl font-bold">
                        Statement of Shareholders’ Equity
                    </h1>
                    {fiscalYearCode && (
                        <p className="text-sm">Fiscal Year: {fiscalYearCode}</p>
                    )}
                    <p className="text-sm">
                        Opening Balance + Net Profit = Closing Balance
                    </p>
                    <hr className="my-2 border-t border-border" />
                </div>

                {/* Table */}
                <div className="rounded-md border p-2 print:border-none">
                    <table className="w-full border-collapse text-sm print:text-base">
                        <thead>
                            <tr>
                                <th className="border-b px-2 py-1 text-left">
                                    Period
                                </th>
                                <th className="border-b px-2 py-1 text-left">
                                    Equity Account
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Opening Balance
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Net Profit / (Loss)
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Closing Balance
                                </th>
                            </tr>
                        </thead>

                        {Object.entries(grouped).map(([group, rows]) => {
                            const totals = groupTotal(rows);

                            return (
                                <tbody key={group}>
                                    {/* Group Header */}
                                    <tr className="bg-muted font-semibold print:bg-transparent">
                                        <td colSpan={5} className="px-2 py-1">
                                            {group}
                                        </td>
                                    </tr>

                                    {/* Rows */}
                                    {rows.map((row, idx) => (
                                        <tr key={`${group}-${idx}`}>
                                            <td className="border px-2 py-1">
                                                {row.period_name ?? '—'}
                                            </td>
                                            <td className="border px-2 py-1">
                                                {row.account_code} —{' '}
                                                {row.account_name}
                                            </td>
                                            <td className="border px-2 py-1 text-right">
                                                {formatBDTCurrency(
                                                    row.opening_balance ?? 0,
                                                )}
                                            </td>
                                            <td
                                                className={`border px-2 py-1 text-right ${(row.net_profit ?? 0) < 0 ? 'text-red-600' : 'text-green-600'}`}
                                            >
                                                {formatBDTCurrency(
                                                    row.net_profit ?? 0,
                                                )}
                                            </td>
                                            <td className="border px-2 py-1 text-right font-semibold">
                                                {formatBDTCurrency(
                                                    row.ending_balance ?? 0,
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Group Total */}
                                    <tr className="font-bold">
                                        <td className="border px-2 py-1">
                                            Total {group}
                                        </td>
                                        <td className="border px-2 py-1"></td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(totals.opening)}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(
                                                totals.netProfit,
                                            )}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(totals.ending)}
                                        </td>
                                    </tr>
                                </tbody>
                            );
                        })}

                        {/* Grand Total */}
                        <tfoot className="font-bold">
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border px-2 py-1 text-right"
                                >
                                    Grand Total
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotals.opening)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotals.netProfit)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotals.ending)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
