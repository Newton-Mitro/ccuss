import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '@/components/heading-small';
import ReportExportActions from '@/components/report-export-actions';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { BreadcrumbItem } from '@/types';
import type { Props } from '@/modules/general-accounting/types/reports/balance-sheet-page.interfaces';


export default function BalanceSheetPage() {
    const { balanceSheet, fiscalYears, selectedFiscalYear } =
        usePage<Props>().props;
    const [fiscalYear, setFiscalYear] = useState<number>(
        selectedFiscalYear || 0,
    );

    // Update report when fiscal year changes
    const handleFiscalYearChange = (value) => {
        const year = Number(value);
        setFiscalYear(year);
        router.get(
            '/financial-reports/balance-sheet',
            { fiscal_year_id: year },
            { preserveState: true },
        );
    };

    // Calculate totals per category
    const totalsByCategory: Record<string, number> = {};
    balanceSheet.forEach((row) => {
        if (!totalsByCategory[row.category]) totalsByCategory[row.category] = 0;
        totalsByCategory[row.category] += Number(row.balance);
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Reports', href: '#' },
        { title: 'Balance Sheet', href: '/financial-reports/balance-sheet' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Balance Sheet Report" />

            <div className="space-y-3 text-foreground">
                <ReportExportActions
                    report="balance-sheet"
                    query={{ fiscal_year_id: fiscalYear }}
                />
                {/* Screen Header + Fiscal Year */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Balance Sheet Report"
                        description="Financial position as of the selected fiscal year-end"
                    />
                    <div className="flex items-center gap-2">
                        <div className="w-60">
                            <Select
                                className="bg-card"
                                value={fiscalYear.toString()}
                                onChange={handleFiscalYearChange}
                                options={fiscalYears.map((fy) => ({
                                    value: fy.id.toString(),
                                    label: fy.code,
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Table & Totals */}
                <div className="rounded-md border p-2">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {['Category', 'Account Name', 'Balance'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="border-b px-2 py-1 text-left font-medium text-muted-foreground"
                                        >
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {balanceSheet.length > 0 ? (
                                balanceSheet.map((row) => (
                                    <tr
                                        key={row.ledger_account_id}
                                        className="even:bg-muted/20 hover:bg-muted/10"
                                    >
                                        <td className="border px-2 py-1">
                                            {row.category}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {row.account_name}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatBDTCurrency(
                                                row.balance,
                                                false,
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-2 py-4 text-center text-muted-foreground"
                                    >
                                        No accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals per category */}
                    <div className="mt-2 text-sm">
                        {Object.entries(totalsByCategory).map(
                            ([category, total]) => (
                                <div
                                    key={category}
                                    className="flex justify-between border-b px-2 py-1"
                                >
                                    <span>{category} Total:</span>
                                    <span>
                                        {formatBDTCurrency(total, false)}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
