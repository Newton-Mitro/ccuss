import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/general-accounting/types/treasury-gl-mappings/form.types';
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
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

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

const formatLabel = (value: string) => value.replaceAll('_', ' ');

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
        {
            title: editing ? 'Edit Mapping' : 'Create Mapping',
            href: '',
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mapping) {
            form.put(route('treasury-gl-mappings.update', mapping.id), {
                preserveScroll: true,
            });
        } else {
            form.post(route('treasury-gl-mappings.store'), {
                preserveScroll: true,
            });
        }
    };

    const accountOptions = [
        { value: '', label: 'Select GL account' },
        ...accounts.map((account) => ({
            value: String(account.id),
            label: `${account.code} - ${account.name}${
                account.is_control_account && account.is_cash_account
                    ? ' · Cash control'
                    : account.is_cash_account
                      ? ' · Cash'
                      : ''
            }`,
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

    const sourceTransactionTypes = transactionTypes[form.data.source_type];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing
                        ? 'Edit Treasury GL Mapping'
                        : 'Create Treasury GL Mapping'
                }
            />

            <div className="w-full min-w-0 space-y-5 pb-8 text-foreground">
                {/* Page header */}
                <header className="relative isolate overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-4 shadow-sm sm:p-6">
                    <div className="pointer-events-none absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary sm:size-12">
                                <ArrowLeftRight className="size-5 sm:size-6" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                                        {editing
                                            ? 'Edit Treasury GL Mapping'
                                            : 'Create Treasury GL Mapping'}
                                    </h1>

                                    <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        Treasury
                                    </span>
                                </div>

                                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                    Connect Treasury transaction types to the
                                    appropriate general ledger accounts for
                                    accurate journal posting.
                                </p>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full shrink-0 sm:w-auto"
                        >
                            <Link href={route('treasury-gl-mappings.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to mappings
                            </Link>
                        </Button>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-3">
                        {/* Main form */}
                        <div className="min-w-0 space-y-5 xl:col-span-2">
                            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Landmark className="size-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold">
                                            Mapping configuration
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Define the source, transaction, and
                                            debit/credit accounts.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 p-4 sm:p-6">
                                    {/* Source configuration */}
                                    <section className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Transaction source
                                            </h3>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Specify which Treasury source
                                                and transaction this mapping
                                                applies to.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="source_type">
                                                    Source type
                                                </Label>

                                                <Select
                                                    id="source_type"
                                                    className="h-10 w-full"
                                                    value={
                                                        form.data.source_type
                                                    }
                                                    onChange={(value) => {
                                                        form.setData(
                                                            'source_type',
                                                            value,
                                                        );

                                                        if (
                                                            transactionTypes[
                                                                value
                                                            ]
                                                        ) {
                                                            form.setData(
                                                                'transaction_type',
                                                                transactionTypes[
                                                                    value
                                                                ][0],
                                                            );
                                                        }
                                                    }}
                                                    options={sourceTypes.map(
                                                        (type) => ({
                                                            value: type,
                                                            label: formatLabel(
                                                                type,
                                                            ),
                                                        }),
                                                    )}
                                                />

                                                <InputError
                                                    message={
                                                        form.errors.source_type
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="source_code">
                                                    Source code
                                                </Label>

                                                <Input
                                                    id="source_code"
                                                    value={
                                                        form.data.source_code
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'source_code',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="DEFAULT, TELLER, or VAULT"
                                                    className="h-10"
                                                    required
                                                    aria-invalid={Boolean(
                                                        form.errors.source_code,
                                                    )}
                                                />

                                                <InputError
                                                    message={
                                                        form.errors.source_code
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5 sm:col-span-2">
                                                <Label htmlFor="transaction_type">
                                                    Transaction type
                                                </Label>

                                                {sourceTransactionTypes ? (
                                                    <Select
                                                        id="transaction_type"
                                                        className="h-10 w-full"
                                                        value={
                                                            form.data
                                                                .transaction_type
                                                        }
                                                        onChange={(value) =>
                                                            form.setData(
                                                                'transaction_type',
                                                                value,
                                                            )
                                                        }
                                                        options={sourceTransactionTypes.map(
                                                            (type) => ({
                                                                value: type,
                                                                label: formatLabel(
                                                                    type,
                                                                ),
                                                            }),
                                                        )}
                                                    />
                                                ) : (
                                                    <Input
                                                        id="transaction_type"
                                                        value={
                                                            form.data
                                                                .transaction_type
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'transaction_type',
                                                                event.target.value.toUpperCase(),
                                                            )
                                                        }
                                                        placeholder="Transaction type"
                                                        className="h-10"
                                                        required
                                                        aria-invalid={Boolean(
                                                            form.errors
                                                                .transaction_type,
                                                        )}
                                                    />
                                                )}

                                                <InputError
                                                    message={
                                                        form.errors
                                                            .transaction_type
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Ledger account mapping */}
                                    <section className="space-y-4 border-t border-border pt-5">
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Ledger account mapping
                                            </h3>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Select the accounts that will be
                                                debited and credited when this
                                                transaction is posted.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {/* Debit account */}
                                            <div className="min-w-0 space-y-3 rounded-xl border border-border p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <ArrowRight className="size-4" />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="debit_account_id">
                                                            Debit account
                                                        </Label>
                                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                            Account to debit
                                                        </p>
                                                    </div>
                                                </div>

                                                <Select
                                                    id="debit_account_id"
                                                    className="h-10 w-full"
                                                    value={
                                                        form.data
                                                            .debit_account_id
                                                    }
                                                    onChange={(value) =>
                                                        form.setData(
                                                            'debit_account_id',
                                                            value,
                                                        )
                                                    }
                                                    options={accountOptions}
                                                />

                                                {debitAccount && (
                                                    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                                                        <p className="text-xs font-medium break-words">
                                                            {debitAccount.code}{' '}
                                                            —{' '}
                                                            {debitAccount.name}
                                                        </p>
                                                        {debitAccount.is_cash_account && (
                                                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <BadgeCheck className="size-3" />
                                                                Cash account
                                                                {debitAccount.is_control_account
                                                                    ? ' · Control account'
                                                                    : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {cashControlSide ===
                                                    'debit' && (
                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                        This side must use an
                                                        account marked as both
                                                        cash and control.
                                                    </p>
                                                )}

                                                <InputError
                                                    message={
                                                        form.errors
                                                            .debit_account_id
                                                    }
                                                />
                                            </div>

                                            {/* Credit account */}
                                            <div className="min-w-0 space-y-3 rounded-xl border border-border p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <ArrowLeftRight className="size-4" />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="credit_account_id">
                                                            Credit account
                                                        </Label>
                                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                            Account to credit
                                                        </p>
                                                    </div>
                                                </div>

                                                <Select
                                                    id="credit_account_id"
                                                    className="h-10 w-full"
                                                    value={
                                                        form.data
                                                            .credit_account_id
                                                    }
                                                    onChange={(value) =>
                                                        form.setData(
                                                            'credit_account_id',
                                                            value,
                                                        )
                                                    }
                                                    options={accountOptions}
                                                />

                                                {creditAccount && (
                                                    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                                                        <p className="text-xs font-medium break-words">
                                                            {creditAccount.code}{' '}
                                                            —{' '}
                                                            {creditAccount.name}
                                                        </p>
                                                        {creditAccount.is_cash_account && (
                                                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <BadgeCheck className="size-3" />
                                                                Cash account
                                                                {creditAccount.is_control_account
                                                                    ? ' · Control account'
                                                                    : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {cashControlSide ===
                                                    'credit' && (
                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                        This side must use an
                                                        account marked as both
                                                        cash and control.
                                                    </p>
                                                )}

                                                <InputError
                                                    message={
                                                        form.errors
                                                            .credit_account_id
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {debitAccount &&
                                            creditAccount &&
                                            form.data.debit_account_id ===
                                                form.data.credit_account_id && (
                                                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive">
                                                    <CircleHelp className="mt-0.5 size-4 shrink-0" />
                                                    <p>
                                                        Debit and credit
                                                        accounts must be
                                                        different. Please select
                                                        two distinct ledger
                                                        accounts.
                                                    </p>
                                                </div>
                                            )}
                                    </section>

                                    {/* Mapping status */}
                                    {editing && (
                                        <section className="border-t border-border pt-5">
                                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                                                <Input
                                                    type="checkbox"
                                                    checked={form.data.status}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'status',
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                    className="size-4 accent-primary"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium">
                                                        Active mapping
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        Allow this mapping to be
                                                        used for transaction
                                                        posting.
                                                    </p>
                                                </div>
                                            </label>

                                            <InputError
                                                message={form.errors.status}
                                            />
                                        </section>
                                    )}
                                </div>
                            </section>

                            {/* Cash control guidance */}
                            {cashControlSide && (
                                <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Cash control account required
                                            </h3>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                For this cash location{' '}
                                                {formatLabel(
                                                    form.data.transaction_type,
                                                ).toLowerCase()}
                                                , the{' '}
                                                <strong>
                                                    {cashControlSide}
                                                </strong>{' '}
                                                side must use a ledger account
                                                marked as both a cash account
                                                and a control account.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">
                            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="border-b border-border bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Sparkles className="size-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">
                                                Posting preview
                                            </h2>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Review the mapping direction
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4">
                                    <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                                        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            Transaction
                                        </p>
                                        <p className="mt-1.5 text-sm font-semibold break-words">
                                            {formatLabel(
                                                form.data.transaction_type,
                                            ) || 'Transaction type'}
                                        </p>
                                        <p className="mt-1 text-xs break-words text-muted-foreground">
                                            {formatLabel(form.data.source_type)}{' '}
                                            ·{' '}
                                            {form.data.source_code ||
                                                'Source code'}
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="rounded-xl border border-border p-3.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                                                    Debit
                                                </span>
                                                {debitAccount?.is_cash_account && (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                                        Cash
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1.5 text-sm font-semibold break-words">
                                                {debitAccount
                                                    ? `${debitAccount.code} — ${debitAccount.name}`
                                                    : 'Select debit account'}
                                            </p>
                                        </div>

                                        <div className="flex justify-center">
                                            <div className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                                                <ArrowRight className="size-3.5 rotate-90" />
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-border p-3.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                                                    Credit
                                                </span>
                                                {creditAccount?.is_cash_account && (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                                        Cash
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1.5 text-sm font-semibold break-words">
                                                {creditAccount
                                                    ? `${creditAccount.code} — ${creditAccount.name}`
                                                    : 'Select credit account'}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed ${
                                            mappingReady
                                                ? 'border-primary/20 bg-primary/5 text-foreground'
                                                : 'border-border bg-muted/30 text-muted-foreground'
                                        }`}
                                    >
                                        {mappingReady ? (
                                            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                                        ) : (
                                            <CircleHelp className="mt-0.5 size-4 shrink-0" />
                                        )}
                                        <span>
                                            {mappingReady
                                                ? 'Both ledger accounts are selected and distinct.'
                                                : 'Select two different ledger accounts to complete the mapping.'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <ShieldCheck className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold">
                                            Before saving
                                        </h3>

                                        <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                                            <li>
                                                Confirm the source and
                                                transaction type.
                                            </li>
                                            <li>
                                                Ensure debit and credit accounts
                                                are different.
                                            </li>
                                            <li>
                                                Verify the cash control account
                                                requirement when applicable.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <ArrowLeftRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <h3 className="text-xs font-semibold">
                                            Balanced journal entries
                                        </h3>
                                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                            This mapping defines the ledger
                                            accounts used for posting. Ensure
                                            the transaction rules and account
                                            classifications match your
                                            accounting policy.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Sticky actions */}
                    <footer className="sticky bottom-0 z-20 -mx-2 border-t border-border bg-background/95 px-2 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-4 sm:px-4">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-xs text-muted-foreground md:block">
                                {editing
                                    ? 'Review the mapping before saving your changes.'
                                    : 'Verify both ledger accounts before creating the mapping.'}
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                                <Button
                                    asChild
                                    variant="outline"
                                    disabled={form.processing}
                                    className="w-full sm:w-auto"
                                >
                                    <Link
                                        href={route(
                                            'treasury-gl-mappings.index',
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        accounts.length < 2 ||
                                        !mappingReady
                                    }
                                    className="w-full gap-2 sm:w-auto"
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
                                          : 'Create mapping'}
                                </Button>
                            </div>
                        </div>
                    </footer>

                    {accounts.length < 2 && (
                        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            <CircleHelp className="mt-0.5 size-4 shrink-0" />
                            <p>
                                At least two ledger accounts are required to
                                create a mapping. Add the required accounts
                                before continuing.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </CustomAuthLayout>
    );
}
