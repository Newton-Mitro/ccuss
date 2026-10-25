import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { CustomerSearchInput } from '@/modules/customers-kyc/customers/components/customer-search-input';
import type { FinancialProductTermOption } from '@/modules/financial-services/types/financial-services';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    FileText,
    Landmark,
    Percent,
    Repeat2,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        terms: FinancialProductTermOption[];
    }>;
}

export default function RecurringDepositAccountCreate() {
    const { products } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        financial_product_term_id: '',
        holder_id: '',
        name: '',
        account_type: 'RECURRING_DEPOSIT',
        installment_amount: '',
        installment_frequency: 'MONTHLY',
        total_installments: '12',
        started_at: new Date().toLocaleDateString('en-CA'),
        maturity_extension_days: '0',
        grace_days: '0',
    });

    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );

    const selectedTerm = product?.terms.find(
        (term) => String(term.id) === data.financial_product_term_id,
    );

    const termInstallments = selectedTerm
        ? selectedTerm.tenure_unit === 'YEAR'
            ? selectedTerm.tenure_value * 12
            : selectedTerm.tenure_unit === 'QUARTER'
              ? selectedTerm.tenure_value
              : selectedTerm.tenure_value
        : null;

    const installmentAmount = Number(data.installment_amount) || 0;
    const installmentCount = Number(
        termInstallments ?? data.total_installments,
    );
    const estimatedTotal = installmentAmount * installmentCount;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('financial-accounts.recurring.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Recurring Deposits',
            href: route('financial-accounts.recurring.index'),
        },
        { title: 'Open recurring deposit', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open recurring deposit" />

            <div className="w-full max-w-screen-xl space-y-5 pb-6">
                <ResourcePageHeader
                    variant="account"
                    title="Open recurring deposit"
                    description="Configure the savings plan, installment schedule, and maturity settings."
                    action={
                        <Button variant="outline" asChild>
                            <Link
                                href={route(
                                    'financial-accounts.recurring.index',
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                <span className="hidden sm:inline">
                                    Back to accounts
                                </span>
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-5">
                            {/* Product selection */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                                        <Landmark className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Deposit product
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Choose the savings product and its
                                            applicable term.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="financial_product_id">
                                            Deposit product{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.financial_product_id}
                                            onChange={(value) => {
                                                const selected = products.find(
                                                    (item) =>
                                                        String(item.id) ===
                                                        value,
                                                );
                                                const term =
                                                    selected?.terms.find(
                                                        (item) =>
                                                            item.code ===
                                                            'BASE',
                                                    );

                                                setData(
                                                    'financial_product_id',
                                                    value,
                                                );
                                                setData(
                                                    'financial_product_term_id',
                                                    String(term?.id ?? ''),
                                                );

                                                if (term) {
                                                    setData(
                                                        'total_installments',
                                                        String(
                                                            term.tenure_unit ===
                                                                'YEAR'
                                                                ? term.tenure_value *
                                                                      12
                                                                : term.tenure_value,
                                                        ),
                                                    );
                                                }
                                            }}
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select deposit product',
                                                },
                                                ...products.map((item) => ({
                                                    value: String(item.id),
                                                    label: `${item.code} — ${item.name}`,
                                                })),
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                errors.financial_product_id
                                            }
                                        />
                                    </div>

                                    {product?.terms.length ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="financial_product_term_id">
                                                Product term
                                            </Label>
                                            <Select
                                                value={
                                                    data.financial_product_term_id
                                                }
                                                onChange={(value) => {
                                                    const term =
                                                        product.terms.find(
                                                            (item) =>
                                                                String(
                                                                    item.id,
                                                                ) === value,
                                                        );

                                                    setData(
                                                        'financial_product_term_id',
                                                        value,
                                                    );

                                                    if (term) {
                                                        setData(
                                                            'total_installments',
                                                            String(
                                                                term.tenure_unit ===
                                                                    'YEAR'
                                                                    ? term.tenure_value *
                                                                          12
                                                                    : term.tenure_value,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select product term',
                                                    },
                                                    ...product.terms.map(
                                                        (term) => ({
                                                            value: String(
                                                                term.id,
                                                            ),
                                                            label: `${term.name} · ${term.tenure_value} ${term.tenure_unit.toLowerCase()} · ${term.interest_rate}%`,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                            <InputError
                                                message={
                                                    errors.financial_product_term_id
                                                }
                                            />
                                        </div>
                                    ) : null}

                                    {selectedTerm && (
                                        <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3 sm:col-span-2">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                                                <Percent className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    {selectedTerm.name}
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Term:{' '}
                                                    {selectedTerm.tenure_value}{' '}
                                                    {selectedTerm.tenure_unit.toLowerCase()}
                                                    {' · '}
                                                    Interest rate:{' '}
                                                    {selectedTerm.interest_rate}
                                                    %
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Depositor information */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                                        <UserRound className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Depositor information
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Link this account to the registered
                                            customer.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="holder_id">
                                            Depositor{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <CustomerSearchInput
                                            onSelect={(customer) =>
                                                setData(
                                                    'holder_id',
                                                    String(customer.id),
                                                )
                                            }
                                            clearSelectedCustomer={() =>
                                                setData('holder_id', '')
                                            }
                                            placeholder="Search depositor by name or customer number..."
                                        />
                                        <InputError
                                            message={errors.holder_id}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Account display name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            placeholder="e.g. Monthly savings plan"
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError message={errors.name} />
                                        <p className="text-xs text-muted-foreground">
                                            Optional name to help identify this
                                            account.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Installment configuration */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                                        <Repeat2 className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Installment schedule
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Define the recurring contribution
                                            and payment frequency.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="installment_amount">
                                            Installment amount{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground">
                                                ৳
                                            </span>
                                            <Input
                                                id="installment_amount"
                                                type="number"
                                                min="0.0001"
                                                step="0.0001"
                                                className="pl-8 tabular-nums"
                                                value={data.installment_amount}
                                                placeholder="0.00"
                                                onChange={(event) =>
                                                    setData(
                                                        'installment_amount',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <InputError
                                            message={errors.installment_amount}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="installment_frequency">
                                            Payment frequency
                                        </Label>
                                        <Select
                                            value={
                                                selectedTerm?.tenure_unit ===
                                                'QUARTER'
                                                    ? 'QUARTERLY'
                                                    : selectedTerm?.tenure_unit ===
                                                            'WEEK' ||
                                                        selectedTerm?.tenure_unit ===
                                                            'DAY'
                                                      ? 'WEEKLY'
                                                      : data.installment_frequency
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    'installment_frequency',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: 'WEEKLY',
                                                    label: 'Weekly',
                                                },
                                                {
                                                    value: 'MONTHLY',
                                                    label: 'Monthly',
                                                },
                                                {
                                                    value: 'QUARTERLY',
                                                    label: 'Quarterly',
                                                },
                                            ]}
                                            disabled={Boolean(selectedTerm)}
                                        />
                                        <InputError
                                            message={
                                                errors.installment_frequency
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="total_installments">
                                            Total installments
                                        </Label>
                                        <Input
                                            id="total_installments"
                                            type="number"
                                            min="1"
                                            max="600"
                                            value={
                                                selectedTerm
                                                    ? String(termInstallments)
                                                    : data.total_installments
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'total_installments',
                                                    event.target.value,
                                                )
                                            }
                                            readOnly={Boolean(selectedTerm)}
                                        />
                                        <InputError
                                            message={errors.total_installments}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {selectedTerm
                                                ? 'Installment count is derived from the selected product term.'
                                                : 'Enter the number of scheduled installments, up to 600.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Dates and maturity */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                                        <CalendarDays className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Schedule and maturity
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Set the start date and applicable
                                            grace periods.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="started_at">
                                            Start date{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <AppDatePicker
                                            value={data.started_at}
                                            onChange={(value) =>
                                                setData('started_at', value)
                                            }
                                        />
                                        <InputError
                                            message={errors.started_at}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="grace_days">
                                            Grace period (days)
                                        </Label>
                                        <Input
                                            id="grace_days"
                                            type="number"
                                            min="0"
                                            value={data.grace_days}
                                            onChange={(event) =>
                                                setData(
                                                    'grace_days',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.grace_days}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Additional days allowed under the
                                            configured grace policy.
                                        </p>
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="maturity_extension_days">
                                            Maturity extension (days)
                                        </Label>
                                        <Input
                                            id="maturity_extension_days"
                                            type="number"
                                            min="0"
                                            value={data.maturity_extension_days}
                                            onChange={(event) =>
                                                setData(
                                                    'maturity_extension_days',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors.maturity_extension_days
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Extra days permitted beyond the
                                            scheduled maturity date.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Live summary */}
                        <aside className="space-y-4 lg:sticky lg:top-5">
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center gap-3 border-b px-4 py-4">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted/50 text-primary">
                                        <Wallet className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Deposit summary
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Estimated contribution
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Estimated total deposits
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold tracking-tight break-words tabular-nums">
                                            {estimatedTotal.toLocaleString(
                                                'en-BD',
                                                {
                                                    style: 'currency',
                                                    currency: 'BDT',
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                },
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Excludes interest, fees, and
                                            penalties.
                                        </p>
                                    </div>

                                    <div className="space-y-3 border-t pt-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                Installment
                                            </span>
                                            <span className="text-right text-sm font-medium tabular-nums">
                                                {installmentAmount.toLocaleString(
                                                    'en-BD',
                                                    {
                                                        style: 'currency',
                                                        currency: 'BDT',
                                                        maximumFractionDigits: 4,
                                                    },
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                Frequency
                                            </span>
                                            <span className="text-right text-sm font-medium">
                                                {selectedTerm?.tenure_unit ===
                                                'QUARTER'
                                                    ? 'Quarterly'
                                                    : selectedTerm?.tenure_unit ===
                                                            'WEEK' ||
                                                        selectedTerm?.tenure_unit ===
                                                            'DAY'
                                                      ? 'Weekly'
                                                      : data.installment_frequency.charAt(
                                                            0,
                                                        ) +
                                                        data.installment_frequency
                                                            .slice(1)
                                                            .toLowerCase()}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                Installments
                                            </span>
                                            <span className="text-sm font-medium tabular-nums">
                                                {Number.isFinite(
                                                    installmentCount,
                                                )
                                                    ? installmentCount
                                                    : 0}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                Grace period
                                            </span>
                                            <span className="text-sm font-medium tabular-nums">
                                                {data.grace_days || '0'} days
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Before you continue
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Verify the depositor, selected
                                            product term, installment amount,
                                            and schedule before opening the
                                            account.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Form actions */}
                    <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-screen-xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                                <FileText className="size-3.5" />
                                Review all details before submission.
                            </p>

                            <div className="flex justify-end gap-2">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    <Link
                                        href={route(
                                            'financial-accounts.recurring.index',
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                            Opening account...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            Open recurring deposit
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
