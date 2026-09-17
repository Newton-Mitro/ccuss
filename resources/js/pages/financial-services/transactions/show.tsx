import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, RotateCcw } from 'lucide-react';
import { route } from 'ziggy-js';

interface Transaction {
    id: number;
    transaction_no: string;
    transaction_type: string;
    transaction_date: string;
    amount: string | number;
    currency: string;
    status: string;
    description?: string;
    reference?: string;
    financial_account?: { account_no?: string } | null;
}

export default function FinancialTransactionShow() {
    const { transaction } = usePage<{ transaction: Transaction }>().props;
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
                    description={`${transaction.transaction_type} · ${transaction.financial_account?.account_no ?? '-'}`}
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
