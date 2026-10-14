import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    Banknote,
    Building2,
    CalendarDays,
    Clock3,
    FileClock,
    HandCoins,
    Landmark,
    ReceiptText,
    Users,
    WalletCards,
} from 'lucide-react';
import { route } from 'ziggy-js';
import {
    ResourcePageHeader,
    StatusBadge,
} from '../components/resource-page-shell';
import CustomAuthLayout from '../layouts/custom-auth-layout';
import { formatDateTime } from '../lib/date_util';
import type { BreadcrumbItem, SharedData } from '../types';

interface DashboardProps extends SharedData {
    stats: {
        branches: number;
        members: number;
        activeAccounts: number;
        loanPortfolio: number;
        pendingApplications: number;
        pendingTransactions: number;
        monthTransactionVolume: number;
        openBranchDays: number;
        openTellerSessions: number;
        openVaultSessions: number;
    };
    dailyVolume: { date: string; label: string; amount: number }[];
    accountMix: { type: string; count: number; balance: number }[];
    recentTransactions: {
        id: number;
        number: string;
        type: string;
        date: string | null;
        amount: number;
        status: string;
        branch: string | null;
    }[];
    pendingApplicationsList: {
        id: number;
        number: string;
        applicant: string;
        amount: number;
        status: string;
        created_at: string | null;
    }[];
    quickLinks: { label: string; href: string }[];
    today: string;
}

const numberFormat = new Intl.NumberFormat('en-BD');
const compactNumberFormat = new Intl.NumberFormat('en-BD', {
    notation: 'compact',
    maximumFractionDigits: 1,
});
const moneyFormat = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
});

const formatMoney = (amount: number) => moneyFormat.format(amount || 0);
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
            tone: 'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/50',
        },
        {
            label: 'Active members',
            value: numberFormat.format(stats.members),
            detail: 'Individual customers',
            icon: Users,
            tone: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50',
        },
        {
            label: 'Active accounts',
            value: numberFormat.format(stats.activeAccounts),
            detail: 'Across all product types',
            icon: WalletCards,
            tone: 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/50',
        },
        {
            label: 'Loan portfolio',
            value: formatMoney(stats.loanPortfolio),
            detail: 'Active loan account balances',
            icon: HandCoins,
            tone: 'text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50',
        },
        {
            label: 'Needs attention',
            value: numberFormat.format(pendingWork),
            detail: `${stats.pendingApplications} applications · ${stats.pendingTransactions} transactions`,
            icon: FileClock,
            tone: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/50',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Organization Overview" />
            <div className="space-y-6 text-foreground">
                <ResourcePageHeader
                    title="Organization overview"
                    description="A live operating snapshot across branches, accounts, lending, and treasury."
                    action={
                        <div className="text-right">
                            <div className="text-sm font-medium">
                                {organization.active?.name ??
                                    'Active organization'}
                            </div>
                            <div className="text-xs text-muted-foreground">
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
                    }
                />

                <section
                    aria-label="Organization metrics"
                    className="grid grid-cols-2 divide-x divide-y overflow-hidden border-y sm:grid-cols-3 sm:divide-y-0 xl:grid-cols-5"
                >
                    {metrics.map(
                        ({ label, value, detail, icon: Icon, tone }) => (
                            <div
                                key={label}
                                className="min-w-0 px-3 py-3 sm:px-4"
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
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
                        ),
                    )}
                </section>

                {quickLinks.length > 0 && (
                    <nav
                        className="flex flex-wrap items-center gap-2"
                        aria-label="Dashboard shortcuts"
                    >
                        <span className="mr-1 text-xs font-medium text-muted-foreground">
                            Go to
                        </span>
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                            >
                                {link.label}
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </Link>
                        ))}
                    </nav>
                )}

                <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_0.6fr]">
                    <section className="min-w-0 border-y py-4">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Posted transaction volume
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Daily total for the last seven days
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold tabular-nums">
                                    {formatMoney(stats.monthTransactionVolume)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    posted this month
                                </div>
                            </div>
                        </div>

                        <div className="flex h-44 items-end gap-2 border-b border-l px-2 pb-0 sm:gap-4">
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
                                            className="w-full rounded-t-sm bg-primary/75 transition-[height]"
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

                    <section className="min-w-0 border-y py-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Operations today
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Live branch and session status
                                </p>
                            </div>
                            <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="divide-y">
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
                                    className="flex items-center justify-between gap-4 py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate text-sm">
                                            {label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums">
                                        {numberFormat.format(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid items-start gap-6 xl:grid-cols-2">
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Recent transactions
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Latest organization-wide financial activity
                                </p>
                            </div>
                            <ReceiptText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="overflow-x-auto border-y">
                            {recentTransactions.length > 0 ? (
                                <table className="w-full min-w-140 text-sm">
                                    <thead className="text-left text-[10px] text-muted-foreground uppercase">
                                        <tr>
                                            <th className="py-2 pr-3 font-medium">
                                                Transaction
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Branch
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Status
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recentTransactions.map(
                                            (transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="py-2 pr-3">
                                                        <div className="font-medium">
                                                            {transaction.number}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
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
                                                    </td>
                                                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                                                        {transaction.branch ??
                                                            '—'}
                                                    </td>
                                                    <td className="py-2 pr-3">
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
                                                    <td className="py-2 text-right font-medium tabular-nums">
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

                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Loan applications to review
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {numberFormat.format(
                                        stats.pendingApplications,
                                    )}{' '}
                                    awaiting a decision
                                </p>
                            </div>
                            <HandCoins className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="divide-y border-y">
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
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                                                <ArrowDownRight className="h-4 w-4" />
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

                <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Financial account mix
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Accounts and current balances by type
                            </p>
                        </div>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid gap-x-8 border-y sm:grid-cols-2 lg:grid-cols-3">
                        {accountMix.length > 0 ? (
                            accountMix.map((account) => (
                                <div
                                    key={account.type}
                                    className="min-w-0 py-3"
                                >
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="truncate text-sm font-medium">
                                            {formatType(account.type)}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {numberFormat.format(account.count)}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary/75"
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
                                    <div className="mt-1 text-xs text-muted-foreground">
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
