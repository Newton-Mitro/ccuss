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

type RepaymentAmountField =
    | 'principal_amount'
    | 'interest_amount'
    | 'fine_amount'
    | 'protection_fee_amount'
    | 'protection_renewal_fee';

type RepaymentLoan = NonNullable<
    FinancialTransactionWorkflowPageProps['loan_accounts']
>[number];

function getRepaymentDue(loan: RepaymentLoan, repaymentDate: string) {
    const due = (loan.schedules ?? [])
        .filter(
            (schedule) =>
                schedule.due_date <= repaymentDate &&
                !['PAID', 'WAIVED'].includes(schedule.status),
        )
        .flatMap((schedule) => schedule.components ?? [])
        .filter((component) => !['PAID', 'WAIVED'].includes(component.status))
        .reduce(
            (totals, component) => {
                const outstanding = Math.max(
                    0,
                    Number(component.amount_due) -
                        Number(component.amount_paid),
                );
                if (component.type === 'PRINCIPAL') {
                    totals.principal += outstanding;
                } else if (component.type === 'INTEREST') {
                    totals.interest += outstanding;
                } else if (component.type === 'PROTECTION_FEE') {
                    totals.protection += outstanding;
                } else {
                    totals.fine += outstanding;
                }
                return totals;
            },
            { principal: 0, interest: 0, protection: 0, fine: 0 },
        );
    const policy = loan.protection_policy;
    const renewal =
        policy?.status === 'ACTIVE' &&
        policy.next_renewal_at &&
        policy.next_renewal_at <= repaymentDate
            ? Number(policy.renewal_fee)
            : 0;

    return { ...due, renewal };
}

function repaymentFormDefaults(loan: RepaymentLoan, repaymentDate: string) {
    const due = getRepaymentDue(loan, repaymentDate);
    const amounts = {
        principal_amount: due.principal.toFixed(2),
        interest_amount: due.interest.toFixed(2),
        fine_amount: due.fine.toFixed(2),
        protection_fee_amount: due.protection.toFixed(2),
        protection_renewal_fee: due.renewal.toFixed(2),
    };

    return {
        ...amounts,
        amount: Object.values(amounts)
            .reduce((sum, value) => sum + Number(value), 0)
            .toFixed(2),
    };
}

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

function AccountBalanceSummary({
    account,
}: {
    account: FinancialAccountSearchResult | null;
}) {
    return (
        <div className="flex items-center gap-3 text-[11px] leading-none text-muted-foreground">
            <div className="min-w-0">
                <span>Balance </span>
                <span className="font-semibold text-foreground tabular-nums">
                    {formatBDTCurrency(account?.balance ?? 0)}
                </span>
            </div>
            <span className="h-3 border-l" aria-hidden="true" />
            <div className="min-w-0">
                <span>Available </span>
                <span className="font-semibold text-foreground tabular-nums">
                    {formatBDTCurrency(account?.available_balance ?? 0)}
                </span>
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
    const [selectedPayoutSearchAccount, setSelectedPayoutSearchAccount] =
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
        principal_amount: '',
        interest_amount: '',
        fine_amount: '',
        protection_fee_amount: '',
        protection_renewal_fee: '',
        note: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
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
    const selectedPayoutAccount =
        selectedPayoutSearchAccount ??
        payout_accounts.find(
            (account) => String(account.id) === data.payout_account_id,
        );
    const workflowError = isDisbursement
        ? errors.disbursement
        : isRepayment
          ? errors.repayment
          : undefined;
    const repaymentDue = selectedLoan
        ? getRepaymentDue(selectedLoan, data.repayment_date)
        : null;
    const totalRepaymentDue = repaymentDue
        ? repaymentDue.principal +
          repaymentDue.interest +
          repaymentDue.protection +
          repaymentDue.fine +
          repaymentDue.renewal
        : 0;
    const repaymentAmountFields: Array<{
        field: RepaymentAmountField;
        label: string;
        due: number;
    }> = [
        {
            field: 'principal_amount',
            label: 'Monthly principal repayment',
            due: repaymentDue?.principal ?? 0,
        },
        {
            field: 'interest_amount',
            label: 'Interest',
            due: repaymentDue?.interest ?? 0,
        },
        {
            field: 'fine_amount',
            label: 'Fine',
            due: repaymentDue?.fine ?? 0,
        },
        {
            field: 'protection_fee_amount',
            label: 'Loan protection fee',
            due: repaymentDue?.protection ?? 0,
        },
        {
            field: 'protection_renewal_fee',
            label: 'Loan protection renewal fee',
            due: repaymentDue?.renewal ?? 0,
        },
    ];

    const updateRepaymentAmount = (
        field: RepaymentAmountField,
        value: string,
    ) => {
        const amounts = {
            principal_amount: data.principal_amount,
            interest_amount: data.interest_amount,
            fine_amount: data.fine_amount,
            protection_fee_amount: data.protection_fee_amount,
            protection_renewal_fee: data.protection_renewal_fee,
            [field]: value,
        };
        const total = Object.values(amounts).reduce(
            (sum, amount) => sum + (Number(amount) || 0),
            0,
        );

        setData({ ...data, ...amounts, amount: total.toFixed(2) });
    };

    const fillScheduledRepayment = () => {
        if (selectedLoan) {
            setData({
                ...data,
                ...repaymentFormDefaults(selectedLoan, data.repayment_date),
            });
        }
    };

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

                                    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4">
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
                                            <AccountBalanceSummary
                                                account={selectedSource}
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
                                            <AccountBalanceSummary
                                                account={selectedDestination}
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
                        <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="min-w-0 space-y-4">
                                {workflowError && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                                    >
                                        {workflowError}
                                    </div>
                                )}

                                {/* Loan selection */}
                                <section className="relative z-20 overflow-visible rounded-xl border bg-card">
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
                                            {isLoanWorkflow ? (
                                                <FinancialAccountSearchInput
                                                    scope={
                                                        isRepayment
                                                            ? 'loan_repayment'
                                                            : 'loan_disbursement'
                                                    }
                                                    placeholder={
                                                        isRepayment
                                                            ? 'Search loan number or borrower'
                                                            : 'Search approved loan number or borrower'
                                                    }
                                                    onSelect={(account) => {
                                                        const loan =
                                                            loan_accounts.find(
                                                                (item) =>
                                                                    item.financial_account_id ===
                                                                    account.id,
                                                            );
                                                        if (!loan) return;

                                                        if (isRepayment) {
                                                            setData({
                                                                ...data,
                                                                loan_account_id:
                                                                    String(
                                                                        loan.id,
                                                                    ),
                                                                ...repaymentFormDefaults(
                                                                    loan,
                                                                    data.repayment_date,
                                                                ),
                                                            });
                                                        } else {
                                                            setData(
                                                                'loan_account_id',
                                                                String(loan.id),
                                                            );
                                                        }
                                                    }}
                                                    clearSelectedAccount={() => {
                                                        if (isRepayment) {
                                                            setData({
                                                                ...data,
                                                                loan_account_id:
                                                                    '',
                                                                principal_amount:
                                                                    '0.00',
                                                                interest_amount:
                                                                    '0.00',
                                                                fine_amount:
                                                                    '0.00',
                                                                protection_fee_amount:
                                                                    '0.00',
                                                                protection_renewal_fee:
                                                                    '0.00',
                                                                amount: '0.00',
                                                            });
                                                        } else {
                                                            setData(
                                                                'loan_account_id',
                                                                '',
                                                            );
                                                        }
                                                    }}
                                                />
                                            ) : (
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
                                                            label: 'Select approved loan',
                                                        },
                                                        ...loan_accounts.map(
                                                            (loan) => ({
                                                                value: String(
                                                                    loan.id,
                                                                ),
                                                                label: `${loan.loan_no} - ${loan.financial_account?.customer?.name ?? 'Customer'}`,
                                                            }),
                                                        ),
                                                    ]}
                                                />
                                            )}
                                        </Field>

                                        <Field
                                            label="Payout account"
                                            required
                                            error={errors.payout_account_id}
                                            hint="Choose the cash or bank account used for this transaction."
                                        >
                                            <FinancialAccountSearchInput
                                                scope="payout"
                                                placeholder="Search cash or bank account"
                                                onSelect={(account) => {
                                                    setData(
                                                        'payout_account_id',
                                                        String(account.id),
                                                    );
                                                    setSelectedPayoutSearchAccount(
                                                        account,
                                                    );
                                                }}
                                                clearSelectedAccount={() => {
                                                    setData(
                                                        'payout_account_id',
                                                        '',
                                                    );
                                                    setSelectedPayoutSearchAccount(
                                                        null,
                                                    );
                                                }}
                                            />
                                            <AccountBalanceSummary
                                                account={
                                                    selectedPayoutSearchAccount
                                                }
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
                                        {isRepayment && selectedLoan && repaymentDue && (
                                            <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:col-span-2">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            Editable repayment breakdown
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Adjust each amount up to its outstanding balance for the selected date.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={totalRepaymentDue <= 0}
                                                        onClick={fillScheduledRepayment}
                                                    >
                                                        Fill scheduled amounts
                                                    </Button>
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                    {repaymentAmountFields.map(
                                                        ({ field, label, due }) => (
                                                            <Field
                                                                key={field}
                                                                label={label}
                                                                error={errors[field]}
                                                                hint={`Outstanding: ${formatBDTCurrency(due)}`}
                                                            >
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max={due.toFixed(2)}
                                                                    step="0.01"
                                                                    required
                                                                    value={data[field]}
                                                                    onChange={(event) =>
                                                                        updateRepaymentAmount(
                                                                            field,
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                />
                                                            </Field>
                                                        ),
                                                    )}
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
                                        {isRepayment ? (
                                            <Field
                                                label="Total repayment collected"
                                                required
                                                error={errors.amount}
                                                hint="Calculated from the editable component amounts."
                                            >
                                                <Input
                                                    type="number"
                                                    readOnly
                                                    className="bg-muted/40 font-semibold tabular-nums"
                                                    value={data.amount}
                                                />
                                            </Field>
                                        ) : (
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
                                        )}

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
                                                onChange={(value) => {
                                                    if (isDisbursement) {
                                                        setData(
                                                            'disbursed_at',
                                                            value,
                                                        );
                                                        return;
                                                    }
                                                    if (isRepayment && selectedLoan) {
                                                        setData({
                                                            ...data,
                                                            repayment_date:
                                                                value,
                                                            ...repaymentFormDefaults(
                                                                selectedLoan,
                                                                value,
                                                            ),
                                                        });
                                                        return;
                                                    }
                                                    setData(
                                                        'repayment_date',
                                                        value,
                                                    );
                                                }}
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
                            </div>

                            <aside className="min-w-0 space-y-3 rounded-xl border bg-card p-3.5 shadow-sm xl:sticky xl:top-4">
                                <div className="flex items-center gap-2.5 border-b pb-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Eye className="size-3.5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-semibold tracking-[0.14em] text-primary uppercase">
                                            Transaction summary
                                        </p>
                                        <h2 className="text-[13px] font-semibold">
                                            Live preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>

                                <div className="rounded-lg bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3 ring-1 ring-primary/10">
                                    <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                        {isDisbursement
                                            ? 'Loan disbursement'
                                            : 'Loan repayment'}
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-semibold">
                                        {selectedLoan?.loan_no ??
                                            'Select a loan account'}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                        {selectedLoan?.financial_account
                                            ?.customer?.name ??
                                            'Borrower not selected'}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-primary/15 bg-primary/[0.06] px-3 py-2.5">
                                    <p className="text-[10px] text-muted-foreground">
                                        {isDisbursement
                                            ? 'Disbursement amount'
                                            : 'Repayment amount'}
                                    </p>
                                    <p className="mt-0.5 text-lg font-semibold text-primary tabular-nums">
                                        {formatBDTCurrency(data.amount || 0)}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    {[
                                        {
                                            label: 'Payout account',
                                            value: selectedPayoutAccount
                                                ? `${selectedPayoutAccount.account_no} · ${selectedPayoutAccount.name ?? selectedPayoutAccount.account_type}`
                                                : 'Not selected',
                                            icon: Landmark,
                                        },
                                        {
                                            label: 'Transaction date',
                                            value: isDisbursement
                                                ? data.disbursed_at
                                                : data.repayment_date,
                                            icon: CalendarDays,
                                        },
                                        {
                                            label: 'Reference',
                                            value:
                                                data.reference.trim() ||
                                                'Not provided',
                                            icon: FileText,
                                        },
                                    ].map((item) => {
                                        const ItemIcon = item.icon;

                                        return (
                                            <div
                                                key={item.label}
                                                className="flex min-w-0 items-center justify-between gap-2 rounded-md border bg-muted/20 px-2 py-1.5"
                                            >
                                                <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <ItemIcon className="size-3 shrink-0" />
                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                </span>
                                                <span className="min-w-0 text-right text-[10px] font-medium break-words">
                                                    {item.value || 'Not set'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {isDisbursement && remainingAmount !== null && (
                                    <div className="rounded-lg border bg-muted/30 px-2.5 py-2">
                                        <p className="text-[10px] text-muted-foreground">
                                            Remaining principal
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold tabular-nums">
                                            {formatBDTCurrency(remainingAmount)}
                                        </p>
                                    </div>
                                )}

                                <p className="flex items-start gap-1.5 border-t pt-2.5 text-[10px] leading-snug text-muted-foreground">
                                    <ShieldCheck className="mt-0.5 size-3 shrink-0 text-primary" />
                                    Draft only. Final posting follows
                                    authorization rules.
                                </p>
                            </aside>
                        </div>
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
                            data-slot="page-sticky-action-bar"
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
