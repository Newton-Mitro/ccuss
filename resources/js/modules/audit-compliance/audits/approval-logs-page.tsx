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
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface ApprovalLog {
    id: number;
    record_id: number | null;
    record_kind: string;
    record_reference: string;
    record_title: string;
    action: string;
    previous_status: string | null;
    new_status: string;
    comment: string | null;
    acted_at: string;
    actor?: { name: string } | null;
    record?: { id: number } | null;
}

interface Props extends SharedData {
    logs: {
        data: ApprovalLog[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        total: number;
    };
    filters: {
        action?: string;
        search?: string;
        per_page?: number;
    };
    actions: string[];
}

export default function ApprovalLogsPage() {
    const { logs, filters, actions, auth } = usePage<Props>().props;
    const permissionSlugs =
        auth.user.permissions?.map(({ slug }) => slug) ?? [];
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? '');
    useFlashToastHandler();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('approval-logs.index'),
                {
                    search: search || undefined,
                    action: action || undefined,
                    per_page: filters.per_page ?? 18,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, action, filters.per_page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit & Compliance', href: '' },
        { title: 'Governance', href: '' },
        {
            title: 'Approval Logs',
            href: route('approval-logs.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Logs" />

            <div className="mx-auto w-full max-w-7xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title="Approval Logs"
                    description="Review the immutable status decisions recorded across audit, compliance, risk, and regulatory records."
                    action={
                        <Button variant="outline" asChild>
                            <Link href={route('internal-audit.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Audit overview
                            </Link>
                        </Button>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Recorded decisions
                            </p>
                            <p className="mt-0.5 text-xl font-semibold tabular-nums">
                                {logs.total.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">
                            Decision types
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {actions.map((item) => (
                                <StatusBadge key={item} tone="info">
                                    {item}
                                </StatusBadge>
                            ))}
                        </div>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-2">
                            <Search className="size-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">
                                Decision history
                            </h2>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[minmax(200px,1fr)_180px]">
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search reference or title..."
                                className="bg-background"
                                aria-label="Search approval history"
                            />
                            <Select
                                value={action}
                                onChange={setAction}
                                className="bg-background"
                                options={[
                                    { value: '', label: 'All decisions' },
                                    ...actions.map((item) => ({
                                        value: item,
                                        label: item,
                                    })),
                                ]}
                            />
                        </div>
                    </div>

                    {logs.data.length === 0 ? (
                        <ResourceEmptyState
                            title="No approval decisions found"
                            description="Approval decisions are added when a record changes to an approved, rejected, submitted, or accepted state."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-200 text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground">
                                    <tr>
                                        {[
                                            'Date',
                                            'Record',
                                            'Decision',
                                            'Status change',
                                            'Actor',
                                            'Comment',
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
                                    {logs.data.map((log) => {
                                        const target = routeForKind(
                                            log.record_kind,
                                        );
                                        const canViewRecord =
                                            target !== null &&
                                            permissionSlugs.includes(
                                                `${target.permission}.view`,
                                            );

                                        return (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3.5 pl-5 text-xs whitespace-nowrap text-muted-foreground">
                                                    {new Intl.DateTimeFormat(
                                                        undefined,
                                                        {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        },
                                                    ).format(
                                                        new Date(log.acted_at),
                                                    )}
                                                </td>
                                                <td className="max-w-80 px-4 py-3.5">
                                                    {log.record_id &&
                                                    log.record &&
                                                    canViewRecord &&
                                                    target ? (
                                                        <Link
                                                            href={route(
                                                                `${target.route}.show`,
                                                                log.record_id,
                                                            )}
                                                            className="block hover:text-primary"
                                                        >
                                                            <span className="block truncate font-medium">
                                                                {
                                                                    log.record_title
                                                                }
                                                            </span>
                                                            <span className="mt-1 block font-mono text-xs text-muted-foreground">
                                                                {
                                                                    log.record_reference
                                                                }
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <div>
                                                            <span className="block truncate font-medium">
                                                                {
                                                                    log.record_title
                                                                }
                                                            </span>
                                                            <span className="mt-1 block font-mono text-xs text-muted-foreground">
                                                                {
                                                                    log.record_reference
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge
                                                        tone={
                                                            log.action ===
                                                            'REJECTED'
                                                                ? 'danger'
                                                                : 'success'
                                                        }
                                                    >
                                                        {log.action}
                                                    </StatusBadge>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs whitespace-nowrap text-muted-foreground">
                                                    {log.previous_status ??
                                                        'NEW'}{' '}
                                                    → {log.new_status}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {log.actor?.name ??
                                                        'System user'}
                                                </td>
                                                <td className="max-w-64 px-4 py-3.5 pr-5 text-xs text-muted-foreground">
                                                    <p className="line-clamp-2">
                                                        {log.comment || '—'}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {logs.data.length > 0 && (
                        <div className="border-t border-border bg-muted/10 px-4 py-3 sm:px-5">
                            <DataTablePagination
                                perPage={logs.per_page}
                                links={logs.links}
                                onPerPageChange={(perPage) =>
                                    router.get(
                                        route('approval-logs.index'),
                                        {
                                            search: search || undefined,
                                            action: action || undefined,
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

function routeForKind(
    kind: string,
): { route: string; permission: string } | null {
    const routes: Record<string, { route: string; permission: string }> = {
        AUDIT_PLAN: { route: 'audit-plans', permission: 'audit-plans' },
        AUDIT_ENGAGEMENT: {
            route: 'audit-engagements',
            permission: 'audit-engagements',
        },
        AUDIT_WORKING_PAPER: {
            route: 'audit-working-papers',
            permission: 'audit-working-papers',
        },
        AUDIT_FINDING: {
            route: 'audit-findings',
            permission: 'audit-findings',
        },
        AUDIT_CORRECTIVE_ACTION: {
            route: 'audit-corrective-actions',
            permission: 'audit-corrective-actions',
        },
        AUDIT_FOLLOW_UP: {
            route: 'audit-follow-ups',
            permission: 'audit-follow-ups',
        },
        COMPLIANCE_REQUIREMENT: {
            route: 'compliance-requirements',
            permission: 'compliance-requirements',
        },
        COMPLIANCE_ASSESSMENT: {
            route: 'compliance-assessments',
            permission: 'compliance-assessments',
        },
        COMPLIANCE_ACTION: {
            route: 'compliance-actions',
            permission: 'compliance-actions',
        },
        RISK: { route: 'risks', permission: 'risks' },
        RISK_ASSESSMENT: {
            route: 'risk-assessments',
            permission: 'risk-assessments',
        },
        RISK_MITIGATION: {
            route: 'risk-mitigations',
            permission: 'risk-mitigations',
        },
        REGULATORY_TEMPLATE: {
            route: 'regulatory-reports',
            permission: 'regulatory-reports',
        },
        REGULATORY_REPORT: {
            route: 'regulatory-reports-generated',
            permission: 'regulatory-reports',
        },
        REGULATORY_SUBMISSION: {
            route: 'regulatory-report-submissions',
            permission: 'regulatory-report-submissions',
        },
    };

    return routes[kind] ?? null;
}
