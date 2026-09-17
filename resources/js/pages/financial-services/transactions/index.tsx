import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { route } from 'ziggy-js';

interface Transaction {
    id: number;
    transaction_no: string;
    transaction_type: string;
    transaction_date: string;
    amount: string | number;
    status: string;
    financial_account?: { account_no?: string } | null;
}

export default function FinancialTransactionIndex() {
    const { transactions } = usePage<{
        transactions: { data: Transaction[] };
    }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transactions', href: route('financial-transactions.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Transactions" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Financial Transactions"
                    description="Create, post, and reverse operational account movements."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('financial-transactions.create')}>
                                <Plus className="mr-1 h-4 w-4" /> New
                                transaction
                            </Link>
                        </Button>
                    }
                />
                <ResourceTableCard>
                    <div className="overflow-auto">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="bg-muted/80 text-left text-xs text-muted-foreground">
                                <tr>
                                    {[
                                        'Number',
                                        'Account',
                                        'Type',
                                        'Date',
                                        'Amount',
                                        'Status',
                                        '',
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="border-b px-3 py-2"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b even:bg-muted/30 hover:bg-primary/5"
                                    >
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {transaction.transaction_no}
                                        </td>
                                        <td className="px-3 py-2">
                                            {transaction.financial_account
                                                ?.account_no ?? '-'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {transaction.transaction_type}
                                        </td>
                                        <td className="px-3 py-2">
                                            {transaction.transaction_date}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {Number(transaction.amount).toFixed(
                                                4,
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <StatusBadge
                                                tone={
                                                    transaction.status ===
                                                    'POSTED'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {transaction.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <Link
                                                href={route(
                                                    'financial-transactions.show',
                                                    transaction.id,
                                                )}
                                                title="View transaction"
                                            >
                                                <Eye className="ml-auto h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
            </div>
        </CustomAuthLayout>
    );
}
