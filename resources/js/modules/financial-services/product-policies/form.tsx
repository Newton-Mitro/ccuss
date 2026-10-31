import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate } from '@/lib/date_util';
import type { ProductPolicyFormPageProps } from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Check,
    Clock3,
    FileJson2,
    Landmark,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { route } from 'ziggy-js';

const jsonValue = (value: unknown) =>
    value ? JSON.stringify(value, null, 2) : '';

const formatDecimal = (value: string | number | null | undefined) => {
    if (value == null || value === '') return '';

    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : String(value);
};

export default function FinancialProductPolicyForm() {
    const {
        product,
        policy,
        family = '',
    } = usePage<ProductPolicyFormPageProps>().props;
    const policyRoute =
        family === 'loan'
            ? 'loan-product-policies'
            : 'deposit-product-policies';
    const { data, setData, post, transform, processing, errors } = useForm({
        minimum_opening_amount: formatDecimal(policy?.minimum_opening_amount),
        minimum_deposit_amount: formatDecimal(policy?.minimum_deposit_amount),
        maximum_deposit_amount: formatDecimal(policy?.maximum_deposit_amount),
        maximum_loan_amount: formatDecimal(policy?.maximum_loan_amount),
        loan_to_value_percent: formatDecimal(policy?.loan_to_value_percent),
        interest_rebate_percent: formatDecimal(policy?.interest_rebate_percent),
        source_url: policy?.source_url ?? '',
        source_checked_at: policy?.source_checked_at ?? '',
        effective_from: policy?.effective_from ?? '',
        effective_until: policy?.effective_until ?? '',
        version: policy?.version ?? '',
        status: policy?.status ?? 'DRAFT',
        customer_can_open_multiple_account:
            policy?.customer_can_open_multiple_account == null
                ? 'INHERIT'
                : policy.customer_can_open_multiple_account
                  ? 'ALLOW'
                  : 'DENY',
        notes: policy?.notes ?? '',
        deposit_amount_rules: jsonValue(policy?.deposit_amount_rules),
        tenure_rules: jsonValue(policy?.tenure_rules),
        loan_ceiling_rules: jsonValue(policy?.loan_ceiling_rules),
        repayment_rules: jsonValue(policy?.repayment_rules),
        eligibility_rules: jsonValue(policy?.eligibility_rules),
        security_rules: jsonValue(policy?.security_rules),
        documentation_requirements: jsonValue(
            policy?.documentation_requirements,
        ),
        maturity_examples: jsonValue(policy?.maturity_examples),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        transform((formData) => ({
            ...formData,
            customer_can_open_multiple_account:
                formData.customer_can_open_multiple_account === 'INHERIT'
                    ? null
                    : formData.customer_can_open_multiple_account === 'ALLOW',
        }));
        post(route(`${policyRoute}.store`, product.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        {
            title: 'Product Policies',
            href: route(`${policyRoute}.index`),
        },
        { title: product.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Policy: ${product.name}`} />
            <div className="mx-auto max-w-6xl space-y-4">
                <header className="relative isolate overflow-hidden rounded-xl border bg-card px-4 py-4 shadow-sm sm:px-5 sm:py-5">
                    <div className="absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                                    {family === 'loan'
                                        ? 'Lending'
                                        : 'Deposit products'}
                                </span>
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                {family === 'loan'
                                    ? 'Loan product policy'
                                    : 'Deposit product policy'}
                            </h1>
                            <p className="text-sm leading-5 text-muted-foreground">
                                Configure{' '}
                                {family === 'loan'
                                    ? 'lending limits, repayment, and security requirements'
                                    : 'account opening, deposit, tenure, and maturity rules'}{' '}
                                for{' '}
                                <span className="font-medium text-foreground">
                                    {product.name}
                                </span>
                                .
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 rounded-lg border bg-background/70 px-3 py-2">
                            <Landmark className="size-4 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Product code
                                </p>
                                <p className="text-sm font-semibold">
                                    {product.code}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-4 p-4 sm:p-5">
                            <div className="flex items-start gap-2.5 border-b pb-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                    <SlidersHorizontal className="size-4" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Limits and rates
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Set the account limits and pricing that
                                        apply to this policy.
                                    </p>
                                </div>
                            </div>
                            <div className="max-w-xs space-y-1">
                                <Label>Accounts per customer</Label>
                                <Select
                                    value={
                                        data.customer_can_open_multiple_account
                                    }
                                    onChange={(value) =>
                                        setData(
                                            'customer_can_open_multiple_account',
                                            value,
                                        )
                                    }
                                    options={[
                                        {
                                            value: 'INHERIT',
                                            label: 'Use product setting',
                                        },
                                        {
                                            value: 'ALLOW',
                                            label: 'Allow multiple accounts',
                                        },
                                        {
                                            value: 'DENY',
                                            label: 'One open account only',
                                        },
                                    ]}
                                />
                            </div>
                            <InputError
                                message={
                                    errors.customer_can_open_multiple_account
                                }
                            />
                            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    ...(family === 'loan'
                                        ? [
                                              [
                                                  'maximum_loan_amount',
                                                  'Maximum loan amount',
                                              ],
                                              [
                                                  'loan_to_value_percent',
                                                  'Loan-to-value (%)',
                                              ],
                                          ]
                                        : [
                                              [
                                                  'minimum_opening_amount',
                                                  'Minimum opening amount',
                                              ],
                                              [
                                                  'minimum_deposit_amount',
                                                  'Minimum deposit amount',
                                              ],
                                              [
                                                  'maximum_deposit_amount',
                                                  'Maximum deposit amount',
                                              ],
                                          ]),
                                    [
                                        'interest_rebate_percent',
                                        'Interest rebate (%)',
                                    ],
                                ].map(([field, label]) => (
                                    <div key={field} className="space-y-1">
                                        <Label>{label}</Label>
                                        <Input
                                            type={
                                                field.endsWith('_amount')
                                                    ? 'text'
                                                    : 'number'
                                            }
                                            inputMode={
                                                field.endsWith('_amount')
                                                    ? 'decimal'
                                                    : undefined
                                            }
                                            min={
                                                field.endsWith('_amount')
                                                    ? undefined
                                                    : '0'
                                            }
                                            step={
                                                field.endsWith('_amount')
                                                    ? undefined
                                                    : '0.01'
                                            }
                                            className="h-9"
                                            value={
                                                data[
                                                    field as keyof typeof data
                                                ] as string
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    field as keyof typeof data,
                                                    event.target.value as never,
                                                )
                                            }
                                            onBlur={() => {
                                                const value =
                                                    data[
                                                        field as keyof typeof data
                                                    ];
                                                if (
                                                    typeof value === 'string' &&
                                                    value !== ''
                                                ) {
                                                    setData(
                                                        field as keyof typeof data,
                                                        formatDecimal(
                                                            value,
                                                        ) as never,
                                                    );
                                                }
                                            }}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    field as keyof typeof errors
                                                ]
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4 border-t p-4 sm:p-5">
                            <div className="flex items-start gap-2.5 border-b pb-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                    <Clock3 className="size-4" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Lifecycle and provenance
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Track the policy version, effective
                                        dates, and source of this information.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <Label>Version</Label>
                                    <Input
                                        value={data.version}
                                        className="h-9"
                                        onChange={(event) =>
                                            setData(
                                                'version',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.version} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Status</Label>
                                    <Select
                                        value={data.status}
                                        onChange={(value) =>
                                            setData('status', value)
                                        }
                                        options={[
                                            'DRAFT',
                                            'ACTIVE',
                                            'RETIRED',
                                        ].map((value) => ({
                                            value,
                                            label: value,
                                        }))}
                                    />
                                    <InputError message={errors.status} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Effective from</Label>
                                    <AppDatePicker
                                        value={data.effective_from}
                                        onChange={(value) =>
                                            setData('effective_from', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.effective_from}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Effective until</Label>
                                    <AppDatePicker
                                        value={data.effective_until}
                                        onChange={(value) =>
                                            setData('effective_until', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.effective_until}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Source URL</Label>
                                <Input
                                    type="url"
                                    value={data.source_url}
                                    placeholder="https://..."
                                    className="h-9"
                                    onChange={(event) =>
                                        setData(
                                            'source_url',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.source_url} />
                            </div>
                            <div className="space-y-1">
                                <Label>Source checked at</Label>
                                <AppDatePicker
                                    value={data.source_checked_at}
                                    onChange={(value) =>
                                        setData('source_checked_at', value)
                                    }
                                />
                                <InputError
                                    message={errors.source_checked_at}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <textarea
                                    className="min-h-28 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Add context about this policy or its approval."
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </section>

                        <section className="space-y-4 border-t p-4 sm:p-5">
                            <div className="flex items-start gap-2.5 border-b pb-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                    <FileJson2 className="size-4" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Advanced rule configuration
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Enter valid JSON for product-specific
                                        rules. Leave blank when not applicable.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {[
                                    ...(family === 'loan'
                                        ? [
                                              [
                                                  'loan_ceiling_rules',
                                                  'Loan ceiling rules',
                                              ],
                                              [
                                                  'repayment_rules',
                                                  'Repayment rules',
                                              ],
                                              [
                                                  'security_rules',
                                                  'Security rules',
                                              ],
                                          ]
                                        : [
                                              [
                                                  'deposit_amount_rules',
                                                  'Deposit amount rules',
                                              ],
                                              ['tenure_rules', 'Tenure rules'],
                                              [
                                                  'maturity_examples',
                                                  'Maturity examples',
                                              ],
                                          ]),
                                    ['eligibility_rules', 'Eligibility rules'],
                                    [
                                        'documentation_requirements',
                                        'Documentation requirements',
                                    ],
                                ].map(([field, label]) => (
                                    <div key={field} className="space-y-1">
                                        <Label>{label}</Label>
                                        <textarea
                                            className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs leading-5 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={
                                                data[
                                                    field as keyof typeof data
                                                ] as string
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    field as keyof typeof data,
                                                    event.target.value as never,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    field as keyof typeof errors
                                                ]
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <footer
                            data-slot="form-actions"
                            className="flex flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-5"
                        >
                            <Button asChild type="button" variant="outline">
                                <Link href={route(`${policyRoute}.index`)}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save policy'}
                            </Button>
                        </footer>
                    </form>
                    <aside className="space-y-3">
                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Policy overview
                                    </h2>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    A live summary of the current settings.
                                </p>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {product.code} ·{' '}
                                        {family === 'loan' ? 'Loan' : 'Deposit'}{' '}
                                        policy
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Policy version
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {data.version || 'Not set'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Effective from
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {data.effective_from
                                            ? formatDate(data.effective_from)
                                            : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                                    <BadgeCheck className="size-4" />
                                    {data.status}
                                </div>
                            </div>
                        </section>
                        <section className="rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Helpful reminders
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Set effective dates to control when this
                                    policy applies.
                                </li>
                                <li>
                                    Confirm amounts and rates match your
                                    organization’s approved terms.
                                </li>
                                <li>
                                    Advanced rules must be valid JSON to save
                                    correctly.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
