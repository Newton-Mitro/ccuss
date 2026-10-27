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
    ArrowLeft,
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    CircleHelp,
    FolderTree,
    Landmark,
    Layers3,
    LoaderCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/general-accounting/types/chart-of-accounts/groups/form.interfaces';


const types = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];

export default function AccountGroupForm({
    accountGroup,
    parents = [],
}: Props) {
    const editing = Boolean(accountGroup);
    const { data, setData, post, put, processing, errors } = useForm({
        code: accountGroup?.code ?? '',
        name: accountGroup?.name ?? '',
        type: accountGroup?.type ?? '',
        normal_balance: accountGroup?.normal_balance ?? 'DEBIT',
        parent_id: String(accountGroup?.parent_id ?? ''),
        status: accountGroup?.status ?? true,
    });
    useFlashToastHandler();

    const selectedParent = parents.find(
        (parent) => String(parent.id) === data.parent_id,
    );
    const typeDescription: Record<string, string> = {
        ASSET: 'Resources owned or controlled by the organization.',
        LIABILITY: 'Obligations owed to other parties.',
        EQUITY: 'The residual interest in the organization.',
        INCOME: 'Revenue and other income-generating activity.',
        EXPENSE: 'Costs incurred in the course of operations.',
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        if (editing && accountGroup) {
            put(route('account-groups.update', accountGroup.id), options);
        } else {
            post(route('account-groups.store'), options);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Account Groups', href: route('account-groups.index') },
        {
            title: editing ? 'Edit Account Group' : 'Create Account Group',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={editing ? 'Edit Account Group' : 'Create Account Group'}
            />
            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
                <ResourcePageHeader
                    title={
                        editing ? 'Edit Account Group' : 'Create Account Group'
                    }
                    description="Define a reporting group to organize related ledger accounts."
                    action={
                        <Button variant="outline" asChild>
                            <Link href={route('account-groups.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to groups
                            </Link>
                        </Button>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FolderTree className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Group configuration
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Set its identity, classification and
                                    placement in the chart.
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
                                        Use a unique code and a recognizable
                                        group name.
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="group-code">
                                            Group code
                                        </Label>
                                        <Input
                                            id="group-code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. 1000"
                                            className="h-10"
                                            aria-invalid={Boolean(errors.code)}
                                        />
                                        <InputError message={errors.code} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="group-name">
                                            Group name
                                        </Label>
                                        <Input
                                            id="group-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Current assets"
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
                                        Choose the accounting category and
                                        where this group belongs.
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
                                                ...types.map((value) => ({
                                                    value,
                                                    label: value,
                                                })),
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
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label>Parent group</Label>
                                        <Select
                                            value={data.parent_id}
                                            onChange={(value) =>
                                                setData('parent_id', value)
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'None — top-level group',
                                                },
                                                ...parents.map((parent) => ({
                                                    value: String(parent.id),
                                                    label: `${parent.code} — ${parent.name}`,
                                                })),
                                            ]}
                                            error={errors.parent_id}
                                        />
                                        <InputError
                                            message={errors.parent_id}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="border-t border-border pt-5">
                                <label
                                    htmlFor="group-status"
                                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <Check className="size-4" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-medium">
                                                Active group
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                Available for classifying
                                                ledger accounts.
                                            </span>
                                        </span>
                                    </span>
                                    <Input
                                        id="group-status"
                                        type="checkbox"
                                        checked={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.checked,
                                            )
                                        }
                                        className="size-4 shrink-0 accent-primary"
                                    />
                                </label>
                                <InputError message={errors.status} />
                            </section>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs text-muted-foreground">
                                Group changes affect how accounts are organized
                                in reports.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link href={route('account-groups.index')}>
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
                                        : editing
                                          ? 'Save changes'
                                          : 'Create group'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Landmark className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        How this group will appear
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 p-4">
                                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Layers3 className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {data.name || 'Group name'}
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
                                            {data.type || 'Not selected'}
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
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-2.5">
                                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <h3 className="text-xs font-semibold">
                                        {data.type || 'Account type'}
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        {typeDescription[data.type] ??
                                            'Select an account type to see how it is classified in the chart of accounts.'}
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
