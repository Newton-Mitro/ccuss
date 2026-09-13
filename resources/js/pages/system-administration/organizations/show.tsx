import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

import BolderLessInfoBox from '../../../components/borderless-info-box';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { Organization } from '../../../types/organization';

interface OrganizationPageProps extends SharedData {
    organization: Organization & {
        branches: Branch[];
    };
}

function Show() {
    const { organization } = usePage<OrganizationPageProps>().props;

    const { delete: destroy, processing } = useForm();

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'System Administration',
            href: '',
        },
        {
            title: 'Organizations',
            href: route('organizations.index'),
        },
        {
            title: organization.name,
            href: '',
        },
    ];

    const handleDelete = (branch: Branch) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Branch "${branch.name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Organization Details" />

            <div className="space-y-3 text-foreground">
                <HeadingSmall
                    title="Organization Details"
                    description="Overview of the organization profile."
                />

                {/* Organization Summary */}
                <div className="overflow-hidden rounded-lg border bg-card">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-3">
                        {organization.logo_url ? (
                            <img
                                src={organization.logo_url}
                                alt={organization.name}
                                className="h-12 w-12 shrink-0 rounded-md border object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted text-[10px] text-muted-foreground">
                                No Logo
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <h2 className="truncate text-base font-semibold">
                                    {organization.name}
                                </h2>

                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-400/10 dark:text-green-400">
                                    Active
                                </span>
                            </div>

                            <p className="truncate text-xs text-muted-foreground">
                                {organization.short_name || '—'}
                                <span className="mx-1">•</span>
                                Code: {organization.code}
                            </p>
                        </div>
                    </div>

                    {/* Compact Details */}
                    <div className="grid grid-cols-2 border-t p-3 sm:grid-cols-4">
                        <BolderLessInfoBox
                            label="Registration"
                            value={organization.registration_no || '—'}
                        />

                        <BolderLessInfoBox
                            label="Tax ID"
                            value={organization.tax_id || '—'}
                        />

                        <BolderLessInfoBox
                            label="Phone"
                            value={organization.phone || '—'}
                        />

                        <BolderLessInfoBox
                            label="Email"
                            value={organization.email || '—'}
                        />
                    </div>

                    {/* Address */}
                    {address && (
                        <div className="border-t px-3 py-2">
                            <div className="text-[11px] text-muted-foreground">
                                Address
                            </div>

                            <div className="truncate text-xs font-medium">
                                {address}
                            </div>
                        </div>
                    )}
                </div>

                {/* Branches */}
                <div className="rounded-lg border bg-card">
                    <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold">
                                    Branches
                                </h3>

                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {organization.branches.length}
                                </span>
                            </div>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Manage branches belonging to this organization.
                            </p>
                        </div>

                        <Link
                            href={route('branches.create', {
                                organization_id: organization.id,
                            })}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Branch
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead className="border-b bg-muted/30 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">
                                        Code
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                        Name
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                        Manager
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                        Address
                                    </th>

                                    <th className="px-3 py-2 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {organization.branches.length > 0 ? (
                                    organization.branches.map((branch) => (
                                        <tr
                                            key={branch.id}
                                            className="border-b last:border-0 hover:bg-muted/50"
                                        >
                                            <td className="px-3 py-2 font-medium whitespace-nowrap">
                                                {branch.code}
                                            </td>

                                            <td className="px-3 py-2">
                                                {branch.name}
                                            </td>

                                            <td className="px-3 py-2">
                                                <span
                                                    className={
                                                        branch.manager
                                                            ? ''
                                                            : 'text-muted-foreground'
                                                    }
                                                >
                                                    {branch.manager?.name ??
                                                        'Not assigned'}
                                                </span>
                                            </td>

                                            <td className="max-w-xs truncate px-3 py-2 text-muted-foreground">
                                                {branch.address ??
                                                    'Not provided'}
                                            </td>

                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route(
                                                            'branches.show',
                                                            branch.id,
                                                        )}
                                                        className="text-info transition-opacity hover:opacity-70"
                                                        title="View branch"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>

                                                    <Link
                                                        href={route(
                                                            'branches.edit',
                                                            branch.id,
                                                        )}
                                                        className="text-success transition-opacity hover:opacity-70"
                                                        title="Edit branch"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() =>
                                                            handleDelete(branch)
                                                        }
                                                        className="text-destructive transition-opacity hover:opacity-70 disabled:opacity-50"
                                                        title="Delete branch"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-8 text-center text-xs text-muted-foreground"
                                        >
                                            No branches found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default Show;
