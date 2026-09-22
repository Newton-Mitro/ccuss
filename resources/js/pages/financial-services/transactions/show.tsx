import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialTransactionPageProps } from '@/types/financial-services';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, RotateCcw } from 'lucide-react';
import { route } from 'ziggy-js';

export default function FinancialTransactionShow() {
    const { transaction } = usePage<FinancialTransactionPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transactions', href: route('financial-transactions.index') },
        { title: transaction.transaction_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={transaction.transaction_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={transaction.transaction_no}
                    description={`${transaction.transaction_type} · ${
                        transaction.entries
                            ?.map(
                                (entry) => entry.financial_account?.account_no,
                            )
                            .filter(Boolean)
                            .join(', ') || '-'
                    }`}
                    action={
                        <div className="flex gap-2">
                            {transaction.status === 'PENDING' && (
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                'financial-transactions.post',
                                                transaction.id,
                                            ),
                                        )
                                    }
                                >
                                    <Check className="mr-1 h-4 w-4" /> Post
                                </Button>
                            )}
                            {transaction.status === 'POSTED' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                'financial-transactions.reverse',
                                                transaction.id,
                                            ),
                                        )
                                    }
                                >
                                    <RotateCcw className="mr-1 h-4 w-4" />{' '}
                                    Reverse
                                </Button>
                            )}
                        </div>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <StatusBadge
                            tone={
                                transaction.status === 'POSTED'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {transaction.status}
                        </StatusBadge>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="mt-1 font-medium">
                            {transaction.transaction_date}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="mt-1 font-semibold tabular-nums">
                            {Number(transaction.amount).toFixed(4)}{' '}
                            {transaction.currency}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">
                            Reference
                        </p>
                        <p className="mt-1 font-medium">
                            {transaction.reference ?? '-'}
                        </p>
                    </div>
                </div>
                {transaction.description && (
                    <div className="rounded-lg border bg-card p-3 text-sm">
                        {transaction.description}
                    </div>
                )}
                <div className="rounded-lg border bg-card p-3">
                    <h2 className="mb-2 text-sm font-medium">Entries</h2>
                    <div className="space-y-2 text-sm">
                        {transaction.entries?.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                            >
                                <span>
                                    {entry.financial_account?.account_no ?? '-'}
                                </span>
                                <span className="tabular-nums">
                                    {entry.direction}{' '}
                                    {Number(entry.amount).toFixed(4)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <Link
                    className="text-sm text-primary hover:underline"
                    href={route('financial-transactions.index')}
                >
                    Back to transactions
                </Link>
            </div>
        </CustomAuthLayout>
    );
}
