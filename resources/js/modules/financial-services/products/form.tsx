import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialProductFormPageProps } from '@/modules/financial-services/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    Banknote,
    Check,
    FileText,
    Percent,
    Sparkles,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { ProductTermData } from '@/modules/financial-services/types/products/form.types';


export default function FinancialProductForm() {
    const { product, family = '' } =
        usePage<FinancialProductFormPageProps>().props;
    const productRoute =
        family === 'loan' ? 'loan-products' : 'deposit-products';
    const categories =
        family === 'loan'
            ? ['LOAN']
            : family === 'deposit'
              ? ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT']
              : [
                    'SAVINGS',
                    'SHARE',
                    'FIXED_DEPOSIT',
                    'RECURRING_DEPOSIT',
                    'LOAN',
                    'OTHER',
                ];
    const editing = Boolean(product);
    const { data, setData, post, put, transform, processing, errors } =
        useForm<{
            code: string;
            name: string;
            category: string;
            balance_type: string;
            interest_calculation: string;
            interest_frequency: string;
            interest_rate: string;
            customer_can_open_multiple_account: boolean;
            status: boolean;
            terms: ProductTermData[];
        }>({
            code: product?.code ?? '',
            name: product?.name ?? '',
            category:
                product?.category ?? (family === 'loan' ? 'LOAN' : 'SAVINGS'),
            balance_type: product?.balance_type ?? 'LIABILITY',
            interest_calculation: product?.interest_calculation ?? 'NONE',
            interest_frequency: product?.interest_frequency ?? 'NONE',
            interest_rate: String(
                product?.interest_rate ??
                    product?.base_term?.interest_rate ??
                    0,
            ),
            terms: product?.terms?.map((term) => ({
                ...term,
                id: term.id,
                tenure_value: String(term.tenure_value),
                interest_rate: String(term.interest_rate),
                minimum_amount:
                    term.minimum_amount == null
                        ? ''
                        : String(term.minimum_amount),
                maximum_amount:
                    term.maximum_amount == null
                        ? ''
                        : String(term.maximum_amount),
                effective_from: term.effective_from ?? '',
                effective_until: term.effective_until ?? '',
                status: term.status ?? true,
            })) ?? [
                {
                    code: 'BASE',
                    name: 'Base term',
                    tenure_value: '1',
                    tenure_unit: 'MONTH',
                    interest_rate: '0',
                    interest_calculation:
                        product?.interest_calculation ?? 'NONE',
                    interest_frequency: product?.interest_frequency ?? 'NONE',
                    minimum_amount: '',
                    maximum_amount: '',
                    status: true,
                    effective_from: '',
                    effective_until: '',
                },
            ],
            customer_can_open_multiple_account:
                product?.customer_can_open_multiple_account ?? true,
            status: product?.status ?? true,
        });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        transform((formData) => {
            if (family === 'loan') {
                const loanData = { ...formData };
                Reflect.deleteProperty(loanData, 'terms');
                return {
                    ...loanData,
                    category: 'LOAN',
                    base_interest_rate: formData.interest_rate,
                };
            }

            return {
                ...formData,
                base_interest_rate: formData.terms[0]?.interest_rate ?? '0',
            };
        });
        if (editing) {
            put(route(`${productRoute}.update`, product!.id));
        } else {
            post(route(`${productRoute}.store`));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title:
                family === 'loan'
                    ? 'Loan Products'
                    : family === 'deposit'
                      ? 'Deposit Products'
                      : 'Products',
            href: route(`${productRoute}.index`),
        },
        { title: editing ? 'Edit Product' : 'New Product', href: '' },
    ];

    const updateTerm = <K extends keyof ProductTermData>(
        index: number,
        field: K,
        value: ProductTermData[K],
    ) => {
        setData(
            'terms',
            data.terms.map((term, termIndex) =>
                termIndex === index ? { ...term, [field]: value } : term,
            ),
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing
                        ? `Edit ${family === 'loan' ? 'Loan' : 'Financial'} Product`
                        : `New ${family === 'loan' ? 'Loan' : 'Financial'} Product`
                }
            />
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="space-y-3 py-2">
                    <div className="flex flex-col gap-4">
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    {family === 'loan'
                                        ? 'Lending'
                                        : 'Financial products'}
                                </span>
                                <span className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {editing ? 'Edit product' : 'New setup'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {editing
                                    ? `Edit ${family === 'loan' ? 'loan' : 'financial'} product`
                                    : `Create a ${family === 'loan' ? 'loan' : 'financial'} product`}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                {family === 'loan'
                                    ? 'Set up the product details and interest terms used to create consistent loan offers.'
                                    : 'Define the product rules used when financial accounts are opened.'}
                            </p>
                        </div>
                    </div>
                </header>
                <div
                    className={
                        family === 'loan'
                            ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'
                            : ''
                    }
                >
                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Product details
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {family === 'loan'
                                            ? 'Give this loan product a recognizable identity and define its core settings.'
                                            : 'Define the product information and account-opening rules.'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="financial-product-code">
                                        Code
                                    </Label>
                                    <Input
                                        id="financial-product-code"
                                        value={data.code}
                                        onChange={(event) =>
                                            setData(
                                                'code',
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g. PERSONAL-LOAN"
                                        className="h-11"
                                    />
                                    <InputError message={errors.code} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="financial-product-name">
                                        Name
                                    </Label>
                                    <Input
                                        id="financial-product-name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="e.g. Personal Loan"
                                        className="h-11"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={data.category}
                                        onChange={(value) =>
                                            setData('category', value)
                                        }
                                        options={categories.map((value) => ({
                                            value,
                                            label: value.replaceAll('_', ' '),
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Balance type</Label>
                                    <Select
                                        value={data.balance_type}
                                        onChange={(value) =>
                                            setData('balance_type', value)
                                        }
                                        options={[
                                            'ASSET',
                                            'LIABILITY',
                                            'EQUITY',
                                        ].map((value) => ({
                                            value,
                                            label: value,
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interest calculation</Label>
                                    <Select
                                        value={data.interest_calculation}
                                        onChange={(value) =>
                                            setData(
                                                'interest_calculation',
                                                value,
                                            )
                                        }
                                        options={[
                                            'NONE',
                                            'SIMPLE',
                                            'COMPOUND',
                                            'FLAT',
                                            'REDUCING_BALANCE',
                                        ].map((value) => ({
                                            value,
                                            label: value.replaceAll('_', ' '),
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interest frequency</Label>
                                    <Select
                                        value={data.interest_frequency}
                                        onChange={(value) =>
                                            setData('interest_frequency', value)
                                        }
                                        options={[
                                            'NONE',
                                            'DAILY',
                                            'MONTHLY',
                                            'QUARTERLY',
                                            'HALF_YEARLY',
                                            'YEARLY',
                                            'MATURITY',
                                        ].map((value) => ({
                                            value,
                                            label: value.replaceAll('_', ' '),
                                        }))}
                                    />
                                </div>
                            </div>
                        </section>
                        {family === 'loan' && (
                            <section className="space-y-5 border-t p-5 sm:p-7">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Percent className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="font-semibold tracking-tight">
                                            Interest settings
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Define how interest is calculated
                                            and applied to this loan.
                                        </p>
                                    </div>
                                </div>
                                <div className="max-w-sm space-y-2">
                                    <Label htmlFor="loan-interest-rate">
                                        Annual interest rate
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="loan-interest-rate"
                                            type="number"
                                            min="0"
                                            step="0.000001"
                                            value={data.interest_rate}
                                            onChange={(event) =>
                                                setData(
                                                    'interest_rate',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className="h-11 pr-12"
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Set the yearly rate used for loan
                                        interest calculations.
                                    </p>
                                </div>
                            </section>
                        )}
                        {family !== 'loan' && (
                            <section className="space-y-4 border-t p-5 sm:p-7">
                                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="font-semibold">
                                            Product terms
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Configure the tenure and interest
                                            choices shown when an account is
                                            opened.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setData('terms', [
                                                ...data.terms,
                                                {
                                                    code: `TERM-${data.terms.length + 1}`,
                                                    name: `Term ${data.terms.length + 1}`,
                                                    tenure_value: '12',
                                                    tenure_unit: 'MONTH',
                                                    interest_rate: '0',
                                                    interest_calculation:
                                                        data.interest_calculation,
                                                    interest_frequency:
                                                        data.interest_frequency,
                                                    minimum_amount: '',
                                                    maximum_amount: '',
                                                    status: true,
                                                    effective_from: '',
                                                    effective_until: '',
                                                },
                                            ])
                                        }
                                    >
                                        Add term
                                    </Button>
                                </div>
                                {data.terms.map((term, index) => (
                                    <fieldset
                                        key={term.id ?? `${term.code}-${index}`}
                                        className="space-y-3 rounded-xl border bg-muted/20 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <legend className="font-medium">
                                                {term.name ||
                                                    `Term ${index + 1}`}
                                            </legend>
                                            {term.code !== 'BASE' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setData(
                                                            'terms',
                                                            data.terms.filter(
                                                                (
                                                                    _,
                                                                    termIndex,
                                                                ) =>
                                                                    termIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove term
                                                </Button>
                                            )}
                                        </div>
                                        <Input
                                            type="hidden"
                                            name={`terms.${index}.id`}
                                            value={term.id ?? ''}
                                        />
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <Label>Code</Label>
                                                <Input
                                                    value={term.code}
                                                    readOnly={
                                                        term.code === 'BASE'
                                                    }
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'code',
                                                            event.target.value.toUpperCase(),
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.code`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Name</Label>
                                                <Input
                                                    value={term.name}
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.name`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Tenure</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={term.tenure_value}
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'tenure_value',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.tenure_value`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Tenure unit</Label>
                                                <Select
                                                    value={term.tenure_unit}
                                                    onChange={(value) =>
                                                        updateTerm(
                                                            index,
                                                            'tenure_unit',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        'DAY',
                                                        'WEEK',
                                                        'MONTH',
                                                        'QUARTER',
                                                        'YEAR',
                                                    ].map((value) => ({
                                                        value,
                                                        label: value,
                                                    }))}
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.tenure_unit`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>
                                                    Annual interest rate (%)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.000001"
                                                    value={term.interest_rate}
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'interest_rate',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.interest_rate`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>
                                                    Interest calculation
                                                </Label>
                                                <Select
                                                    value={
                                                        term.interest_calculation
                                                    }
                                                    onChange={(value) =>
                                                        updateTerm(
                                                            index,
                                                            'interest_calculation',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        'NONE',
                                                        'SIMPLE',
                                                        'COMPOUND',
                                                        'FLAT',
                                                        'REDUCING_BALANCE',
                                                    ].map((value) => ({
                                                        value,
                                                        label: value.replaceAll(
                                                            '_',
                                                            ' ',
                                                        ),
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label>
                                                    Interest frequency
                                                </Label>
                                                <Select
                                                    value={
                                                        term.interest_frequency
                                                    }
                                                    onChange={(value) =>
                                                        updateTerm(
                                                            index,
                                                            'interest_frequency',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        'NONE',
                                                        'DAILY',
                                                        'MONTHLY',
                                                        'QUARTERLY',
                                                        'HALF_YEARLY',
                                                        'YEARLY',
                                                        'MATURITY',
                                                    ].map((value) => ({
                                                        value,
                                                        label: value.replaceAll(
                                                            '_',
                                                            ' ',
                                                        ),
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label>Minimum amount</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    value={
                                                        term.minimum_amount ??
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'minimum_amount',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.minimum_amount`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Maximum amount</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    value={
                                                        term.maximum_amount ??
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'maximum_amount',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `terms.${index}.maximum_amount`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Effective from</Label>
                                                <AppDatePicker
                                                    value={
                                                        term.effective_from ??
                                                        ''
                                                    }
                                                    onChange={(value) =>
                                                        updateTerm(
                                                            index,
                                                            'effective_from',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Effective until</Label>
                                                <AppDatePicker
                                                    value={
                                                        term.effective_until ??
                                                        ''
                                                    }
                                                    onChange={(value) =>
                                                        updateTerm(
                                                            index,
                                                            'effective_until',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Input
                                                    type="checkbox"
                                                    checked={term.status}
                                                    onChange={(event) =>
                                                        updateTerm(
                                                            index,
                                                            'status',
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                />
                                                Active term
                                            </label>
                                        </div>
                                    </fieldset>
                                ))}
                            </section>
                        )}
                        <footer className="flex flex-col gap-5 border-t bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3.5 text-sm transition hover:bg-muted/50">
                                    <Input
                                        type="checkbox"
                                        checked={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.checked,
                                            )
                                        }
                                        className="mt-0.5"
                                    />
                                    <span className="space-y-1">
                                        <span className="block font-medium">
                                            Active product
                                        </span>
                                        <span className="block text-xs leading-5 text-muted-foreground">
                                            Available for new loan applications.
                                        </span>
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3.5 text-sm transition hover:bg-muted/50">
                                    <Input
                                        type="checkbox"
                                        checked={
                                            data.customer_can_open_multiple_account
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'customer_can_open_multiple_account',
                                                event.target.checked,
                                            )
                                        }
                                        className="mt-0.5"
                                    />
                                    <span className="space-y-1">
                                        <span className="block font-medium">
                                            Multiple accounts
                                        </span>
                                        <span className="block text-xs leading-5 text-muted-foreground">
                                            Allow customers to open more than
                                            one.
                                        </span>
                                    </span>
                                </label>
                                <InputError
                                    message={
                                        errors.customer_can_open_multiple_account
                                    }
                                />
                            </div>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Button asChild type="button" variant="outline">
                                    <Link href={route(`${productRoute}.index`)}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save changes'
                                          : 'Create product'}
                                </Button>
                            </div>
                        </footer>
                    </form>
                    {family === 'loan' && (
                        <aside className="space-y-4">
                            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                <div className="border-b p-5">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary" />
                                        <h2 className="text-sm font-semibold">
                                            Loan product preview
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        A quick overview of your product setup.
                                    </p>
                                </div>
                                <div className="space-y-4 p-5">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Banknote className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold break-words">
                                            {data.name || 'Loan product name'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {data.code || 'PRODUCT-CODE'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <BadgePercent className="size-4" />
                                            Annual interest
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {data.interest_rate || '0.00'}%
                                        </span>
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                                            data.status
                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${
                                                data.status
                                                    ? 'bg-emerald-500'
                                                    : 'bg-muted-foreground'
                                            }`}
                                        />
                                        {data.status
                                            ? 'Active for new applications'
                                            : 'Currently unavailable'}
                                    </div>
                                </div>
                            </section>
                            <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Check className="size-4 text-primary" />
                                    Before you save
                                </div>
                                <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                    <li>
                                        Choose a unique code staff can quickly
                                        recognize.
                                    </li>
                                    <li>
                                        Verify the interest method and rate
                                        match your lending policy.
                                    </li>
                                    <li>
                                        Set the product active when it is ready
                                        to be offered.
                                    </li>
                                </ul>
                            </section>
                        </aside>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
