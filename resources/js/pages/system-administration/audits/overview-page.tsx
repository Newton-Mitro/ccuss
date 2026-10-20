import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    ClipboardCheck,
    Clock3,
    FileClock,
    ShieldCheck,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Dashboard {
    route: string;
    title: string;
    description: string;
    area: string;
}

interface Register {
    route: string;
    title: string;
    singular: string;
    description: string;
    count: number;
    open_count: number;
}

interface RecentRecord {
    id: number;
    reference: string;
    title: string;
    kind: string;
    status: string;
    priority: string;
    due_date: string | null;
    register_route: string;
}

interface Props extends SharedData {
    dashboard: Dashboard;
    summary: {
        total: number;
        open: number;
        overdue: number;
        approved: number;
        rejected: number;
    };
    registers: Register[];
    statusCounts: Record<string, number>;
    recentRecords: RecentRecord[];
}

export default function AuditComplianceOverview() {
    const { dashboard, summary, registers, statusCounts, recentRecords, auth } =
        usePage<Props>().props;
    useFlashToastHandler();
    const permissionSlugs =
        auth.user.permissions?.map(({ slug }) => slug) ?? [];

    const iconByArea = {
        'Internal Audit': ClipboardCheck,
        Compliance: ShieldCheck,
        'Risk Management': AlertTriangle,
    };
    const OverviewIcon = iconByArea[dashboard.area as keyof typeof iconByArea];
    const cards = [
        {
            label: 'Tracked records',
            value: summary.total,
            icon: FileClock,
            tone: 'bg-primary/10 text-primary',
        },
        {
            label: 'Open work',
            value: summary.open,
            icon: Clock3,
            tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Overdue',
            value: summary.overdue,
            icon: AlertTriangle,
            tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        {
            label: 'Approved / accepted',
            value: summary.approved,
            icon: ShieldCheck,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
    ];
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit & Compliance', href: '' },
        { title: dashboard.title, href: route(`${dashboard.route}.index`) },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={dashboard.title} />

            <div className="mx-auto w-full max-w-7xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title={dashboard.title}
                    description={dashboard.description}
                    action={
                        <div className="flex flex-wrap gap-2">
                            {permissionSlugs.includes('approval-logs.view') && (
                                <Button variant="outline" asChild>
                                    <Link href={route('approval-logs.index')}>
                                        <Activity className="mr-2 size-4" />
                                        Approval history
                                    </Link>
                                </Button>
                            )}
                            {permissionSlugs.includes('activity_logs.view') && (
                                <Button variant="outline" asChild>
                                    <Link href={route('audits.index')}>
                                        Activity audit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <section
                    aria-label={`${dashboard.area} summary`}
                    className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {cards.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                        >
                            <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
                            >
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                                    {value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <OverviewIcon className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Registers
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Open a register to review or manage its
                                    records.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-3 p-4 sm:grid-cols-2">
                            {registers.map((register) => (
                                <Link
                                    key={register.route}
                                    href={route(`${register.route}.index`)}
                                    className="group rounded-xl border border-border/80 bg-background/70 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-semibold">
                                                {register.title}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                {register.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <StatusBadge tone="info">
                                            {register.count} total
                                        </StatusBadge>
                                        <StatusBadge tone="warning">
                                            {register.open_count} open
                                        </StatusBadge>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border px-4 py-3.5">
                                <h2 className="text-sm font-semibold">
                                    Status distribution
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Current workflow states
                                </p>
                            </div>
                            <div className="space-y-3 p-4">
                                {Object.entries(statusCounts).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No records to summarize yet.
                                    </p>
                                ) : (
                                    Object.entries(statusCounts)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([status, count]) => (
                                            <div
                                                key={status}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                                <span className="text-sm font-semibold tabular-nums">
                                                    {count}
                                                </span>
                                            </div>
                                        ))
                                )}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <FileClock className="size-4 text-primary" />
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Recently updated
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Latest work across this area
                                    </p>
                                </div>
                            </div>
                            <div className="divide-y divide-border/70">
                                {recentRecords.length === 0 ? (
                                    <p className="p-4 text-sm text-muted-foreground">
                                        No recent records.
                                    </p>
                                ) : (
                                    recentRecords.map((record) => (
                                        <Link
                                            key={record.id}
                                            href={route(
                                                `${record.register_route}.show`,
                                                record.id,
                                            )}
                                            className="block px-4 py-3 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {record.title}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                                                        {record.reference}
                                                    </p>
                                                </div>
                                                <StatusBadge tone="neutral">
                                                    {record.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </StatusBadge>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
