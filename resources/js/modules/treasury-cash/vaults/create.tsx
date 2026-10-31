import type { VaultCreatePageProps } from '@/modules/treasury-cash/types/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Check,
    CheckCircle2,
    CircleDollarSign,
    Eye,
    Info,
    Landmark,
    ShieldCheck,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem } from '@/types';

export default function Create({ vault, branch_locked = false }: any) {
    const editing = Boolean(vault);

    const { branches = [], default_branch_id } =
        usePage<VaultCreatePageProps>().props;

    const { data, setData, post, put, processing, errors } = useForm({
        branch_id: String(
            vault?.cash_location?.branch_id ??
                default_branch_id ??
                branches[0]?.id ??
                '',
        ),
        code: vault?.code ?? '',
        name: vault?.name ?? '',
        maximum_balance: String(vault?.maximum_balance ?? ''),
        status: vault?.status ?? 'ACTIVE',
    });
    const selectedBranch = branches.find(
        (branch) => String(branch.id) === data.branch_id,
    );

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Vaults', href: route('vaults.index') },
        { title: editing ? 'Edit Vault' : 'Create Vault', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing) {
            put(route('vaults.update', vault.id));
        } else {
            post(route('vaults.store'));
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Vault' : 'Create Vault'} />

            <div className="w-full max-w-7xl space-y-5 pb-24 text-foreground">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={editing ? 'Edit Vault' : 'Create Vault'}
                        description={
                            editing
                                ? 'Manage vault identification, branch assignment, and cash holding limits.'
                                : 'Set up a secure branch cash location with clearly defined holding limits.'
                        }
                    />
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-4">
                            {/* Vault identity */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Landmark className="size-4.5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold">
                                            Vault identity
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Identify the branch and assign a
                                            recognizable vault code and name.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="branch_id"
                                            className="text-sm font-medium"
                                        >
                                            Branch{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <Select
                                            id="branch_id"
                                            className="h-10 w-full"
                                            value={data.branch_id}
                                            disabled={editing && branch_locked}
                                            onChange={(value) =>
                                                setData('branch_id', value)
                                            }
                                            placeholder="Select branch"
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select branch',
                                                },
                                                ...branches.map((branch) => ({
                                                    value: String(branch.id),
                                                    label: `${branch.name} (${branch.code})`,
                                                })),
                                            ]}
                                        />

                                        {errors.branch_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.branch_id}
                                            </p>
                                        )}

                                        {editing && branch_locked && (
                                            <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                                                <Info className="mt-0.5 size-3.5 shrink-0" />
                                                Branch assignment cannot be
                                                changed after vault activity
                                                exists.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="code"
                                            className="text-sm font-medium"
                                        >
                                            Vault code{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <Input
                                            id="code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. VLT-001"
                                            autoComplete="off"
                                            required
                                            aria-invalid={Boolean(errors.code)}
                                            className="h-10"
                                        />

                                        {errors.code && (
                                            <p className="text-xs text-destructive">
                                                {errors.code}
                                            </p>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            Use a unique identifier for the
                                            vault.
                                        </p>
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Display name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Main Branch Vault"
                                            required
                                            aria-invalid={Boolean(errors.name)}
                                            className="h-10"
                                        />

                                        {errors.name && (
                                            <p className="text-xs text-destructive">
                                                {errors.name}
                                            </p>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            This name will help staff identify
                                            the vault throughout cash
                                            management.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Operating controls */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CircleDollarSign className="size-4.5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold">
                                            Operating controls
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Set the maximum cash holding limit
                                            and control vault availability.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="maximum_balance"
                                            className="text-sm font-medium"
                                        >
                                            Maximum balance
                                        </label>

                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                                                ৳
                                            </span>

                                            <Input
                                                id="maximum_balance"
                                                type="number"
                                                min="0"
                                                step="0.0001"
                                                value={data.maximum_balance}
                                                onChange={(event) =>
                                                    setData(
                                                        'maximum_balance',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="0.00"
                                                aria-invalid={Boolean(
                                                    errors.maximum_balance,
                                                )}
                                                className="h-10 pl-8 tabular-nums"
                                            />
                                        </div>

                                        {errors.maximum_balance && (
                                            <p className="text-xs text-destructive">
                                                {errors.maximum_balance}
                                            </p>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            Maximum permitted balance for this
                                            vault.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="status"
                                            className="text-sm font-medium"
                                        >
                                            Operational status
                                        </label>

                                        <Select
                                            id="status"
                                            className="h-10 w-full"
                                            value={data.status}
                                            onChange={(value) =>
                                                setData('status', value)
                                            }
                                            options={[
                                                {
                                                    value: 'ACTIVE',
                                                    label: 'Active',
                                                },
                                                {
                                                    value: 'INACTIVE',
                                                    label: 'Inactive',
                                                },
                                                {
                                                    value: 'CLOSED',
                                                    label: 'Closed',
                                                },
                                            ]}
                                        />

                                        <p className="text-xs text-muted-foreground">
                                            {data.status === 'ACTIVE'
                                                ? 'The vault is marked as active.'
                                                : data.status === 'INACTIVE'
                                                  ? 'The vault is marked as inactive.'
                                                  : 'The vault is marked as closed.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3 sm:mx-5 sm:mb-5">
                                    <Banknote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        The maximum balance defines the vault's
                                        cash holding ceiling. Enforce this limit
                                        on the server during cash movements and
                                        vault transactions.
                                    </p>
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
                                                Cash operations
                                            </p>
                                            <h2 className="text-sm font-semibold">
                                                Vault preview
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
                                            Vault
                                        </p>
                                        <p className="mt-1 text-base font-semibold break-words">
                                            {data.name || 'Vault name'}
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                                            {data.code || 'VAULT-CODE'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CircleDollarSign className="size-4 text-primary" />
                                            Maximum balance
                                        </div>
                                        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                            {data.maximum_balance
                                                ? formatBDTCurrency(
                                                      data.maximum_balance,
                                                      false,
                                                  )
                                                : 'Not set'}
                                        </p>
                                    </div>

                                    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                            <Landmark className="size-3.5 shrink-0" />
                                            Branch
                                        </span>
                                        <span className="min-w-0 text-right text-xs font-medium break-words">
                                            {selectedBranch
                                                ? `${selectedBranch.name} (${selectedBranch.code})`
                                                : 'Not selected'}
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
                                        Operational status: {data.status}
                                    </div>

                                    <div className="flex items-start gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                        Maximum balance is the vault's cash
                                        holding limit.
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Actions */}
                    <div
                        data-slot="page-action-bar"
                        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 shadow-[0_-4px_16px_-12px_rgba(0,0,0,0.2)] backdrop-blur supports-[backdrop-filter]:bg-background/85"
                    >
                        <div className="flex w-full flex-col-reverse gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <a
                                href={route('vaults.index')}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                <ArrowLeft className="size-4" />
                                Back to vaults
                            </a>

                            <Button
                                type="submit"
                                disabled={processing || branches.length === 0}
                                className="h-10 gap-2 rounded-lg px-5"
                            >
                                {processing ? (
                                    <>
                                        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {editing ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            <Check className="size-4" />
                                        )}
                                        {editing
                                            ? 'Save changes'
                                            : 'Create vault'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
