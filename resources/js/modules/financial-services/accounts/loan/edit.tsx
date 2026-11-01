import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { Props } from '@/modules/financial-services/types/accounts/loan/edit.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CalendarDays,
    CircleDollarSign,
    FileText,
    PencilLine,
    UserRound,
} from 'lucide-react';
import { route } from 'ziggy-js';

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-lg border border-border/70 bg-background/70 px-2.5 py-2">
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="mt-0.5 truncate text-xs font-semibold text-foreground">
                {value || '—'}
            </dd>
        </div>
    );
}

export default function LoanAccountEdit() {
    const { account } = usePage<Props>().props;
    const loan = account.loan_account;
    const loanNumber = loan?.loan_no ?? account.account_no;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        { title: 'Loan Accounts', href: route('loan-accounts.index') },
        { title: loanNumber, href: '' },
    ];

    const summaryItems = [
        {
            label: 'Approved principal',
            value: formatBDTCurrency(loan?.principal_amount),
            icon: CircleDollarSign,
        },
        {
            label: 'Disbursed amount',
            value: formatBDTCurrency(loan?.disbursed_amount),
            icon: Banknote,
        },
        {
            label: 'Contractual rate',
            value: `${loan?.contractual_rate ?? '0'}%`,
            icon: FileText,
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
        { label: 'Loan number', value: loanNumber },
        {
            label: 'Loan product',
            value:
                [account.product?.code, account.product?.name]
                    .filter(Boolean)
                    .join(' · ') || '—',
        },
        { label: 'Borrower', value: account.holder?.name ?? '—' },
        { label: 'Account type', value: account.account_type ?? 'LOAN' },
        { label: 'Account status', value: account.status ?? '—' },
        { label: 'Loan status', value: loan?.status ?? '—' },
        {
            label: 'Account balance',
            value: formatBDTCurrency(account.balance),
        },
        {
            label: 'Available balance',
            value: formatBDTCurrency(account.available_balance),
        },
    ];

    const contractDetails = [
        {
            label: 'Interest calculation',
            value: loan?.interest_calculation ?? '—',
        },
        {
            label: 'Repayment frequency',
            value: loan?.repayment_frequency ?? '—',
        },
        {
            label: 'Interest frequency',
            value: loan?.interest_frequency ?? '—',
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
            <Head title={`Edit ${loanNumber}`} />

            <div className="w-full max-w-7xl space-y-4 pb-24">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Edit loan account"
                        description="Update the account display name and review the approved loan details."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <Button variant="outline" asChild>
                            <Link
                                href={route('loan-accounts.show', account.id)}
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Back to loan
                            </Link>
                        </Button>
                    </div>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(route('loan-accounts.update', account.id));
                    }}
                    className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                >
                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm lg:col-span-2">
                        <div className="relative overflow-hidden bg-gradient-to-r from-primary/[0.12] via-primary/[0.06] to-card p-4 text-foreground sm:p-5">
                            <div className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full bg-primary/10 blur-3xl" />
                            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                                        Loan account
                                    </p>
                                    <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
                                        {loanNumber}
                                    </h2>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <UserRound className="size-3.5 shrink-0 text-primary" />
                                        <span className="truncate">
                                            {account.holder?.name ??
                                                'Borrower not assigned'}
                                        </span>
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <StatusBadge
                                            tone={
                                                loan?.status?.toUpperCase() ===
                                                'ACTIVE'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {loan?.status ?? 'APPROVED'}
                                        </StatusBadge>
                                        <StatusBadge>
                                            {account.status ??
                                                'ACCOUNT STATUS UNKNOWN'}
                                        </StatusBadge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 xl:min-w-[520px]">
                                    {summaryItems.map(
                                        ({ label, value, icon: Icon }) => (
                                            <div
                                                key={label}
                                                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border/70 bg-background/75 px-3 py-2.5 shadow-sm"
                                            >
                                                <Icon className="size-4 shrink-0 text-primary" />
                                                <div className="min-w-0">
                                                    <p className="truncate text-[10px] text-muted-foreground">
                                                        {label}
                                                    </p>
                                                    <p className="truncate text-xs font-semibold tabular-nums">
                                                        {value}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="min-w-0 space-y-3">
                        <section className="overflow-hidden rounded-xl border border-primary/20 bg-card shadow-sm">
                            <div className="flex items-center gap-2.5 border-b bg-primary/[0.04] px-3.5 py-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <PencilLine className="size-3.5" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold">
                                        Display name
                                    </h2>
                                    <p className="text-[10px] text-muted-foreground">
                                        The only editable loan account detail
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3">
                                <Input
                                    id="account-name"
                                    aria-label="Display name"
                                    placeholder="Enter account display name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-9"
                                />
                                <InputError message={errors.name} />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b px-3.5 py-2.5">
                                <p className="text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                                    Account details
                                </p>
                                <h2 className="text-xs font-semibold">
                                    Overview
                                </h2>
                            </div>
                            <dl className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                                {accountDetails.map((detail) => (
                                    <DetailItem
                                        key={detail.label}
                                        {...detail}
                                    />
                                ))}
                            </dl>
                        </section>
                    </div>

                    <section className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-3.5 py-2.5">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                                    Reference only
                                </p>
                                <h2 className="text-xs font-semibold">
                                    Approved loan terms
                                </h2>
                            </div>
                            <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <dl className="grid gap-2 p-3 sm:grid-cols-2">
                            {contractDetails.map((detail) => (
                                <DetailItem key={detail.label} {...detail} />
                            ))}
                        </dl>
                    </section>

                    <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:col-span-2">
                        <p className="text-xs text-muted-foreground">
                            Loan contract terms remain protected from this
                            screen.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button asChild type="button" variant="outline">
                                <Link
                                    href={route(
                                        'loan-accounts.show',
                                        account.id,
                                    )}
                                >
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
