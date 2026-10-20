import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    ExternalLink,
    Eye,
    FileText,
    Globe,
    MapPin,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import type { OrganizationShowPageProps } from '@/types/system-administration';
import BolderLessInfoBox from '../../../components/borderless-info-box';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import type { BreadcrumbItem } from '../../../types';
import type { Branch } from '../../../types/branch';
import { BranchDetailsDialog, BranchFormDialog } from './branch-dialogs';

function Show() {
    const { organization } = usePage<OrganizationShowPageProps>().props;
    const [branchFormOpen, setBranchFormOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);

    const { delete: destroy, processing } = useForm();

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
        'flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${organization.name} - Organization Details`} />

            <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-6 text-foreground">
                {/* Page heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <HeadingSmall
                        title="Organization Details"
                        description="View organization information and manage its branches."
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('organizations.index')}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="size-3.5" />
                            Organizations
                        </Link>

                        <Link
                            href={route('organizations.edit', organization.id)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                            <Pencil className="size-3.5" />
                            Edit Organization
                        </Link>
                    </div>
                </div>

                {/* Organization overview */}
                <section className={sectionClass}>
                    <div className="relative overflow-hidden border-b border-border/60 bg-muted/20 p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                                {organization.logo_url ? (
                                    <img
                                        src={organization.logo_url}
                                        alt={`${organization.name} logo`}
                                        className="size-full object-contain p-1.5"
                                    />
                                ) : (
                                    <Building2 className="size-7 text-muted-foreground" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                                        {organization.name}
                                    </h2>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                                        <span className="size-1.5 rounded-full bg-primary" />
                                        Active
                                    </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground/80">
                                        {organization.short_name ||
                                            'No short name'}
                                    </span>

                                    <span className="hidden text-border sm:inline">
                                        |
                                    </span>

                                    <span>
                                        Code:{' '}
                                        <span className="font-semibold text-foreground">
                                            {organization.code || '—'}
                                        </span>
                                    </span>

                                    {organization.registration_no && (
                                        <>
                                            <span className="hidden text-border sm:inline">
                                                |
                                            </span>
                                            <span>
                                                Registration:{' '}
                                                <span className="font-medium text-foreground">
                                                    {
                                                        organization.registration_no
                                                    }
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key information */}
                    <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0">
                        <div className="p-3.5 sm:p-4">
                            <BolderLessInfoBox
                                label="Registration Number"
                                value={organization.registration_no || '—'}
                            />
                        </div>

                        <div className="p-3.5 sm:p-4">
                            <BolderLessInfoBox
                                label="Tax Identification Number"
                                value={organization.tax_id || '—'}
                            />
                        </div>

                        <div className="p-3.5 sm:p-4">
                            <BolderLessInfoBox
                                label="Phone Number"
                                value={organization.phone || '—'}
                            />
                        </div>

                        <div className="p-3.5 sm:p-4">
                            <BolderLessInfoBox
                                label="Email Address"
                                value={organization.email || '—'}
                            />
                        </div>
                    </div>

                    {/* Additional organization information */}
                    <div className="grid grid-cols-1 gap-px border-t border-border/60 bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex min-w-0 items-start gap-3 bg-card p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <MapPin className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Registered Address
                                </p>
                                <p className="mt-1 text-sm font-medium break-words">
                                    {address || 'No address provided'}
                                </p>
                            </div>
                        </div>

                        <div className="flex min-w-0 items-start gap-3 bg-card p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Globe className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Website
                                </p>

                                {organization.website ? (
                                    <a
                                        href={organization.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-medium break-all text-primary hover:underline"
                                    >
                                        {organization.website}
                                        <ExternalLink className="size-3 shrink-0" />
                                    </a>
                                ) : (
                                    <p className="mt-1 text-sm font-medium">
                                        Not provided
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex min-w-0 items-start gap-3 bg-card p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <FileText className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Report Footer
                                </p>
                                <p className="mt-1 text-sm font-medium break-words">
                                    {organization.report_footer ||
                                        'Not configured'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

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

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Manage branches associated with this
                                    organization.
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
                        <table className="w-full min-w-[760px] border-collapse text-sm">
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

                                    <th className="min-w-52 px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Address
                                    </th>

                                    <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
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
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-xs font-medium">
                                                    {branch.code || '—'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="font-medium">
                                                    {branch.name}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
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
                                                        {branch.manager?.name ??
                                                            'Not assigned'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="max-w-64 px-4 py-3.5">
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

                                            <td className="px-4 py-3.5">
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
                                                        disabled={processing}
                                                        onClick={() =>
                                                            handleDelete(branch)
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
                                        <td colSpan={5} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="flex size-12 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
                                                    <Building2 className="size-5" />
                                                </div>

                                                <p className="mt-3 text-sm font-semibold">
                                                    No branches yet
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    Get started by creating the
                                                    first branch for this
                                                    organization.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingBranch(null);
                                                        setBranchFormOpen(true);
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
                    {organization.branches.length > 0 && (
                        <div className="flex flex-col gap-1 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                                Showing{' '}
                                <span className="font-semibold text-foreground">
                                    {organization.branches.length}
                                </span>{' '}
                                {organization.branches.length === 1
                                    ? 'branch'
                                    : 'branches'}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {organization.name}
                            </p>
                        </div>
                    )}
                </section>
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
