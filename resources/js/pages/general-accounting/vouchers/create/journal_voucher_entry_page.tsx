import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
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

interface Account {
    id: number;
    code: string;
    name: string;
}
interface CostCenter {
    id: number;
    code: string;
    name: string;
}
interface FiscalPeriod {
    id: number;
    name: string;
    fiscal_year?: { name: string };
}
interface Entry {
    account_id: string;
    debit: string;
    credit: string;
    description: string;
    cost_center_id: string;
}

const emptyEntry = (): Entry => ({
    account_id: '',
    debit: '',
    credit: '',
    description: '',
    cost_center_id: '',
});

export default function JournalVoucherEntryPage() {
    const { fiscalPeriods, accounts, costCenters, voucherType } = usePage()
        .props as unknown as {
        fiscalPeriods: FiscalPeriod[];
        accounts: Account[];
        costCenters: CostCenter[];
        voucherType: string;
    };
    const { data, setData, post, processing, errors } = useForm({
        fiscal_period_id: String(fiscalPeriods[0]?.id ?? ''),
        voucher_type: voucherType || 'JOURNAL',
        voucher_date: new Date().toISOString().slice(0, 10),
        description: '',
        entries: [emptyEntry(), emptyEntry()],
    });
    useFlashToastHandler();

    const updateEntry = (index: number, field: keyof Entry, value: string) => {
        const entries = [...data.entries];
        entries[index] = { ...entries[index], [field]: value };
        setData('entries', entries);
    };
    const totalDebit = data.entries.reduce(
        (sum, entry) => sum + Number(entry.debit || 0),
        0,
    );
    const totalCredit = data.entries.reduce(
        (sum, entry) => sum + Number(entry.credit || 0),
        0,
    );
    const balanced =
        data.entries.length >= 2 &&
        totalDebit > 0 &&
        totalDebit === totalCredit;
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('vouchers.store'), { preserveScroll: true });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Vouchers', href: route('vouchers.index') },
        { title: 'Create Voucher', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${data.voucher_type} Voucher`} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={`${data.voucher_type} Voucher`}
                    description="Create a balanced draft voucher."
                    action={
                        <StatusBadge tone={balanced ? 'success' : 'warning'}>
                            {balanced ? 'Balanced' : 'Needs balancing'}
                        </StatusBadge>
                    }
                />
                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6"
                >
                    <section className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div>
                            <h2 className="font-medium text-foreground">
                                Voucher details
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Set the period, date, and purpose before adding
                                entries.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label>Fiscal period</Label>
                                <Select
                                    value={data.fiscal_period_id}
                                    onChange={(value) =>
                                        setData('fiscal_period_id', value)
                                    }
                                    options={fiscalPeriods.map((period) => ({
                                        value: String(period.id),
                                        label: `${period.name} - ${period.fiscal_year?.name ?? ''}`,
                                    }))}
                                />
                                <InputError message={errors.fiscal_period_id} />
                            </div>
                            <div>
                                <Label>Voucher date</Label>
                                <Input
                                    type="date"
                                    value={data.voucher_date}
                                    onChange={(event) =>
                                        setData(
                                            'voucher_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.voucher_date} />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </section>
                    <section className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-medium">Voucher entries</h2>
                                <p className="text-xs text-muted-foreground">
                                    Every debit must have an equal credit.
                                </p>
                            </div>
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
                                <Plus className="mr-1 h-4 w-4" /> Add line
                            </Button>
                        </div>
                        {data.entries.map((entry, index) => (
                            <div
                                key={index}
                                className="grid items-end gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm md:grid-cols-[1fr_12rem_8rem_8rem_1fr_auto]"
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
                                            ...accounts.map((account) => ({
                                                value: String(account.id),
                                                label: `${account.code} - ${account.name}`,
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
                                            { value: '', label: 'None' },
                                            ...costCenters.map(
                                                (costCenter) => ({
                                                    value: String(
                                                        costCenter.id,
                                                    ),
                                                    label: `${costCenter.code} - ${costCenter.name}`,
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
                                <div>
                                    <Label>Debit</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={entry.debit}
                                        onChange={(event) =>
                                            updateEntry(
                                                index,
                                                'debit',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors[`entries.${index}.debit`]
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Credit</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={entry.credit}
                                        onChange={(event) =>
                                            updateEntry(
                                                index,
                                                'credit',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors[`entries.${index}.credit`]
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Line description</Label>
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
                                    disabled={data.entries.length <= 2}
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
                        <div className="flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge tone="info">
                                    Debit {totalDebit.toFixed(4)}
                                </StatusBadge>
                                <StatusBadge tone="info">
                                    Credit {totalCredit.toFixed(4)}
                                </StatusBadge>
                            </div>
                            <Button
                                type="submit"
                                disabled={processing || !balanced}
                            >
                                Save draft voucher
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
