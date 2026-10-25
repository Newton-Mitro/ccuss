import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Register {
    route: string;
    title: string;
    singular: string;
    area: string;
    description: string;
    permission: string;
}

interface RegisterRecord {
    id: number;
    reference: string;
    title: string;
    category: string | null;
    status: string;
    priority: string;
    responsible_person: string | null;
    due_date: string | null;
    updated_at: string;
}

interface Props extends SharedData {
    register: Register;
    records: {
        data: RegisterRecord[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        page?: number;
        per_page?: number;
    };
    statuses: string[];
    priorities: string[];
}

function toneForStatus(status: string) {
    if (['APPROVED', 'COMPLIANT', 'ACCEPTED', 'COMPLETED'].includes(status)) {
        return 'success';
    }
    if (['REJECTED', 'NON_COMPLIANT', 'CLOSED'].includes(status)) {
        return 'danger';
    }
    if (
        ['IN_PROGRESS', 'UNDER_REVIEW', 'SUBMITTED', 'MITIGATING'].includes(
            status,
        )
    ) {
        return 'warning';
    }
    return 'neutral';
}

function toneForPriority(priority: string) {
    if (priority === 'CRITICAL' || priority === 'HIGH') return 'danger';
    if (priority === 'MEDIUM') return 'warning';
    return 'neutral';
}

export default function RegisterPage() {
    const { register, records, filters, statuses, priorities, auth } =
        usePage<Props>().props;
    const permissionSlugs =
        auth.user.permissions?.map(({ slug }) => slug) ?? [];
    const canCreate = permissionSlugs.includes(`${register.permission}.create`);
    const canUpdate = permissionSlugs.includes(`${register.permission}.update`);
    const canDelete = permissionSlugs.includes(`${register.permission}.delete`);
    const overviewRoute =
        register.area === 'Compliance'
            ? 'compliance.index'
            : register.area === 'Risk Management'
              ? 'risk-management.index'
              : register.area === 'Regulatory Reporting'
                ? 'regulatory-reports.index'
                : 'internal-audit.index';
    const overviewPermission =
        register.area === 'Compliance'
            ? 'compliance.view'
            : register.area === 'Risk Management'
              ? 'risk-management.view'
              : register.area === 'Regulatory Reporting'
                ? 'regulatory-reports.view'
                : 'internal-audit.view';
    const canViewOverview = permissionSlugs.includes(overviewPermission);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');
    useFlashToastHandler();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route(`${register.route}.index`),
                {
                    search: search || undefined,
                    status: status || undefined,
                    priority: priority || undefined,
                    per_page: filters.per_page ?? 18,
                    page: 1,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status, priority, filters.per_page, register.route]);

    const archive = (record: RegisterRecord) => {
        appSwal
            .fire({
                title: `Archive ${register.singular.toLowerCase()}?`,
                text: `${record.reference} — ${record.title} will be removed from the active register.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Archive record',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(
                        route(`${register.route}.destroy`, record.id),
                        { preserveScroll: true },
                    );
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit & Compliance', href: '' },
        { title: register.area, href: '' },
        { title: register.title, href: route(`${register.route}.index`) },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={register.title} />

            <div className="mx-auto w-full max-w-7xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title={register.title}
                    description={register.description}
                    action={
                        <div className="flex flex-wrap gap-2">
                            {canViewOverview && (
                                <Button variant="outline" asChild>
                                    <Link href={route(overviewRoute)}>
                                        <ArrowLeft className="mr-2 size-4" />
                                        {register.area} overview
                                    </Link>
                                </Button>
                            )}
                            {canCreate && (
                                <Button asChild>
                                    <Link
                                        href={route(`${register.route}.create`)}
                                    >
                                        <Plus className="mr-2 size-4" />
                                        Add {register.singular}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <section className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">
                            Records in register
                        </p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                            {records.total.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">
                            Open on this page
                        </p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                            {
                                records.data.filter(
                                    (record) =>
                                        ![
                                            'COMPLETED',
                                            'CLOSED',
                                            'ACCEPTED',
                                        ].includes(record.status),
                                ).length
                            }
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">
                            High priority on this page
                        </p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                            {
                                records.data.filter((record) =>
                                    ['HIGH', 'CRITICAL'].includes(
                                        record.priority,
                                    ),
                                ).length
                            }
                        </p>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-2">
                            <Search className="size-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">
                                Register records
                            </h2>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_170px_150px]">
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search records..."
                                className="bg-background"
                                aria-label="Search records"
                            />
                            <Select
                                value={status}
                                onChange={setStatus}
                                className="bg-background"
                                options={[
                                    { value: '', label: 'All statuses' },
                                    ...statuses.map((item) => ({
                                        value: item,
                                        label: item.replaceAll('_', ' '),
                                    })),
                                ]}
                            />
                            <Select
                                value={priority}
                                onChange={setPriority}
                                className="bg-background"
                                options={[
                                    { value: '', label: 'All priorities' },
                                    ...priorities.map((item) => ({
                                        value: item,
                                        label: item,
                                    })),
                                ]}
                            />
                        </div>
                    </div>

                    {records.data.length === 0 ? (
                        <ResourceEmptyState
                            title={`No ${register.title.toLowerCase()} yet`}
                            description="Create a record to begin tracking work in this register."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-220 text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground">
                                    <tr>
                                        {[
                                            'Reference',
                                            'Title',
                                            'Category',
                                            'Priority',
                                            'Status',
                                            'Responsible',
                                            'Due date',
                                            'Actions',
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="border-b border-border px-4 py-3 text-left font-medium first:pl-5 last:pr-5"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/70">
                                    {records.data.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3.5 pl-5 font-mono text-xs font-medium text-muted-foreground">
                                                {record.reference}
                                            </td>
                                            <td className="max-w-80 px-4 py-3.5">
                                                <p className="truncate font-medium text-foreground">
                                                    {record.title}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5 text-muted-foreground">
                                                {record.category || '—'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge
                                                    tone={toneForPriority(
                                                        record.priority,
                                                    )}
                                                >
                                                    {record.priority}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge
                                                    tone={toneForStatus(
                                                        record.status,
                                                    )}
                                                >
                                                    {record.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-4 py-3.5 text-muted-foreground">
                                                {record.responsible_person ||
                                                    'Unassigned'}
                                            </td>
                                            <td className="px-4 py-3.5 text-muted-foreground">
                                                {record.due_date || '—'}
                                            </td>
                                            <td className="px-4 py-3.5 pr-5">
                                                <div className="flex justify-end gap-1">
                                                    {canUpdate && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            title="Edit record"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    `${register.route}.edit`,
                                                                    record.id,
                                                                )}
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title="View record"
                                                    >
                                                        <Link
                                                            href={route(
                                                                `${register.route}.show`,
                                                                record.id,
                                                            )}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                archive(record)
                                                            }
                                                            title="Archive record"
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {records.data.length > 0 && (
                        <div className="border-t border-border bg-muted/10 px-4 py-3 sm:px-5">
                            <DataTablePagination
                                perPage={records.per_page}
                                links={records.links}
                                onPerPageChange={(perPage) =>
                                    router.get(
                                        route(`${register.route}.index`),
                                        {
                                            search: search || undefined,
                                            status: status || undefined,
                                            priority: priority || undefined,
                                            per_page: perPage,
                                            page: 1,
                                        },
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                        },
                                    )
                                }
                            />
                        </div>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
}
