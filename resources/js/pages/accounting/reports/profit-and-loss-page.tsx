import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface PLRow {
    ledger_account_id: number;
    category: 'INCOME' | 'EXPENSE';
    account_name: string;
    amount: number;
    fiscal_year_id?: number;
    fiscal_period_id?: number;
}

interface FiscalYear {
    id: number;
    code: string;
}

interface FiscalPeriod {
    id: number;
    period_name: string;
}

interface Props {
    profitAndLoss: PLRow[];
    fiscalYears: FiscalYear[];
    fiscalPeriods: FiscalPeriod[];
    selectedFiscalYear?: number;
    selectedFiscalPeriod?: number;
}

export default function ProfitAndLossPage() {
    const {
        profitAndLoss,
        fiscalYears,
        fiscalPeriods,
        selectedFiscalYear,
        selectedFiscalPeriod,
    } = usePage().props as Props;

    const [fiscalYear, setFiscalYear] = useState<number | ''>(
        selectedFiscalYear || '',
    );
    const [fiscalPeriod, setFiscalPeriod] = useState<number | ''>(
        selectedFiscalPeriod || '',
    );

    const handleFiscalYearChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const year = e.target.value ? Number(e.target.value) : '';
        setFiscalYear(year);
        router.get(
            '/reports/profit-loss',
            { fiscal_year_id: year, fiscal_period_id: fiscalPeriod },
            { preserveState: true },
        );
    };

    const handleFiscalPeriodChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const period = e.target.value ? Number(e.target.value) : '';
        setFiscalPeriod(period);
        router.get(
            '/reports/profit-loss',
            { fiscal_year_id: fiscalYear, fiscal_period_id: period },
            { preserveState: true },
        );
    };

    const totalIncome = profitAndLoss
        .filter((row) => row.category === 'INCOME')
        .reduce((sum, row) => sum + Number(row.amount), 0);

    const totalExpense = profitAndLoss
        .filter((row) => row.category === 'EXPENSE')
        .reduce((sum, row) => sum + Number(row.amount), 0);

    const netProfit = totalIncome - totalExpense;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title: 'Profit & Loss', href: '/reports/profit-loss' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Profit & Loss Report" />

            <div className="space-y-3 p-2 text-foreground print:p-4 print:text-black">
                {/* Header + Fiscal Year/Period + Print */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <HeadingSmall
                        title="Profit & Loss Report"
                        description="Income and Expense summary for the selected period"
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
                            options={fiscalPeriods.map((fy) => ({
                                value: fy.id.toString(),
                                label: fy.period_name,
                            }))}
                        />

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="ml-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                        >
                            Print
                        </button>
                    </div>
                </div>

                {/* Print Header */}
                <div className="mb-4 hidden text-center print:block">
                    <h1 className="text-xl font-bold">Profit & Loss Report</h1>
                    {fiscalYear && (
                        <p className="text-sm">Fiscal Year: {fiscalYear}</p>
                    )}
                    {fiscalPeriod && (
                        <p className="text-sm">Fiscal Period: {fiscalPeriod}</p>
                    )}
                    <p className="text-sm">
                        Income and Expense summary for the selected period
                    </p>
                    <hr className="my-2 border-t border-border" />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-md border border-border print:block print:overflow-visible print:rounded-none print:border-none">
                    <table className="w-full border-collapse text-sm print:text-base">
                        <thead className="bg-muted print:bg-transparent">
                            <tr>
                                {['Category', 'Account Name', 'Amount'].map(
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
                            {profitAndLoss.length > 0 ? (
                                profitAndLoss.map((row) => (
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
                                            {Number(row.amount).toFixed(2)}
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
                                    Total Income
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {totalIncome.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border px-2 py-1 print:text-black"
                                >
                                    Total Expense
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {totalExpense.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border px-2 py-1 print:text-black"
                                >
                                    Net Profit
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {netProfit.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
