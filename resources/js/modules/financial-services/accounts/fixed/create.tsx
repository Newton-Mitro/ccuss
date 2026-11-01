import InputError from '@/components/input-error';

import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { CustomerSearchInput } from '@/modules/customers-kyc/customers/components/customer-search-input';

import HeadingSmall from '@/components/heading-small';
import type { Props } from '@/modules/financial-services/types/accounts/fixed/create.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Eye,
    Landmark,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';

const maturityInstructions = [
    { value: 'PAYOUT', label: 'Pay out at maturity' },
    { value: 'RENEW_PRINCIPAL', label: 'Renew principal only' },
    {
        value: 'RENEW_PRINCIPAL_AND_INTEREST',
        label: 'Renew principal and interest',
    },
];

function FormSection({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof Landmark;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 pt-0.5">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-1">
            <Label className="text-xs">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {children}
            {hint && !error && (
                <p className="text-[11px] leading-snug text-muted-foreground">
                    {hint}
                </p>
            )}
            <InputError message={error} />
        </div>
    );
}

export default function FixedDepositAccountCreate() {
    const { products, customers } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        financial_product_term_id: '',
        holder_id: '',
        guardian_customer_id: '',
        name: '',
        account_type: 'FIXED_DEPOSIT',
        principal_amount: '',
        contractual_rate: '',
        term_months: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_instruction: 'PAYOUT',
    });

    const depositor = customers.find(
        (customer) => String(customer.id) === data.holder_id,
    );

    const isMinorDepositor = depositor ? isMinor(depositor) : false;

    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );

    const selectedTerm = product?.terms.find(
        (term) => String(term.id) === data.financial_product_term_id,
    );

    const selectedRate = selectedTerm
        ? String(selectedTerm.interest_rate)
        : data.contractual_rate;

    const selectedTermMonths = selectedTerm
        ? String(
              selectedTerm.tenure_unit === 'YEAR'
                  ? selectedTerm.tenure_value * 12
                  : selectedTerm.tenure_unit === 'MONTH'
                    ? selectedTerm.tenure_value
                    : data.term_months,
          )
        : data.term_months;
    const guardian = customers.find(
        (customer) => String(customer.id) === data.guardian_customer_id,
    );
    const maturityInstructionLabel =
        maturityInstructions.find(
            (instruction) => instruction.value === data.maturity_instruction,
        )?.label ?? data.maturity_instruction;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-accounts.fixed.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        {
            title: 'Fixed Deposits',
            href: route('financial-accounts.fixed.index'),
        },
        { title: 'Open fixed deposit', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open fixed deposit" />

            <div className="w-full max-w-6xl space-y-3 pb-24">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Open fixed deposit"
                        description="Set up the depositor, principal, contracted rate, tenure, and maturity instructions."
                    />
                </div>

                <form
                    onSubmit={submit}
                    className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_280px]"
                >
                    <div className="min-w-0 space-y-4 overflow-hidden rounded-xl border bg-card p-3.5 shadow-sm sm:p-4">
                        {/* Product selection */}
                        <FormSection
                            icon={Landmark}
                            title="Deposit product"
                            description="Choose the fixed deposit product and its applicable terms."
                        >
                            <Field
                                label="Deposit product"
                                required
                                error={errors.financial_product_id}
                            >
                                <Select
                                    value={data.financial_product_id}
                                    onChange={(value) => {
                                        const selected = products.find(
                                            (item) => String(item.id) === value,
                                        );
                                        const baseTerm = selected?.terms.find(
                                            (term) => term.code === 'BASE',
                                        );

                                        setData('financial_product_id', value);
                                        setData(
                                            'financial_product_term_id',
                                            String(baseTerm?.id ?? ''),
                                        );

                                        if (baseTerm) {
                                            setData(
                                                'contractual_rate',
                                                String(baseTerm.interest_rate),
                                            );

                                            if (
                                                baseTerm.tenure_unit === 'MONTH'
                                            ) {
                                                setData(
                                                    'term_months',
                                                    String(
                                                        baseTerm.tenure_value,
                                                    ),
                                                );
                                            } else if (
                                                baseTerm.tenure_unit === 'YEAR'
                                            ) {
                                                setData(
                                                    'term_months',
                                                    String(
                                                        baseTerm.tenure_value *
                                                            12,
                                                    ),
                                                );
                                            }
                                        }
                                    }}
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select deposit product',
                                        },
                                        ...products.map((item) => ({
                                            value: String(item.id),
                                            label: `${item.code} - ${item.name}`,
                                        })),
                                    ]}
                                />
                            </Field>

                            {product?.terms.length ? (
                                <Field
                                    label="Product term"
                                    required
                                    error={errors.financial_product_term_id}
                                    hint="Selecting a predefined term applies its contracted rate and tenure."
                                >
                                    <Select
                                        value={data.financial_product_term_id}
                                        onChange={(value) => {
                                            const term = product.terms.find(
                                                (item) =>
                                                    String(item.id) === value,
                                            );

                                            setData(
                                                'financial_product_term_id',
                                                value,
                                            );

                                            if (term) {
                                                setData(
                                                    'contractual_rate',
                                                    String(term.interest_rate),
                                                );

                                                if (
                                                    term.tenure_unit === 'MONTH'
                                                ) {
                                                    setData(
                                                        'term_months',
                                                        String(
                                                            term.tenure_value,
                                                        ),
                                                    );
                                                } else if (
                                                    term.tenure_unit === 'YEAR'
                                                ) {
                                                    setData(
                                                        'term_months',
                                                        String(
                                                            term.tenure_value *
                                                                12,
                                                        ),
                                                    );
                                                }
                                            }
                                        }}
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select product term',
                                            },
                                            ...product.terms.map((term) => ({
                                                value: String(term.id),
                                                label: `${term.name} · ${term.tenure_value} ${term.tenure_unit.toLowerCase()} · ${term.interest_rate}%`,
                                            })),
                                        ]}
                                    />
                                </Field>
                            ) : null}

                            <Field
                                label="Display name"
                                error={errors.name}
                                hint="Optional internal name to help identify this account."
                            >
                                <Input
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="e.g. Five-year fixed deposit"
                                    autoComplete="off"
                                />
                            </Field>
                        </FormSection>

                        <div className="border-t" />

                        {/* Depositor */}
                        <FormSection
                            icon={Users}
                            title="Depositor information"
                            description="Select the customer who will hold this fixed deposit."
                        >
                            <Field
                                label="Depositor"
                                required
                                error={errors.holder_id}
                            >
                                <CustomerSearchInput
                                    onSelect={(customer) => {
                                        const selectedCustomer = customers.find(
                                            (item) =>
                                                String(item.id) ===
                                                String(customer.id),
                                        );
                                        setData(
                                            'holder_id',
                                            String(customer.id),
                                        );

                                        if (
                                            selectedCustomer &&
                                            !isMinor(selectedCustomer)
                                        ) {
                                            setData('guardian_customer_id', '');
                                        }
                                    }}
                                    clearSelectedCustomer={() => {
                                        setData('holder_id', '');
                                        setData('guardian_customer_id', '');
                                    }}
                                    placeholder="Search depositor by name or customer number..."
                                />
                            </Field>

                            {isMinorDepositor && (
                                <Field
                                    label="Guardian"
                                    required
                                    error={errors.guardian_customer_id}
                                    hint="A minor depositor requires an eligible adult individual as guardian."
                                >
                                    <Select
                                        value={data.guardian_customer_id}
                                        onChange={(value) =>
                                            setData(
                                                'guardian_customer_id',
                                                value,
                                            )
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select adult guardian',
                                            },
                                            ...customers
                                                .filter(
                                                    (customer) =>
                                                        customer.type ===
                                                            'INDIVIDUAL' &&
                                                        !isMinor(customer) &&
                                                        String(customer.id) !==
                                                            data.holder_id,
                                                )
                                                .map((customer) => ({
                                                    value: String(customer.id),
                                                    label: `${customer.customer_no} - ${customer.name}`,
                                                })),
                                        ]}
                                    />
                                </Field>
                            )}

                            {depositor && (
                                <div className="sm:col-span-2">
                                    <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                                            <UserRound className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">
                                                {depositor.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Customer No.{' '}
                                                {depositor.customer_no}
                                                {' · '}
                                                {depositor.type === 'INDIVIDUAL'
                                                    ? 'Individual'
                                                    : 'Organization'}
                                            </p>
                                            {isMinorDepositor && (
                                                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                                    <ShieldCheck className="size-3.5" />
                                                    Guardian details are
                                                    required for this depositor.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FormSection>

                        <div className="border-t" />

                        {/* Principal and contracted terms */}
                        <FormSection
                            icon={CircleDollarSign}
                            title="Deposit amount and terms"
                            description="Enter the principal and confirm the annual interest rate and deposit duration."
                        >
                            <Field
                                label="Principal amount (৳)"
                                required
                                error={errors.principal_amount}
                                hint="Enter the amount to be deposited."
                            >
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={data.principal_amount}
                                    onChange={(event) =>
                                        setData(
                                            'principal_amount',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                    inputMode="decimal"
                                />
                            </Field>

                            <Field
                                label="Contractual annual rate (%)"
                                required
                                error={errors.contractual_rate}
                                hint={
                                    selectedTerm
                                        ? 'Rate is determined by the selected product term.'
                                        : 'Enter the agreed annual interest rate.'
                                }
                            >
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.000001"
                                    value={selectedRate}
                                    onChange={(event) =>
                                        setData(
                                            'contractual_rate',
                                            event.target.value,
                                        )
                                    }
                                    readOnly={Boolean(selectedTerm)}
                                    placeholder="e.g. 8.50"
                                />
                                {product?.base_interest_rate != null && (
                                    <p className="text-xs text-muted-foreground">
                                        Product base rate:{' '}
                                        {product.base_interest_rate}%
                                    </p>
                                )}
                            </Field>

                            <Field
                                label="Term in months"
                                required
                                error={errors.term_months}
                                hint={
                                    selectedTerm
                                        ? 'Tenure is determined by the selected product term.'
                                        : 'Enter the contractual duration in months.'
                                }
                            >
                                <Input
                                    type="number"
                                    min="1"
                                    max="600"
                                    value={selectedTermMonths}
                                    onChange={(event) =>
                                        setData(
                                            'term_months',
                                            event.target.value,
                                        )
                                    }
                                    readOnly={Boolean(selectedTerm)}
                                    placeholder="12"
                                />
                            </Field>

                            <Field
                                label="Start date"
                                required
                                error={errors.started_at}
                                hint="The date the fixed deposit begins."
                            >
                                <AppDatePicker
                                    value={data.started_at}
                                    onChange={(value) =>
                                        setData('started_at', value)
                                    }
                                />
                            </Field>
                        </FormSection>

                        <div className="border-t" />

                        {/* Maturity instructions */}
                        <FormSection
                            icon={CalendarDays}
                            title="Maturity instructions"
                            description="Choose how the deposit should be handled when it reaches maturity."
                        >
                            <Field
                                label="Maturity instruction"
                                required
                                error={errors.maturity_instruction}
                            >
                                <Select
                                    value={data.maturity_instruction}
                                    onChange={(value) =>
                                        setData('maturity_instruction', value)
                                    }
                                    options={maturityInstructions}
                                />
                            </Field>

                            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/20 p-3 sm:mt-5">
                                <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Verify the principal, contractual rate,
                                    tenure, and maturity instruction before
                                    opening the account. Interest calculations
                                    and maturity dates follow your configured
                                    backend business rules.
                                </p>
                            </div>
                        </FormSection>
                    </div>

                    <aside className="min-w-0 space-y-2.5 rounded-xl border bg-card p-3 shadow-sm lg:sticky lg:top-4">
                        <div className="flex items-center gap-2.5 border-b pb-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Eye className="size-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-semibold tracking-[0.14em] text-primary uppercase">
                                    Deposit summary
                                </p>
                                <h2 className="text-[13px] font-semibold">
                                    Live preview
                                </h2>
                            </div>
                            <span className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                LIVE
                            </span>
                        </div>

                        <div className="rounded-lg bg-gradient-to-br from-primary/[0.09] to-muted/30 p-3 ring-1 ring-primary/10">
                            <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                Fixed deposit
                            </p>
                            <p className="mt-0.5 text-sm font-semibold break-words">
                                {data.name.trim() ||
                                    product?.name ||
                                    'Fixed deposit'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {depositor?.name ??
                                    'Select a depositor to begin'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-primary/15 bg-primary/[0.06] px-3 py-2.5">
                            <p className="text-[10px] text-muted-foreground">
                                Principal amount
                            </p>
                            <p className="mt-0.5 text-lg font-semibold text-primary tabular-nums">
                                {formatBDTCurrency(data.principal_amount || 0)}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            {[
                                {
                                    label: 'Product',
                                    value: product
                                        ? `${product.code} · ${product.name}`
                                        : 'Not selected',
                                    icon: Landmark,
                                },
                                {
                                    label: 'Product term',
                                    value:
                                        selectedTerm?.name ??
                                        (selectedTermMonths
                                            ? `${selectedTermMonths} months`
                                            : 'Not selected'),
                                    icon: Clock3,
                                },
                                {
                                    label: 'Annual rate',
                                    value: selectedRate
                                        ? `${selectedRate}%`
                                        : 'Not set',
                                    icon: CircleDollarSign,
                                },
                                {
                                    label: 'Start date',
                                    value: data.started_at || 'Not set',
                                    icon: CalendarDays,
                                },
                                {
                                    label: 'Maturity',
                                    value: maturityInstructionLabel,
                                    icon: ShieldCheck,
                                },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex min-w-0 items-center justify-between gap-2 rounded-md border bg-muted/20 px-2 py-1.5"
                                    >
                                        <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <Icon className="size-3 shrink-0" />
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                        </span>
                                        <span className="min-w-0 text-right text-[10px] font-medium break-words">
                                            {item.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {isMinorDepositor && (
                            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-2.5 py-2 text-[11px]">
                                <p className="font-medium text-amber-700 dark:text-amber-400">
                                    Guardian required
                                </p>
                                <p className="mt-0.5 text-muted-foreground">
                                    {guardian?.name ??
                                        'Select an adult guardian'}
                                </p>
                            </div>
                        )}

                        <p className="flex items-start gap-1.5 border-t pt-2.5 text-[10px] leading-snug text-muted-foreground">
                            <ShieldCheck className="mt-0.5 size-3 shrink-0 text-primary" />
                            Interest and maturity follow configured business
                            rules.
                        </p>
                    </aside>

                    {/* Form actions */}
                    <div
                        data-slot="page-sticky-action-bar"
                        className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:col-span-2"
                    >
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('financial-accounts.fixed.index')}
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Cancel
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            <CheckCircle2 className="mr-2 size-4" />
                            {processing
                                ? 'Opening fixed deposit...'
                                : 'Open fixed deposit'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

function isMinor(customer: Props['customers'][number]): boolean {
    if (customer.type !== 'INDIVIDUAL' || !customer.dob) return false;

    const birthDate = new Date(customer.dob);

    if (Number.isNaN(birthDate.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const birthdayNotReached =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate());

    if (birthdayNotReached) age -= 1;

    return age < 18;
}
