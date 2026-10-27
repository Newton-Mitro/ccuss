import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    ArrowRight,
    BadgeCheck,
    Check,
    CircleHelp,
    Landmark,
    Plus,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/general-accounting/types/treasury-gl-mappings/form.types';


const transactionTypes: Record<string, string[]> = {
    PETTY_CASH_TRANSACTION: [
        'FUNDING',
        'EXPENSE',
        'REPLENISHMENT',
        'RETURN',
        'ADJUSTMENT',
    ],
    CASH_LOCATION: ['DEPOSIT', 'WITHDRAWAL'],
};

export default function TreasuryGlMappingForm({
    accounts,
    sourceTypes,
    mapping,
}: Props) {
    const editing = Boolean(mapping);
    const form = useForm({
        source_type: mapping?.source_type ?? sourceTypes[0] ?? 'BANK_ACCOUNT',
        source_code: mapping?.source_code ?? 'DEFAULT',
        transaction_type: mapping?.transaction_type ?? 'DEPOSIT',
        debit_account_id: mapping
            ? String(mapping.debit_account_id ?? mapping.debit_account.id)
            : '',
        credit_account_id: mapping
            ? String(mapping.credit_account_id ?? mapping.credit_account.id)
            : '',
        status: mapping?.status ?? true,
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        {
            title: 'Treasury GL Mappings',
            href: route('treasury-gl-mappings.index'),
        },
        { title: editing ? 'Edit Mapping' : 'Create Mapping', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (mapping) {
            form.put(route('treasury-gl-mappings.update', mapping.id));
        } else {
            form.post(route('treasury-gl-mappings.store'));
        }
    };

    const accountOptions = [
        { value: '', label: 'Select GL account' },
        ...accounts.map((account) => ({
            value: String(account.id),
            label: `${account.code} - ${account.name}${account.is_control_account && account.is_cash_account ? ' · Cash control' : account.is_cash_account ? ' · Cash' : ''}`,
        })),
    ];
    const cashControlSide =
        form.data.source_type === 'CASH_LOCATION'
            ? form.data.transaction_type === 'DEPOSIT'
                ? 'debit'
                : 'credit'
            : null;
    const debitAccount = accounts.find(
        (account) => String(account.id) === form.data.debit_account_id,
    );
    const creditAccount = accounts.find(
        (account) => String(account.id) === form.data.credit_account_id,
    );
    const mappingReady =
        Boolean(debitAccount) &&
        Boolean(creditAccount) &&
        form.data.debit_account_id !== form.data.credit_account_id;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing
                        ? 'Edit Treasury GL Mapping'
                        : 'Create Treasury GL Mapping'
                }
            />
            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <ArrowLeftRight className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    General accounting
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Treasury configuration
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {editing
                                    ? 'Edit Treasury GL mapping'
                                    : 'Create Treasury GL mapping'}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Map Treasury transaction types to the ledger
                                accounts used for balanced journal entries.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="shrink-0">
                            <Link href={route('treasury-gl-mappings.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to mappings
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form onSubmit={submit} className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-start gap-3 border-b border-border px-5 py-5 sm:px-7">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <Landmark className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Mapping configuration
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose the transaction source, then
                                        assign its debit and credit ledger
                                        accounts.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                                <div className="space-y-2">
                                    <Label htmlFor="source_type">
                                        Source type
                                    </Label>
                                    <Select
                                        id="source_type"
                                        value={form.data.source_type}
                                        onChange={(value) => {
                                            form.setData('source_type', value);
                                            if (transactionTypes[value]) {
                                                form.setData(
                                                    'transaction_type',
                                                    transactionTypes[value][0],
                                                );
                                            }
                                        }}
                                        options={sourceTypes.map((type) => ({
                                            value: type,
                                            label: type.replaceAll('_', ' '),
                                        }))}
                                    />
                                    <InputError
                                        message={form.errors.source_type}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source_code">
                                        Source code
                                    </Label>
                                    <Input
                                        id="source_code"
                                        value={form.data.source_code}
                                        onChange={(event) =>
                                            form.setData(
                                                'source_code',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="DEFAULT, TELLER, or VAULT"
                                        className="h-11"
                                        required
                                    />
                                    <InputError
                                        message={form.errors.source_code}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transaction_type">
                                        Transaction type
                                    </Label>
                                    {transactionTypes[form.data.source_type] ? (
                                        <Select
                                            id="transaction_type"
                                            value={form.data.transaction_type}
                                            onChange={(value) =>
                                                form.setData(
                                                    'transaction_type',
                                                    value,
                                                )
                                            }
                                            options={transactionTypes[
                                                form.data.source_type
                                            ].map((type) => ({
                                                value: type,
                                                label: type.replaceAll(
                                                    '_',
                                                    ' ',
                                                ),
                                            }))}
                                        />
                                    ) : (
                                        <Input
                                            id="transaction_type"
                                            value={form.data.transaction_type}
                                            onChange={(event) =>
                                                form.setData(
                                                    'transaction_type',
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="Transaction type"
                                            required
                                        />
                                    )}
                                    <InputError
                                        message={form.errors.transaction_type}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="debit_account_id">
                                        Debit account
                                    </Label>
                                    <Select
                                        id="debit_account_id"
                                        value={form.data.debit_account_id}
                                        onChange={(value) =>
                                            form.setData(
                                                'debit_account_id',
                                                value,
                                            )
                                        }
                                        options={accountOptions}
                                    />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        The account debited when this
                                        transaction is posted.
                                    </p>
                                    {cashControlSide === 'debit' && (
                                        <p className="text-xs text-muted-foreground">
                                            Select a cash and control account.
                                        </p>
                                    )}
                                    <InputError
                                        message={form.errors.debit_account_id}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="credit_account_id">
                                        Credit account
                                    </Label>
                                    <Select
                                        id="credit_account_id"
                                        value={form.data.credit_account_id}
                                        onChange={(value) =>
                                            form.setData(
                                                'credit_account_id',
                                                value,
                                            )
                                        }
                                        options={accountOptions}
                                    />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        The account credited when this
                                        transaction is posted.
                                    </p>
                                    {cashControlSide === 'credit' && (
                                        <p className="text-xs text-muted-foreground">
                                            Select a cash and control account.
                                        </p>
                                    )}
                                    <InputError
                                        message={form.errors.credit_account_id}
                                    />
                                </div>
                                {mapping && (
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/20 p-4 text-sm sm:col-span-2">
                                        <Input
                                            type="checkbox"
                                            checked={form.data.status}
                                            onChange={(event) =>
                                                form.setData(
                                                    'status',
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        Active
                                    </label>
                                )}
                            </div>
                        </section>

                        {cashControlSide && (
                            <div className="flex items-start gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 p-4 text-sm text-sky-800 dark:text-sky-200">
                                <CircleHelp className="mt-0.5 size-4 shrink-0" />
                                <p className="leading-5">
                                    The {cashControlSide} side must use an
                                    account marked as both a cash account and a
                                    control account in the chart of accounts.
                                </p>
                            </div>
                        )}

                        <footer className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:justify-end sm:px-5">
                            <Button
                                asChild
                                variant="outline"
                                disabled={form.processing}
                            >
                                <Link
                                    href={route('treasury-gl-mappings.index')}
                                >
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    form.processing || accounts.length < 2
                                }
                                className="gap-2"
                            >
                                {form.processing ? (
                                    <RefreshCw className="size-4 animate-spin" />
                                ) : editing ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                                {form.processing
                                    ? 'Saving...'
                                    : editing
                                      ? 'Save changes'
                                      : 'Save mapping'}
                            </Button>
                        </footer>
                        {accounts.length < 2 && (
                            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                <CircleHelp className="mt-0.5 size-4 shrink-0" />
                                <p>
                                    At least two active ledger accounts are
                                    required to create a mapping.
                                </p>
                            </div>
                        )}
                    </form>
                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Posting preview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review the mapping direction at a glance.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="rounded-xl bg-muted/50 p-3.5">
                                    <p className="text-xs text-muted-foreground">
                                        Transaction
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {form.data.transaction_type.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {form.data.source_type.replaceAll(
                                            '_',
                                            ' ',
                                        )}{' '}
                                        ·{' '}
                                        {form.data.source_code || 'Source code'}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="rounded-xl border p-3.5">
                                        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                                            Debit
                                        </p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {debitAccount
                                                ? `${debitAccount.code} · ${debitAccount.name}`
                                                : 'Select debit account'}
                                        </p>
                                    </div>
                                    <div className="flex justify-center text-muted-foreground">
                                        <ArrowRight className="size-4 rotate-90" />
                                    </div>
                                    <div className="rounded-xl border p-3.5">
                                        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                                            Credit
                                        </p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {creditAccount
                                                ? `${creditAccount.code} · ${creditAccount.name}`
                                                : 'Select credit account'}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                                        mappingReady
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {mappingReady ? (
                                        <BadgeCheck className="size-4" />
                                    ) : (
                                        <CircleHelp className="size-4" />
                                    )}
                                    {mappingReady
                                        ? 'Debit and credit configured'
                                        : 'Complete both sides'}
                                </div>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Before saving
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Confirm the source and transaction type are
                                    correct.
                                </li>
                                <li>
                                    Debit and credit accounts must be distinct.
                                </li>
                                <li>
                                    Cash-side mappings require a cash control
                                    account.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
