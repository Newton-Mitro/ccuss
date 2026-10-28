import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type {
    Entry,
    PageProps,
} from '@/modules/general-accounting/types/budgets/form.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ClipboardList,
    Coins,
    FileText,
    Plus,
    ReceiptText,
    Trash2,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

const emptyEntry = (): Entry => ({
    account_id: '',
    cost_center_id: '',
    fiscal_period_id: '',
    amount: '',
});

const formatAmount = (amount: number) =>
    amount.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function BudgetForm() {
    const { budget, fiscalYears, fiscalPeriods, accounts, costCenters } =
        usePage<PageProps>().props;

    const editing = Boolean(budget);

    const { data, setData, post, put, processing, errors } = useForm({
        name: budget?.name ?? '',
        fiscal_year_id: String(
            budget?.fiscal_year_id ?? fiscalYears[0]?.id ?? '',
        ),
        entries: (budget?.entries ?? []).map((entry) => ({
            account_id: String(entry.account_id),
            cost_center_id: entry.cost_center_id
                ? String(entry.cost_center_id)
                : '',
            fiscal_period_id: entry.fiscal_period_id
                ? String(entry.fiscal_period_id)
                : '',
            amount: String(entry.amount),
        })) as Entry[],
    });

    useFlashToastHandler();

    const updateEntry = (index: number, field: keyof Entry, value: string) => {
        const entries = [...data.entries];
        entries[index] = { ...entries[index], [field]: value };
        setData('entries', entries);
    };

    const addEntry = () => {
        setData('entries', [...data.entries, emptyEntry()]);
    };

    const removeEntry = (index: number) => {
        setData(
            'entries',
            data.entries.filter((_, current) => current !== index),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (budget) {
            put(route('budgets.update', budget.id), {
                preserveScroll: true,
            });
        } else {
            post(route('budgets.store'), {
                preserveScroll: true,
            });
        }
    };

    const totalAmount = data.entries.reduce(
        (total, entry) => total + (Number(entry.amount) || 0),
        0,
    );

    const completedEntries = data.entries.filter(
        (entry) => entry.account_id && entry.amount !== '',
    ).length;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
        { title: editing ? 'Edit Budget' : 'Create Budget', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Budget' : 'Create Budget'} />

            <div className="w-full max-w-none space-y-4 pb-24 text-foreground">
                {/* Page header */}
                <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary" />

                    <div className="flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                                <ReceiptText className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <HeadingSmall
                                    title={
                                        editing
                                            ? 'Edit Budget'
                                            : 'Create Budget'
                                    }
                                    description="Organize planned expenditure by fiscal year, account, cost center, and period."
                                />

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                                        <CalendarDays className="size-3" />
                                        Fiscal planning
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                                        <ClipboardList className="size-3" />
                                        {data.entries.length} budget line
                                        {data.entries.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 sm:w-auto"
                        >
                            <Link href={route('budgets.index')}>
                                <ArrowLeft className="size-4" />
                                Back to budgets
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Budget summary */}
                <div className="grid divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <SummaryCard
                        icon={Wallet}
                        label="Planned budget"
                        value={formatAmount(totalAmount)}
                    />

                    <SummaryCard
                        icon={ClipboardList}
                        label="Budget lines"
                        value={String(data.entries.length)}
                    />

                    <SummaryCard
                        icon={Check}
                        label="Completed lines"
                        value={`${completedEntries} / ${data.entries.length}`}
                    />
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* General information */}

                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border bg-muted/20 px-4 py-3 sm:px-5">
                            <SectionHeader
                                icon={FileText}
                                title="Budget information"
                                description="Define the budget name and the fiscal year it applies to."
                                step="01"
                            />
                        </div>

                        <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 p-4 sm:p-5 lg:grid-cols-2 lg:gap-x-8">
                            {/* Budget name */}
                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="budget-name"
                                    className="text-sm font-medium"
                                >
                                    Budget name
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <Input
                                    id="budget-name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="e.g. Annual operating budget"
                                    maxLength={150}
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-10 w-full"
                                />

                                <div className="flex min-h-4 items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <InputError message={errors.name} />
                                    </div>

                                    <span className="shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                                        {data.name.length}/150
                                    </span>
                                </div>
                            </div>

                            {/* Fiscal year */}
                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="fiscal-year"
                                    className="text-sm font-medium"
                                >
                                    Fiscal year
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <Select
                                    id="fiscal-year"
                                    value={data.fiscal_year_id}
                                    onChange={(value) =>
                                        setData('fiscal_year_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select fiscal year',
                                        },
                                        ...fiscalYears.map((year) => ({
                                            value: String(year.id),
                                            label: year.name,
                                        })),
                                    ]}
                                />

                                <div className="min-h-4">
                                    <InputError
                                        message={errors.fiscal_year_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Budget entries */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                            <SectionHeader
                                icon={ClipboardList}
                                title="Budget entries"
                                description="Set the planned amount for each account, with optional cost-center and fiscal-period allocation."
                                step="02"
                            />

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addEntry}
                                className="w-full shrink-0 gap-2 md:w-auto"
                            >
                                <Plus className="size-4" />
                                Add budget line
                            </Button>
                        </div>

                        <div className="space-y-3 p-3 sm:p-4">
                            {data.entries.length === 0 ? (
                                <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-muted/10 px-5 py-7 text-center">
                                    <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm">
                                        <ClipboardList className="size-5" />
                                    </div>

                                    <h3 className="mt-3 text-sm font-semibold">
                                        No budget lines added
                                    </h3>

                                    <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                                        Start by selecting a general ledger
                                        account and entering its planned
                                        allocation.
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addEntry}
                                        size="sm"
                                        className="mt-3 gap-2"
                                    >
                                        <Plus className="size-4" />
                                        Add first budget line
                                    </Button>
                                </div>
                            ) : (
                                data.entries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-lg border border-border bg-background transition-colors focus-within:border-primary/40"
                                    >
                                        {/* Line header */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/20 px-3 py-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/10 text-xs font-semibold text-primary">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        '0',
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold">
                                                        Budget line {index + 1}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                                    {entry.account_id &&
                                                    entry.amount !== ''
                                                        ? 'Amount entered'
                                                        : 'Incomplete'}
                                                </span>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    title="Remove budget line"
                                                    aria-label={`Remove budget entry ${index + 1}`}
                                                    onClick={() =>
                                                        removeEntry(index)
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Line fields */}
                                        <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-12">
                                            <div className="space-y-1.5 sm:col-span-2 xl:col-span-5">
                                                <Label
                                                    htmlFor={`entry-account-${index}`}
                                                >
                                                    General ledger account
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
                                                </Label>

                                                <Select
                                                    id={`entry-account-${index}`}
                                                    value={entry.account_id}
                                                    onChange={(value) =>
                                                        updateEntry(
                                                            index,
                                                            'account_id',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        {
                                                            value: '',
                                                            label: 'Select account',
                                                        },
                                                        ...accounts.map(
                                                            (item) => ({
                                                                value: String(
                                                                    item.id,
                                                                ),
                                                                label: `${item.code} - ${item.name}`,
                                                            }),
                                                        ),
                                                    ]}
                                                />

                                                <InputError
                                                    message={
                                                        errors[
                                                            `entries.${index}.account_id`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1.5 sm:col-span-1 xl:col-span-2">
                                                <Label
                                                    htmlFor={`entry-center-${index}`}
                                                >
                                                    Cost center
                                                </Label>

                                                <Select
                                                    id={`entry-center-${index}`}
                                                    value={entry.cost_center_id}
                                                    onChange={(value) =>
                                                        updateEntry(
                                                            index,
                                                            'cost_center_id',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        {
                                                            value: '',
                                                            label: 'All cost centers',
                                                        },
                                                        ...costCenters.map(
                                                            (item) => ({
                                                                value: String(
                                                                    item.id,
                                                                ),
                                                                label: `${item.code} - ${item.name}`,
                                                            }),
                                                        ),
                                                    ]}
                                                />

                                                <InputError
                                                    message={
                                                        errors[
                                                            `entries.${index}.cost_center_id`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1.5 sm:col-span-1 xl:col-span-2">
                                                <Label
                                                    htmlFor={`entry-period-${index}`}
                                                >
                                                    Fiscal period
                                                </Label>

                                                <Select
                                                    id={`entry-period-${index}`}
                                                    value={
                                                        entry.fiscal_period_id
                                                    }
                                                    onChange={(value) =>
                                                        updateEntry(
                                                            index,
                                                            'fiscal_period_id',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        {
                                                            value: '',
                                                            label: 'Annual budget',
                                                        },
                                                        ...fiscalPeriods.map(
                                                            (item) => ({
                                                                value: String(
                                                                    item.id,
                                                                ),
                                                                label: item.name,
                                                            }),
                                                        ),
                                                    ]}
                                                />

                                                <InputError
                                                    message={
                                                        errors[
                                                            `entries.${index}.fiscal_period_id`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1.5 sm:col-span-2 xl:col-span-3">
                                                <Label
                                                    htmlFor={`entry-amount-${index}`}
                                                >
                                                    Planned amount
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
                                                </Label>

                                                <div className="relative">
                                                    <Coins className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                                    <Input
                                                        id={`entry-amount-${index}`}
                                                        type="number"
                                                        min="0"
                                                        step="0.0001"
                                                        value={entry.amount}
                                                        onChange={(event) =>
                                                            updateEntry(
                                                                index,
                                                                'amount',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="h-9 pl-9 text-right font-medium tabular-nums"
                                                        placeholder="0.00"
                                                        aria-invalid={Boolean(
                                                            errors[
                                                                `entries.${index}.amount`
                                                            ],
                                                        )}
                                                    />
                                                </div>

                                                <InputError
                                                    message={
                                                        errors[
                                                            `entries.${index}.amount`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals footer */}
                        <div className="border-t border-border bg-muted/15 px-3 py-2.5 sm:px-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <p className="text-sm font-medium">
                                        Budget summary
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.entries.length} line
                                        {data.entries.length === 1
                                            ? ''
                                            : 's'} · {completedEntries}{' '}
                                        completed
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
                                    <p className="text-xs text-muted-foreground">
                                        Total planned budget
                                    </p>

                                    <p className="text-sm font-semibold tracking-tight tabular-nums">
                                        ৳ {formatAmount(totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sticky actions */}
                    <div className="sticky bottom-1 z-20 rounded-lg border border-border bg-background/95 p-2.5 shadow-lg backdrop-blur-md sm:p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="hidden min-w-0 sm:block">
                                <p className="text-xs font-medium">
                                    {editing
                                        ? 'Ready to update this budget?'
                                        : 'Ready to save this budget?'}
                                </p>

                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    {editing
                                        ? 'Your changes will be submitted for saving.'
                                        : 'Review the budget lines before saving.'}
                                </p>
                            </div>

                            <div className="flex flex-row items-center gap-2">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    size="sm"
                                >
                                    <Link href={route('budgets.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {processing ? (
                                        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                    ) : editing ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Plus className="size-4" />
                                    )}

                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Update budget'
                                          : 'Save budget'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
    step,
}: {
    icon: typeof CalendarDays;
    title: string;
    description: string;
    step: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
                        {step}
                    </span>
                </div>

                <p className="mt-0.5 max-w-2xl text-[11px] leading-4 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Wallet;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2.5 px-3 py-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>

            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <p className="truncate text-xs text-muted-foreground">
                    {label}
                </p>
                <p className="truncate text-sm font-semibold tracking-tight tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    );
}
