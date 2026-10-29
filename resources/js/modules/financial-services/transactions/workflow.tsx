import HeadingSmall from '@/components/heading-small';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { FinancialAccountSearchResult } from '@/modules/financial-services/components/financial-account-search-input';
import { FinancialAccountSearchInput } from '@/modules/financial-services/components/financial-account-search-input';
import type { FinancialTransactionWorkflowPageProps } from '@/modules/financial-services/types/financial-services';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRightLeft,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Eye,
    FileText,
    Landmark,
    LoaderCircle,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { route } from 'ziggy-js';

const details: Record<
    string,
    {
        title: string;
        description: string;
        icon: typeof ArrowRightLeft;
        eyebrow: string;
        action: string;
    }
> = {
    transfer: {
        title: 'Account transfer',
        description:
            'Move funds between financial accounts with a traceable transaction record.',
        icon: ArrowRightLeft,
        eyebrow: 'Account operations',
        action: 'Create transfer draft',
    },
    'loan-disbursement': {
        title: 'Loan disbursement',
        description:
            'Disburse an approved loan through an authorized cash or bank account.',
        icon: CircleDollarSign,
        eyebrow: 'Loan operations',
        action: 'Create disbursement draft',
    },
    'loan-repayment': {
        title: 'Loan repayment',
        description:
            'Record a loan repayment and allocate it through the configured repayment workflow.',
        icon: CircleDollarSign,
        eyebrow: 'Loan operations',
        action: 'Create repayment draft',
    },
};

function getLocalDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function Field({
    label,
    children,
    error,
    hint,
    required = false,
}: {
    label: string;
    children: ReactNode;
    error?: string;
    hint?: string;
    required?: boolean;
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>

            {children}

            {error ? (
                <p className="text-xs leading-relaxed text-destructive">
                    {error}
                </p>
            ) : hint ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof FileText;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                <Icon className="size-4 text-primary" />
            </div>

            <div className="min-w-0">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function TransactionWorkflow() {
    const [destinationSearchResetKey, setDestinationSearchResetKey] =
        useState(0);
    const [selectedSource, setSelectedSource] =
        useState<FinancialAccountSearchResult | null>(null);
    const [selectedDestination, setSelectedDestination] =
        useState<FinancialAccountSearchResult | null>(null);
    const {
        workflow,
        accounts = [],
        loan_accounts = [],
        payout_accounts = [],
    } = usePage<FinancialTransactionWorkflowPageProps>().props;

    const detail = details[workflow] ?? details.transfer;
    const Icon = detail.icon;
    const isTransfer = workflow === 'transfer';
    const isDisbursement = workflow === 'loan-disbursement';
    const isRepayment = workflow === 'loan-repayment';
    const isLoanWorkflow = isDisbursement || isRepayment;

    const { data, setData, post, processing, errors } = useForm({
        idempotency_key: crypto.randomUUID(),
        source_account_id: '',
        destination_account_id: '',
        transaction_date: getLocalDate(),
        amount: '',
        currency: 'BDT',
        reference: '',
        description: '',
        loan_account_id: '',
        payout_account_id: '',
        disbursed_at: getLocalDate(),
        repayment_date: getLocalDate(),
        note: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Transactions',
            href: route('financial-transactions.index'),
        },
        { title: detail.title, href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isTransfer) {
            post(route('financial-transactions.transfer.store'));
        } else if (isDisbursement) {
            post(route('financial-transactions.loan-disbursement.store'));
        } else if (isRepayment) {
            post(route('financial-transactions.loan-repayment.store'));
        }
    };

    const selectedLoan = loan_accounts.find(
        (loan) => String(loan.id) === data.loan_account_id,
    );

    const remainingAmount = selectedLoan
        ? Math.max(
              0,
              Number(selectedLoan.principal_amount) -
                  Number(selectedLoan.disbursed_amount),
          )
        : null;

    const noTransferAccounts = accounts.length < 2;
    const sameTransferAccount =
        Boolean(data.source_account_id) &&
        data.source_account_id === data.destination_account_id;

    const canSubmit = isTransfer
        ? !noTransferAccounts && !sameTransferAccount
        : loan_accounts.length > 0 && payout_accounts.length > 0;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={detail.title} />

            <div className="w-full max-w-none space-y-6 pb-24">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={detail.title}
                        description={detail.description}
                    />
                </div>

                {/* Workflow overview */}
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-card shadow-sm">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />

                    <div className="flex flex-col gap-5 p-5 pl-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-background/80 text-primary shadow-sm">
                                <Icon className="size-6" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        {detail.eyebrow}
                                    </span>

                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                        <span className="size-1.5 rounded-full bg-amber-500" />
                                        Draft
                                    </span>
                                </div>

                                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                                    {detail.title}
                                </h2>

                                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                    Complete the required information below to
                                    prepare this transaction for review.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-background/80 px-4 py-3 shadow-sm">
                            <ShieldCheck className="size-4 text-primary" />
                            <span className="text-xs font-medium">
                                Controlled workflow
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {isTransfer ? (
                        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="min-w-0 space-y-6">
                                {/* Transfer accounts */}
                                <section className="relative z-20 overflow-visible rounded-2xl border bg-card shadow-sm">
                                    <div className="rounded-t-2xl border-b bg-muted/30 px-5 py-5 sm:px-7">
                                        <SectionHeading
                                            icon={ArrowRightLeft}
                                            title="Transfer accounts"
                                            description="Choose the account to debit and the account to credit."
                                        />
                                    </div>

                                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7">
                                        <Field
                                            label="Source account"
                                            required
                                            error={errors.source_account_id}
                                            hint="Funds will be deducted from this account."
                                        >
                                            <FinancialAccountSearchInput
                                                placeholder="Search source account"
                                                onSelect={(account) => {
                                                    const sourceAccountId =
                                                        String(account.id);
                                                    setData(
                                                        'source_account_id',
                                                        sourceAccountId,
                                                    );
                                                    setSelectedSource(account);

                                                    if (
                                                        sourceAccountId ===
                                                        data.destination_account_id
                                                    ) {
                                                        setData(
                                                            'destination_account_id',
                                                            '',
                                                        );
                                                        setSelectedDestination(
                                                            null,
                                                        );
                                                        setDestinationSearchResetKey(
                                                            (key) => key + 1,
                                                        );
                                                    }
                                                }}
                                                clearSelectedAccount={() => {
                                                    setData(
                                                        'source_account_id',
                                                        '',
                                                    );
                                                    setSelectedSource(null);
                                                }}
                                            />
                                        </Field>

                                        <Field
                                            label="Destination account"
                                            required
                                            error={
                                                errors.destination_account_id
                                            }
                                            hint="Funds will be credited to this account."
                                        >
                                            <FinancialAccountSearchInput
                                                key={destinationSearchResetKey}
                                                placeholder="Search destination account"
                                                excludeAccountIds={
                                                    data.source_account_id
                                                        ? [
                                                              Number(
                                                                  data.source_account_id,
                                                              ),
                                                          ]
                                                        : []
                                                }
                                                onSelect={(account) => {
                                                    setData(
                                                        'destination_account_id',
                                                        String(account.id),
                                                    );
                                                    setSelectedDestination(
                                                        account,
                                                    );
                                                }}
                                                clearSelectedAccount={() => {
                                                    setData(
                                                        'destination_account_id',
                                                        '',
                                                    );
                                                    setSelectedDestination(
                                                        null,
                                                    );
                                                }}
                                            />
                                        </Field>

                                        {noTransferAccounts && (
                                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground sm:col-span-2">
                                                At least two eligible financial
                                                accounts are required to create
                                                a transfer.
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Transfer details */}
                                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                    <div className="border-b bg-muted/30 px-5 py-5 sm:px-7">
                                        <SectionHeading
                                            icon={FileText}
                                            title="Transaction details"
                                            description="Specify the transfer amount, effective date, and supporting information."
                                        />
                                    </div>

                                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7 lg:grid-cols-3">
                                        <Field
                                            label="Transfer date"
                                            required
                                            error={errors.transaction_date}
                                        >
                                            <AppDatePicker
                                                value={data.transaction_date}
                                                onChange={(value) =>
                                                    setData(
                                                        'transaction_date',
                                                        value,
                                                    )
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Transfer amount"
                                            required
                                            error={errors.amount}
                                            hint="Enter an amount greater than zero."
                                        >
                                            <div className="relative">
                                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                                                    ৳
                                                </span>
                                                <Input
                                                    type="number"
                                                    min="0.0001"
                                                    step="0.0001"
                                                    required
                                                    className="pl-8 tabular-nums"
                                                    placeholder="0.00"
                                                    value={data.amount}
                                                    onChange={(event) =>
                                                        setData(
                                                            'amount',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </Field>

                                        <Field
                                            label="Reference number"
                                            error={errors.reference}
                                            hint="Optional cheque, voucher, or external reference."
                                        >
                                            <Input
                                                value={data.reference}
                                                onChange={(event) =>
                                                    setData(
                                                        'reference',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Enter reference number"
                                                maxLength={100}
                                            />
                                        </Field>

                                        <Field
                                            label="Description"
                                            error={errors.description}
                                            hint="Optional explanation for the transfer."
                                        >
                                            <Input
                                                value={data.description}
                                                onChange={(event) =>
                                                    setData(
                                                        'description',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Internal account transfer"
                                                maxLength={255}
                                            />
                                        </Field>
                                    </div>
                                </section>
                            </div>

                            <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                        <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                        <div className="relative flex items-center gap-2.5">
                                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                                <Eye className="size-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                                    Transfer overview
                                                </p>
                                                <h2 className="text-sm font-semibold">
                                                    Live preview
                                                </h2>
                                            </div>
                                            <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                                LIVE
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-3">
                                        <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <CircleDollarSign className="size-4 text-primary" />
                                                Transfer amount
                                            </div>
                                            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                                {formatBDTCurrency(
                                                    data.amount || 0,
                                                )}
                                            </p>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {data.currency}
                                            </p>
                                        </div>

                                        {[
                                            {
                                                label: 'From account',
                                                account: selectedSource,
                                                icon: Wallet,
                                            },
                                            {
                                                label: 'To account',
                                                account: selectedDestination,
                                                icon: Landmark,
                                            },
                                        ].map((item) => {
                                            const AccountIcon = item.icon;
                                            return (
                                                <div
                                                    key={item.label}
                                                    className="rounded-xl border border-border/60 bg-muted/20 p-3"
                                                >
                                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        <AccountIcon className="size-3.5" />
                                                        {item.label}
                                                    </div>
                                                    {item.account ? (
                                                        <div className="mt-2 min-w-0">
                                                            <p className="font-mono text-sm font-semibold break-all">
                                                                {
                                                                    item.account
                                                                        .account_no
                                                                }
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {item.account
                                                                    .name ||
                                                                    item.account.account_type.replaceAll(
                                                                        '_',
                                                                        ' ',
                                                                    )}
                                                            </p>
                                                            <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2 text-[11px]">
                                                                <span className="text-muted-foreground">
                                                                    Available
                                                                </span>
                                                                <span className="font-medium tabular-nums">
                                                                    {formatBDTCurrency(
                                                                        item
                                                                            .account
                                                                            .available_balance,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            Select an account to
                                                            preview it.
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <div className="space-y-2">
                                            {[
                                                {
                                                    label: 'Transfer date',
                                                    value: data.transaction_date
                                                        ? new Intl.DateTimeFormat(
                                                              'en-BD',
                                                              {
                                                                  dateStyle:
                                                                      'medium',
                                                              },
                                                          ).format(
                                                              new Date(
                                                                  `${data.transaction_date}T00:00:00`,
                                                              ),
                                                          )
                                                        : 'Not set',
                                                },
                                                {
                                                    label: 'Reference',
                                                    value:
                                                        data.reference ||
                                                        'Not provided',
                                                },
                                                {
                                                    label: 'Description',
                                                    value:
                                                        data.description ||
                                                        'Not provided',
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5"
                                                >
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.label}
                                                    </span>
                                                    <span className="min-w-0 text-right text-xs font-medium break-words">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {sameTransferAccount && (
                                            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                                                Choose two different accounts to
                                                continue.
                                            </p>
                                        )}
                                    </div>
                                </section>
                            </aside>
                        </div>
                    ) : isLoanWorkflow ? (
                        <>
                            {/* Loan selection */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="border-b bg-muted/20 px-4 py-4 sm:px-5">
                                    <SectionHeading
                                        icon={Landmark}
                                        title="Loan and payout accounts"
                                        description="Select the loan and the authorized account used for the transaction."
                                    />
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
                                    <Field
                                        label="Loan account"
                                        required
                                        error={errors.loan_account_id}
                                    >
                                        <Select
                                            value={data.loan_account_id}
                                            onChange={(value) =>
                                                setData(
                                                    'loan_account_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: isDisbursement
                                                        ? 'Select approved loan'
                                                        : 'Select active loan',
                                                },
                                                ...loan_accounts.map(
                                                    (loan) => ({
                                                        value: String(loan.id),
                                                        label: `${loan.loan_no} - ${loan.financial_account?.customer?.name ?? 'Customer'}`,
                                                    }),
                                                ),
                                            ]}
                                        />
                                    </Field>

                                    <Field
                                        label="Payout account"
                                        required
                                        error={errors.payout_account_id}
                                        hint="Select the cash or bank account for this transaction."
                                    >
                                        <Select
                                            value={data.payout_account_id}
                                            onChange={(value) =>
                                                setData(
                                                    'payout_account_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select cash or bank account',
                                                },
                                                ...payout_accounts.map(
                                                    (account) => ({
                                                        value: String(
                                                            account.id,
                                                        ),
                                                        label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                                    }),
                                                ),
                                            ]}
                                        />
                                    </Field>

                                    {selectedLoan &&
                                        remainingAmount !== null && (
                                            <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:col-span-2 lg:col-span-1">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                                                    <Wallet className="size-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Remaining principal
                                                        available for
                                                        disbursement
                                                    </p>
                                                    <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
                                                        {formatBDTCurrency(
                                                            remainingAmount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </section>

                            {/* Loan transaction details */}
                            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                <div className="border-b bg-muted/30 px-5 py-5 sm:px-7">
                                    <SectionHeading
                                        icon={CalendarDays}
                                        title="Transaction details"
                                        description="Provide the amount, transaction date, and supporting reference."
                                    />
                                </div>

                                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7 xl:grid-cols-4">
                                    <Field
                                        label="Transaction amount"
                                        required
                                        error={errors.amount}
                                    >
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                                                ৳
                                            </span>
                                            <Input
                                                type="number"
                                                min="0.0001"
                                                step="0.0001"
                                                required
                                                className="pl-8 tabular-nums"
                                                placeholder="0.00"
                                                value={data.amount}
                                                onChange={(event) =>
                                                    setData(
                                                        'amount',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </Field>

                                    <Field
                                        label={
                                            isDisbursement
                                                ? 'Disbursement date'
                                                : 'Repayment date'
                                        }
                                        required
                                        error={
                                            isDisbursement
                                                ? errors.disbursed_at
                                                : errors.repayment_date
                                        }
                                    >
                                        <AppDatePicker
                                            value={
                                                isDisbursement
                                                    ? data.disbursed_at
                                                    : data.repayment_date
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    isDisbursement
                                                        ? 'disbursed_at'
                                                        : 'repayment_date',
                                                    value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="Reference number"
                                        error={errors.reference}
                                        hint="Optional receipt, voucher, or external reference."
                                    >
                                        <Input
                                            value={data.reference}
                                            onChange={(event) =>
                                                setData(
                                                    'reference',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Enter reference number"
                                            maxLength={100}
                                        />
                                    </Field>

                                    {isDisbursement ? (
                                        <Field
                                            label="Disbursement note"
                                            error={errors.note}
                                            hint="Optional internal note for the disbursement."
                                        >
                                            <Input
                                                value={data.note}
                                                onChange={(event) =>
                                                    setData(
                                                        'note',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Add a note"
                                                maxLength={255}
                                            />
                                        </Field>
                                    ) : (
                                        <Field
                                            label="Additional note"
                                            error={errors.note}
                                            hint="Optional repayment remarks."
                                        >
                                            <Input
                                                value={data.note}
                                                onChange={(event) =>
                                                    setData(
                                                        'note',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Add repayment remarks"
                                                maxLength={255}
                                            />
                                        </Field>
                                    )}
                                </div>
                            </section>
                        </>
                    ) : (
                        <section className="rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-10">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon className="size-7" />
                            </div>

                            <h2 className="mt-4 text-lg font-semibold">
                                Workflow ready for configuration
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                                This workflow will validate account eligibility,
                                product rules, and accounting mappings before
                                posting.
                            </p>

                            <Button asChild className="mt-6">
                                <Link
                                    href={route('financial-transactions.index')}
                                >
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back to transactions
                                </Link>
                            </Button>
                        </section>
                    )}

                    {/* Sticky form actions */}
                    {(isTransfer || isLoanWorkflow) && (
                        <div
                            className={
                                isTransfer
                                    ? 'border-t bg-background/95 px-4 py-4 md:px-6'
                                    : 'sticky bottom-0 z-20 -mx-4 border-t bg-background/95 px-4 py-4 shadow-[0_-8px_24px_-18px_hsl(var(--foreground)/0.3)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6'
                            }
                        >
                            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-4 shrink-0" />
                                    <span>
                                        Draft only. Final posting follows
                                        authorization rules.
                                    </span>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        asChild
                                        type="button"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        <Link
                                            href={route(
                                                'financial-transactions.index',
                                            )}
                                        >
                                            <ArrowLeft className="mr-2 size-4" />
                                            Cancel
                                        </Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            !canSubmit ||
                                            sameTransferAccount
                                        }
                                    >
                                        {processing ? (
                                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="mr-2 size-4" />
                                        )}
                                        <span>
                                            {processing
                                                ? 'Processing...'
                                                : detail.action}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </CustomAuthLayout>
    );
}
