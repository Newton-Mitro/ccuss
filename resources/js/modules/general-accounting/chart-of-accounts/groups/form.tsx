import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/general-accounting/types/chart-of-accounts/groups/form.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowLeft,
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

            <div className="w-full min-w-0 space-y-6 pb-8">
                {/* Page header */}
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
                            <FolderTree className="size-6" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <HeadingSmall
                                title={
                                    editing
                                        ? 'Edit Account Group'
                                        : 'Create Account Group'
                                }
                                description="Define a reporting group to organize related ledger accounts."
                            />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        asChild
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Link href={route('account-groups.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to groups
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-3"
                >
                    {/* Main configuration */}
                    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm xl:col-span-2">
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FolderTree className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Group Configuration
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Configure the group identity,
                                    classification, hierarchy, and status.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 p-4 sm:p-6">
                            {/* Basic information */}
                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Basic Information
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Enter a unique group code and a
                                        recognizable name.
                                    </p>
                                </div>

                                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-2">
                                        <Label htmlFor="group-code">
                                            Group Code
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
                                            className="h-11 w-full"
                                            aria-invalid={Boolean(errors.code)}
                                        />
                                        <InputError message={errors.code} />
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <Label htmlFor="group-name">
                                            Group Name
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
                                            className="h-11 w-full"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                </div>
                            </section>

                            {/* Classification and hierarchy */}
                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Classification & Hierarchy
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Select the accounting category, normal
                                        balance, and parent group.
                                    </p>
                                </div>

                                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-2">
                                        <Label>Account Type</Label>
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

                                    <div className="min-w-0 space-y-2">
                                        <Label>Normal Balance</Label>
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

                                    <div className="min-w-0 space-y-2 sm:col-span-2">
                                        <Label>Parent Group</Label>
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
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Leave empty to create a top-level
                                            group in the chart of accounts.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Group status */}
                            <section className="space-y-3 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Group Status
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Control whether this group is marked as
                                        active.
                                    </p>
                                </div>

                                <label
                                    htmlFor="group-status"
                                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground">
                                            <Check className="size-5" />
                                        </span>

                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium">
                                                Active Group
                                            </span>
                                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                                Available for classifying ledger
                                                accounts.
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

                        {/* Form actions */}
                        <div className="sticky bottom-3 z-10 flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="hidden text-xs leading-5 text-muted-foreground sm:block">
                                Group changes affect how accounts are organized
                                in reports.
                            </p>

                            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                                <Button
                                    variant="outline"
                                    type="button"
                                    asChild
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={route('account-groups.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full gap-2 sm:w-auto sm:min-w-36"
                                >
                                    {processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}

                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save Changes'
                                          : 'Create Group'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Live preview sidebar */}
                    <aside className="min-w-0 space-y-5 xl:sticky xl:top-5">
                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-4">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Landmark className="size-4.5" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Live Preview
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Updates as you edit
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 p-4">
                                <div className="flex min-w-0 items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Layers3 className="size-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold break-words">
                                            {data.name || 'Group Name'}
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                                            {data.code || 'CODE'}
                                        </p>
                                    </div>
                                </div>

                                <dl className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Account type
                                        </dt>
                                        <dd className="max-w-[60%] rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-right text-[11px] font-semibold text-primary">
                                            {data.type || 'Not selected'}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-xs text-muted-foreground">
                                            Normal balance
                                        </dt>
                                        <dd className="flex items-center gap-1.5 text-xs font-medium">
                                            {data.normal_balance ===
                                            'CREDIT' ? (
                                                <ArrowUpRight className="size-4 text-sky-600" />
                                            ) : (
                                                <ArrowDownLeft className="size-4 text-amber-600" />
                                            )}
                                            {data.normal_balance}
                                        </dd>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <dt className="pt-0.5 text-xs text-muted-foreground">
                                            Parent group
                                        </dt>
                                        <dd className="max-w-[60%] text-right text-xs font-medium break-words">
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
                                            {data.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="border-t border-border pt-4">
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {editing
                                            ? 'Changes will be applied when you save this group.'
                                            : 'Your group will be created with the configuration shown above.'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Account type guidance */}
                        <section className="rounded-xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                    <CircleHelp className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold">
                                        {data.type || 'Account Type Guide'}
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                        {typeDescription[data.type] ??
                                            'Select an account type to understand its classification in the chart of accounts.'}
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
