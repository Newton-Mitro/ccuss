import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
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

interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        available_balance?: string | number;
        status?: string;
        name?: string;
        product?: { name?: string; code?: string } | null;
        holder?: { name?: string } | null;
        loan_account?: {
            loan_no?: string;
            principal_amount?: string | number;
            disbursed_amount?: string | number;
            contractual_rate?: string | number;
            interest_calculation?: string;
            term_value?: number;
            term_unit?: string;
            repayment_frequency?: string;
            interest_frequency?: string;
            grace_days?: number;
            late_payment_fine_rate?: string | number;
            approved_at?: string;
            disbursed_at?: string;
            maturity_date?: string;
            status?: string;
        } | null;
    };
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-lg border border-border/70 bg-background/70 px-3.5 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-foreground">
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
        { title: 'Financial Services', href: '' },
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

            <div className="w-full max-w-7xl space-y-6 pb-8">
                <ResourcePageHeader
                    title="Edit loan account"
                    description="Update the account display name and review the approved loan details."
                    action={
                        <Button variant="outline" asChild>
                            <Link
                                href={route('loan-accounts.show', account.id)}
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Back to loan
                            </Link>
                        </Button>
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
                                    Loan account
                                </p>
                                <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
                                    {loanNumber}
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

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                tone={
                                    loan?.status?.toUpperCase() === 'ACTIVE'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {loan?.status ?? 'APPROVED'}
                            </StatusBadge>
                            <StatusBadge>
                                {account.status ?? 'ACCOUNT STATUS UNKNOWN'}
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

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(route('loan-accounts.update', account.id));
                    }}
                    className="space-y-5"
                >
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <PencilLine className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Account display name
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    This is the only editable field on this
                                    account.
                                </p>
                            </div>
                        </div>
                        <div className="max-w-2xl space-y-2 p-5 sm:px-6">
                            <Label htmlFor="account-name">Display name</Label>
                            <Input
                                id="account-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                aria-invalid={Boolean(errors.name)}
                                className="h-11"
                            />
                            <InputError message={errors.name} />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border px-5 py-4 sm:px-6">
                            <h2 className="text-sm font-semibold">
                                Account overview
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Account identity, status and current balances.
                            </p>
                        </div>
                        <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                            {accountDetails.map((detail) => (
                                <DetailItem key={detail.label} {...detail} />
                            ))}
                        </dl>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border px-5 py-4 sm:px-6">
                            <h2 className="text-sm font-semibold">
                                Approved loan terms
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Contract and servicing details are shown for
                                reference and cannot be changed here.
                            </p>
                        </div>
                        <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                            {contractDetails.map((detail) => (
                                <DetailItem key={detail.label} {...detail} />
                            ))}
                        </dl>
                    </section>

                    <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
