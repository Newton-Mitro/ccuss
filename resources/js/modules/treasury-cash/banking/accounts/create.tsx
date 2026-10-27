import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import type { BankAccountCreatePageProps } from '@/modules/treasury-cash/types/forms';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    FileCheck2,
    Landmark,
    LoaderCircle,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { type FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function Create() {
    const { branches, ledger_accounts, account } =
        usePage<BankAccountCreatePageProps>().props;
    const editing = Boolean(account);

    const { data, setData, post, put, processing, errors } = useForm({
        branch_id: String(account?.branch_id ?? ''),
        account_name: account?.account_name ?? '',
        account_number: account?.account_number ?? '',
        routing_number: account?.routing_number ?? '',
        account_type: account?.account_type ?? 'CURRENT',
        opening_balance: String(account?.opening_balance ?? '0'),
        opening_counterpart_account_id: '',
        is_reconcilable: account?.is_reconcilable ?? true,
        status: account?.status ?? 'ACTIVE',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Bank Accounts', href: route('bank-accounts.index') },
        {
            title: account ? 'Edit' : 'Create',
            href: account
                ? route('bank-accounts.edit', account.id)
                : route('bank-accounts.create'),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (account) {
            put(route('bank-accounts.update', account.id));
        } else {
            post(route('bank-accounts.store'));
        }
    };

    const sectionClass = 'rounded-xl border bg-card shadow-sm';

    const sectionHeaderClass =
        'flex items-start gap-3 border-b px-4 py-4 sm:px-5';

    const fieldClass = 'h-10 w-full';

    const labelClass = 'text-sm font-medium';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${editing ? 'Edit' : 'Create'} Bank Account`} />

            <div className="w-full max-w-5xl space-y-5 pb-24 text-foreground">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                            <Landmark className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {editing
                                        ? 'Edit Bank Account'
                                        : 'Create Bank Account'}
                                </h1>

                                <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    <ShieldCheck className="size-3.5" />
                                    Bank setup
                                </span>
                            </div>

                            <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
                                {editing
                                    ? 'Update bank account details, branch assignment, and reconciliation settings.'
                                    : 'Register a bank account, link it to your financial ledger, and configure its branch and reconciliation settings.'}
                            </p>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Link href={route('bank-accounts.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to bank accounts
                        </Link>
                    </Button>
                </div>

                {/* Informational banner */}
                <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                        <FileCheck2 className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium">
                            Bank account configuration
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Link the bank account to the appropriate financial
                            account. A positive opening balance queues a deposit
                            for posting and voucher creation.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Section 2: Branch assignment */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Building2 className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-semibold">
                                    Branch assignment
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Specify the branch responsible for this bank
                                    account.
                                </p>
                            </div>

                            <span className="hidden text-xs text-muted-foreground sm:block">
                                Section 02
                            </span>
                        </div>

                        <div className="p-4 sm:p-5">
                            <div className="max-w-xl space-y-1.5">
                                <label
                                    htmlFor="branch_id"
                                    className={labelClass}
                                >
                                    Responsible branch
                                </label>

                                <Select
                                    id="branch_id"
                                    className={fieldClass}
                                    value={data.branch_id}
                                    onChange={(value) =>
                                        setData('branch_id', value)
                                    }
                                    placeholder="Organization-wide"
                                    options={[
                                        {
                                            value: '',
                                            label: 'Organization-wide',
                                        },
                                        ...branches.map((branch) => ({
                                            value: String(branch.id),
                                            label: `${branch.name} (${branch.code})`,
                                        })),
                                    ]}
                                />

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Leave as organization-wide if the account is
                                    not assigned to a specific branch.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Bank account details */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Wallet className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-semibold">
                                    Bank account details
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Enter the account identification and banking
                                    information.
                                </p>
                            </div>

                            <span className="hidden text-xs text-muted-foreground sm:block">
                                Section 03
                            </span>
                        </div>

                        <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="min-w-0 space-y-1.5">
                                <label
                                    htmlFor="account_name"
                                    className={labelClass}
                                >
                                    Account name
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </label>

                                <Input
                                    id="account_name"
                                    className={fieldClass}
                                    value={data.account_name}
                                    placeholder="Enter account holder name"
                                    autoComplete="off"
                                    onChange={(event) =>
                                        setData(
                                            'account_name',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />

                                <InputError message={errors.account_name} />
                            </div>

                            <div className="min-w-0 space-y-1.5">
                                <label
                                    htmlFor="account_number"
                                    className={labelClass}
                                >
                                    Account number
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </label>

                                <Input
                                    id="account_number"
                                    className={fieldClass}
                                    value={data.account_number}
                                    placeholder="Enter bank account number"
                                    autoComplete="off"
                                    onChange={(event) =>
                                        setData(
                                            'account_number',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />

                                <InputError message={errors.account_number} />
                            </div>

                            <div className="min-w-0 space-y-1.5">
                                <label
                                    htmlFor="routing_number"
                                    className={labelClass}
                                >
                                    Routing number
                                </label>

                                <Input
                                    id="routing_number"
                                    className={fieldClass}
                                    value={data.routing_number}
                                    placeholder="Enter routing number"
                                    autoComplete="off"
                                    onChange={(event) =>
                                        setData(
                                            'routing_number',
                                            event.target.value,
                                        )
                                    }
                                />

                                <InputError message={errors.routing_number} />

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Optional bank routing information.
                                </p>
                            </div>

                            <div className="min-w-0 space-y-1.5">
                                <label
                                    htmlFor="account_type"
                                    className={labelClass}
                                >
                                    Account type
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </label>

                                <Select
                                    id="account_type"
                                    className={fieldClass}
                                    value={data.account_type}
                                    onChange={(value) =>
                                        setData('account_type', value)
                                    }
                                    options={[
                                        {
                                            value: 'CURRENT',
                                            label: 'Current account',
                                        },
                                        {
                                            value: 'SAVINGS',
                                            label: 'Savings account',
                                        },
                                        {
                                            value: 'FDR',
                                            label: 'Fixed deposit (FDR)',
                                        },
                                        {
                                            value: 'OTHER',
                                            label: 'Other',
                                        },
                                    ]}
                                />

                                <InputError message={errors.account_type} />
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Financial controls */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <CircleDollarSign className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-semibold">
                                    {editing
                                        ? 'Financial controls'
                                        : 'Opening balance & controls'}
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {editing
                                        ? 'Configure reconciliation preferences. Opening deposits are managed through bank transactions.'
                                        : 'Set the opening deposit and configure reconciliation preferences.'}
                                </p>
                            </div>

                            <span className="hidden text-xs text-muted-foreground sm:block">
                                Section 04
                            </span>
                        </div>

                        <div className="space-y-5 p-4 sm:p-5">
                            {!editing && (
                                <>
                                    <div className="max-w-xl space-y-1.5">
                                        <label
                                            htmlFor="opening_balance"
                                            className={labelClass}
                                        >
                                            Opening balance
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <div className="flex h-11 items-center rounded-lg border bg-background transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                                            <div className="flex h-full items-center border-r bg-muted/40 px-3">
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    ৳
                                                </span>
                                            </div>

                                            <Input
                                                id="opening_balance"
                                                type="number"
                                                min="0"
                                                step="0.0001"
                                                className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                value={data.opening_balance}
                                                placeholder="0.0000"
                                                onChange={(event) =>
                                                    setData(
                                                        'opening_balance',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        <InputError
                                            message={errors.opening_balance}
                                        />

                                        <p className="text-xs leading-5 text-muted-foreground">
                                            A positive amount queues a pending
                                            deposit. Posting it updates the book
                                            balance and creates the voucher; the
                                            selected branch needs an open
                                            business day.
                                        </p>
                                    </div>

                                    <div className="max-w-xl space-y-1.5">
                                        <label
                                            htmlFor="opening_counterpart_account_id"
                                            className={labelClass}
                                        >
                                            Opening balance counterpart
                                            {Number(data.opening_balance) >
                                                0 && (
                                                <span className="ml-1 text-destructive">
                                                    *
                                                </span>
                                            )}
                                        </label>

                                        <Select
                                            id="opening_counterpart_account_id"
                                            className={fieldClass}
                                            value={
                                                data.opening_counterpart_account_id
                                            }
                                            disabled={
                                                Number(data.opening_balance) <=
                                                0
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    'opening_counterpart_account_id',
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
                                                        value: String(
                                                            account.id,
                                                        ),
                                                        label: `${account.code} — ${account.name}`,
                                                    }),
                                                ),
                                            ]}
                                        />

                                        <InputError
                                            message={
                                                errors.opening_counterpart_account_id
                                            }
                                        />

                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Required for a positive opening
                                            balance. The chosen ledger account
                                            will be credited when the opening
                                            deposit is posted.
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="rounded-lg border bg-muted/20 p-3.5">
                                <label
                                    htmlFor="is_reconcilable"
                                    className="flex cursor-pointer items-start gap-3"
                                >
                                    <Input
                                        id="is_reconcilable"
                                        type="checkbox"
                                        checked={data.is_reconcilable}
                                        onChange={(event) =>
                                            setData(
                                                'is_reconcilable',
                                                event.target.checked,
                                            )
                                        }
                                        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                            <CheckCircle2 className="size-4 text-muted-foreground" />
                                            Enable bank reconciliation
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                            Allow this account to be included in
                                            bank statement reconciliation
                                            workflows.
                                        </span>
                                    </span>
                                </label>
                            </div>

                            <div className="max-w-xl space-y-1.5">
                                <label htmlFor="status" className={labelClass}>
                                    Account status
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </label>

                                <Select
                                    id="status"
                                    className={fieldClass}
                                    value={data.status}
                                    onChange={(value) =>
                                        setData('status', value)
                                    }
                                    options={[
                                        {
                                            value: 'ACTIVE',
                                            label: 'Active — available for use',
                                        },
                                        {
                                            value: 'INACTIVE',
                                            label: 'Inactive — temporarily unavailable',
                                        },
                                        {
                                            value: 'CLOSED',
                                            label: 'Closed — no longer in use',
                                        },
                                    ]}
                                />

                                <InputError message={errors.status} />

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Choose the appropriate operational status
                                    for the bank account.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Form actions */}
                    <div className="fixed inset-x-4 bottom-0 z-30 w-auto max-w-5xl border-t bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:inset-x-auto md:left-[calc(var(--app-sidebar-offset,0px)+1.5rem)] md:w-[calc(100%-var(--app-sidebar-offset,0px)-3rem)]">
                        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                                <ShieldCheck className="size-4 shrink-0" />
                                Review account details before submitting.
                            </p>

                            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={route('bank-accounts.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:min-w-44"
                                >
                                    {processing ? (
                                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Building2 className="mr-2 size-4" />
                                    )}

                                    {processing
                                        ? 'Creating account...'
                                        : editing
                                          ? 'Save changes'
                                          : 'Create bank account'}

                                    {!processing && (
                                        <ChevronRight className="ml-2 size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
