import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { FinancialTransactionPageProps } from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    CalendarDays,
    Check,
    CircleDollarSign,
    FileText,
    Landmark,
    RotateCcw,
} from 'lucide-react';
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
                    variant="account"
                    title={transaction.transaction_no}
                    description={`${transaction.transaction_type} · ${
                        transaction.entries
                            ?.map(
                                (entry) =>
                                    entry.financial_account?.name ||
                                    entry.financial_account?.account_no,
                            )
                            .filter(Boolean)
                            .join(', ') || '-'
                    }`}
                    action={
                        <div className="flex gap-2">
                            {transaction.status === 'PENDING' && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        appSwal
                                            .fire({
                                                title: 'Post this transaction?',
                                                text: `Post ${transaction.transaction_no}? This will move it to the ledger.`,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText:
                                                    'Post transaction',
                                                cancelButtonText: 'Cancel',
                                            })
                                            .then((result) => {
                                                if (!result.isConfirmed) return;

                                                router.post(
                                                    route(
                                                        'financial-transactions.post',
                                                        transaction.id,
                                                    ),
                                                    {},
                                                    {
                                                        onError: (errors) => {
                                                            void appSwal.fire({
                                                                title: 'Unable to post transaction',
                                                                text: Object.values(
                                                                    errors,
                                                                ).join(' '),
                                                                icon: 'error',
                                                            });
                                                        },
                                                    },
                                                );
                                            });
                                    }}
                                >
                                    <Check className="mr-1 h-4 w-4" /> Post
                                </Button>
                            )}
                            {transaction.status === 'POSTED' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        appSwal
                                            .fire({
                                                title: 'Reverse this transaction?',
                                                text: `Reverse ${transaction.transaction_no}? This action affects the posted ledger.`,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText:
                                                    'Reverse transaction',
                                                cancelButtonText: 'Cancel',
                                            })
                                            .then((result) => {
                                                if (!result.isConfirmed) return;

                                                router.post(
                                                    route(
                                                        'financial-transactions.reverse',
                                                        transaction.id,
                                                    ),
                                                );
                                            });
                                    }}
                                >
                                    <RotateCcw className="mr-1 h-4 w-4" />{' '}
                                    Reverse
                                </Button>
                            )}
                        </div>
                    }
                />
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Status
                                </p>
                                <div className="mt-2">
                                    <StatusBadge
                                        tone={
                                            transaction.status === 'POSTED'
                                                ? 'success'
                                                : transaction.status ===
                                                    'CANCELLED'
                                                  ? 'danger'
                                                  : transaction.status ===
                                                      'REVERSED'
                                                    ? 'info'
                                                    : 'warning'
                                        }
                                    >
                                        {transaction.status}
                                    </StatusBadge>
                                </div>
                            </div>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ArrowLeftRight className="size-4" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Transaction date
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    {formatDate(transaction.transaction_date)}
                                </p>
                            </div>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="size-4" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Transaction amount
                                </p>
                                <p className="mt-2 text-lg font-semibold tracking-tight break-words tabular-nums">
                                    {formatBDTCurrency(
                                        transaction.amount,
                                        false,
                                    )}{' '}
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {transaction.currency}
                                    </span>
                                </p>
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CircleDollarSign className="size-4" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Reference
                                </p>
                                <p className="mt-2 text-sm font-semibold break-words">
                                    {transaction.reference || 'No reference'}
                                </p>
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText className="size-4" />
                            </div>
                        </div>
                    </div>
                </section>
                {transaction.description && (
                    <section className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold">
                                Description
                            </h2>
                            <p className="mt-1 text-sm leading-6 break-words text-muted-foreground">
                                {transaction.description}
                            </p>
                        </div>
                    </section>
                )}
                {transaction.voucher && (
                    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Landmark className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Accounting voucher
                                    </h2>
                                    <Link
                                        className="text-xs text-primary hover:underline"
                                        href={route(
                                            'vouchers.show',
                                            transaction.voucher.id,
                                        )}
                                    >
                                        {transaction.voucher.voucher_no}
                                    </Link>
                                </div>
                            </div>
                            <StatusBadge
                                tone={
                                    transaction.voucher.status === 'POSTED'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {transaction.voucher.status}
                            </StatusBadge>
                        </div>
                        <div className="divide-y">
                            {transaction.voucher.entries?.map(
                                (entry, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-5"
                                    >
                                        <span className="text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {entry.account?.code ?? '-'}
                                            </span>
                                            {' · '}
                                            {Number(entry.debit) > 0
                                                ? 'Debit'
                                                : 'Credit'}
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatBDTCurrency(
                                                Number(entry.debit) > 0
                                                    ? entry.debit
                                                    : entry.credit,
                                                false,
                                            )}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </section>
                )}
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Transaction entries
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {transaction.entries?.length ?? 0} ledger{' '}
                                {(transaction.entries?.length ?? 0) === 1
                                    ? 'entry'
                                    : 'entries'}
                            </p>
                        </div>
                        <ArrowLeftRight className="size-4 text-muted-foreground" />
                    </div>
                    <div className="divide-y">
                        {transaction.entries?.map((entry, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <Landmark className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {entry.financial_account?.name ||
                                                'Financial account'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Account{' '}
                                            {entry.financial_account
                                                ?.account_no ?? '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 pl-11 sm:justify-end sm:pl-0">
                                    <StatusBadge
                                        tone={
                                            entry.direction === 'DEBIT'
                                                ? 'info'
                                                : 'success'
                                        }
                                    >
                                        {entry.direction}
                                    </StatusBadge>
                                    <span className="min-w-28 text-right text-sm font-semibold tabular-nums">
                                        {formatBDTCurrency(entry.amount, false)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="flex justify-start">
                    <Button variant="outline" asChild>
                        <Link href={route('financial-transactions.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to transactions
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
