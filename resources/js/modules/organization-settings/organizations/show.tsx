import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    ExternalLink,
    Eye,
    Pencil,
    Plus,
    Trash2,
    UserPlus,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import type { Branch } from '@/modules/branch-operations/types/branch';
import {
    BranchDetailsDialog,
    BranchFormDialog,
} from '@/modules/organization-settings/organizations/branch-dialogs';
import type { OrganizationShowPageProps } from '@/modules/organization-settings/types/page-props';
import type { BreadcrumbItem } from '@/types';

function Show() {
    const { organization, users, canManageUsers } =
        usePage<OrganizationShowPageProps>().props;
    const [branchFormOpen, setBranchFormOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);

    const { delete: destroy, processing } = useForm();
    const {
        data: userForm,
        setData: setUserForm,
        post: addUser,
        delete: removeUser,
        processing: addingUser,
        errors: userErrors,
        reset: resetUserForm,
    } = useForm({ email: '' });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Organizations', href: route('organizations.index') },
        { title: organization.name, href: '' },
    ];

    const handleDelete = (branch: Branch) => {
        appSwal
            .fire({
                title: 'Delete Branch?',
                text: `Are you sure you want to permanently delete "${branch.name}"? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete branch',
                cancelButtonText: 'Cancel',
                reverseButtons: true,
                focusCancel: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('branches.destroy', branch.id), {
                        preserveScroll: true,
                    });
                }
            });
    };

    const handleRemoveUser = (user: { id: number; name: string }) => {
        appSwal
            .fire({
                title: 'Remove organization user?',
                text: `${user.name} will lose access to ${organization.name}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Remove user',
                cancelButtonText: 'Cancel',
                reverseButtons: true,
                focusCancel: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    removeUser(
                        route('organizations.users.destroy', {
                            organization: organization.id,
                            user: user.id,
                        }),
                        { preserveScroll: true },
                    );
                }
            });
    };

    const address = [
        organization.address_line1,
        organization.address_line2,
        organization.city,
        organization.state,
        organization.postal_code,
        organization.country,
    ]
        .filter(Boolean)
        .join(', ');

    const sectionClass =
        'overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm';

    const sectionHeaderClass =
        'flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${organization.name} - Organization Details`} />

            <div className="mx-auto w-full max-w-[1600px] space-y-3 pb-5 text-foreground">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                            Organization workspace
                        </p>
                        <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                            {organization.name}
                        </h1>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            href={route('organizations.index')}
                            aria-label="Back to organizations"
                            title="Back to organizations"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <Link
                            href={route('organizations.edit', organization.id)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                            <Pencil className="size-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                        </Link>
                    </div>
                </div>

                <section className={`${sectionClass} relative`}>
                    <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(250px,0.85fr)_minmax(0,1.5fr)] lg:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/30">
                                {organization.logo_url ? (
                                    <img
                                        src={organization.logo_url}
                                        alt={`${organization.name} logo`}
                                        className="size-full object-contain p-1"
                                    />
                                ) : (
                                    <Building2 className="size-5 text-primary" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="truncate text-sm font-semibold">
                                        {organization.short_name ||
                                            organization.name}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>
                                </div>
                                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                                    {organization.code ||
                                        'No organization code'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/60 pt-3 sm:grid-cols-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
                            <CompactFact
                                label="Registration"
                                value={organization.registration_no}
                            />
                            <CompactFact
                                label="Tax ID"
                                value={organization.tax_id}
                            />
                            <CompactFact
                                label="Phone"
                                value={organization.phone}
                            />
                            <CompactFact
                                label="Email"
                                value={organization.email}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                            <CompactFact
                                label="Registered address"
                                value={address}
                            />
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Website
                                </p>
                                {organization.website ? (
                                    <a
                                        href={organization.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-primary hover:underline"
                                    >
                                        <span className="truncate">
                                            {organization.website}
                                        </span>
                                        <ExternalLink className="size-3 shrink-0" />
                                    </a>
                                ) : (
                                    <p className="text-xs font-medium">—</p>
                                )}
                            </div>
                            <CompactFact
                                label="Report footer"
                                value={organization.report_footer}
                            />
                        </div>
                    </div>
                </section>

                <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)]">
                    {/* Branch management */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold">
                                            Organization Branches
                                        </h3>

                                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                            {organization.branches.length}
                                        </span>
                                    </div>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {organization.branches.length} branch
                                        {organization.branches.length === 1
                                            ? ''
                                            : 'es'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBranch(null);
                                    setBranchFormOpen(true);
                                }}
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                            >
                                <Plus className="size-4" />
                                Add Branch
                            </button>
                        </div>

                        {/* Branch table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 bg-muted/30 text-left">
                                        <th className="w-32 px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Branch Code
                                        </th>

                                        <th className="min-w-48 px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Branch Name
                                        </th>

                                        <th className="min-w-40 px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Branch Manager
                                        </th>

                                        <th className="min-w-40 px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                                            Address
                                        </th>

                                        <th className="w-24 px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border/50">
                                    {organization.branches.length > 0 ? (
                                        organization.branches.map((branch) => (
                                            <tr
                                                key={branch.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-3 py-2.5">
                                                    <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-xs font-medium">
                                                        {branch.code || '—'}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <div className="font-medium">
                                                        {branch.name}
                                                    </div>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                                                            {branch.manager?.name
                                                                ?.charAt(0)
                                                                .toUpperCase() ??
                                                                '?'}
                                                        </div>

                                                        <span
                                                            className={
                                                                branch.manager
                                                                    ? 'text-xs font-medium'
                                                                    : 'text-xs text-muted-foreground'
                                                            }
                                                        >
                                                            {branch.manager
                                                                ?.name ??
                                                                'Not assigned'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="max-w-64 px-3 py-2.5">
                                                    <span
                                                        className="block truncate text-xs text-muted-foreground"
                                                        title={
                                                            branch.address ??
                                                            undefined
                                                        }
                                                    >
                                                        {branch.address ||
                                                            'No address provided'}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewingBranch(
                                                                    branch,
                                                                )
                                                            }
                                                            aria-label={`View ${branch.name}`}
                                                            title="View branch"
                                                            className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
                                                        >
                                                            <Eye className="size-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingBranch(
                                                                    branch,
                                                                );
                                                                setBranchFormOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            aria-label={`Edit ${branch.name}`}
                                                            title="Edit branch"
                                                            className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-primary"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    branch,
                                                                )
                                                            }
                                                            aria-label={`Delete ${branch.name}`}
                                                            title="Delete branch"
                                                            className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-8"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                    <div className="flex size-12 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
                                                        <Building2 className="size-5" />
                                                    </div>

                                                    <p className="mt-3 text-sm font-semibold">
                                                        No branches yet
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        Get started by creating
                                                        the first branch for
                                                        this organization.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingBranch(
                                                                null,
                                                            );
                                                            setBranchFormOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                                    >
                                                        <Plus className="size-4" />
                                                        Create First Branch
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer */}
                    </section>

                    {/* Organization users */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <UsersRound className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold">
                                            Organization Users
                                        </h3>
                                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                            {users.length}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {users.length} member
                                        {users.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                            </div>
                            {canManageUsers && (
                                <form
                                    className="flex w-full gap-2 sm:w-auto"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        addUser(
                                            route(
                                                'organizations.users.store',
                                                organization.id,
                                            ),
                                            {
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    resetUserForm(),
                                            },
                                        );
                                    }}
                                >
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        onChange={(event) =>
                                            setUserForm(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        disabled={addingUser}
                                        placeholder="Enter user email"
                                        aria-label="User email"
                                        autoComplete="email"
                                        required
                                        className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:w-44 sm:flex-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            addingUser || !userForm.email.trim()
                                        }
                                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <UserPlus className="size-4" />
                                        Add User
                                    </button>
                                </form>
                            )}
                        </div>
                        {userErrors.email && (
                            <p className="px-5 pb-3 text-xs text-destructive">
                                {userErrors.email}
                            </p>
                        )}
                        <div className="divide-y divide-border/60">
                            {users.length ? (
                                users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2.5 px-3 py-2.5"
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                        {canManageUsers && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveUser(user)
                                                }
                                                aria-label={`Remove ${user.name} from ${organization.name}`}
                                                title="Remove from organization"
                                                className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                                    No users are assigned to this organization
                                    yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <BranchFormDialog
                open={branchFormOpen}
                onOpenChange={setBranchFormOpen}
                branch={editingBranch}
            />
            <BranchDetailsDialog
                branch={viewingBranch}
                onOpenChange={(open) => {
                    if (!open) setViewingBranch(null);
                }}
            />
        </CustomAuthLayout>
    );
}

export default Show;

function CompactFact({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground">
                {label}
            </p>
            <p
                className="truncate text-xs font-medium"
                title={value || undefined}
            >
                {value || '—'}
            </p>
        </div>
    );
}
