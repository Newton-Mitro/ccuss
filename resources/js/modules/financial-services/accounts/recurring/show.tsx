import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import {
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
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
import { Label } from '@/components/ui/label';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import FinancialAccountActivation from '@/modules/financial-services/components/financial-account-activation';
import FinancialAccountPeopleManagement from '@/modules/financial-services/components/financial-account-people-management';
import type {
    Installment,
    Props,
    TransactionReference,
} from '@/modules/financial-services/types/accounts/recurring/show.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    FileClock,
    Pencil,
    Plus,
    ReceiptText,
    Wallet,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { route } from 'ziggy-js';

function SummaryMetric({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: typeof Wallet;
    label: string;
    value: string;
    description?: string;
}) {
    return (
        <div className="rounded-lg border bg-card p-3.5 transition-colors hover:bg-muted/20 sm:p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight break-words tabular-nums sm:text-xl">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium break-words">{value}</p>
        </div>
    );
}

function getInstallmentTone(status: string) {
    switch (status.toUpperCase()) {
        case 'PAID':
            return 'success' as const;
        case 'PENDING':
            return 'neutral' as const;
        case 'OVERDUE':
        case 'MISSED':
            return 'danger' as const;
        default:
            return 'neutral' as const;
    }
}

export default function RecurringDepositAccountShow() {
    useFlashToastHandler();

    const {
        account,
        customers,
        can_manage_recurring_deposits: canManageRecurringDeposits,
        errors: pageErrors,
    } = usePage<
        Props & {
            customers: Array<{
                id: number;
                customer_no: string;
                name: string;
            }>;
        }
    >().props;

    const deposit = account.recurring_deposit;
    const installments = deposit?.installments ?? [];
    const paidInstallments = deposit?.paid_installments ?? 0;
    const totalInstallments = deposit?.total_installments ?? 0;
    const progress =
        totalInstallments > 0
            ? Math.min((paidInstallments / totalInstallments) * 100, 100)
            : 0;
    const canManageSchedule =
        canManageRecurringDeposits &&
        account.status !== 'CLOSED' &&
        !deposit?.closed_at;
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [editingInstallment, setEditingInstallment] =
        useState<Installment | null>(null);
    const {
        data: scheduleData,
        setData: setScheduleData,
        post: postSchedule,
        put: putSchedule,
        processing: scheduleProcessing,
        errors: scheduleErrors,
        reset: resetScheduleForm,
    } = useForm({
        due_date: new Date().toLocaleDateString('en-CA'),
        amount_due: '',
    });

    const openAddInstallment = () => {
        setEditingInstallment(null);
        resetScheduleForm();
        setScheduleDialogOpen(true);
    };

    const openEditInstallment = (installment: Installment) => {
        setEditingInstallment(installment);
        setScheduleData('due_date', installment.due_date.slice(0, 10));
        setScheduleData(
            'amount_due',
            String(installment.amount_due ?? deposit?.installment_amount ?? ''),
        );
        setScheduleDialogOpen(true);
    };

    const saveInstallment = (event: FormEvent) => {
        event.preventDefault();
        if (!deposit) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setScheduleDialogOpen(false);
                setEditingInstallment(null);
                resetScheduleForm();
            },
        };
        const routeParameters = {
            financial_account: account.id,
            recurringDeposit: deposit.id,
        };

        if (editingInstallment) {
            putSchedule(
                route(
                    'financial-accounts.recurring-deposit.installments.update',
                    {
                        ...routeParameters,
                        installment: editingInstallment.id,
                    },
                ),
                options,
            );
            return;
        }

        postSchedule(
            route(
                'financial-accounts.recurring-deposit.installments.store',
                routeParameters,
            ),
            options,
        );
    };

    const cancelInstallment = (installment: Installment) => {
        appSwal
            .fire({
                title: 'Cancel this installment?',
                text: 'It will be marked as waived and will no longer be collectable.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Cancel installment',
                cancelButtonText: 'Keep installment',
            })
            .then((result) => {
                if (!result.isConfirmed || !deposit) {
                    return;
                }

                router.post(
                    route(
                        'financial-accounts.recurring-deposit.installments.waive',
                        {
                            financial_account: account.id,
                            recurringDeposit: deposit.id,
                            installment: installment.id,
                        },
                    ),
                    {},
                    { preserveScroll: true },
                );
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Recurring Deposits',
            href: route('financial-accounts.recurring.index'),
        },
        { title: account.account_no, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recurring Deposit - ${account.account_no}`} />

            <div className="space-y-5 pb-6">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={account.account_no}
                        description={`${account.holder?.name ?? 'Unassigned'} · Recurring deposit account`}
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <FinancialAccountActivation
                                accountId={account.id}
                                status={account.status}
                            />
                            <Button asChild size="sm">
                                <Link
                                    href={route(
                                        'financial-accounts.recurring.edit',
                                        account.id,
                                    )}
                                >
                                    Edit account
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Account overview */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Wallet className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Recurring deposit account
                                </p>
                                <h2 className="mt-0.5 truncate text-base font-semibold">
                                    {account.product?.name ??
                                        'Recurring Deposit'}
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Account No. {account.account_no}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                tone={
                                    account.status === 'ACTIVE'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {account.status}
                            </StatusBadge>
                            <StatusBadge tone="neutral">
                                {deposit?.installment_frequency ??
                                    'Frequency not set'}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                        <DetailItem
                            label="Account holder"
                            value={account.holder?.name ?? 'Unassigned'}
                        />
                        <DetailItem
                            label="Account type"
                            value={account.account_type ?? 'Recurring Deposit'}
                        />
                        <DetailItem
                            label="Account balance"
                            value={formatBDTCurrency(
                                account.balance ?? 0,
                                false,
                            )}
                        />
                        <DetailItem
                            label="Deposit start date"
                            value={
                                deposit?.started_at
                                    ? formatDate(deposit.started_at)
                                    : '—'
                            }
                        />
                    </div>
                </section>

                {/* Key metrics */}
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric
                        icon={CreditCard}
                        label="Installment amount"
                        value={formatBDTCurrency(
                            deposit?.installment_amount ?? 0,
                            false,
                        )}
                        description="Amount per installment"
                    />
                    <SummaryMetric
                        icon={ReceiptText}
                        label="Installments paid"
                        value={`${paidInstallments} / ${totalInstallments}`}
                        description={`${Math.round(progress)}% completed`}
                    />
                    <SummaryMetric
                        icon={CalendarDays}
                        label="Maturity date"
                        value={
                            deposit?.maturity_date
                                ? formatDate(deposit.maturity_date)
                                : '—'
                        }
                        description="Scheduled maturity"
                    />
                    <SummaryMetric
                        icon={Clock3}
                        label="Remaining installments"
                        value={String(
                            Math.max(totalInstallments - paidInstallments, 0),
                        )}
                        description="Installments left to complete"
                    />
                </section>

                {/* Installment progress */}
                <section className="rounded-xl border bg-card p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">Deposit progress</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Track completed installments against the total
                                schedule.
                            </p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    <div
                        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Installment completion"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                    >
                        <div
                            className="h-full rounded-full bg-primary transition-[width]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                        <span>{paidInstallments} completed</span>
                        <span>
                            {Math.max(totalInstallments - paidInstallments, 0)}{' '}
                            remaining
                        </span>
                    </div>
                </section>

                {/* Installment schedule */}
                <ResourceTableCard>
                    <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileClock className="size-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold">
                                    Installment schedule
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {installments.length} scheduled installment
                                    {installments.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                        {canManageSchedule && (
                            <Button size="sm" onClick={openAddInstallment}>
                                <Plus className="mr-1.5 size-4" />
                                Add installment
                            </Button>
                        )}
                    </div>

                    {installments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="w-20 px-4 py-3 text-left font-medium">
                                            No.
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Due date
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Amount due
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Transaction reference
                                        </th>
                                        <th className="px-4 py-3 text-center font-medium">
                                            Status
                                        </th>
                                        {canManageSchedule && (
                                            <th className="px-4 py-3 text-center font-medium">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {installments.map((item) => {
                                        const transactions = [
                                            ...(item.financial_transaction
                                                ? [item.financial_transaction]
                                                : []),
                                            ...(item.transaction_entries
                                                ?.map(
                                                    (entry) =>
                                                        entry.transaction,
                                                )
                                                .filter(
                                                    (
                                                        transaction,
                                                    ): transaction is TransactionReference =>
                                                        Boolean(transaction),
                                                ) ?? []),
                                        ].filter(
                                            (transaction, index, all) =>
                                                all.findIndex(
                                                    (candidate) =>
                                                        candidate.id ===
                                                        transaction.id,
                                                ) === index,
                                        );

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-t transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3.5 font-medium tabular-nums">
                                                    {String(
                                                        item.installment_no,
                                                    ).padStart(2, '0')}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {formatDate(item.due_date)}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-medium tabular-nums">
                                                    {formatBDTCurrency(
                                                        item.amount_due ?? 0,
                                                        false,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {transactions.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {transactions.map(
                                                                (
                                                                    transaction,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            transaction.id
                                                                        }
                                                                        className="flex flex-wrap items-center gap-x-2 gap-y-1"
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'financial-transactions.show',
                                                                                transaction.id,
                                                                            )}
                                                                            className="font-medium text-primary underline-offset-4 hover:underline"
                                                                        >
                                                                            {
                                                                                transaction.transaction_no
                                                                            }
                                                                        </Link>
                                                                        <StatusBadge
                                                                            tone={
                                                                                transaction.status ===
                                                                                'POSTED'
                                                                                    ? 'success'
                                                                                    : 'neutral'
                                                                            }
                                                                        >
                                                                            {
                                                                                transaction.status
                                                                            }
                                                                        </StatusBadge>
                                                                        {transaction.reference && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Ref:{' '}
                                                                                {
                                                                                    transaction.reference
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <StatusBadge
                                                        tone={getInstallmentTone(
                                                            item.status,
                                                        )}
                                                    >
                                                        {item.status}
                                                    </StatusBadge>
                                                </td>
                                                {canManageSchedule && (
                                                    <td className="px-4 py-3.5 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            {item.status ===
                                                                'PENDING' &&
                                                                !item.financial_transaction_id &&
                                                                Number(
                                                                    item.amount_paid ??
                                                                        0,
                                                                ) === 0 && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-8 px-2"
                                                                        onClick={() =>
                                                                            openEditInstallment(
                                                                                item,
                                                                            )
                                                                        }
                                                                        aria-label={`Edit installment ${item.installment_no}`}
                                                                    >
                                                                        <Pencil className="mr-1 size-3.5" />
                                                                        Edit
                                                                    </Button>
                                                                )}
                                                            {[
                                                                'PENDING',
                                                                'MISSED',
                                                            ].includes(
                                                                item.status,
                                                            ) &&
                                                                !item.financial_transaction_id &&
                                                                Number(
                                                                    item.amount_paid ??
                                                                        0,
                                                                ) === 0 && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-8 px-2 text-destructive hover:text-destructive"
                                                                        onClick={() =>
                                                                            cancelInstallment(
                                                                                item,
                                                                            )
                                                                        }
                                                                        aria-label={`Cancel installment ${item.installment_no}`}
                                                                    >
                                                                        <X className="mr-1 size-3.5" />
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            {![
                                                                'PENDING',
                                                                'MISSED',
                                                            ].includes(
                                                                item.status,
                                                            ) && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <FileClock className="size-5" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">
                                No installments available
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                The installment schedule has not been generated
                                or there are no installments to display.
                            </p>
                        </div>
                    )}
                </ResourceTableCard>

                <Dialog
                    open={scheduleDialogOpen}
                    onOpenChange={(open) => {
                        setScheduleDialogOpen(open);
                        if (!open) {
                            setEditingInstallment(null);
                            resetScheduleForm();
                        }
                    }}
                >
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {editingInstallment
                                    ? 'Edit recurring installment'
                                    : 'Add recurring installment'}
                            </DialogTitle>
                            <DialogDescription>
                                Set the due date and installment amount.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={saveInstallment} className="space-y-4">
                            <InputError message={pageErrors?.schedule} />
                            <div>
                                <Label htmlFor="recurring-installment-due-date">
                                    Due date
                                </Label>
                                <AppDatePicker
                                    id="recurring-installment-due-date"
                                    value={scheduleData.due_date}
                                    required
                                    onChange={(value) =>
                                        setScheduleData('due_date', value)
                                    }
                                />
                                <InputError message={scheduleErrors.due_date} />
                            </div>
                            <div>
                                <Label htmlFor="recurring-installment-amount">
                                    Amount due
                                </Label>
                                <Input
                                    id="recurring-installment-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="mt-1 h-9"
                                    value={scheduleData.amount_due}
                                    onChange={(event) =>
                                        setScheduleData(
                                            'amount_due',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={scheduleErrors.amount_due}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setScheduleDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={scheduleProcessing}
                                >
                                    {scheduleProcessing
                                        ? 'Saving…'
                                        : editingInstallment
                                          ? 'Save changes'
                                          : 'Add installment'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Account holder and nominee management */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">
                            Account relationships
                        </h2>
                    </div>

                    <FinancialAccountPeopleManagement
                        account={account}
                        customers={customers}
                        nomineesEnabled
                    />
                </div>
            </div>
        </CustomAuthLayout>
    );
}
