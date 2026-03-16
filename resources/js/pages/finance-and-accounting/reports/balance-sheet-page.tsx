import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface BalanceSheetRow {
    ledger_account_id: number;
    category: string;
    account_name: string;
    balance: number;
}

interface FiscalYear {
    id: number;
    code: string;
}

interface Props {
    balanceSheet: BalanceSheetRow[];
    fiscalYears: FiscalYear[];
    selectedFiscalYear?: number;
}

export default function BalanceSheetPage() {
    const { balanceSheet, fiscalYears, selectedFiscalYear } = usePage()
        .props as Props;
    const [fiscalYear, setFiscalYear] = useState<number>(
        selectedFiscalYear || 0,
    );

    // Get fiscal year code for display in print header
    const fiscalYearCode = fiscalYears.find(
        (fy) => fy.id === Number(fiscalYear),
    )?.code;

    // Update report when fiscal year changes
    const handleFiscalYearChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const year = Number(e.target.value);
        setFiscalYear(year);
        router.get(
            '/reports/balance-sheet',
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

    const totalBalance = balanceSheet.reduce(
        (sum, row) => sum + Number(row.balance),
        0,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '#' },
        { title: 'Balance Sheet', href: '/reports/balance-sheet' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Balance Sheet Report" />

            <div className="space-y-3 p-2 text-foreground print:p-4 print:text-black">
                {/* Screen Header + Fiscal Year + Print Button */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <HeadingSmall
                        title="Balance Sheet Report"
                        description="Assets = Liabilities + Equity"
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
                            className="ml-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                        >
                            Print
                        </button>
                    </div>
                </div>

                {/* Print-only Header */}
                <div className="mb-4 hidden text-center print:block">
                    <h1 className="text-xl font-bold">Balance Sheet Report</h1>
                    {fiscalYearCode && (
                        <p className="text-sm">Fiscal Year: {fiscalYearCode}</p>
                    )}
                    <p className="text-sm">Assets = Liabilities + Equity</p>
                    <hr className="my-2 border-t border-border" />
                </div>

                {/* Table & Totals */}
                <div className="print-area rounded-md border border-border p-2 print:rounded-none print:border-none">
                    <table className="w-full border-collapse text-sm print:text-base">
                        <thead className="sticky top-0 bg-muted print:bg-transparent">
                            <tr>
                                {['Category', 'Account Name', 'Balance'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="border-b border-border px-2 py-1 text-left font-medium text-muted-foreground print:text-black"
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
                                        className="even:bg-muted/20 hover:bg-muted/10 print:bg-white"
                                    >
                                        <td className="border px-2 py-1 print:text-black">
                                            {row.category}
                                        </td>
                                        <td className="border px-2 py-1 print:text-black">
                                            {row.account_name}
                                        </td>
                                        <td className="border px-2 py-1 text-right print:text-black">
                                            {Number(row.balance).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-2 py-4 text-center text-muted-foreground print:text-black"
                                    >
                                        No accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-muted font-bold print:bg-transparent">
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border px-2 py-1 print:text-black"
                                >
                                    Total
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {totalBalance.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Totals per category */}
                    <div className="mt-2 text-sm print:text-base">
                        {Object.entries(totalsByCategory).map(
                            ([category, total]) => (
                                <div
                                    key={category}
                                    className="flex justify-between border-b px-2 py-1 print:text-black"
                                >
                                    <span>{category} Total:</span>
                                    <span>{total.toFixed(2)}</span>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
