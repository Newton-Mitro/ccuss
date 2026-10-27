import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileText,
    Landmark,
    Plus,
    Scale,
    Trash2,
    Wallet,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import type { Entry } from '@/modules/general-accounting/types/opening-balances/create.interfaces';


export default function OpeningBalancesCreate() {
    const { fiscalPeriods, accounts } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        fiscal_period_id: fiscalPeriods[0]?.id ?? '',
        offset_account_id: '',
        entries: [{ account_id: '', amount: '', description: '' }] as Entry[],
    });
    const selectedPeriod = fiscalPeriods.find(
        (period: any) => String(period.id) === String(data.fiscal_period_id),
    );
    const selectedOffsetAccount = accounts.find(
        (account: any) => String(account.id) === String(data.offset_account_id),
    );
    const totalAmount = data.entries.reduce(
        (total, entry) => total + (Number(entry.amount) || 0),
        0,
    );
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
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <Scale className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    General accounting
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Opening balances
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Apply opening balances
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Enter the starting balances for your ledger
                                accounts and post them as one balanced opening
                                voucher.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="shrink-0">
                            <a href={route('opening-balances.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to balances
                            </a>
                        </Button>
                    </div>
                </header>

                <form
                    onSubmit={submit}
                    className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <Landmark className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Accounting period
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose where the opening voucher will be
                                        recorded.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Fiscal period</Label>
                                    <Select
                                        value={data.fiscal_period_id}
                                        onChange={(value) =>
                                            setData('fiscal_period_id', value)
                                        }
                                        options={fiscalPeriods.map(
                                            (period: any) => ({
                                                value: String(period.id),
                                                label: `${period.name} - ${period.fiscal_year?.name ?? ''}`,
                                            }),
                                        )}
                                    />
                                    <InputError
                                        message={errors.fiscal_period_id}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Offset account</Label>
                                    <Select
                                        value={data.offset_account_id}
                                        onChange={(value) =>
                                            setData('offset_account_id', value)
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select account',
                                            },
                                            ...accounts.map((account: any) => ({
                                                value: String(account.id),
                                                label: `${account.code} - ${account.name}`,
                                            })),
                                        ]}
                                    />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        This account balances the opening
                                        voucher entries.
                                    </p>
                                    <InputError
                                        message={errors.offset_account_id}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-5 border-t p-5 sm:p-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <FileText className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="font-semibold tracking-tight">
                                            Balance entries
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Add each account balance to the
                                            opening voucher.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
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
                                    <Plus className="mr-2 size-4" />
                                    Add line
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {data.entries.map((entry, index) => (
                                    <fieldset
                                        key={index}
                                        className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <legend className="text-sm font-semibold">
                                                Entry {index + 1}
                                            </legend>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                title="Remove line"
                                                aria-label={`Remove entry ${index + 1}`}
                                                disabled={
                                                    data.entries.length === 1
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
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2 sm:col-span-2">
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
                                                        ...accounts.map(
                                                            (account: any) => ({
                                                                value: String(
                                                                    account.id,
                                                                ),
                                                                label: `${account.code} - ${account.name}`,
                                                            }),
                                                        ),
                                                    ]}
                                                />
                                            </div>
                                            <div className="space-y-2">
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
                                                    placeholder="0.00"
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
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
                                                    placeholder="Optional entry description"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                ))}
                                <InputError message={errors.entries} />
                            </div>
                        </section>

                        <footer className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <Button asChild variant="outline">
                                <a href={route('opening-balances.index')}>
                                    Cancel
                                </a>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <ArrowRight className="mr-2 size-4" />
                                {processing
                                    ? 'Posting...'
                                    : 'Post opening balances'}
                            </Button>
                        </footer>
                    </div>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Wallet className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Voucher overview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Check your opening balance setup.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Scale className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Fiscal period
                                    </p>
                                    <p className="font-semibold">
                                        {selectedPeriod?.name ??
                                            'Select a period'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedPeriod?.fiscal_year?.name ??
                                            'No period selected'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="text-xs text-muted-foreground">
                                        Balance entries
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {data.entries.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="text-xs text-muted-foreground">
                                        Total entered
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {totalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="space-y-1 border-t pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        Offset account
                                    </p>
                                    <p className="text-sm font-medium">
                                        {selectedOffsetAccount
                                            ? `${selectedOffsetAccount.code} · ${selectedOffsetAccount.name}`
                                            : 'Not selected'}
                                    </p>
                                </div>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Before posting
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Check the fiscal period is open and
                                    appropriate.
                                </li>
                                <li>
                                    Ensure every amount is assigned to the
                                    correct ledger account.
                                </li>
                                <li>
                                    Choose the offset account that balances the
                                    opening voucher.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
