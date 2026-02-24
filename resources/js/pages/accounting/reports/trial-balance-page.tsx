import { Head, usePage } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface TrialBalanceRow {
    ledger_account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    total_debit: number;
    total_credit: number;
    balance: number;
}

interface Props {
    trialBalance: TrialBalanceRow[];
}

export default function TrialBalancePage() {
    const { trialBalance } = usePage().props as Props;

    const totalDebit = trialBalance.reduce(
        (sum, row) => sum + Number(row.total_debit),
        0,
    );
    const totalCredit = trialBalance.reduce(
        (sum, row) => sum + Number(row.total_credit),
        0,
    );
    const totalBalance = trialBalance.reduce(
        (sum, row) => sum + Number(row.balance),
        0,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title: 'Trial Balance', href: '/reports/trial-balance' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Trial Balance Report" />

            <div className="space-y-3 p-2 text-foreground print:p-4 print:text-black">
                {/* Screen Header + Print Button */}
                <div className="print-hidden flex items-center justify-between">
                    <HeadingSmall
                        title="Trial Balance Report"
                        description="View ledger accounts, debits, credits, and balances"
                    />
                    <button
                        onClick={() => window.print()}
                        className="ml-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                    >
                        Print
                    </button>
                </div>

                {/* Print Header */}
                <div className="mb-4 hidden text-center print:block">
                    <h1 className="text-xl font-bold">Trial Balance Report</h1>
                    <p className="text-sm">
                        View ledger accounts, debits, credits, and balances
                    </p>
                    <hr className="my-2 border-t border-border" />
                </div>

                {/* Table */}
                <div className="print-area overflow-x-auto rounded-md border border-border print:overflow-visible print:rounded-none print:border-none">
                    <table className="w-full border-collapse text-sm print:text-base">
                        <thead className="sticky top-0 bg-muted print:bg-transparent">
                            <tr>
                                {[
                                    'Code',
                                    'Account Name',
                                    'Type',
                                    'Debit',
                                    'Credit',
                                    'Balance',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b border-border px-2 py-1 text-left font-medium text-muted-foreground print:text-black"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {trialBalance.length > 0 ? (
                                trialBalance.map((row) => (
                                    <tr
                                        key={row.ledger_account_id}
                                        className="even:bg-muted/20 hover:bg-muted/10 print:bg-white"
                                    >
                                        <td className="border px-2 py-1 print:text-black">
                                            {row.account_code}
                                        </td>
                                        <td className="border px-2 py-1 print:text-black">
                                            {row.account_name}
                                        </td>
                                        <td className="border px-2 py-1 print:text-black">
                                            {row.account_type}
                                        </td>
                                        <td className="border px-2 py-1 text-right print:text-black">
                                            {Number(row.total_debit).toFixed(2)}
                                        </td>
                                        <td className="border px-2 py-1 text-right print:text-black">
                                            {Number(row.total_credit).toFixed(
                                                2,
                                            )}
                                        </td>
                                        <td className="border px-2 py-1 text-right print:text-black">
                                            {Number(row.balance).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
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
                                    colSpan={3}
                                    className="border px-2 py-1 print:text-black"
                                >
                                    Totals
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {totalDebit.toFixed(2)}
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {totalCredit.toFixed(2)}
                                </td>
                                <td className="border px-2 py-1 text-right print:text-black">
                                    {totalBalance.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
