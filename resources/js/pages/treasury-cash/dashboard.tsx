import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Clock3, UserRound, Vault } from 'lucide-react';
import { route } from 'ziggy-js';

interface TreasuryCashDashboardProps extends SharedData {
    stats: {
        vaults: number;
        tellers: number;
        openBranchDays: number;
        openTellerSessions: number;
    };
}

const links = [
    {
        label: 'Branch days',
        href: 'branch-days.index',
        icon: CalendarDays,
    },
    {
        label: 'Vaults',
        href: 'vaults.index',
        icon: Vault,
    },
    {
        label: 'Tellers',
        href: 'tellers.index',
        icon: UserRound,
    },
    {
        label: 'Teller sessions',
        href: 'teller-sessions.index',
        icon: Clock3,
    },
] as const;

export default function TreasuryCashDashboard() {
    const { stats } = usePage<TreasuryCashDashboardProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Treasury & Cash',
            href: route('treasury-cash.dashboard'),
        },
        {
            title: 'Dashboard',
            href: '',
        },
    ];

    const metrics = [
        {
            label: 'Vaults',
            value: stats.vaults,
            detail: 'Configured cash locations',
            icon: Vault,
        },
        {
            label: 'Tellers',
            value: stats.tellers,
            detail: 'Registered tellers',
            icon: UserRound,
        },
        {
            label: 'Open branch days',
            value: stats.openBranchDays,
            detail: 'Currently operating',
            icon: CalendarDays,
        },
        {
            label: 'Open teller sessions',
            value: stats.openTellerSessions,
            detail: 'Currently active',
            icon: Clock3,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Treasury & Cash" />

            <div className="space-y-5 text-foreground">
                <ResourcePageHeader
                    title="Treasury & Cash"
                    description="Monitor branch readiness, cash locations, and teller activity."
                    action={
                        <StatusBadge
                            tone={
                                stats.openBranchDays > 0 ? 'success' : 'warning'
                            }
                        >
                            {stats.openBranchDays > 0
                                ? `${stats.openBranchDays} branch day${stats.openBranchDays === 1 ? '' : 's'} open`
                                : 'No branch day open'}
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
                    aria-label="Treasury and cash"
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

                {/* Operational Overview */}
                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Branch Day Status */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Branch day status
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Current branch operating status
                                </p>
                            </div>

                            <StatusBadge
                                tone={
                                    stats.openBranchDays > 0
                                        ? 'success'
                                        : 'warning'
                                }
                            >
                                {stats.openBranchDays > 0 ? 'Open' : 'Closed'}
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <div className="flex items-center justify-between gap-3 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Open branch days
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Active business days across branches
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.openBranchDays}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        open
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <Clock3 className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Teller sessions
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Active cash handling sessions
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.openTellerSessions}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cash Infrastructure */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Cash infrastructure
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Configured treasury resources
                                </p>
                            </div>

                            <StatusBadge tone="info">
                                {stats.vaults + stats.tellers} resources
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('vaults.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <Vault className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Vaults
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Branch cash storage locations
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-semibold tabular-nums">
                                        {stats.vaults}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        configured
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href={route('tellers.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <UserRound className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Tellers
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Staff assigned to cash operations
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-semibold tabular-nums">
                                        {stats.tellers}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        registered
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Empty / Informational State */}
                {!stats.vaults &&
                !stats.tellers &&
                !stats.openBranchDays &&
                !stats.openTellerSessions ? (
                    <ResourceEmptyState
                        title="Treasury setup is incomplete"
                        description="Configure branch days, vaults, and tellers to start managing treasury operations."
                    />
                ) : null}
            </div>
        </CustomAuthLayout>
    );
}
