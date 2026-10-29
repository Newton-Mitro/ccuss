import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BankAccountCreatePageProps } from '@/modules/treasury-cash/types/forms';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Eye,
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
    const selectedBranch = branches.find(
        (branch) => String(branch.id) === data.branch_id,
    );
    const selectedCounterpartAccount = ledger_accounts.find(
        (ledgerAccount) =>
            String(ledgerAccount.id) === data.opening_counterpart_account_id,
    );

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
        'flex items-center gap-3 border-b px-3 py-2.5 sm:px-4';

    const fieldClass = 'h-9 w-full';

    const labelClass = 'text-sm font-medium';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${editing ? 'Edit' : 'Create'} Bank Account`} />

            <div className="w-full max-w-7xl space-y-3 pb-20 text-foreground">
                <header className="flex flex-col gap-2 py-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                            Treasury &amp; cash · Banking
                        </p>
                        <h1 className="text-xl leading-tight font-semibold tracking-tight">
                            {editing
                                ? 'Edit bank account'
                                : 'Create bank account'}
                        </h1>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {editing
                                ? 'Update account details and reconciliation settings.'
                                : 'Register an account, assign its branch, and configure opening balance settings.'}
                        </p>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                    >
                        <Link href={route('bank-accounts.index')}>
                            <ArrowLeft className="size-4" />
                            Bank accounts
                        </Link>
                    </Button>
                </header>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                    <div className="min-w-0 space-y-3">
                        {/* Section 2: Branch assignment */}
                        <section className={sectionClass}>
                            <div className={sectionHeaderClass}>
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Building2 className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-semibold">
                                        Branch assignment
                                    </h2>
                                    <p className="text-xs leading-4 text-muted-foreground">
                                        Specify the branch responsible for this
                                        bank account.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 sm:p-4">
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
                                        Leave as organization-wide if the
                                        account is not assigned to a specific
                                        branch.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Bank account details */}
                        <section className={sectionClass}>
                            <div className={sectionHeaderClass}>
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Wallet className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-semibold">
                                        Bank account details
                                    </h2>
                                    <p className="text-xs leading-4 text-muted-foreground">
                                        Enter the account identification and
                                        banking information.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-4 gap-y-3 p-3 sm:grid-cols-2 sm:p-4">
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

                                    <InputError
                                        message={errors.account_number}
                                    />
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

                                    <InputError
                                        message={errors.routing_number}
                                    />

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
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <CircleDollarSign className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-semibold">
                                        {editing
                                            ? 'Financial controls'
                                            : 'Opening balance & controls'}
                                    </h2>
                                    <p className="text-xs leading-4 text-muted-foreground">
                                        {editing
                                            ? 'Configure reconciliation preferences. Opening deposits are managed through bank transactions.'
                                            : 'Set the opening deposit and configure reconciliation preferences.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
                                {!editing && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="opening_balance"
                                                className={labelClass}
                                            >
                                                Opening balance
                                                <span className="ml-1 text-destructive">
                                                    *
                                                </span>
                                            </label>

                                            <div className="flex h-9 items-center rounded-lg border bg-background transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
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
                                                A positive amount queues a
                                                pending deposit. Posting it
                                                updates the book balance and
                                                creates the voucher; the
                                                selected branch needs an open
                                                business day.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
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
                                                    Number(
                                                        data.opening_balance,
                                                    ) <= 0
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
                                                balance. The chosen ledger
                                                account will be credited when
                                                the opening deposit is posted.
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="rounded-lg border bg-muted/20 p-3">
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
                                                Allow this account to be
                                                included in bank statement
                                                reconciliation workflows.
                                            </span>
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="status"
                                        className={labelClass}
                                    >
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
                                        Choose the appropriate operational
                                        status for the bank account.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                            Treasury &amp; cash
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Bank account preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        Account
                                    </p>
                                    <p className="mt-1 text-base font-semibold break-words">
                                        {data.account_name || 'Account name'}
                                    </p>
                                    <p className="mt-1 font-mono text-xs break-all text-muted-foreground">
                                        {data.account_number ||
                                            'Account number'}
                                    </p>
                                </div>

                                {!editing && (
                                    <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CircleDollarSign className="size-4 text-primary" />
                                            Opening balance
                                        </div>
                                        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                            {formatBDTCurrency(
                                                data.opening_balance || 0,
                                                false,
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {[
                                        {
                                            label: 'Branch',
                                            value: selectedBranch
                                                ? `${selectedBranch.name} (${selectedBranch.code})`
                                                : 'Organization-wide',
                                            icon: Building2,
                                        },
                                        {
                                            label: 'Account type',
                                            value:
                                                {
                                                    CURRENT: 'Current account',
                                                    SAVINGS: 'Savings account',
                                                    FDR: 'Fixed deposit (FDR)',
                                                    OTHER: 'Other',
                                                }[data.account_type] ??
                                                data.account_type,
                                            icon: Wallet,
                                        },
                                        {
                                            label: 'Routing number',
                                            value:
                                                data.routing_number ||
                                                'Not provided',
                                            icon: ChevronRight,
                                        },
                                        ...(!editing &&
                                        Number(data.opening_balance) > 0
                                            ? [
                                                  {
                                                      label: 'Counterpart',
                                                      value: selectedCounterpartAccount
                                                          ? `${selectedCounterpartAccount.code} — ${selectedCounterpartAccount.name}`
                                                          : 'Not selected',
                                                      icon: CircleDollarSign,
                                                  },
                                              ]
                                            : []),
                                    ].map((item) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div
                                                key={item.label}
                                                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
                                            >
                                                <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                                    <ItemIcon className="size-3.5 shrink-0" />
                                                    {item.label}
                                                </span>
                                                <span className="min-w-0 text-right text-xs font-medium break-words">
                                                    {item.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {editing && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <CircleDollarSign className="size-3.5" />
                                            Recorded opening balance
                                        </div>
                                        <p className="mt-2 text-lg font-semibold tabular-nums">
                                            {formatBDTCurrency(
                                                data.opening_balance,
                                                false,
                                            )}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Opening deposits are managed through
                                            bank transactions.
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="size-3.5" />
                                        Reconciliation
                                    </span>
                                    <span className="text-xs font-medium">
                                        {data.is_reconcilable
                                            ? 'Enabled'
                                            : 'Disabled'}
                                    </span>
                                </div>

                                <div
                                    className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-medium ${
                                        data.status === 'ACTIVE'
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                            : data.status === 'INACTIVE'
                                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                              : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <span className="size-2 rounded-full bg-current" />
                                    Account status: {data.status}
                                </div>
                            </div>
                        </section>
                    </aside>

                    {/* Form actions */}
                    <div className="fixed inset-x-4 bottom-0 z-30 w-auto border-t bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:inset-x-auto md:left-[calc(var(--app-sidebar-offset,0px)+1.5rem)] md:w-[calc(100%-var(--app-sidebar-offset,0px)-3rem)]">
                        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
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
