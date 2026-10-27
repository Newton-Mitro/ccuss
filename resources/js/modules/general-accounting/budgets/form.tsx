import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ClipboardList,
    Coins,
    Plus,
    Trash2,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { Entry, PageProps } from '@/modules/general-accounting/types/budgets/form.types';


const emptyEntry = (): Entry => ({
    account_id: '',
    cost_center_id: '',
    fiscal_period_id: '',
    amount: '',
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
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
        { title: editing ? 'Edit Budget' : 'Create Budget', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Budget' : 'Create Budget'} />
            <div className="mx-auto w-full max-w-6xl space-y-5 pb-28 text-foreground">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <ResourcePageHeader
                        title={editing ? 'Edit Budget' : 'Create Budget'}
                        description="Plan account spending across a fiscal year, cost centers, and periods."
                    />
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={route('budgets.index')}>
                            <ArrowLeft className="size-4" />
                            Back to budgets
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CalendarDays className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Budget details
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Set a recognizable name and the fiscal year
                                    this plan covers.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="space-y-2">
                                <Label htmlFor="budget-name">
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
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fiscal-year">
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
                                <InputError message={errors.fiscal_year_id} />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border bg-muted/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ClipboardList className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Budget entries
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Assign planned amounts to accounts and
                                        optional cost centers or periods.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() =>
                                    setData('entries', [
                                        ...data.entries,
                                        emptyEntry(),
                                    ])
                                }
                            >
                                <Plus className="size-4" />
                                Add entry
                            </Button>
                        </div>

                        <div className="space-y-3 p-4 sm:p-5">
                            {data.entries.length === 0 ? (
                                <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/10 px-5 py-10 text-center">
                                    <div className="flex size-11 items-center justify-center rounded-xl border bg-card text-muted-foreground">
                                        <ClipboardList className="size-5" />
                                    </div>
                                    <h3 className="mt-3 text-sm font-semibold">
                                        No budget entries yet
                                    </h3>
                                    <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                                        Add an account and amount to start
                                        building the plan. Entries can be annual
                                        or assigned to a period and cost center.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 gap-1.5"
                                        onClick={() =>
                                            setData('entries', [
                                                ...data.entries,
                                                emptyEntry(),
                                            ])
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add first entry
                                    </Button>
                                </div>
                            ) : (
                                data.entries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-xl border border-border bg-background/50"
                                    >
                                        <div className="flex items-center justify-between border-b border-border/70 bg-muted/15 px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                                                    {index + 1}
                                                </span>
                                                <span className="text-xs font-semibold">
                                                    Budget line
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-destructive"
                                                title="Remove entry"
                                                aria-label={`Remove budget entry ${index + 1}`}
                                                disabled={
                                                    data.entries.length <= 1
                                                }
                                                onClick={() =>
                                                    setData(
                                                        'entries',
                                                        data.entries.filter(
                                                            (_, current) =>
                                                                current !==
                                                                index,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        <div className="grid gap-4 p-3 sm:grid-cols-2 xl:grid-cols-4">
                                            <div className="space-y-2 xl:col-span-2">
                                                <Label
                                                    htmlFor={`entry-account-${index}`}
                                                >
                                                    Account
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
                                            <div className="space-y-2">
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
                                            <div className="space-y-2">
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
                                                            label: 'Annual',
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
                                            <div className="space-y-2 sm:col-span-2 xl:col-span-2">
                                                <Label
                                                    htmlFor={`entry-amount-${index}`}
                                                >
                                                    Planned amount
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
                                                        className="pl-9 tabular-nums"
                                                        placeholder="0.00"
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

                        <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <p className="text-xs text-muted-foreground">
                                {data.entries.length} line
                                {data.entries.length === 1 ? '' : 's'} in this
                                budget
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-xs text-muted-foreground">
                                    Planned total
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {totalAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="sticky bottom-0 flex flex-col-reverse gap-2 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            {editing
                                ? 'Changes will update this budget.'
                                : 'This budget is saved as a draft.'}
                        </p>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button
                                asChild
                                variant="outline"
                                disabled={processing}
                            >
                                <Link href={route('budgets.index')}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
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
                                      : 'Save draft budget'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
