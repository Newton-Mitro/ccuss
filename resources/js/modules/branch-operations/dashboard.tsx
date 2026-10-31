import {
    DashboardMetricGrid,
    DashboardQuickLinks,
} from '@/components/dashboard-summary';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceEmptyState,
    StatusBadge,
} from '@/components/resource-page-shell';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import BranchOperationsCharts from '@/modules/branch-operations/components/branch-operations-charts';
import type { BranchOperationsDashboardProps } from '@/modules/branch-operations/types/dashboard.interfaces';
import type { BreadcrumbItem } from '@/types';
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

const money = (amount: number) => `BDT ${formatBDTCurrency(amount, false)}`;

export default function BranchOperationsDashboard() {
    const {
        branch,
        branch_day,
        metrics,
        open_sessions,
        recent_activity,
        daily_posted_amounts,
        transaction_types,
    } = usePage<BranchOperationsDashboardProps>().props;
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
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Branch Operations"
                        description="Daily branch readiness, teller coverage, and cash activity."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <StatusBadge tone={branch_day ? 'success' : 'warning'}>
                            {branch_day
                                ? 'Branch day open'
                                : 'Branch day closed'}
                        </StatusBadge>
                    </div>
                </div>

                {!branch ? (
                    <ResourceEmptyState
                        title="No branch assigned"
                        description="Assign this user to a branch to view branch operations."
                    />
                ) : (
                    <>
                        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
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

                        <DashboardMetricGrid
                            metrics={[
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
                            ]}
                        />

                        <DashboardQuickLinks
                            label="Branch operations"
                            links={links.map((link) => ({
                                ...link,
                                href: route(link.href),
                            }))}
                        />

                        <BranchOperationsCharts
                            dailyPostedAmounts={daily_posted_amounts}
                            transactionTypes={transaction_types}
                        />

                        <div className="grid items-start gap-5 xl:grid-cols-2">
                            <Card className="min-w-0 gap-4 py-5">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-sm">
                                                Open teller sessions
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                Current branch day
                                            </CardDescription>
                                        </div>
                                        <StatusBadge tone="info">
                                            {open_sessions.length} open
                                        </StatusBadge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {open_sessions.length ? (
                                        <div className="divide-y">
                                            {open_sessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
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
                                                                {session.teller_account_no ??
                                                                    'No financial account'}
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
                                        <p className="py-2 text-sm text-muted-foreground">
                                            No open teller sessions for this
                                            branch day.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="min-w-0 gap-4 py-5">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-sm">
                                                Recent cash activity
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                Latest branch transactions
                                            </CardDescription>
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
                                </CardHeader>
                                <CardContent className="px-0">
                                    {recent_activity.length ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-112 text-sm">
                                                <thead className="text-left text-[10px] text-muted-foreground uppercase">
                                                    <tr>
                                                        <th className="py-2 pr-3 pl-6 font-medium">
                                                            Transaction
                                                        </th>
                                                        <th className="py-2 pr-3 font-medium">
                                                            Teller
                                                        </th>
                                                        <th className="py-2 pr-3 text-right font-medium">
                                                            Amount
                                                        </th>
                                                        <th className="py-2 pr-6 font-medium">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {recent_activity.map(
                                                        (transaction) => (
                                                            <tr
                                                                key={
                                                                    transaction.id
                                                                }
                                                                className="transition-colors hover:bg-muted/40"
                                                            >
                                                                <td className="py-2.5 pr-3 pl-6">
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
                                                                <td className="py-2.5 pr-3 text-xs">
                                                                    {transaction.teller ??
                                                                        '-'}
                                                                </td>
                                                                <td className="py-2.5 pr-3 text-right text-xs font-medium tabular-nums">
                                                                    {money(
                                                                        transaction.amount,
                                                                    )}
                                                                </td>
                                                                <td className="py-2.5 pr-6">
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
                                        <p className="px-6 py-2 text-sm text-muted-foreground">
                                            No cash transactions recorded for
                                            this branch yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
