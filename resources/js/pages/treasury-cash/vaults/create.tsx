import type { VaultCreatePageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Check,
    CheckCircle2,
    CircleDollarSign,
    Info,
    Landmark,
    ShieldCheck,
    Vault as VaultIcon,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

import { ResourcePageHeader } from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem } from '../../../types';

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

            <div className="max-w-4xl space-y-5 pb-24 text-foreground">
                <ResourcePageHeader
                    title={editing ? 'Edit Vault' : 'Create Vault'}
                    description={
                        editing
                            ? 'Manage vault identification, branch assignment, and cash holding limits.'
                            : 'Set up a secure branch cash location with clearly defined holding limits.'
                    }
                />

                {/* Overview */}
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-start gap-4 p-4 sm:p-5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                            <VaultIcon className="size-6 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold tracking-tight">
                                    {editing
                                        ? 'Vault configuration'
                                        : 'New vault setup'}
                                </h2>

                                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    <ShieldCheck className="size-3.5" />
                                    Treasury & Cash
                                </span>
                            </div>

                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {editing
                                    ? 'Review the vault details and update its operational settings.'
                                    : 'Define the vault identity and configure its maximum permitted balance.'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
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
                                    <span className="text-destructive">*</span>
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
                                        { value: '', label: 'Select branch' },
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
                                        Branch assignment cannot be changed
                                        after vault activity exists.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="code"
                                    className="text-sm font-medium"
                                >
                                    Vault code{' '}
                                    <span className="text-destructive">*</span>
                                </label>

                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
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
                                    Use a unique identifier for the vault.
                                </p>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Display name{' '}
                                    <span className="text-destructive">*</span>
                                </label>

                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
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
                                    This name will help staff identify the vault
                                    throughout cash management.
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
                                    Set the maximum cash holding limit and
                                    control vault availability.
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
                                    Maximum permitted balance for this vault.
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
                                        { value: 'ACTIVE', label: 'Active' },
                                        {
                                            value: 'INACTIVE',
                                            label: 'Inactive',
                                        },
                                        { value: 'CLOSED', label: 'Closed' },
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
                                The maximum balance defines the vault's cash
                                holding ceiling. Enforce this limit on the
                                server during cash movements and vault
                                transactions.
                            </p>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 shadow-[0_-4px_16px_-12px_rgba(0,0,0,0.2)] backdrop-blur supports-[backdrop-filter]:bg-background/85">
                        <div className="mx-auto flex max-w-4xl flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
