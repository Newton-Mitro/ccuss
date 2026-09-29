import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import ReportExportActions from '../../../components/report-export-actions';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface PLRow {
    ledger_account_id: number;
    category: 'income' | 'expense';
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

interface Props extends SharedData {
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
    } = usePage<Props>().props;

    const [fiscalYear, setFiscalYear] = useState<number | ''>(
        selectedFiscalYear || '',
    );
    const [fiscalPeriod, setFiscalPeriod] = useState<number | ''>(
        selectedFiscalPeriod || '',
    );

    const handleFiscalYearChange = (value) => {
        const year = Number(value);
        setFiscalYear(year);
        router.get(
            '/financial-reports/profit-loss',
            { fiscal_year_id: year, fiscal_period_id: fiscalPeriod },
            { preserveState: true },
        );
    };

    const handleFiscalPeriodChange = (value) => {
        const period = Number(value);
        setFiscalPeriod(period);
        router.get(
            '/financial-reports/profit-loss',
            { fiscal_year_id: fiscalYear, fiscal_period_id: period },
            { preserveState: true },
        );
    };

    const totalIncome = profitAndLoss
        .filter((row) => row.category === 'income')
        .reduce((sum, row) => sum + Number(row.amount), 0);

    const totalExpense = profitAndLoss
        .filter((row) => row.category === 'expense')
        .reduce((sum, row) => sum + Number(row.amount), 0);

    const netProfit = totalIncome - totalExpense;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Reports', href: '#' },
        { title: 'Profit & Loss', href: '/financial-reports/profit-loss' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Profit & Loss Report" />

            <div className="space-y-3 text-foreground">
                <ReportExportActions
                    report="profit-loss"
                    query={{
                        fiscal_year_id: fiscalYear,
                        fiscal_period_id: fiscalPeriod,
                    }}
                />
                {/* Header + Fiscal Year/Period + Print */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Profit & Loss Report"
                        description="Income and Expense summary for the selected period"
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

                        <div className="w-60">
                            <Select
                                className="bg-card"
                                value={fiscalPeriod.toString()}
                                onChange={handleFiscalPeriodChange}
                                options={fiscalPeriods.map((fy) => ({
                                    value: fy.id.toString(),
                                    label: fy.period_name,
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-muted">
                            <tr>
                                {['Category', 'Account Name', 'Amount'].map(
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
                            {profitAndLoss.length > 0 ? (
                                profitAndLoss.map((row) => (
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
                                            {Number(row.amount).toFixed(2)}
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
                        <tfoot className="bg-muted font-bold">
                            <tr>
                                <td colSpan={2} className="border px-2 py-1">
                                    Total Income
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {totalIncome.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="border px-2 py-1">
                                    Total Expense
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {totalExpense.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="border px-2 py-1">
                                    Net Profit
                                </td>
                                <td className="border px-2 py-1 text-right">
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
