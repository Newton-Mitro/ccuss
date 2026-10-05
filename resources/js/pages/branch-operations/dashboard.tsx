import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowLeftRight,
    CalendarDays,
    Clock3,
    FileClock,
    UserRound,
    WalletCards,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface BranchOperationsDashboardProps extends SharedData {
    branch: { id: number; code: string; name: string } | null;
    branch_day: {
        id: number;
        business_date: string;
        status: string;
        opened_at: string | null;
    } | null;
    metrics: {
        assigned_tellers: number;
        open_sessions: number;
        pending_transactions: number;
        posted_today_amount: number;
    };
    open_sessions: {
        id: number;
        teller_name: string;
        teller_code: string | null;
        business_date: string | null;
        opened_at: string | null;
        expected_cash: number;
    }[];
    recent_activity: {
        id: number;
        transaction_no: string;
        type: string;
        amount: number;
        status: string;
        requested_at: string | null;
        cash_location: string | null;
        teller: string | null;
    }[];
}

const links = [
    { label: 'Branch days', href: 'branch-days.index', icon: CalendarDays },
    { label: 'Teller sessions', href: 'teller-sessions.index', icon: Clock3 },
    {
        label: 'Cash transactions',
        href: 'teller-transactions.index',
        icon: ArrowDownToLine,
    },
    {
        label: 'Cash transfers',
        href: 'cash-movements.transfers.index',
        icon: ArrowLeftRight,
    },
] as const;

const money = (amount: number) =>
    `BDT ${Number(amount || 0).toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function BranchOperationsDashboard() {
    const { branch, branch_day, metrics, open_sessions, recent_activity } =
        usePage<BranchOperationsDashboardProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Branch Operations',
            href: route('branch-operations.dashboard'),
        },
        { title: 'Dashboard', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Operations" />
            <div className="space-y-5 text-foreground">
                <ResourcePageHeader
                    title="Branch Operations"
                    description="Daily branch readiness, teller coverage, and cash activity."
                    action={
                        <StatusBadge tone={branch_day ? 'success' : 'warning'}>
                            {branch_day
                                ? 'Branch day open'
                                : 'Branch day closed'}
                        </StatusBadge>
                    }
                />

                {!branch ? (
                    <ResourceEmptyState
                        title="No branch assigned"
                        description="Assign this user to a branch to view branch operations."
                    />
                ) : (
                    <>
                        <section className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">
                                        {branch.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {branch.code} ·{' '}
                                        {branch_day?.business_date ??
                                            'No open business day'}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={route('branch-days.index')}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Manage branch day
                            </Link>
                        </section>

                        <section className="grid grid-cols-2 divide-x divide-y overflow-hidden border-y sm:grid-cols-4 sm:divide-y-0">
                            {[
                                {
                                    label: 'Active tellers',
                                    value: metrics.assigned_tellers,
                                    detail: 'Assigned to this branch',
                                    icon: UserRound,
                                },
                                {
                                    label: 'Open sessions',
                                    value: metrics.open_sessions,
                                    detail: 'Currently operating',
                                    icon: Clock3,
                                },
                                {
                                    label: 'Pending transactions',
                                    value: metrics.pending_transactions,
                                    detail: 'Awaiting posting',
                                    icon: FileClock,
                                },
                                {
                                    label: 'Posted today',
                                    value: money(metrics.posted_today_amount),
                                    detail: 'Current open business day',
                                    icon: WalletCards,
                                },
                            ].map(({ label, value, detail, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="min-w-0 px-3 py-3 sm:px-4"
                                >
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

                        <nav
                            className="flex flex-wrap gap-2"
                            aria-label="Branch operations"
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

                        <div className="grid items-start gap-5 xl:grid-cols-2">
                            <section className="min-w-0 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Open teller sessions
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Current branch day
                                        </p>
                                    </div>
                                    <StatusBadge tone="info">
                                        {open_sessions.length} open
                                    </StatusBadge>
                                </div>
                                {open_sessions.length ? (
                                    <div className="divide-y border-y">
                                        {open_sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="flex flex-wrap items-center justify-between gap-3 py-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                        <UserRound className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium">
                                                            {
                                                                session.teller_name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {session.teller_code ??
                                                                'No teller code'}
                                                            {' · '}
                                                            {session.business_date ??
                                                                '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-muted-foreground">
                                                        Expected cash
                                                    </div>
                                                    <div className="text-sm font-semibold tabular-nums">
                                                        {money(
                                                            session.expected_cash,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="border-y py-5 text-sm text-muted-foreground">
                                        No open teller sessions for this branch
                                        day.
                                    </p>
                                )}
                            </section>

                            <section className="min-w-0 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Recent cash activity
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Latest branch transactions
                                        </p>
                                    </div>
                                    <Link
                                        href={route(
                                            'teller-transactions.index',
                                        )}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        View queue
                                    </Link>
                                </div>
                                {recent_activity.length ? (
                                    <div className="overflow-x-auto border-y">
                                        <table className="w-full min-w-112 text-sm">
                                            <thead className="text-left text-[10px] text-muted-foreground uppercase">
                                                <tr>
                                                    <th className="py-2 pr-3 font-medium">
                                                        Transaction
                                                    </th>
                                                    <th className="py-2 pr-3 font-medium">
                                                        Teller
                                                    </th>
                                                    <th className="py-2 pr-3 text-right font-medium">
                                                        Amount
                                                    </th>
                                                    <th className="py-2 font-medium">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {recent_activity.map(
                                                    (transaction) => (
                                                        <tr
                                                            key={transaction.id}
                                                        >
                                                            <td className="py-2 pr-3">
                                                                <div className="font-mono text-xs">
                                                                    {
                                                                        transaction.transaction_no
                                                                    }
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground">
                                                                    {transaction.type.replaceAll(
                                                                        '_',
                                                                        ' ',
                                                                    )}
                                                                    {transaction.cash_location
                                                                        ? ` · ${transaction.cash_location}`
                                                                        : ''}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 pr-3 text-xs">
                                                                {transaction.teller ??
                                                                    '-'}
                                                            </td>
                                                            <td className="py-2 pr-3 text-right text-xs font-medium tabular-nums">
                                                                {money(
                                                                    transaction.amount,
                                                                )}
                                                            </td>
                                                            <td className="py-2">
                                                                <StatusBadge
                                                                    tone={
                                                                        transaction.status ===
                                                                        'POSTED'
                                                                            ? 'success'
                                                                            : transaction.status ===
                                                                                'PENDING'
                                                                              ? 'warning'
                                                                              : 'neutral'
                                                                    }
                                                                >
                                                                    {
                                                                        transaction.status
                                                                    }
                                                                </StatusBadge>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="border-y py-5 text-sm text-muted-foreground">
                                        No cash transactions recorded for this
                                        branch yet.
                                    </p>
                                )}
                            </section>
                        </div>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
