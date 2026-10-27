import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { FinancialTransactionsPageProps } from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Eye, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function FinancialTransactionIndex() {
    const {
        transactions,
        filters,
        can_post: canPost,
        can_reverse: canReverse,
    } = usePage<FinancialTransactionsPageProps>().props;
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

    const handleAction = async (
        transaction: FinancialTransactionsPageProps['transactions']['data'][number],
        action: 'post' | 'cancel' | 'reverse',
    ) => {
        const actionDetails = {
            post: {
                title: 'Post this transaction?',
                text: `Post ${transaction.transaction_no}? This will move it to the ledger.`,
                confirmButtonText: 'Post transaction',
                route: 'financial-transactions.post',
            },
            cancel: {
                title: 'Cancel this transaction?',
                text: `Cancel pending transaction ${transaction.transaction_no}?`,
                confirmButtonText: 'Cancel transaction',
                route: 'financial-transactions.cancel',
            },
            reverse: {
                title: 'Reverse this transaction?',
                text: `Reverse ${transaction.transaction_no}? This action affects the posted ledger.`,
                confirmButtonText: 'Reverse transaction',
                route: 'financial-transactions.reverse',
            },
        }[action];
        const result = await appSwal.fire({
            title: actionDetails.title,
            text: actionDetails.text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: actionDetails.confirmButtonText,
            cancelButtonText: 'Keep transaction',
        });

        if (!result.isConfirmed) return;

        router.post(
            route(actionDetails.route, transaction.id),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    const messages = Object.values(errors)
                        .flatMap((error) =>
                            Array.isArray(error) ? error : [error],
                        )
                        .filter(Boolean);
                    void appSwal.fire({
                        title: `Unable to ${action} transaction`,
                        text:
                            messages.join(' ') ||
                            'Please review the transaction and try again.',
                        icon: 'error',
                    });
                },
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transactions', href: route('financial-transactions.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Transactions" />
            <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Financial Transactions"
                        description="Create, post, and reverse operational account movements."
                    />
                </div>
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
                                            <div className="flex justify-end gap-1 whitespace-nowrap">
                                                {transaction.status ===
                                                    'PENDING' &&
                                                    canPost && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleAction(
                                                                    transaction,
                                                                    'post',
                                                                )
                                                            }
                                                            title="Post transaction"
                                                            aria-label={`Post transaction ${transaction.transaction_no}`}
                                                        >
                                                            <Check className="size-4" />
                                                            Post
                                                        </Button>
                                                    )}
                                                {transaction.status ===
                                                    'PENDING' &&
                                                    canReverse && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleAction(
                                                                    transaction,
                                                                    'cancel',
                                                                )
                                                            }
                                                            title="Cancel transaction"
                                                            aria-label={`Cancel transaction ${transaction.transaction_no}`}
                                                        >
                                                            <X className="size-4" />
                                                            Cancel
                                                        </Button>
                                                    )}
                                                {transaction.status ===
                                                    'POSTED' &&
                                                    canReverse && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleAction(
                                                                    transaction,
                                                                    'reverse',
                                                                )
                                                            }
                                                            title="Reverse transaction"
                                                            aria-label={`Reverse transaction ${transaction.transaction_no}`}
                                                        >
                                                            <RotateCcw className="size-4" />
                                                            Reverse
                                                        </Button>
                                                    )}
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
