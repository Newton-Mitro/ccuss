import { formatDate } from '@/lib/date_util';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRightLeft,
    Building2,
    Check,
    CircleDollarSign,
    Sparkles,
} from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { Props } from '@/modules/treasury-cash/types/banking/transactions/create.interfaces';


export default function Create() {
    const { bank_accounts, ledger_accounts } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        bank_account_id: '',
        counterpart_account_id: '',
        type: 'DEPOSIT',
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        reference: '',
        description: '',
    });
    const selectedBankAccount = bank_accounts.find(
        (account) => String(account.id) === data.bank_account_id,
    );
    const selectedCounterpartAccount = ledger_accounts.find(
        (account) => String(account.id) === data.counterpart_account_id,
    );
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Bank Transactions', href: route('bank-transactions.index') },
        { title: 'Create', href: route('bank-transactions.create') },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('bank-transactions.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bank Transaction" />
            <div className="mx-auto max-w-6xl space-y-6 text-foreground">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <ArrowRightLeft className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    Banking
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    New transaction
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Create bank transaction
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Record a pending movement between a bank account
                                and its counterpart ledger account.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="shrink-0"
                            onClick={() =>
                                router.visit(route('bank-transactions.index'))
                            }
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Back to transactions
                        </Button>
                    </div>
                </header>

                {bank_accounts.length === 0 && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
                    >
                        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                No bank accounts available
                            </p>
                            <p className="mt-1 leading-5 opacity-90">
                                Add or activate a bank account before recording
                                a transaction.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <Building2 className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Transaction details
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Select both accounts and specify the
                                        transaction type and amount.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="bank_account_id">
                                        Bank account
                                    </Label>
                                    <Select
                                        id="bank_account_id"
                                        value={data.bank_account_id}
                                        onChange={(value) =>
                                            setData('bank_account_id', value)
                                        }
                                        placeholder="Select account"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select account',
                                            },
                                            ...bank_accounts.map((account) => ({
                                                value: String(account.id),
                                                label: `${account.account_name} (${account.account_number})`,
                                            })),
                                        ]}
                                    />
                                    {errors.bank_account_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.bank_account_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="counterpart_account_id">
                                        Counterpart ledger account
                                    </Label>
                                    <Select
                                        id="counterpart_account_id"
                                        value={data.counterpart_account_id}
                                        onChange={(value) =>
                                            setData(
                                                'counterpart_account_id',
                                                value,
                                            )
                                        }
                                        placeholder="Select counterpart account"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select counterpart account',
                                            },
                                            ...ledger_accounts.map(
                                                (account) => ({
                                                    value: String(account.id),
                                                    label: `${account.code} — ${account.name}`,
                                                }),
                                            ),
                                        ]}
                                    />
                                    {errors.counterpart_account_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.counterpart_account_id}
                                        </p>
                                    )}
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Choose the ledger account on the other
                                        side of this transaction.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Transaction type
                                    </Label>
                                    <Select
                                        id="type"
                                        value={data.type}
                                        onChange={(value) =>
                                            setData('type', value)
                                        }
                                        options={[
                                            {
                                                value: 'DEPOSIT',
                                                label: 'Deposit',
                                            },
                                            {
                                                value: 'WITHDRAWAL',
                                                label: 'Withdrawal',
                                            },
                                            {
                                                value: 'TRANSFER_IN',
                                                label: 'Transfer in',
                                            },
                                            {
                                                value: 'TRANSFER_OUT',
                                                label: 'Transfer out',
                                            },
                                            {
                                                value: 'CHARGE',
                                                label: 'Charge',
                                            },
                                            {
                                                value: 'INTEREST',
                                                label: 'Interest',
                                            },
                                            {
                                                value: 'ADJUSTMENT',
                                                label: 'Adjustment',
                                            },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <div className="relative">
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.0001"
                                            value={data.amount}
                                            onChange={(event) =>
                                                setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className="h-11 pl-10"
                                            required
                                        />
                                        <CircleDollarSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                    {errors.amount && (
                                        <p className="text-sm text-destructive">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transaction_date">
                                        Transaction date
                                    </Label>
                                    <AppDatePicker
                                        id="transaction_date"
                                        value={data.transaction_date}
                                        onChange={(value) =>
                                            setData('transaction_date', value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reference">
                                        Reference{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="reference"
                                        value={data.reference}
                                        onChange={(event) =>
                                            setData(
                                                'reference',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={255}
                                        placeholder="Receipt or transfer reference"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="description">
                                        Description{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={2000}
                                        rows={3}
                                        placeholder="Add context for this transaction."
                                        className="flex min-h-24 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                            </div>
                        </section>

                        <footer className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.visit(
                                        route('bank-transactions.index'),
                                    )
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing || bank_accounts.length === 0
                                }
                            >
                                <ArrowRightLeft className="mr-2 size-4" />
                                {processing
                                    ? 'Submitting...'
                                    : 'Create pending transaction'}
                            </Button>
                        </footer>
                    </form>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Transaction preview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review the transfer details before saving.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ArrowRightLeft className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {data.type.replaceAll('_', ' ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedBankAccount?.account_name ??
                                            'Select a bank account'}
                                    </p>
                                    {selectedBankAccount && (
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {selectedBankAccount.account_number}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CircleDollarSign className="size-4" />
                                        Amount
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {data.amount || '0.00'}
                                    </span>
                                </div>
                                <div className="space-y-1 border-t pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        Counterpart ledger
                                    </p>
                                    <p className="text-sm font-medium">
                                        {selectedCounterpartAccount
                                            ? `${selectedCounterpartAccount.code} · ${selectedCounterpartAccount.name}`
                                            : 'Not selected'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                                    <span className="size-1.5 rounded-full bg-amber-500" />
                                    Pending review
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {data.transaction_date
                                        ? formatDate(data.transaction_date)
                                        : 'Transaction date not set'}
                                </p>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Before you submit
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Confirm the bank and ledger accounts are
                                    correct.
                                </li>
                                <li>
                                    Verify the transaction type and amount
                                    against supporting records.
                                </li>
                                <li>
                                    The transaction will remain pending until it
                                    is reviewed.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
