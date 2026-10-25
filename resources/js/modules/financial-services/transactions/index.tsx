import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import { BreadcrumbItem } from '@/types';
import type { FinancialTransactionsPageProps } from '@/modules/financial-services/types/financial-services';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '@/components/data-table-pagination';

export default function FinancialTransactionIndex() {
    const { transactions, filters } =
        usePage<FinancialTransactionsPageProps>().props;
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
                                        {
                                            label: 'Number',
                                            className: 'text-left',
                                        },
                                        {
                                            label: 'Account',
                                            className: 'text-left',
                                        },
                                        {
                                            label: 'Type',
                                            className: 'text-left',
                                        },
                                        {
                                            label: 'Date',
                                            className: 'text-left',
                                        },
                                        {
                                            label: 'Amount',
                                            className: 'text-right',
                                        },
                                        {
                                            label: 'Status',
                                            className: 'text-left',
                                        },
                                        {
                                            label: 'Actions',
                                            className: 'text-right',
                                        },
                                    ].map(({ label, className }) => (
                                        <th
                                            key={label}
                                            className={`border-b p-2 ${className} text-sm font-medium`}
                                        >
                                            {label}
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
                                            {transaction.entries
                                                ?.map(
                                                    (entry) =>
                                                        entry.financial_account
                                                            ?.account_no,
                                                )
                                                .filter(Boolean)
                                                .join(', ') || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {transaction.transaction_type}
                                        </td>
                                        <td className="px-2 py-1">
                                            {formatDate(
                                                transaction.transaction_date,
                                            )}
                                        </td>
                                        <td className="px-2 py-1 text-right tabular-nums">
                                            {formatBDTCurrency(
                                                transaction.amount,
                                                false,
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
                                        <td className="px-2 py-1">
                                            <div className="flex justify-end">
                                                <Link
                                                    href={route(
                                                        'financial-transactions.show',
                                                        transaction.id,
                                                    )}
                                                    title="View transaction"
                                                    aria-label={`View transaction ${transaction.transaction_no}`}
                                                    className="inline-flex rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </div>
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
