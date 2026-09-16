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

interface Entry {
    account_id: string;
    amount: string;
    description: string;
}

export default function OpeningBalancesCreate() {
    const { fiscalPeriods, accounts } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        fiscal_period_id: fiscalPeriods[0]?.id ?? '',
        offset_account_id: '',
        entries: [{ account_id: '', amount: '', description: '' }] as Entry[],
    });
    useFlashToastHandler();

    const updateEntry = (index: number, field: keyof Entry, value: string) => {
        const entries = [...data.entries];
        entries[index] = { ...entries[index], [field]: value };
        setData('entries', entries);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('opening-balances.store'), { preserveScroll: true });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Opening Balances', href: route('opening-balances.index') },
        { title: 'Apply Opening Balances', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Apply Opening Balances" />
            <div className="space-y-4">
                <HeadingSmall
                    title="Apply Opening Balances"
                    description="Create and post one balanced opening voucher."
                />
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-md border bg-card p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Fiscal period</Label>
                            <Select
                                value={data.fiscal_period_id}
                                onChange={(value) =>
                                    setData('fiscal_period_id', value)
                                }
                                options={fiscalPeriods.map((period: any) => ({
                                    value: period.id,
                                    label: `${period.name} - ${period.fiscal_year?.name ?? ''}`,
                                }))}
                            />
                            <InputError message={errors.fiscal_period_id} />
                        </div>
                        <div>
                            <Label>Offset account</Label>
                            <Select
                                value={data.offset_account_id}
                                onChange={(value) =>
                                    setData('offset_account_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select account' },
                                    ...accounts.map((account: any) => ({
                                        value: account.id,
                                        label: `${account.code} - ${account.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.offset_account_id} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-medium">Balance entries</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setData('entries', [
                                        ...data.entries,
                                        {
                                            account_id: '',
                                            amount: '',
                                            description: '',
                                        },
                                    ])
                                }
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add line
                            </Button>
                        </div>
                        {data.entries.map((entry, index) => (
                            <div
                                key={index}
                                className="grid items-end gap-3 md:grid-cols-[1fr_10rem_1fr_auto]"
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
                                            ...accounts.map((account: any) => ({
                                                value: account.id,
                                                label: `${account.code} - ${account.name}`,
                                            })),
                                        ]}
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
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={entry.description}
                                        onChange={(event) =>
                                            updateEntry(
                                                index,
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    title="Remove line"
                                    disabled={data.entries.length === 1}
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
                        <InputError message={errors.entries} />
                    </div>
                    <Button type="submit" disabled={processing}>
                        Post opening balances
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
