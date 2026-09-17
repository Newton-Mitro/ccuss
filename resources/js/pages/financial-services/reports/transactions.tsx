import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
interface Transaction {
    id: number;
    transaction_no: string;
    transaction_type: string;
    transaction_date: string;
    amount: string | number;
    status: string;
    financial_account?: { account_no?: string } | null;
}
export default function TransactionReport() {
    const { transactions } = usePage<{
        transactions: { data: Transaction[] };
    }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transaction Report', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Report" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Transaction report"
                    description="Operational movements across financial accounts."
                />
                <ResourceTableCard>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">Number</th>
                                <th className="px-3 py-2">Account</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="px-3 py-2 font-mono text-xs">
                                        {transaction.transaction_no}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.financial_account
                                            ?.account_no ?? '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.transaction_date}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.transaction_type}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {Number(transaction.amount).toFixed(4)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ResourceTableCard>
            </div>
        </CustomAuthLayout>
    );
}
