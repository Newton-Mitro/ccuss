import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ClipboardList,
    DatabaseBackup,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface AdministrativeTasksDashboardProps extends SharedData {
    stats: {
        users: number;
        roles: number;
        auditLogs: number;
        successfulBackups: number;
    };
}

const links = [
    {
        label: 'Users',
        href: 'users.index',
        icon: Users,
    },
    {
        label: 'Role permissions',
        href: 'roles.index',
        icon: ShieldCheck,
    },
    {
        label: 'Activity logs',
        href: 'audits.index',
        icon: ClipboardList,
    },
] as const;

export default function AdministrativeTasksDashboard() {
    const { stats } = usePage<AdministrativeTasksDashboardProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Administrative Tasks',
            href: route('admin-dashboard'),
        },
        {
            title: 'Dashboard',
            href: '',
        },
    ];

    const metrics = [
        {
            label: 'Users',
            value: stats.users,
            detail: 'System users',
            icon: Users,
        },
        {
            label: 'Roles',
            value: stats.roles,
            detail: 'Access control roles',
            icon: ShieldCheck,
        },
        {
            label: 'Audit events',
            value: stats.auditLogs,
            detail: 'Recorded system activity',
            icon: Activity,
        },
        {
            label: 'Successful backups',
            value: stats.successfulBackups,
            detail: 'Completed backups',
            icon: DatabaseBackup,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrative Tasks" />

            <div className="space-y-5 text-foreground">
                {/* Page Header */}
                <ResourcePageHeader
                    title="Administrative Tasks"
                    description="Manage users, access control, system activity, and administrative operations."
                    action={
                        <StatusBadge
                            tone={
                                stats.successfulBackups > 0
                                    ? 'success'
                                    : 'warning'
                            }
                        >
                            {stats.successfulBackups > 0
                                ? 'System activity monitored'
                                : 'Backup attention required'}
                        </StatusBadge>
                    }
                />

                {/* Summary Metrics */}
                <section className="grid grid-cols-2 divide-x divide-y overflow-hidden border-y sm:grid-cols-4 sm:divide-y-0">
                    {metrics.map(({ label, value, detail, icon: Icon }) => (
                        <div key={label} className="min-w-0 px-3 py-3 sm:px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon className="h-4 w-4 shrink-0" />

                                <span className="truncate text-xs">
                                    {label}
                                </span>
                            </div>

                            <div className="mt-2 truncate text-xl font-semibold tabular-nums">
                                {value}
                            </div>

                            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {detail}
                            </div>
                        </div>
                    ))}
                </section>

                {/* Quick Navigation */}
                <nav
                    className="flex flex-wrap gap-2"
                    aria-label="Administrative tasks"
                >
                    {links.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={route(href)}
                            className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-medium transition hover:bg-muted"
                        >
                            <Icon className="h-4 w-4 text-primary" />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Access & Audit */}
                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Access Control */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Access control
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Users and permission management
                                </p>
                            </div>

                            <StatusBadge tone="info">
                                {stats.roles} roles
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('users.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <UserRound className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            System users
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Manage user accounts and access
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.users}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        users
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href={route('roles.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Roles & permissions
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Control system capabilities
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.roles}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        roles
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Audit & Activity */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Audit & activity
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    System history and accountability
                                </p>
                            </div>

                            <StatusBadge
                                tone={
                                    stats.auditLogs > 0 ? 'success' : 'neutral'
                                }
                            >
                                {stats.auditLogs > 0
                                    ? `${stats.auditLogs} events`
                                    : 'No events'}
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('audits.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Activity logs
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Review recorded system activity
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.auditLogs}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        events
                                    </div>
                                </div>
                            </Link>

                            <div className="flex items-center justify-between gap-3 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <DatabaseBackup className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            System backups
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Successfully completed backups
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.successfulBackups}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        successful
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Administration Overview */}
                <section className="min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Administration overview
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Core controls available to system administrators
                            </p>
                        </div>

                        <StatusBadge
                            tone={
                                stats.users > 0 && stats.roles > 0
                                    ? 'success'
                                    : 'warning'
                            }
                        >
                            {stats.users > 0 && stats.roles > 0
                                ? 'Configured'
                                : 'Setup required'}
                        </StatusBadge>
                    </div>

                    <div className="grid gap-2 border-y py-3 sm:grid-cols-3">
                        {links.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={route(href)}
                                className="group flex items-center gap-3 rounded-md border bg-card px-3 py-3 transition hover:bg-muted"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Icon className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">
                                        {label}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        Open management
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Empty State */}
                {!stats.users &&
                !stats.roles &&
                !stats.auditLogs &&
                !stats.successfulBackups ? (
                    <ResourceEmptyState
                        title="Administrative setup is incomplete"
                        description="Create users and roles to begin managing system access and administrative activity."
                    />
                ) : null}
            </div>
        </CustomAuthLayout>
    );
}
