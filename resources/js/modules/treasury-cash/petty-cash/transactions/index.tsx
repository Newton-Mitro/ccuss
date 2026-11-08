import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceEmptyState,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { PettyCashTransactionIndexProps } from '@/modules/treasury-cash/types/petty-cash-transactions';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Ban,
    CheckCircle2,
    ReceiptText,
    RotateCcw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function Index() {
    const { transactions, filters, auth } =
        usePage<PettyCashTransactionIndexProps>().props;
    const [correctionAction, setCorrectionAction] = useState<{
        transaction: (typeof transactions.data)[number];
        action: 'cancel' | 'reverse';
    } | null>(null);
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canPost = permissions.has('petty_cash.expense');
    const canFund = permissions.has('petty_cash.create');
    const canExpense = permissions.has('petty_cash.expense');
    const correctionForm = useForm({ reason: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('petty-cash-transactions.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: 'Petty Cash Transactions',
            href: route('petty-cash-transactions.index'),
        },
    ];

    const startCorrection = (
        transaction: (typeof transactions.data)[number],
        action: 'cancel' | 'reverse',
    ) => {
        correctionForm.setData('reason', '');
        correctionForm.clearErrors();
        setCorrectionAction({ transaction, action });
    };

    const submitCorrection = () => {
        if (!correctionAction || !correctionForm.data.reason.trim()) return;

        correctionForm.post(
            route(
                correctionAction.action === 'cancel'
                    ? 'petty-cash-transactions.cancel'
                    : 'petty-cash-transactions.reverse',
                correctionAction.transaction.id,
            ),
            {
                preserveScroll: true,
                onSuccess: () => setCorrectionAction(null),
            },
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Transactions" />
            <div className="space-y-4 text-foreground">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Petty Cash Transactions"
                        description="Review, post, or cancel pending activity and reverse posted transactions."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <div className="flex flex-wrap gap-2">
                            {canFund && (
                                <Button asChild variant="outline">
                                    <Link
                                        href={route(
                                            'petty-cash-transactions.funding',
                                        )}
                                    >
                                        <ArrowDownToLine className="h-4 w-4" />
                                        Add funding
                                    </Link>
                                </Button>
                            )}
                            {canExpense && (
                                <Button asChild>
                                    <Link
                                        href={route(
                                            'petty-cash-transactions.expense',
                                        )}
                                    >
                                        <ArrowUpFromLine className="h-4 w-4" />
                                        Add expense
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search transaction, fund, payee, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {transactions.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No petty cash transactions found"
                        description="Funding and expense requests will appear here."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-260 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Transaction',
                                        'Fund',
                                        'Business Date',
                                        'Type',
                                        'Amount',
                                        'Payee',
                                        'Status',
                                        'Actions',
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            className="border-b p-2 text-left font-medium"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((transaction, index) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(transactions.current_page - 1) *
                                                transactions.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <ReceiptText className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            transaction.transaction_no
                                                        }
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {transaction.description ??
                                                            '-'}
                                                    </div>
                                                    {(transaction.cancellation_reason ||
                                                        transaction.reversal_reason) && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Reason:{' '}
                                                            {transaction.cancellation_reason ??
                                                                transaction.reversal_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.petty_cash_fund
                                                ?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.branch_day
                                                ?.business_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.type}
                                        </td>
                                        <td className="px-2 py-2">
                                            {formatBDTCurrency(
                                                transaction.amount,
                                                false,
                                            )}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.payee ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <StatusBadge
                                                tone={
                                                    transaction.status ===
                                                    'POSTED'
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
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-1">
                                                {canPost &&
                                                    transaction.status ===
                                                        'PENDING' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                appSwal
                                                                    .fire({
                                                                        title: 'Post this petty cash transaction?',
                                                                        text: `Post ${transaction.transaction_no} for ${formatBDTCurrency(transaction.amount, false)}?`,
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText:
                                                                            'Post transaction',
                                                                        cancelButtonText:
                                                                            'Cancel',
                                                                    })
                                                                    .then(
                                                                        (
                                                                            result,
                                                                        ) => {
                                                                            if (
                                                                                !result.isConfirmed
                                                                            )
                                                                                return;

                                                                            router.post(
                                                                                route(
                                                                                    'petty-cash-transactions.post',
                                                                                    transaction.id,
                                                                                ),
                                                                                {},
                                                                                {
                                                                                    preserveScroll: true,
                                                                                },
                                                                            );
                                                                        },
                                                                    );
                                                            }}
                                                            aria-label={`Post ${transaction.transaction_no}`}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                                        </Button>
                                                    )}
                                                {canPost &&
                                                    transaction.status ===
                                                        'PENDING' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            title="Cancel pending transaction"
                                                            aria-label={`Cancel ${transaction.transaction_no}`}
                                                            onClick={() =>
                                                                startCorrection(
                                                                    transaction,
                                                                    'cancel',
                                                                )
                                                            }
                                                        >
                                                            <Ban className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                {canPost &&
                                                    transaction.status ===
                                                        'POSTED' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            title="Reverse posted transaction"
                                                            aria-label={`Reverse ${transaction.transaction_no}`}
                                                            onClick={() =>
                                                                startCorrection(
                                                                    transaction,
                                                                    'reverse',
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <DataTablePagination
                    perPage={transactions.per_page}
                    currentPage={transactions.current_page}
                    totalItems={transactions.total}
                    totalPages={transactions.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() =>
                        setData('page', transactions.current_page + 1)
                    }
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, transactions.current_page - 1),
                        )
                    }
                />
                <Dialog
                    open={Boolean(correctionAction)}
                    onOpenChange={(open) => !open && setCorrectionAction(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {correctionAction?.action === 'cancel'
                                    ? 'Cancel pending transaction'
                                    : 'Reverse posted transaction'}
                            </DialogTitle>
                            <DialogDescription>
                                {correctionAction?.action === 'cancel'
                                    ? `${correctionAction.transaction.transaction_no} will be retained as cancelled.`
                                    : `This reverses the ledger and petty cash balance effect for ${correctionAction?.transaction.transaction_no}.`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <label
                                htmlFor="petty-cash-correction-reason"
                                className="text-sm font-medium"
                            >
                                Reason
                            </label>
                            <textarea
                                id="petty-cash-correction-reason"
                                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                maxLength={1000}
                                value={correctionForm.data.reason}
                                onChange={(event) =>
                                    correctionForm.setData(
                                        'reason',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            {correctionForm.errors.reason && (
                                <p className="text-sm text-destructive">
                                    {correctionForm.errors.reason}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={
                                    correctionForm.processing ||
                                    !correctionForm.data.reason.trim()
                                }
                                onClick={submitCorrection}
                            >
                                {correctionAction?.action === 'cancel'
                                    ? 'Cancel transaction'
                                    : 'Reverse transaction'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </CustomAuthLayout>
    );
}
