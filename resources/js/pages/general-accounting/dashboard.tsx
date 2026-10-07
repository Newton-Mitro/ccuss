import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    ClipboardList,
    FileCheck2,
    FileClock,
    FileText,
    Layers3,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface GeneralAccountingDashboardProps extends SharedData {
    stats: {
        accountGroups: number;
        ledgerAccounts: number;
        openFiscalYears: number;
        openFiscalPeriods: number;
        draftVouchers: number;
        postedVouchers: number;
        activeBudgets: number;
    };
}

const links = [
    {
        label: 'Chart of accounts',
        href: 'account-groups.index',
        icon: BookOpen,
    },
    {
        label: 'Vouchers',
        href: 'vouchers.index',
        icon: ClipboardList,
    },
    {
        label: 'Budgets',
        href: 'budgets.index',
        icon: Wallet,
    },
    {
        label: 'Financial reports',
        href: 'financial-reports.trial-balance',
        icon: FileText,
    },
] as const;

export default function GeneralAccountingDashboard() {
    const { stats } = usePage<GeneralAccountingDashboardProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'General Accounting',
            href: route('general-accounting.dashboard'),
        },
        {
            title: 'Dashboard',
            href: '',
        },
    ];

    const metrics = [
        {
            label: 'Account groups',
            value: stats.accountGroups,
            detail: 'Chart structure',
            icon: Layers3,
        },
        {
            label: 'Ledger accounts',
            value: stats.ledgerAccounts,
            detail: 'Configured accounts',
            icon: BookOpen,
        },
        {
            label: 'Draft vouchers',
            value: stats.draftVouchers,
            detail: 'Awaiting posting',
            icon: FileClock,
        },
        {
            label: 'Posted vouchers',
            value: stats.postedVouchers,
            detail: 'Successfully posted',
            icon: FileCheck2,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="General Accounting" />

            <div className="space-y-5 text-foreground">
                {/* Page Header */}
                <ResourcePageHeader
                    title="General Accounting"
                    description="Monitor the organization ledger, vouchers, fiscal periods, and budgets."
                    action={
                        <StatusBadge
                            tone={
                                stats.openFiscalPeriods > 0
                                    ? 'success'
                                    : 'warning'
                            }
                        >
                            {stats.openFiscalPeriods > 0
                                ? `${stats.openFiscalPeriods} period${stats.openFiscalPeriods === 1 ? '' : 's'} open`
                                : 'No fiscal period open'}
                        </StatusBadge>
                    }
                />

                {/* Accounting Metrics */}
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
                    aria-label="General accounting"
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

                {/* Accounting Operations */}
                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Fiscal Control */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Fiscal control
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Current accounting periods and controls
                                </p>
                            </div>

                            <StatusBadge
                                tone={
                                    stats.openFiscalPeriods > 0
                                        ? 'success'
                                        : 'warning'
                                }
                            >
                                {stats.openFiscalPeriods > 0
                                    ? 'Operational'
                                    : 'Attention'}
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('fiscal-years.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Fiscal years
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Open accounting years
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.openFiscalYears}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        open
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href={route('fiscal-periods.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Fiscal periods
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Periods available for posting
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.openFiscalPeriods}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        open
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Voucher Control */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Voucher control
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Journal posting and accounting workflow
                                </p>
                            </div>

                            <StatusBadge
                                tone={
                                    stats.draftVouchers > 0
                                        ? 'warning'
                                        : 'success'
                                }
                            >
                                {stats.draftVouchers > 0
                                    ? `${stats.draftVouchers} pending`
                                    : 'Up to date'}
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('vouchers.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <FileClock className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Draft vouchers
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Vouchers awaiting posting
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.draftVouchers}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        pending
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href={route('vouchers.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <FileCheck2 className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Posted vouchers
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Completed accounting entries
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold tabular-nums">
                                        {stats.postedVouchers}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        posted
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Ledger & Budget Overview */}
                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Ledger */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Ledger structure
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Organization chart of accounts
                                </p>
                            </div>

                            <StatusBadge tone="info">
                                {stats.ledgerAccounts} accounts
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('account-groups.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <Layers3 className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Account groups
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Assets, liabilities, equity, income
                                            and expenses
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm font-semibold tabular-nums">
                                    {stats.accountGroups}
                                </div>
                            </Link>

                            <Link
                                href={route('account-groups.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <BookOpen className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Ledger accounts
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Individual posting accounts
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm font-semibold tabular-nums">
                                    {stats.ledgerAccounts}
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Budget */}
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Budget control
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Active organizational budgets
                                </p>
                            </div>

                            <StatusBadge
                                tone={
                                    stats.activeBudgets > 0
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {stats.activeBudgets > 0
                                    ? `${stats.activeBudgets} active`
                                    : 'No active budgets'}
                            </StatusBadge>
                        </div>

                        <div className="divide-y border-y">
                            <Link
                                href={route('budgets.index')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <Wallet className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Active budgets
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Current budget configurations
                                        </div>
                                    </div>
                                </div>

                                <div className="text-lg font-semibold tabular-nums">
                                    {stats.activeBudgets}
                                </div>
                            </Link>

                            <Link
                                href={route('financial-reports.trial-balance')}
                                className="group flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            Financial reports
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Trial balance and accounting reports
                                        </div>
                                    </div>
                                </div>

                                <span className="text-xs font-medium text-primary">
                                    Open
                                </span>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Empty State */}
                {!stats.accountGroups &&
                !stats.ledgerAccounts &&
                !stats.openFiscalYears &&
                !stats.openFiscalPeriods ? (
                    <ResourceEmptyState
                        title="Accounting setup is incomplete"
                        description="Configure your chart of accounts and fiscal periods to start recording accounting transactions."
                    />
                ) : null}
            </div>
        </CustomAuthLayout>
    );
}
