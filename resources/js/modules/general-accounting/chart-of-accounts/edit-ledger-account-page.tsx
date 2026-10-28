import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { accountTypes } from '@/modules/general-accounting/chart-of-accounts/data/account-type';
import type { Props } from '@/modules/general-accounting/types/chart-of-accounts/edit-ledger-account-page.interfaces';
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

    const availableParents = parents.filter(
        (parent) => parent.id !== ledger.id,
    );

    const selectedGroup = accountGroups.find(
        (group) => String(group.id) === data.account_group_id,
    );

    const selectedParent = availableParents.find(
        (parent) => String(parent.id) === data.parent_id,
    );

    const selectedType = accountTypes.find((type) => type.value === data.type);

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

            <div className="w-full min-w-0 space-y-5 pb-10 text-foreground sm:space-y-6">
                {/* Page header */}
                <div className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary sm:size-12">
                            <Landmark className="size-5 sm:size-6" />
                        </div>

                        <div className="min-w-0">
                            <HeadingSmall
                                title="Edit Ledger Account"
                                description="Update the account’s classification, hierarchy, and reconciliation behavior."
                            />

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                    <FolderTree className="size-3.5" />
                                    Chart of Accounts
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                                    <Activity className="size-3.5" />
                                    Editing account
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        asChild
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Link href={route('ledger-accounts.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to accounts
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-3"
                >
                    {/* Main form */}
                    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:col-span-2">
                        <div className="flex min-w-0 items-start gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Landmark className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Account configuration
                                </h2>

                                <p className="mt-1 text-xs leading-relaxed break-words text-muted-foreground">
                                    Editing {ledger.code || 'ledger account'}
                                    {ledger.name ? ` · ${ledger.name}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-7 p-4 sm:p-6">
                            {/* Basic information */}
                            <section className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <Landmark className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Basic information
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Update the account code and
                                            descriptive name.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-1.5">
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

                                    <div className="min-w-0 space-y-1.5">
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

                            {/* Classification and hierarchy */}
                            <section className="space-y-4 border-t border-border pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FolderTree className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Classification and hierarchy
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Choose the account type, normal
                                            balance, group, and parent
                                            relationship.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-1.5">
                                        <Label htmlFor="ledger-type">
                                            Account type
                                        </Label>

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

                                    <div className="min-w-0 space-y-1.5">
                                        <Label htmlFor="normal-balance">
                                            Normal balance
                                        </Label>

                                        <Select
                                            value={data.normal_balance}
                                            onChange={(value) =>
                                                setData('normal_balance', value)
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

                                    <div className="min-w-0 space-y-1.5">
                                        <Label htmlFor="account-group">
                                            Account group
                                        </Label>

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

                                    <div className="min-w-0 space-y-1.5">
                                        <Label htmlFor="parent-account">
                                            Parent account
                                        </Label>

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

                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                            Leave unselected to make this a
                                            top-level account.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Account settings */}
                            <section className="space-y-4 border-t border-border pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <ShieldCheck className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Account settings
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Configure how the account is used
                                            and managed.
                                        </p>
                                    </div>
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
                                                className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                                                    data[key]
                                                        ? 'border-primary/30 bg-primary/5'
                                                        : 'border-border bg-background hover:bg-muted/30'
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
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

                                                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
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

                        {/* Sticky form actions */}
                        <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Review your changes before saving.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    type="button"
                                    asChild
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={route('ledger-accounts.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    {processing ? (
                                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Check className="mr-2 size-4" />
                                    )}

                                    {processing ? 'Saving...' : 'Save changes'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Preview sidebar */}
                    <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <FolderTree className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Updated account details
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 p-4">
                                <div className="flex min-w-0 items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Landmark className="size-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold break-words">
                                            {data.name || 'Account name'}
                                        </p>

                                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                                            {data.code || 'ACCOUNT-CODE'}
                                        </p>
                                    </div>
                                </div>

                                <dl className="divide-y divide-border">
                                    <div className="flex items-center justify-between gap-3 py-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Account type
                                        </dt>

                                        <dd className="max-w-[60%] truncate rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-right text-[11px] font-semibold text-primary">
                                            {selectedType?.label ??
                                                'Not selected'}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 py-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Normal balance
                                        </dt>

                                        <dd className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                                            {data.normal_balance ===
                                            'CREDIT' ? (
                                                <ArrowUpRight className="size-3.5 text-sky-600" />
                                            ) : (
                                                <ArrowDownLeft className="size-3.5 text-amber-600" />
                                            )}

                                            {data.normal_balance}
                                        </dd>
                                    </div>

                                    <div className="flex items-start justify-between gap-3 py-3">
                                        <dt className="pt-0.5 text-xs text-muted-foreground">
                                            Account group
                                        </dt>

                                        <dd className="max-w-[60%] text-right text-xs leading-relaxed font-medium">
                                            {selectedGroup
                                                ? `${selectedGroup.code} · ${selectedGroup.name}`
                                                : 'Not assigned'}
                                        </dd>
                                    </div>

                                    <div className="flex items-start justify-between gap-3 py-3">
                                        <dt className="pt-0.5 text-xs text-muted-foreground">
                                            Parent account
                                        </dt>

                                        <dd className="max-w-[60%] text-right text-xs leading-relaxed font-medium">
                                            {selectedParent
                                                ? `${selectedParent.code} · ${selectedParent.name}`
                                                : 'Top-level'}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 py-3">
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

                                            {data.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="border-t border-border pt-4">
                                    <p className="mb-2.5 text-xs font-semibold">
                                        Enabled settings
                                    </p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {settingOptions
                                            .filter(({ key }) => data[key])
                                            .map(({ key, label }) => (
                                                <span
                                                    key={key}
                                                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
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
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CircleHelp className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold">
                                        Keep the hierarchy consistent
                                    </h3>

                                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                        Select a group and parent that match the
                                        account’s purpose. Its normal balance
                                        should reflect how the balance typically
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
