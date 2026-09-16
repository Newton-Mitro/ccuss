import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

type Option = { id: number; code?: string; name: string };
type Entry = {
    account_id: string;
    cost_center_id: string;
    fiscal_period_id: string;
    amount: string;
};

const emptyEntry = (): Entry => ({
    account_id: '',
    cost_center_id: '',
    fiscal_period_id: '',
    amount: '',
});

export default function BudgetForm() {
    const props = usePage().props as any;
    const budget = props.budget;
    const editing = Boolean(budget);
    const { fiscalYears, fiscalPeriods, accounts, costCenters } = props as {
        fiscalYears: Option[];
        fiscalPeriods: Option[];
        accounts: Option[];
        costCenters: Option[];
    };
    const { data, setData, post, put, processing, errors } = useForm({
        name: budget?.name ?? '',
        fiscal_year_id: String(
            budget?.fiscal_year_id ?? fiscalYears[0]?.id ?? '',
        ),
        entries: (budget?.entries ?? []).map((entry: any) => ({
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

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        editing
            ? put(route('budgets.update', budget.id), { preserveScroll: true })
            : post(route('budgets.store'), { preserveScroll: true });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
        { title: editing ? 'Edit Budget' : 'Create Budget', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Budget' : 'Create Budget'} />
            <div className="space-y-4">
                <HeadingSmall
                    title={editing ? 'Edit Budget' : 'Create Budget'}
                    description="Set planned amounts for accounts, cost centers, and fiscal periods."
                />
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-md border bg-card p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div>
                            <Label>Fiscal year</Label>
                            <Select
                                value={data.fiscal_year_id}
                                onChange={(value) =>
                                    setData('fiscal_year_id', value)
                                }
                                options={fiscalYears.map((year) => ({
                                    value: String(year.id),
                                    label: year.name,
                                }))}
                            />
                            <InputError message={errors.fiscal_year_id} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-medium">Budget entries</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setData('entries', [
                                        ...data.entries,
                                        emptyEntry(),
                                    ])
                                }
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add entry
                            </Button>
                        </div>
                        {data.entries.map((entry, index) => (
                            <div
                                key={index}
                                className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_9rem_auto]"
                            >
                                <div>
                                    <Label>Account</Label>
                                    <Select
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
                                            ...accounts.map((item) => ({
                                                value: String(item.id),
                                                label: `${item.code} - ${item.name}`,
                                            })),
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
                                <div>
                                    <Label>Cost center</Label>
                                    <Select
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
                                            ...costCenters.map((item) => ({
                                                value: String(item.id),
                                                label: `${item.code} - ${item.name}`,
                                            })),
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
                                <div>
                                    <Label>Fiscal period</Label>
                                    <Select
                                        value={entry.fiscal_period_id}
                                        onChange={(value) =>
                                            updateEntry(
                                                index,
                                                'fiscal_period_id',
                                                value,
                                            )
                                        }
                                        options={[
                                            { value: '', label: 'Annual' },
                                            ...fiscalPeriods.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            })),
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
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={entry.amount}
                                        onChange={(event) =>
                                            updateEntry(
                                                index,
                                                'amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors[`entries.${index}.amount`]
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    title="Remove entry"
                                    disabled={data.entries.length <= 1}
                                    onClick={() =>
                                        setData(
                                            'entries',
                                            data.entries.filter(
                                                (_, current) =>
                                                    current !== index,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 className="mb-2 h-4 w-4 text-destructive" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button type="submit" disabled={processing}>
                        {editing ? 'Update budget' : 'Save draft budget'}
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
