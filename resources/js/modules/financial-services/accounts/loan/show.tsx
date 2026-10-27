import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    FileText,
    PencilLine,
    UserRound,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/financial-services/types/accounts/loan/show.interfaces';


function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border/70 bg-background/70 px-3.5 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
                {value || '—'}
            </dd>
        </div>
    );
}

function statusTone(
    status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    switch (status.toUpperCase()) {
        case 'ACTIVE':
        case 'PAID':
        case 'COMPLETED':
            return 'success';
        case 'PENDING':
        case 'DUE':
            return 'warning';
        case 'OVERDUE':
        case 'DEFAULTED':
        case 'REJECTED':
            return 'danger';
        case 'PARTIALLY_PAID':
            return 'info';
        default:
            return 'neutral';
    }
}

export default function LoanAccountShow() {
    useFlashToastHandler();

    const { account } = usePage<Props>().props;
    const loan = account.loan_account;
    const loanNumber = loan?.loan_no ?? account.account_no;
    const schedules = loan?.schedules ?? [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Accounts', href: route('loan-accounts.index') },
        { title: loanNumber, href: '' },
    ];

    const summaryItems = [
        {
            label: 'Approved principal',
            value: formatBDTCurrency(loan?.principal_amount ?? 0, false),
            icon: CircleDollarSign,
        },
        {
            label: 'Disbursed amount',
            value: formatBDTCurrency(loan?.disbursed_amount ?? 0, false),
            icon: FileText,
        },
        {
            label: 'Contractual rate',
            value: `${loan?.contractual_rate ?? '0'}%`,
            icon: CheckCircle2,
        },
        {
            label: 'Loan tenure',
            value:
                loan?.term_value != null
                    ? `${loan.term_value} ${loan.term_unit ?? ''}`.trim()
                    : '—',
            icon: CalendarDays,
        },
    ];

    const accountDetails = [
        { label: 'Account number', value: account.account_no },
        { label: 'Account name', value: account.name ?? '—' },
        {
            label: 'Loan product',
            value:
                [account.product?.code, account.product?.name]
                    .filter(Boolean)
                    .join(' · ') || '—',
        },
        { label: 'Account balance', value: formatBDTCurrency(account.balance) },
        {
            label: 'Available balance',
            value: formatBDTCurrency(account.available_balance),
        },
        {
            label: 'Repayment frequency',
            value: loan?.repayment_frequency ?? '—',
        },
        { label: 'Interest frequency', value: loan?.interest_frequency ?? '—' },
        {
            label: 'Interest calculation',
            value: loan?.interest_calculation ?? '—',
        },
        { label: 'Grace period', value: `${loan?.grace_days ?? 0} days` },
        {
            label: 'Late payment fine rate',
            value: `${loan?.late_payment_fine_rate ?? '0'}%`,
        },
        { label: 'Approved date', value: formatDate(loan?.approved_at) },
        { label: 'Disbursed date', value: formatDate(loan?.disbursed_at) },
        { label: 'Maturity date', value: formatDate(loan?.maturity_date) },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={loanNumber} />

            <div className="w-full max-w-7xl space-y-6 pb-8">
                <ResourcePageHeader variant="account"
                    title={loanNumber}
                    description="Loan account overview, approved terms and repayment progress."
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={route('loan-accounts.index')}>
                                    <ArrowLeft className="mr-2 size-4" />
                                    Loan accounts
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link
                                    href={route(
                                        'loan-accounts.edit',
                                        account.id,
                                    )}
                                >
                                    <PencilLine className="mr-2 size-4" />
                                    Edit account
                                </Link>
                            </Button>
                        </div>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText className="size-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Loan contract
                                </p>
                                <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
                                    {account.name || loanNumber}
                                </h2>
                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <UserRound className="size-3.5 shrink-0" />
                                    <span className="truncate">
                                        {account.holder?.name ??
                                            'Borrower not assigned'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge
                                tone={statusTone(loan?.status ?? 'APPROVED')}
                            >
                                Loan: {loan?.status ?? 'APPROVED'}
                            </StatusBadge>
                            <StatusBadge
                                tone={statusTone(account.status ?? 'UNKNOWN')}
                            >
                                Account: {account.status ?? 'UNKNOWN'}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
                        {summaryItems.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 bg-card px-5 py-4"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                                    <Icon className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 truncate text-sm font-semibold tabular-nums">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Clock3 className="size-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                Loan details
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Account information and approved servicing
                                terms.
                            </p>
                        </div>
                    </div>
                    <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
                        {accountDetails.map((detail) => (
                            <DetailItem key={detail.label} {...detail} />
                        ))}
                    </dl>
                </section>

                <ResourceTableCard className="overflow-hidden rounded-2xl shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Repayment schedule
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Installment due dates, amounts and payment
                                status.
                            </p>
                        </div>
                        <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {schedules.length}{' '}
                            {schedules.length === 1
                                ? 'installment'
                                : 'installments'}
                        </span>
                    </div>
                    {schedules.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead className="bg-muted/60 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Installment
                                        </th>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Due date
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Amount due
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Amount paid
                                        </th>
                                        <th className="px-5 py-3 text-center font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-border/70 transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-3.5 font-medium">
                                                <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/8 text-xs font-semibold text-primary">
                                                    {item.installment_no}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground">
                                                {formatDate(item.due_date)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                                                {formatBDTCurrency(
                                                    item.total_due ?? 0,
                                                    false,
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right tabular-nums">
                                                {formatBDTCurrency(
                                                    item.total_paid ?? 0,
                                                    false,
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <StatusBadge
                                                    tone={statusTone(
                                                        item.status,
                                                    )}
                                                >
                                                    {item.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </StatusBadge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <CalendarDays className="size-5" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">
                                No repayment schedule yet
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Installment details will appear here when a
                                repayment schedule is available.
                            </p>
                        </div>
                    )}
                </ResourceTableCard>
            </div>
        </CustomAuthLayout>
    );
}
