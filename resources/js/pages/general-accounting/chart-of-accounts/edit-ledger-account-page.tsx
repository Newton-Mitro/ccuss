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
import {
    Activity,
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    Check,
    CircleHelp,
    FolderTree,
    Landmark,
    LoaderCircle,
    ShieldCheck,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';
import { accountTypes } from './data/account-type';

interface Ledger {
    id: number;
    code?: string | null;
    name?: string | null;
    type?: string | null;
    account_type?: string | null;
    normal_balance?: string | null;
    account_group_id?: number | string | null;
    parent_id?: number | string | null;
    is_control_account?: boolean | null;
    is_reconcilable?: boolean | null;
    is_system?: boolean | null;
    status?: boolean | null;
}

interface AccountGroupOption {
    id: number;
    code: string;
    name: string;
}

interface ParentAccountOption {
    id: number;
    code: string;
    name: string;
}

interface Props {
    ledger: Ledger;
    parents?: ParentAccountOption[];
    accountGroups?: AccountGroupOption[];
}

const settingOptions = [
    {
        key: 'is_control_account' as const,
        label: 'Control account',
        description: 'Summarizes balances from related subaccounts.',
        icon: ShieldCheck,
    },
    {
        key: 'is_reconcilable' as const,
        label: 'Reconcilable',
        description: 'Supports balance reconciliation.',
        icon: Check,
    },
    {
        key: 'is_system' as const,
        label: 'System account',
        description: 'Reserved for system-managed accounting activity.',
        icon: Landmark,
    },
    {
        key: 'status' as const,
        label: 'Active',
        description: 'Available for posting and account selection.',
        icon: Activity,
    },
];

export default function Edit({
    ledger,
    parents = [],
    accountGroups = [],
}: Props) {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        code: ledger.code ?? '',
        name: ledger.name ?? '',
        type: ledger.type ?? ledger.account_type ?? '',
        normal_balance: ledger.normal_balance ?? 'DEBIT',
        account_group_id: String(ledger.account_group_id ?? ''),
        parent_id: String(ledger.parent_id ?? ''),
        is_control_account: Boolean(ledger.is_control_account),
        is_reconcilable: Boolean(ledger.is_reconcilable),
        is_system: Boolean(ledger.is_system),
        status: ledger.status ?? true,
    });

    const availableParents = parents.filter((parent) => parent.id !== ledger.id);
    const selectedGroup = accountGroups.find(
        (group) => String(group.id) === data.account_group_id,
    );
    const selectedParent = availableParents.find(
        (parent) => String(parent.id) === data.parent_id,
    );
    const selectedType = accountTypes.find(
        (type) => type.value === data.type,
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route('ledger-accounts.update', ledger.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: 'Edit Ledger Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${ledger.code ?? 'Ledger Account'}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title="Edit Ledger Account"
                    description="Update the account’s classification, hierarchy, and reconciliation behavior."
                    action={
                        <Button variant="outline" asChild>
                            <Link href={route('ledger-accounts.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to accounts
                            </Link>
                        </Button>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Landmark className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Account configuration
                                </h2>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    Editing {ledger.code || 'ledger account'}
                                    {ledger.name ? ` · ${ledger.name}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Basic information
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Update the account’s code and
                                        description.
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ledger-code">
                                            Account code
                                        </Label>
                                        <Input
                                            id="ledger-code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10"
                                            aria-invalid={Boolean(errors.code)}
                                        />
                                        <InputError message={errors.code} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ledger-name">
                                            Account name
                                        </Label>
                                        <Input
                                            id="ledger-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Classification and hierarchy
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Choose the account type, group, and
                                        parent relationship.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label>Account type</Label>
                                        <Select
                                            value={data.type}
                                            onChange={(value) =>
                                                setData('type', value)
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select account type',
                                                },
                                                ...accountTypes,
                                            ]}
                                            error={errors.type}
                                        />
                                        <InputError message={errors.type} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Normal balance</Label>
                                        <Select
                                            value={data.normal_balance}
                                            onChange={(value) =>
                                                setData(
                                                    'normal_balance',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: 'DEBIT',
                                                    label: 'Debit',
                                                },
                                                {
                                                    value: 'CREDIT',
                                                    label: 'Credit',
                                                },
                                            ]}
                                            error={errors.normal_balance}
                                        />
                                        <InputError
                                            message={errors.normal_balance}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Account group</Label>
                                        <Select
                                            value={data.account_group_id}
                                            onChange={(value) =>
                                                setData(
                                                    'account_group_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select account group',
                                                },
                                                ...accountGroups.map(
                                                    (group) => ({
                                                        value: String(group.id),
                                                        label: `${group.code} — ${group.name}`,
                                                    }),
                                                ),
                                            ]}
                                            error={errors.account_group_id}
                                        />
                                        <InputError
                                            message={errors.account_group_id}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Parent account</Label>
                                        <Select
                                            value={data.parent_id}
                                            onChange={(value) =>
                                                setData('parent_id', value)
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'None — top-level account',
                                                },
                                                ...availableParents.map(
                                                    (parent) => ({
                                                        value: String(
                                                            parent.id,
                                                        ),
                                                        label: `${parent.code} — ${parent.name}`,
                                                    }),
                                                ),
                                            ]}
                                            error={errors.parent_id}
                                        />
                                        <InputError
                                            message={errors.parent_id}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Account settings
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Configure how this account is used and
                                        managed.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {settingOptions.map(
                                        ({
                                            key,
                                            label,
                                            description,
                                            icon: Icon,
                                        }) => (
                                            <label
                                                key={key}
                                                htmlFor={`setting-${key}`}
                                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                                                    data[key]
                                                        ? 'border-primary/30 bg-primary/5'
                                                        : 'border-border bg-background hover:bg-muted/30'
                                                }`}
                                            >
                                                <span
                                                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                                        data[key]
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    <Icon className="size-4" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-medium">
                                                        {label}
                                                    </span>
                                                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                                        {description}
                                                    </span>
                                                </span>
                                                <Input
                                                    id={`setting-${key}`}
                                                    type="checkbox"
                                                    checked={data[key]}
                                                    onChange={(event) =>
                                                        setData(
                                                            key,
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                    className="mt-1 size-4 shrink-0 accent-primary"
                                                />
                                            </label>
                                        ),
                                    )}
                                </div>
                                {errors.status && (
                                    <InputError message={errors.status} />
                                )}
                            </section>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs text-muted-foreground">
                                Changes are applied to this ledger account.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link href={route('ledger-accounts.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Check className="mr-2 size-4" />
                                    )}
                                    {processing
                                        ? 'Saving...'
                                        : 'Save changes'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FolderTree className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Account appearance
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 p-4">
                                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Landmark className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {data.name || 'Account name'}
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                                            {data.code || 'CODE'}
                                        </p>
                                    </div>
                                </div>

                                <dl className="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Type
                                        </dt>
                                        <dd className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                            {selectedType?.label ??
                                                'Not selected'}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Normal balance
                                        </dt>
                                        <dd className="flex items-center gap-1.5 text-xs font-medium">
                                            {data.normal_balance === 'CREDIT' ? (
                                                <ArrowUpRight className="size-3.5 text-sky-600" />
                                            ) : (
                                                <ArrowDownLeft className="size-3.5 text-amber-600" />
                                            )}
                                            {data.normal_balance}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Group
                                        </dt>
                                        <dd className="max-w-40 truncate text-right text-xs font-medium">
                                            {selectedGroup
                                                ? `${selectedGroup.code} · ${selectedGroup.name}`
                                                : 'Not assigned'}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Parent
                                        </dt>
                                        <dd className="max-w-40 truncate text-right text-xs font-medium">
                                            {selectedParent
                                                ? `${selectedParent.code} · ${selectedParent.name}`
                                                : 'Top-level'}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Status
                                        </dt>
                                        <dd
                                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                                data.status
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            <span
                                                className={`size-1.5 rounded-full ${
                                                    data.status
                                                        ? 'bg-emerald-500'
                                                        : 'bg-muted-foreground/50'
                                                }`}
                                            />
                                            {data.status ? 'Active' : 'Inactive'}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
                                    {settingOptions
                                        .filter(({ key }) => data[key])
                                        .map(({ key, label }) => (
                                            <span
                                                key={key}
                                                className="rounded-full border border-border bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    {settingOptions.every(
                                        ({ key }) => !data[key],
                                    ) && (
                                        <span className="text-xs text-muted-foreground">
                                            No additional settings enabled
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-2.5">
                                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <h3 className="text-xs font-semibold">
                                        Keep the hierarchy consistent
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Choose a group and parent that match
                                        this account’s purpose. The normal
                                        balance should reflect how its balance
                                        increases.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
