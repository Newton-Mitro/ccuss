import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';

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
    const { transactions, filters } = usePage<{
        transactions: {
            data: Transaction[];
            links: { url: string | null; label: string; active: boolean }[];
            per_page: number;
        };
        filters: { search?: string };
    }>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('financial-transactions.index'),
                { search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);
        return () => clearTimeout(timeout);
    }, [search]);
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
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search transaction number or type..."
                    className="w-full bg-card sm:w-96"
                />
                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <div className="overflow-auto">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
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
                                            className="border-b p-2 text-left text-sm font-medium"
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
                                        className="border-b even:bg-muted hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-1 font-mono text-xs">
                                            {transaction.transaction_no}
                                        </td>
                                        <td className="px-2 py-1">
                                            {transaction.financial_account
                                                ?.account_no ?? '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {transaction.transaction_type}
                                        </td>
                                        <td className="px-2 py-1">
                                            {transaction.transaction_date}
                                        </td>
                                        <td className="px-2 py-1 text-right tabular-nums">
                                            {Number(transaction.amount).toFixed(
                                                4,
                                            )}
                                        </td>
                                        <td className="px-2 py-1">
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
                                        <td className="px-2 py-1 text-right">
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
                <DataTablePagination
                    perPage={transactions.per_page}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('financial-transactions.index'),
                            { search, per_page: perPage, page: 1 },
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                    links={transactions.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
