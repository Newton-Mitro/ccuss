import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem, SharedData } from '../../../types';
import {
    FiscalPeriod,
    FiscalYear,
} from '../../../types/finance_and_accounting';

/* ---------------- Types ---------------- */

interface CashFlowRow {
    fiscal_year_code: string;
    period_name: string;
    cash_category: 'Operating' | 'Investing' | 'Financing' | 'Other';
    net_cash: number;
}

interface Props extends SharedData {
    cashFlows: CashFlowRow[];
    fiscalYears: FiscalYear[];
    fiscalPeriods: FiscalPeriod[];
    selectedFiscalYear?: number;
    selectedFiscalPeriod?: number;
}

/* ---------------- Page ---------------- */

export default function CashFlowStatementPage() {
    const {
        cashFlows,
        fiscalYears,
        fiscalPeriods,
        selectedFiscalYear,
        selectedFiscalPeriod,
    } = usePage<Props>().props;

    // State for filters
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

    // Handle filter changes
    const handleFiscalYearChange = (value) => {
        const year = Number(value);
        setFiscalYear(year);
        router.get(
            '/reports/cash-flow',
            {
                fiscal_year_id: year || undefined,
                fiscal_period_id: fiscalPeriod || undefined,
            },
            { preserveState: false, replace: true },
        );
    };

    const handleFiscalPeriodChange = (value) => {
        const period = Number(value);
        setFiscalPeriod(period);
        router.get(
            '/reports/cash-flow',
            {
                fiscal_year_id: fiscalYear || undefined,
                fiscal_period_id: period || undefined,
            },
            { preserveState: false, replace: true },
        );
    };

    /* ---------------- Grouping & Totals ---------------- */
    const grouped = useMemo(() => {
        const map: Record<string, CashFlowRow[]> = {};
        cashFlows.forEach((row) => {
            if (!map[row.cash_category]) map[row.cash_category] = [];
            map[row.cash_category].push(row);
        });
        return map;
    }, [cashFlows]);

    const categoryTotal = (rows: CashFlowRow[]) =>
        rows.reduce((sum, r) => sum + Number(r.net_cash), 0);

    const grandTotal = useMemo(
        () => cashFlows.reduce((sum, r) => sum + Number(r.net_cash), 0),
        [cashFlows],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '#' },
        { title: 'Cash Flow Statement', href: '/reports/cash-flow' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Flow Statement" />

            <div className="space-y-3 p-2 print:p-4 print:text-black">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <HeadingSmall
                        title="Cash Flow Statement"
                        description="Operating, Investing & Financing Activities"
                    />

                    <div className="flex items-center gap-2">
                        <div className="w-60">
                            <Select
                                value={fiscalYear.toString()}
                                onChange={handleFiscalYearChange}
                                options={fiscalYears.map((fy) => ({
                                    value: fy.id.toString(),
                                    label: fy.code,
                                }))}
                            />
                        </div>

                        <div className="w-60">
                            <Select
                                value={fiscalPeriod.toString()}
                                onChange={handleFiscalPeriodChange}
                                options={[
                                    { value: '0', label: 'All Periods' },
                                    ...fiscalPeriods.map((fp) => ({
                                        value: fp.id.toString(),
                                        label: fp.period_name,
                                    })),
                                ]}
                            />
                        </div>

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
                    <h1 className="text-xl font-bold">Cash Flow Statement</h1>
                    {fiscalYearCode && (
                        <p className="text-sm">Fiscal Year: {fiscalYearCode}</p>
                    )}
                    {fiscalPeriodName && (
                        <p className="text-sm">Period: {fiscalPeriodName}</p>
                    )}
                    <p className="text-sm">
                        Summary of Cash Inflows and Outflows
                    </p>
                    <hr className="my-2 border-t" />
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
                                    Category
                                </th>
                                <th className="border-b px-2 py-1 text-right">
                                    Net Cash
                                </th>
                            </tr>
                        </thead>

                        {Object.entries(grouped).map(([category, rows]) => (
                            <tbody key={category}>
                                {/* Category Header */}
                                <tr className="bg-muted font-semibold print:bg-transparent">
                                    <td colSpan={3} className="px-2 py-1">
                                        {category} Activities
                                    </td>
                                </tr>

                                {/* Rows */}
                                {rows.map((row, idx) => (
                                    <tr key={`${category}-${idx}`}>
                                        <td className="border px-2 py-1">
                                            {row.period_name}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {row.cash_category}
                                        </td>
                                        <td
                                            className={`border px-2 py-1 text-right ${
                                                row.net_cash < 0
                                                    ? 'text-destructive'
                                                    : ''
                                            }`}
                                        >
                                            {formatBDTCurrency(
                                                Number(row.net_cash),
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Category Total */}
                                <tr className="font-bold">
                                    <td
                                        colSpan={2}
                                        className="border px-2 py-1 text-right"
                                    >
                                        Net Cash from {category}
                                    </td>
                                    <td className="border px-2 py-1 text-right">
                                        {formatBDTCurrency(categoryTotal(rows))}
                                    </td>
                                </tr>
                            </tbody>
                        ))}

                        {/* Grand Total */}
                        <tfoot className="font-bold">
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border px-2 py-1 text-right"
                                >
                                    Net Increase / Decrease in Cash
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {formatBDTCurrency(grandTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
