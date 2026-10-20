import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftRight, Check, Plus, RefreshCw } from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

type LedgerAccount = {
    id: number;
    code: string;
    name: string;
    is_control_account: boolean;
    is_cash_account: boolean;
};

type Mapping = {
    id: number;
    source_type: string;
    source_code: string;
    transaction_type: string;
    status: boolean;
    debit_account_id?: number;
    credit_account_id?: number;
    debit_account: LedgerAccount;
    credit_account: LedgerAccount;
};

type Props = {
    accounts: LedgerAccount[];
    sourceTypes: string[];
    mapping?: Mapping | null;
};

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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing
                        ? 'Edit Treasury GL Mapping'
                        : 'Create Treasury GL Mapping'
                }
            />
            <div className="w-full max-w-4xl space-y-5 pb-24">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <ResourcePageHeader
                        title={
                            editing
                                ? 'Edit Treasury GL mapping'
                                : 'Create Treasury GL mapping'
                        }
                        description="Map a Treasury transaction to debit and credit ledger accounts."
                    />
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={route('treasury-gl-mappings.index')}>
                            <ArrowLeftRight className="size-4" />
                            Back to mappings
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border px-4 py-4 sm:px-5">
                            <h2 className="text-sm font-semibold">
                                Mapping configuration
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Choose a source and transaction, then assign
                                distinct debit and credit ledger accounts.
                            </p>
                        </div>
                        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="space-y-2">
                                <Label htmlFor="source_type">Source type</Label>
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
                                <InputError message={form.errors.source_type} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="source_code">Source code</Label>
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
                                    required
                                />
                                <InputError message={form.errors.source_code} />
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
                                            label: type.replaceAll('_', ' '),
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
                                        form.setData('debit_account_id', value)
                                    }
                                    options={accountOptions}
                                />
                                {cashControlSide === 'debit' && (
                                    <p className="text-xs text-muted-foreground">
                                        Select a cash and control account.
                                    </p>
                                )}
                                <InputError
                                    message={form.errors.debit_account_id}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="credit_account_id">
                                    Credit account
                                </Label>
                                <Select
                                    id="credit_account_id"
                                    value={form.data.credit_account_id}
                                    onChange={(value) =>
                                        form.setData('credit_account_id', value)
                                    }
                                    options={accountOptions}
                                />
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
                                <label className="flex items-center gap-2 rounded-lg border p-3 text-sm sm:col-span-2">
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
                            {cashControlSide && (
                                <p className="text-xs text-muted-foreground sm:col-span-2">
                                    The cash-side account must be marked as both
                                    a cash account and a control account in the
                                    chart of accounts.
                                </p>
                            )}
                        </div>
                    </section>

                    <div className="sticky bottom-0 flex flex-col-reverse gap-2 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            variant="outline"
                            disabled={form.processing}
                        >
                            <Link href={route('treasury-gl-mappings.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || accounts.length < 2}
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
                    </div>
                    {accounts.length < 2 && (
                        <p className="text-sm text-destructive">
                            At least two active ledger accounts are required to
                            create a mapping.
                        </p>
                    )}
                </form>
            </div>
        </CustomAuthLayout>
    );
}
