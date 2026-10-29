import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { FinancialProductFormPageProps } from '@/modules/financial-services/types/financial-services';
import type { ProductTermData } from '@/modules/financial-services/types/products/form.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    Banknote,
    Check,
    FileText,
    Plus,
    Settings2,
    Trash2,
} from 'lucide-react';
import { route } from 'ziggy-js';

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
    const isLoan = family === 'loan';

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
            category: product?.category ?? (isLoan ? 'LOAN' : 'SAVINGS'),
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        {
            title: isLoan
                ? 'Loan Products'
                : family === 'deposit'
                  ? 'Deposit Products'
                  : 'Products',
            href: route(`${productRoute}.index`),
        },
        { title: editing ? 'Edit Product' : 'New Product', href: '' },
    ];

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        transform((formData) => {
            if (isLoan) {
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

    const addTerm = () => {
        const number = data.terms.length + 1;

        setData('terms', [
            ...data.terms,
            {
                code: `TERM-${number}`,
                name: `Term ${number}`,
                tenure_value: '12',
                tenure_unit: 'MONTH',
                interest_rate: '0',
                interest_calculation: data.interest_calculation,
                interest_frequency: data.interest_frequency,
                minimum_amount: '',
                maximum_amount: '',
                status: true,
                effective_from: '',
                effective_until: '',
            },
        ]);
    };

    const removeTerm = (index: number) => {
        setData(
            'terms',
            data.terms.filter((_, termIndex) => termIndex !== index),
        );
    };

    const calculationOptions = [
        'NONE',
        'SIMPLE',
        'COMPOUND',
        'FLAT',
        'REDUCING_BALANCE',
    ].map((value) => ({
        value,
        label: value.replaceAll('_', ' '),
    }));

    const frequencyOptions = [
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
    }));

    const tenureOptions = ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'].map(
        (value) => ({ value, label: value }),
    );

    const fieldClass = 'h-10 min-w-0 text-sm';
    const labelClass = 'text-sm font-medium';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${editing ? 'Edit' : 'New'} ${isLoan ? 'Loan' : 'Financial'} Product`}
            />

            <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6 pb-8">
                <header className="relative overflow-hidden rounded-2xl border bg-card px-5 py-5 shadow-sm sm:px-8 sm:py-7">
                    <div className="pointer-events-none absolute -top-20 right-8 size-56 rounded-full bg-primary/[0.07] blur-3xl" />
                    <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    {isLoan ? 'Lending' : 'Deposit products'}
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {editing ? 'Edit product' : 'New setup'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {editing
                                    ? `Edit ${isLoan ? 'loan' : 'financial'} product`
                                    : `Create ${isLoan ? 'loan' : 'financial'} product`}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                {isLoan
                                    ? 'Configure lending rules, interest rates and product availability.'
                                    : 'Configure product details, account terms and eligibility rules.'}
                            </p>
                        </div>
                        <span
                            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                data.status
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            <span className="size-1.5 rounded-full bg-current" />
                            {data.status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-6">
                            {/* Product details */}
                            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b bg-muted/20 px-5 py-4">
                                    <FileText className="size-4 text-primary" />
                                    <h2 className="font-semibold">
                                        Product details
                                    </h2>
                                    <span className="hidden text-sm text-muted-foreground sm:inline">
                                        Identity and accounting configuration
                                    </span>
                                </div>

                                <div className="grid gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
                                    <div className="min-w-0 space-y-2">
                                        <Label
                                            htmlFor="financial-product-code"
                                            className={labelClass}
                                        >
                                            Product code
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
                                            className={fieldClass}
                                        />
                                        <InputError message={errors.code} />
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <Label
                                            htmlFor="financial-product-name"
                                            className={labelClass}
                                        >
                                            Product name
                                        </Label>
                                        <Input
                                            id="financial-product-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Personal Loan"
                                            className={fieldClass}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <Label className={labelClass}>
                                            Category
                                        </Label>
                                        <Select
                                            value={data.category}
                                            onChange={(value) =>
                                                setData('category', value)
                                            }
                                            options={categories.map(
                                                (value) => ({
                                                    value,
                                                    label: value.replaceAll(
                                                        '_',
                                                        ' ',
                                                    ),
                                                }),
                                            )}
                                            className={fieldClass}
                                        />
                                        <InputError message={errors.category} />
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <Label className={labelClass}>
                                            Balance type
                                        </Label>
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
                                            className={fieldClass}
                                        />
                                        <InputError
                                            message={errors.balance_type}
                                        />
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <Label className={labelClass}>
                                            Interest calculation
                                        </Label>
                                        <Select
                                            value={data.interest_calculation}
                                            onChange={(value) =>
                                                setData(
                                                    'interest_calculation',
                                                    value,
                                                )
                                            }
                                            options={calculationOptions}
                                            className={fieldClass}
                                        />
                                        <InputError
                                            message={
                                                errors.interest_calculation
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <Label className={labelClass}>
                                            Interest frequency
                                        </Label>
                                        <Select
                                            value={data.interest_frequency}
                                            onChange={(value) =>
                                                setData(
                                                    'interest_frequency',
                                                    value,
                                                )
                                            }
                                            options={frequencyOptions}
                                            className={fieldClass}
                                        />
                                        <InputError
                                            message={errors.interest_frequency}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Loan interest settings */}
                            {isLoan && (
                                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                    <div className="flex items-center gap-3 border-b bg-muted/20 px-5 py-4">
                                        <BadgePercent className="size-4 text-primary" />
                                        <h2 className="font-semibold">
                                            Loan interest settings
                                        </h2>
                                    </div>

                                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
                                        <div className="min-w-0 space-y-2">
                                            <Label
                                                htmlFor="loan-interest-rate"
                                                className={labelClass}
                                            >
                                                Annual interest rate (%)
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
                                                    className={`${fieldClass} pr-8`}
                                                />
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-xs text-muted-foreground">
                                                    %
                                                </span>
                                            </div>
                                            <InputError
                                                message={errors.interest_rate}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Yearly rate used for loan
                                                interest calculations.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Deposit terms */}
                            {!isLoan && (
                                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                    <div className="flex flex-col gap-3 border-b bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                                        <div className="flex items-center gap-3">
                                            <Settings2 className="size-5 text-primary" />
                                            <div>
                                                <h2 className="font-semibold">
                                                    Product terms
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Configure tenure, interest,
                                                    amount limits and validity.
                                                </p>
                                            </div>
                                            <span className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium tabular-nums">
                                                {data.terms.length} total
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTerm}
                                            className="h-9"
                                        >
                                            <Plus className="mr-1.5 size-4" />
                                            Add term
                                        </Button>
                                    </div>

                                    <div className="space-y-4 p-5 sm:p-7">
                                        {data.terms.map((term, index) => (
                                            <fieldset
                                                key={
                                                    term.id ??
                                                    `${term.code}-${index}`
                                                }
                                                className="min-w-0 rounded-xl border bg-muted/20 p-4 shadow-xs sm:p-5"
                                            >
                                                <div className="flex items-center justify-between gap-3 border-b pb-3">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                                            {index + 1}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <legend className="max-w-full truncate text-sm font-semibold">
                                                                {term.name ||
                                                                    `Term ${index + 1}`}
                                                            </legend>
                                                            <p className="text-xs text-muted-foreground">
                                                                {term.code} ·{' '}
                                                                {term.tenure_value ||
                                                                    '0'}{' '}
                                                                {term.tenure_unit.toLowerCase()}{' '}
                                                                ·{' '}
                                                                {term.interest_rate ||
                                                                    '0'}
                                                                % interest
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span
                                                            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                                                term.status
                                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {term.status
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>

                                                        {term.code !==
                                                            'BASE' && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-muted-foreground hover:text-destructive"
                                                                aria-label={`Remove ${term.name || `term ${index + 1}`}`}
                                                                onClick={() =>
                                                                    removeTerm(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <Input
                                                    type="hidden"
                                                    name={`terms.${index}.id`}
                                                    value={term.id ?? ''}
                                                />

                                                <div className="grid gap-x-4 gap-y-4 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Term code
                                                        </Label>
                                                        <Input
                                                            className={
                                                                fieldClass
                                                            }
                                                            value={term.code}
                                                            readOnly={
                                                                term.code ===
                                                                'BASE'
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

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Term name
                                                        </Label>
                                                        <Input
                                                            className={
                                                                fieldClass
                                                            }
                                                            value={term.name}
                                                            onChange={(event) =>
                                                                updateTerm(
                                                                    index,
                                                                    'name',
                                                                    event.target
                                                                        .value,
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

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Tenure value
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className={
                                                                fieldClass
                                                            }
                                                            value={
                                                                term.tenure_value
                                                            }
                                                            onChange={(event) =>
                                                                updateTerm(
                                                                    index,
                                                                    'tenure_value',
                                                                    event.target
                                                                        .value,
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

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Tenure unit
                                                        </Label>
                                                        <Select
                                                            className={
                                                                fieldClass
                                                            }
                                                            value={
                                                                term.tenure_unit
                                                            }
                                                            onChange={(value) =>
                                                                updateTerm(
                                                                    index,
                                                                    'tenure_unit',
                                                                    value,
                                                                )
                                                            }
                                                            options={
                                                                tenureOptions
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.tenure_unit`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Annual interest rate
                                                            (%)
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.000001"
                                                                className={`${fieldClass} pr-7`}
                                                                value={
                                                                    term.interest_rate
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateTerm(
                                                                        index,
                                                                        'interest_rate',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-xs text-muted-foreground">
                                                                %
                                                            </span>
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.interest_rate`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Interest calculation
                                                        </Label>
                                                        <Select
                                                            className={
                                                                fieldClass
                                                            }
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
                                                            options={
                                                                calculationOptions
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.interest_calculation`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Interest frequency
                                                        </Label>
                                                        <Select
                                                            className={
                                                                fieldClass
                                                            }
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
                                                            options={
                                                                frequencyOptions
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.interest_frequency`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Minimum amount
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className={
                                                                fieldClass
                                                            }
                                                            value={
                                                                term.minimum_amount ??
                                                                ''
                                                            }
                                                            onChange={(event) =>
                                                                updateTerm(
                                                                    index,
                                                                    'minimum_amount',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="No minimum"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.minimum_amount`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-1">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Maximum amount
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className={
                                                                fieldClass
                                                            }
                                                            value={
                                                                term.maximum_amount ??
                                                                ''
                                                            }
                                                            onChange={(event) =>
                                                                updateTerm(
                                                                    index,
                                                                    'maximum_amount',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="No maximum"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.maximum_amount`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-1">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Effective from
                                                        </Label>
                                                        <AppDatePicker
                                                            className={
                                                                fieldClass
                                                            }
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
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.effective_from`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-1">
                                                        <Label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Effective until
                                                        </Label>
                                                        <AppDatePicker
                                                            className={
                                                                fieldClass
                                                            }
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
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `terms.${index}.effective_until`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <label className="flex min-h-10 cursor-pointer items-center gap-2 self-end rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/30">
                                                        <Input
                                                            type="checkbox"
                                                            checked={
                                                                term.status
                                                            }
                                                            onChange={(event) =>
                                                                updateTerm(
                                                                    index,
                                                                    'status',
                                                                    event.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="size-3.5"
                                                        />
                                                        <span className="font-medium">
                                                            Active term
                                                        </span>
                                                    </label>
                                                </div>
                                            </fieldset>
                                        ))}

                                        {data.terms.length === 0 && (
                                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
                                                <Settings2 className="mb-2 size-7 text-muted-foreground" />
                                                <p className="text-sm font-medium">
                                                    No product terms
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Add a term to define tenure
                                                    and interest options.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={addTerm}
                                                >
                                                    <Plus className="mr-1.5 size-3.5" />
                                                    Add first term
                                                </Button>
                                            </div>
                                        )}

                                        <InputError message={errors.terms} />
                                    </div>
                                </section>
                            )}

                            {/* Availability and account rules */}
                            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b bg-muted/20 px-5 py-4">
                                    <Check className="size-4 text-primary" />
                                    <h2 className="font-semibold">
                                        Availability & account rules
                                    </h2>
                                </div>

                                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background px-4 py-3.5 text-sm transition-colors hover:bg-muted/30">
                                        <Input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(event) =>
                                                setData(
                                                    'status',
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold">
                                                Active product
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                Make this product available for
                                                new applications.
                                            </span>
                                        </span>
                                        <span
                                            className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                                                data.status
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {data.status
                                                ? 'Enabled'
                                                : 'Disabled'}
                                        </span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background px-4 py-3.5 text-sm transition-colors hover:bg-muted/30">
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
                                            className="size-4"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold">
                                                Multiple accounts per customer
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                Allow a customer to open more
                                                than one account.
                                            </span>
                                        </span>
                                    </label>
                                </div>

                                <div className="px-5 pb-5 sm:px-7 sm:pb-7">
                                    <InputError
                                        message={
                                            errors.customer_can_open_multiple_account
                                        }
                                    />
                                    <InputError message={errors.status} />
                                </div>
                            </section>
                        </div>

                        <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
                            {isLoan ? (
                                <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl ring-1 shadow-primary/[0.05] ring-foreground/[0.02]">
                                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-5 py-5">
                                        <div className="pointer-events-none absolute -top-12 right-0 size-36 rounded-full bg-primary/10 blur-3xl" />
                                        <div className="relative flex items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                                <Banknote className="size-5" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                                                    Live offer
                                                </p>
                                                <h2 className="text-base font-semibold">
                                                    Loan preview
                                                </h2>
                                            </div>
                                            <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-primary">
                                                LIVE
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div className="rounded-2xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-4 ring-1 ring-primary/10">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-lg font-semibold tracking-tight break-words">
                                                        {data.name ||
                                                            'Loan product name'}
                                                    </p>
                                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                        {data.code ||
                                                            'LOAN-CODE'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                        data.status
                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {data.status
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-primary/15 bg-primary/[0.06] p-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <BadgePercent className="size-4 text-primary" />
                                                Annual interest rate
                                            </div>
                                            <p className="mt-2 text-3xl font-semibold tracking-tight text-primary tabular-nums">
                                                {Number(
                                                    data.interest_rate || 0,
                                                ).toFixed(2)}
                                                %
                                            </p>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Rate used for loan interest
                                                calculations.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                {
                                                    label: 'Category',
                                                    value: data.category.replaceAll(
                                                        '_',
                                                        ' ',
                                                    ),
                                                },
                                                {
                                                    label: 'Balance type',
                                                    value: data.balance_type,
                                                },
                                                {
                                                    label: 'Interest calculation',
                                                    value: data.interest_calculation.replaceAll(
                                                        '_',
                                                        ' ',
                                                    ),
                                                },
                                                {
                                                    label: 'Interest frequency',
                                                    value: data.interest_frequency.replaceAll(
                                                        '_',
                                                        ' ',
                                                    ),
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="min-w-0 rounded-xl border border-border/60 bg-muted/20 p-3"
                                                >
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold break-words capitalize">
                                                        {item.value ||
                                                            'Not set'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3.5 py-3">
                                            <span className="text-xs text-muted-foreground">
                                                Multiple loans per customer
                                            </span>
                                            <span className="text-xs font-semibold">
                                                {data.customer_can_open_multiple_account
                                                    ? 'Allowed'
                                                    : 'Not allowed'}
                                            </span>
                                        </div>

                                        <div
                                            className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-medium ${
                                                data.status
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <Check className="size-4" />
                                            {data.status
                                                ? 'Available for new applications'
                                                : 'Currently unavailable'}
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                <>
                                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                        <div className="border-b bg-muted/20 px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Banknote className="size-5" />
                                                </span>
                                                <div>
                                                    <h2 className="font-semibold">
                                                        Product preview
                                                    </h2>
                                                    <p className="text-xs text-muted-foreground">
                                                        Live account offer
                                                        summary
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <div className="space-y-1">
                                                <p className="text-lg font-semibold tracking-tight">
                                                    {data.name ||
                                                        'Product name'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {data.code ||
                                                        'PRODUCT-CODE'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                                                <span className="text-xs text-muted-foreground">
                                                    Category
                                                </span>
                                                <span className="text-right text-sm font-medium">
                                                    {data.category.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <BadgePercent className="size-4" />
                                                    Annual interest
                                                </span>
                                                <span className="text-sm font-semibold tabular-nums">
                                                    {data.terms[0]
                                                        ?.interest_rate || '0'}
                                                    %
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                                                <span className="text-xs text-muted-foreground">
                                                    Available terms
                                                </span>
                                                <span className="text-sm font-semibold tabular-nums">
                                                    {data.terms.length}
                                                </span>
                                            </div>

                                            {data.terms.length > 0 && (
                                                <div className="space-y-2 border-t pt-4">
                                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                        Term options
                                                    </p>
                                                    {data.terms.map(
                                                        (term, index) => (
                                                            <div
                                                                key={
                                                                    term.id ??
                                                                    `${term.code}-${index}`
                                                                }
                                                                className="flex items-center justify-between gap-3 text-sm"
                                                            >
                                                                <span className="min-w-0 truncate">
                                                                    {term.name ||
                                                                        `Term ${index + 1}`}
                                                                </span>
                                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                                    {term.tenure_value ||
                                                                        '0'}{' '}
                                                                    {term.tenure_unit.toLowerCase()}
                                                                    {' · '}
                                                                    {term.interest_rate ||
                                                                        '0'}
                                                                    %
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between gap-3 text-xs">
                                                <span className="text-muted-foreground">
                                                    Multiple accounts
                                                </span>
                                                <span className="font-medium">
                                                    {data.customer_can_open_multiple_account
                                                        ? 'Allowed'
                                                        : 'Not allowed'}
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
                                                    ? 'Available for new accounts'
                                                    : 'Currently unavailable'}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                                        <p className="text-sm font-semibold">
                                            Before you save
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Confirm the account terms, interest
                                            settings, and availability match
                                            your approved product rules.
                                        </p>
                                    </section>
                                </>
                            )}
                        </aside>
                    </div>

                    <footer className="flex flex-col gap-4 rounded-2xl border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {editing
                                    ? 'Ready to update product'
                                    : 'Ready to create product'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isLoan
                                    ? 'Review the lending configuration before saving.'
                                    : `${data.terms.length} product ${data.terms.length === 1 ? 'term' : 'terms'} configured.`}
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                disabled={processing}
                            >
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
            </div>
        </CustomAuthLayout>
    );
}
