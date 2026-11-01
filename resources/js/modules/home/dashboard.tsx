import {
    DashboardMetricGrid,
    DashboardQuickLinks,
} from '@/components/dashboard-summary';
import { StatusBadge } from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDateTime } from '@/lib/date_util';
import type { DashboardProps } from '@/modules/home/types/dashboard.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    Banknote,
    Building2,
    CalendarDays,
    Clock3,
    FileClock,
    HandCoins,
    Landmark,
    ReceiptText,
    Sparkles,
    Users,
    WalletCards,
} from 'lucide-react';
import { route } from 'ziggy-js';

const numberFormat = new Intl.NumberFormat('en-BD');
const compactNumberFormat = new Intl.NumberFormat('en-BD', {
    notation: 'compact',
    maximumFractionDigits: 1,
});
const formatMoney = (amount: number) => formatBDTCurrency(amount);
const formatType = (value: string) => value.replaceAll('_', ' ');

export default function DashboardPage() {
    const {
        stats,
        dailyVolume,
        accountMix,
        recentTransactions,
        pendingApplicationsList,
        quickLinks,
        today,
        organization,
    } = usePage<DashboardProps>().props;

    const maxDailyVolume = Math.max(0, ...dailyVolume.map((day) => day.amount));
    const maxAccountCount = Math.max(
        0,
        ...accountMix.map((item) => item.count),
    );
    const pendingWork = stats.pendingApplications + stats.pendingTransactions;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    const metrics = [
        {
            label: 'Branches',
            value: numberFormat.format(stats.branches),
            detail: 'Organization locations',
            icon: Building2,
        },
        {
            label: 'Active members',
            value: numberFormat.format(stats.members),
            detail: 'Individual customers',
            icon: Users,
        },
        {
            label: 'Active accounts',
            value: numberFormat.format(stats.activeAccounts),
            detail: 'Across all product types',
            icon: WalletCards,
        },
        {
            label: 'Loan portfolio',
            value: formatMoney(stats.loanPortfolio),
            detail: 'Active loan account balances',
            icon: HandCoins,
        },
        {
            label: 'Needs attention',
            value: numberFormat.format(pendingWork),
            detail: `${stats.pendingApplications} applications · ${stats.pendingTransactions} transactions`,
            icon: FileClock,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Organization Overview" />
            <div className="space-y-5 pb-6 text-foreground">
                <header className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.13] via-card to-card px-5 py-5 shadow-sm sm:px-7 sm:py-6">
                    <div className="pointer-events-none absolute -top-20 right-8 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-10 -bottom-28 -z-10 size-72 rounded-full bg-sky-500/[0.07] blur-3xl" />
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="hidden size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-background/75 text-primary shadow-sm sm:flex">
                                <Sparkles className="size-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                                    Organization dashboard
                                </p>
                                <h1 className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">
                                    Organization overview
                                </h1>
                                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
                                    A live operating snapshot across branches,
                                    accounts, lending, and treasury.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="min-w-0 rounded-xl border border-border/70 bg-background/75 px-3.5 py-2.5">
                                <div className="truncate text-xs font-semibold">
                                    {organization.active?.name ??
                                        'Active organization'}
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                    {new Date(
                                        `${today}T12:00:00`,
                                    ).toLocaleDateString('en-BD', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                Live overview
                            </div>
                        </div>
                    </div>
                </header>

                <DashboardMetricGrid
                    className="xl:grid-cols-5"
                    metrics={metrics}
                />

                <DashboardQuickLinks links={quickLinks} />

                <div className="grid items-stretch gap-4 xl:grid-cols-[1.4fr_0.6fr]">
                    <section className="min-w-0 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Posted transaction volume
                                </h2>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Daily total for the last seven days
                                </p>
                            </div>
                            <div className="rounded-lg border bg-muted/25 px-3 py-2 text-right">
                                <div className="text-sm font-semibold tabular-nums">
                                    {formatMoney(stats.monthTransactionVolume)}
                                </div>
                                <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                    posted this month
                                </div>
                            </div>
                        </div>

                        <div className="relative flex h-44 items-end gap-2 overflow-hidden rounded-lg border border-border/60 bg-gradient-to-b from-primary/[0.025] to-transparent px-3 pb-0 sm:gap-4">
                            <div className="pointer-events-none absolute inset-x-0 top-1/4 border-t border-dashed border-border/60" />
                            <div className="pointer-events-none absolute inset-x-0 top-2/4 border-t border-dashed border-border/60" />
                            <div className="pointer-events-none absolute inset-x-0 top-3/4 border-t border-dashed border-border/60" />
                            {dailyVolume.map((day) => {
                                const height =
                                    maxDailyVolume > 0
                                        ? Math.max(
                                              (day.amount / maxDailyVolume) *
                                                  100,
                                              day.amount > 0 ? 3 : 0,
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={day.date}
                                        className="flex h-full min-w-0 flex-1 flex-col justify-end"
                                    >
                                        <div className="mb-2 truncate text-center text-[10px] text-muted-foreground">
                                            {day.amount > 0
                                                ? compactNumberFormat.format(
                                                      day.amount,
                                                  )
                                                : ''}
                                        </div>
                                        <div
                                            className="relative w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary/45 shadow-[0_0_16px] shadow-primary/10 transition-[height] hover:from-primary hover:to-primary/65"
                                            style={{ height: `${height}%` }}
                                            title={`${day.label}: ${formatMoney(day.amount)}`}
                                            role="img"
                                            aria-label={`${day.label}: ${formatMoney(day.amount)}`}
                                        />
                                        <div className="mt-2 -mb-5 text-center text-[10px] text-muted-foreground">
                                            {day.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="min-w-0 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Operations today
                                </h2>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Live branch and session status
                                </p>
                            </div>
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Activity className="size-4" />
                            </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                            {[
                                {
                                    label: 'Open branch days',
                                    value: stats.openBranchDays,
                                    icon: CalendarDays,
                                },
                                {
                                    label: 'Teller sessions',
                                    value: stats.openTellerSessions,
                                    icon: Clock3,
                                },
                                {
                                    label: 'Vault sessions',
                                    value: stats.openVaultSessions,
                                    icon: Landmark,
                                },
                            ].map(({ label, value, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5 xl:py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border/70">
                                            <Icon className="size-4" />
                                        </span>
                                        <span className="truncate text-xs font-medium">
                                            {label}
                                        </span>
                                    </div>
                                    <span className="text-lg font-semibold tracking-tight tabular-nums">
                                        {numberFormat.format(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid items-start gap-6 xl:grid-cols-2">
                    <section className="min-w-0 space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Recent transactions
                                </h2>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Latest organization-wide financial activity
                                </p>
                            </div>
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ReceiptText className="size-4" />
                            </span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-border/70 bg-background/70 p-3">
                            {recentTransactions.length > 0 ? (
                                <table className="w-full min-w-140 text-sm">
                                    <thead className="border-b bg-muted/25 text-left text-[10px] text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-2 py-2.5 pr-3 font-medium">
                                                Transaction
                                            </th>
                                            <th className="px-2 py-2.5 pr-3 font-medium">
                                                Branch
                                            </th>
                                            <th className="px-2 py-2.5 pr-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-2 py-2.5 text-right font-medium">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {recentTransactions.map(
                                            (transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="transition-colors hover:bg-muted/25"
                                                >
                                                    <td className="px-2 py-3 pr-3">
                                                        <div className="font-medium tracking-tight">
                                                            {transaction.number}
                                                        </div>
                                                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                                                            {formatType(
                                                                transaction.type,
                                                            )}{' '}
                                                            ·{' '}
                                                            {transaction.date
                                                                ? formatDateTime(
                                                                      transaction.date,
                                                                  )
                                                                : '—'}
                                                        </div>
                                                        {transaction.accounts
                                                            .length > 0 && (
                                                            <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                                                                {transaction.accounts.join(
                                                                    ', ',
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-3 pr-3 text-xs text-muted-foreground">
                                                        {transaction.branch ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-2 py-3 pr-3">
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
                                                            {transaction.status}
                                                        </StatusBadge>
                                                    </td>
                                                    <td className="px-2 py-3 text-right font-semibold tabular-nums">
                                                        {formatMoney(
                                                            transaction.amount,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No financial transactions recorded yet.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="min-w-0 space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Loan applications to review
                                </h2>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {numberFormat.format(
                                        stats.pendingApplications,
                                    )}{' '}
                                    awaiting a decision
                                </p>
                            </div>
                            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                <HandCoins className="size-4" />
                            </span>
                        </div>
                        <div className="divide-y divide-border/60 rounded-lg border border-border/70 bg-background/70 px-3">
                            {pendingApplicationsList.length > 0 ? (
                                pendingApplicationsList.map((application) => (
                                    <Link
                                        key={application.id}
                                        href={route(
                                            'loan-applications.show',
                                            application.id,
                                        )}
                                        className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                                <ArrowDownRight className="size-4" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-medium">
                                                    {application.applicant}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {application.number} ·{' '}
                                                    {application.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            </span>
                                        </div>
                                        <span className="shrink-0 text-right text-sm font-medium tabular-nums">
                                            {formatMoney(application.amount)}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No loan applications are awaiting review.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <section className="space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold tracking-tight">
                                Financial account mix
                            </h2>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Accounts and current balances by type
                            </p>
                        </div>
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            <Banknote className="size-4" />
                        </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {accountMix.length > 0 ? (
                            accountMix.map((account) => (
                                <div
                                    key={account.type}
                                    className="min-w-0 rounded-lg border border-border/60 bg-muted/15 px-3.5 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="truncate text-xs font-semibold">
                                            {formatType(account.type)}
                                        </span>
                                        <span className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {numberFormat.format(account.count)}
                                        </span>
                                    </div>
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                                            style={{
                                                width: `${
                                                    maxAccountCount
                                                        ? (account.count /
                                                              maxAccountCount) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-muted-foreground tabular-nums">
                                        {formatMoney(account.balance)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-sm text-muted-foreground">
                                No financial accounts in this organization.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
