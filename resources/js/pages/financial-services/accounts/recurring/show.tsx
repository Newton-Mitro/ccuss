import FinancialAccountActivation from '@/components/financial-account-activation';
import FinancialAccountPeopleManagement from '@/components/financial-account-people-management';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    FileClock,
    ReceiptText,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Installment {
    id: number;
    installment_no: number;
    due_date: string;
    status: string;
    amount_due?: string | number;
}

interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        status: string;
        account_type?: string;
        balance?: string | number;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        recurring_deposit?: {
            installment_amount?: string | number;
            installment_frequency?: string;
            total_installments?: number;
            paid_installments?: number;
            started_at?: string;
            maturity_date?: string;
            installments?: Installment[];
        } | null;
    };
}

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
    const { account, customers } = usePage<
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
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · Recurring deposit account`}
                    action={
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
                    }
                />

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
                    </div>

                    {installments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-sm">
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
                                        <th className="px-4 py-3 text-center font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {installments.map((item) => (
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
                                            <td className="px-4 py-3.5 text-center">
                                                <StatusBadge
                                                    tone={getInstallmentTone(
                                                        item.status,
                                                    )}
                                                >
                                                    {item.status}
                                                </StatusBadge>
                                            </td>
                                        </tr>
                                    ))}
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
