import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem } from '@/types';
import type { TellerCashTransactionIndexProps } from '@/types/treasury-cash/teller-transactions';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Eye,
    Pencil,
    ReceiptText,
    RotateCcw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';

export default function Index() {
    const { transactions, filters, auth } =
        usePage<TellerCashTransactionIndexProps>().props;
    const [viewingTransaction, setViewingTransaction] = useState<
        (typeof transactions.data)[number] | null
    >(null);
    const [editingTransaction, setEditingTransaction] = useState<
        (typeof transactions.data)[number] | null
    >(null);
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
    const canPost = permissions.has('cash_transactions.post');
    const canUpdate = permissions.has('cash_transactions.update');
    const canCancel = permissions.has('cash_transactions.cancel');
    const canReverse = permissions.has('cash_transactions.reverse');
    const editForm = useForm({ reference: '', note: '' });
    const correctionForm = useForm({ reason: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('teller-transactions.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Teller Transactions',
            href: route('teller-transactions.index'),
        },
    ];

    const startEditing = (transaction: (typeof transactions.data)[number]) => {
        editForm.setData({
            reference: transaction.reference ?? '',
            note: transaction.note ?? '',
        });
        editForm.clearErrors();
        setEditingTransaction(transaction);
    };

    const saveEdit = () => {
        if (!editingTransaction) return;

        editForm.patch(
            route('teller-transactions.update', editingTransaction.id),
            {
                preserveScroll: true,
                onSuccess: () => setEditingTransaction(null),
            },
        );
    };

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

        const routeName =
            correctionAction.action === 'cancel'
                ? 'teller-transactions.cancel'
                : 'teller-transactions.reverse';

        correctionForm.post(route(routeName, correctionAction.transaction.id), {
            preserveScroll: true,
            onSuccess: () => setCorrectionAction(null),
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Transactions" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Teller Transactions"
                    description="Review and post pending deposits and withdrawals for the active branch."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search transaction, teller, type, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {transactions.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No teller transactions found"
                        description="Teller deposits and withdrawals will appear here."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-240 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Transaction',
                                        'Teller',
                                        'Business Date',
                                        'Type',
                                        'Amount',
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
                                                        {transaction.reference ??
                                                            '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.teller_session?.teller
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
                                            {transaction.amount}
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
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setViewingTransaction(
                                                            transaction,
                                                        )
                                                    }
                                                    aria-label={`View ${transaction.transaction_no}`}
                                                    title="View transaction"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {canUpdate &&
                                                    transaction.status ===
                                                        'PENDING' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                startEditing(
                                                                    transaction,
                                                                )
                                                            }
                                                            aria-label={`Edit ${transaction.transaction_no}`}
                                                            title="Edit transaction details"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                {canCancel &&
                                                    transaction.status ===
                                                        'PENDING' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                startCorrection(
                                                                    transaction,
                                                                    'cancel',
                                                                )
                                                            }
                                                            aria-label={`Cancel ${transaction.transaction_no}`}
                                                            title="Cancel pending transaction"
                                                        >
                                                            <Ban className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                {canReverse &&
                                                    transaction.status ===
                                                        'POSTED' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                startCorrection(
                                                                    transaction,
                                                                    'reverse',
                                                                )
                                                            }
                                                            aria-label={`Reverse ${transaction.transaction_no}`}
                                                            title="Reverse posted transaction"
                                                        >
                                                            <RotateCcw className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
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
                                                                        title: 'Post this teller transaction?',
                                                                        text: `Post ${transaction.transaction_no} for ${transaction.amount}?`,
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
                                                                                    'teller-transactions.post',
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
            </div>
            <Dialog
                open={Boolean(viewingTransaction)}
                onOpenChange={(open) => !open && setViewingTransaction(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transaction details</DialogTitle>
                        <DialogDescription>
                            {viewingTransaction?.transaction_no}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingTransaction && (
                        <div className="space-y-4 text-sm">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div>
                                    <dt className="text-muted-foreground">
                                        Type
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.type}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Amount
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.amount}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Status
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.status}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Teller
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.teller_session
                                            ?.teller?.name ?? '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Business date
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.branch_day
                                            ?.business_date ?? '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Requested
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.requested_at ?? '-'}
                                    </dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-muted-foreground">
                                        Reference
                                    </dt>
                                    <dd className="font-medium">
                                        {viewingTransaction.reference || '-'}
                                    </dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-muted-foreground">
                                        Note
                                    </dt>
                                    <dd className="font-medium whitespace-pre-wrap">
                                        {viewingTransaction.note || '-'}
                                    </dd>
                                </div>
                                {viewingTransaction.cancellation_reason && (
                                    <div className="col-span-2">
                                        <dt className="text-muted-foreground">
                                            Cancellation reason
                                        </dt>
                                        <dd className="font-medium whitespace-pre-wrap">
                                            {
                                                viewingTransaction.cancellation_reason
                                            }
                                        </dd>
                                        <dd className="text-xs text-muted-foreground">
                                            Cancelled at{' '}
                                            {viewingTransaction.cancelled_at ??
                                                '-'}
                                            {' by user '}
                                            {viewingTransaction.cancelled_by ??
                                                '-'}
                                        </dd>
                                    </div>
                                )}
                                {viewingTransaction.reversal_reason && (
                                    <div className="col-span-2">
                                        <dt className="text-muted-foreground">
                                            Reversal reason
                                        </dt>
                                        <dd className="font-medium whitespace-pre-wrap">
                                            {viewingTransaction.reversal_reason}
                                        </dd>
                                        <dd className="text-xs text-muted-foreground">
                                            Reversed at{' '}
                                            {viewingTransaction.reversed_at ??
                                                '-'}
                                            {' by user '}
                                            {viewingTransaction.reversed_by ??
                                                '-'}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                            {viewingTransaction.financial_transaction && (
                                <div className="space-y-2 border-t pt-3">
                                    <h3 className="font-medium">
                                        Ledger entries (
                                        {
                                            viewingTransaction
                                                .financial_transaction
                                                .transaction_no
                                        }
                                        )
                                    </h3>
                                    <div className="divide-y rounded-md border">
                                        {viewingTransaction.financial_transaction.entries.map(
                                            (entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex justify-between gap-3 px-3 py-2"
                                                >
                                                    <span>
                                                        {entry.financial_account
                                                            ?.account_no ??
                                                            'Account'}
                                                        {entry.financial_account
                                                            ?.name
                                                            ? ` · ${entry.financial_account.name}`
                                                            : ''}
                                                        {entry.description
                                                            ? ` · ${entry.description}`
                                                            : ''}
                                                    </span>
                                                    <span className="shrink-0">
                                                        {entry.direction}{' '}
                                                        {entry.amount}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
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
                                : `This reverses the ledger and teller cash effect for ${correctionAction?.transaction.transaction_no}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label
                            htmlFor="correction-reason"
                            className="text-sm font-medium"
                        >
                            Reason
                        </label>
                        <textarea
                            id="correction-reason"
                            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            maxLength={2000}
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
            <Dialog
                open={Boolean(editingTransaction)}
                onOpenChange={(open) => !open && setEditingTransaction(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit transaction details</DialogTitle>
                        <DialogDescription>
                            {editingTransaction?.transaction_no}. Amount and
                            teller session cannot be changed here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="transaction-reference"
                                className="text-sm font-medium"
                            >
                                Reference
                            </label>
                            <Input
                                id="transaction-reference"
                                value={editForm.data.reference}
                                maxLength={255}
                                onChange={(event) =>
                                    editForm.setData(
                                        'reference',
                                        event.target.value,
                                    )
                                }
                            />
                            {editForm.errors.reference && (
                                <p className="text-sm text-destructive">
                                    {editForm.errors.reference}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="transaction-note"
                                className="text-sm font-medium"
                            >
                                Note
                            </label>
                            <Input
                                id="transaction-note"
                                value={editForm.data.note}
                                maxLength={2000}
                                onChange={(event) =>
                                    editForm.setData('note', event.target.value)
                                }
                            />
                            {editForm.errors.note && (
                                <p className="text-sm text-destructive">
                                    {editForm.errors.note}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            disabled={editForm.processing}
                            onClick={saveEdit}
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CustomAuthLayout>
    );
}
