import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    HandCoins,
    PiggyBank,
    WalletCards,
} from 'lucide-react';
import { route } from 'ziggy-js';

import DashboardMetricCharts from '../../components/dashboard-metric-charts';

interface FinancialServicesDashboardProps extends SharedData {
    metrics: {
        depositProducts: number;
        loanProducts: number;
        accounts: number;
        activeAccounts: number;
        postedTransactions: number;
    };

    recentTransactions: {
        id: number;
        transaction_no: string;
        transaction_type: string;
        amount: string | number;
        status: string;
        entries?: {
            financial_account?: {
                account_no?: string;
            } | null;
        }[];
    }[];
}

const links = [
    {
        label: 'Deposit products',
        href: 'deposit-products.index',
        icon: PiggyBank,
    },
    {
        label: 'Loan products',
        href: 'loan-products.index',
        icon: HandCoins,
    },
    {
        label: 'Financial accounts',
        href: 'financial-accounts.index',
        icon: WalletCards,
    },
    {
        label: 'Transactions',
        href: 'financial-transactions.index',
        icon: ArrowDownToLine,
    },
] as const;

const money = (amount: string | number) =>
    `BDT ${Number(amount || 0).toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatTransactionType = (type: string) => type.replaceAll('_', ' ');

export default function FinancialServicesDashboard() {
    const { metrics, recentTransactions } =
        usePage<FinancialServicesDashboardProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Financial Services',
            href: route('financial-services.dashboard'),
        },
        {
            title: 'Dashboard',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Services" />

            <div className="space-y-5 text-foreground">
                {/* Header */}
                <ResourcePageHeader
                    title="Financial Services"
                    description="Products, financial accounts, and transaction activity."
                    action={
                        <StatusBadge
                            tone={
                                metrics.postedTransactions > 0
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {metrics.postedTransactions.toLocaleString()} posted
                        </StatusBadge>
                    }
                />

                {/* Summary metrics */}
                <section className="grid grid-cols-2 divide-x divide-y overflow-hidden border-y sm:grid-cols-3 sm:divide-y-0 xl:grid-cols-5">
                    {[
                        {
                            label: 'Deposit products',
                            value: metrics.depositProducts,
                            detail: 'Savings and deposits',
                            icon: PiggyBank,
                        },
                        {
                            label: 'Loan products',
                            value: metrics.loanProducts,
                            detail: 'Available loan products',
                            icon: HandCoins,
                        },
                        {
                            label: 'Financial accounts',
                            value: metrics.accounts,
                            detail: 'All financial accounts',
                            icon: WalletCards,
                        },
                        {
                            label: 'Active accounts',
                            value: metrics.activeAccounts,
                            detail: 'Currently active',
                            icon: ArrowUpFromLine,
                        },
                        {
                            label: 'Posted transactions',
                            value: metrics.postedTransactions,
                            detail: 'Recorded transactions',
                            icon: ArrowDownToLine,
                        },
                    ].map(({ label, value, detail, icon: Icon }) => (
                        <div key={label} className="min-w-0 px-3 py-3 sm:px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon className="h-4 w-4 shrink-0" />

                                <span className="truncate text-xs">
                                    {label}
                                </span>
                            </div>

                            <div className="mt-2 truncate text-xl font-semibold tabular-nums">
                                {value.toLocaleString()}
                            </div>

                            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {detail}
                            </div>
                        </div>
                    ))}
                </section>

                {/* Quick navigation */}
                <nav
                    className="flex flex-wrap gap-2"
                    aria-label="Financial services"
                >
                    {links.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={`${label}-${href}`}
                            href={route(href)}
                            className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-medium transition hover:bg-muted"
                        >
                            <Icon className="h-4 w-4 text-primary" />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Metrics chart */}
                <DashboardMetricCharts
                    metrics={{
                        'Deposit products': metrics.depositProducts,
                        'Loan products': metrics.loanProducts,
                        'Financial accounts': metrics.accounts,
                        'Active accounts': metrics.activeAccounts,
                        'Posted transactions': metrics.postedTransactions,
                    }}
                />

                {/* Recent activity */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Recent activity
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Latest posted and pending financial
                                transactions.
                            </p>
                        </div>

                        <Link
                            href={route('financial-transactions.index')}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    <ResourceTableCard>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-sm">
                                <thead className="text-left text-[10px] text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">
                                            Transaction
                                        </th>

                                        <th className="px-3 py-2 font-medium">
                                            Account
                                        </th>

                                        <th className="px-3 py-2 font-medium">
                                            Type
                                        </th>

                                        <th className="px-3 py-2 text-right font-medium">
                                            Amount
                                        </th>

                                        <th className="px-3 py-2 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {recentTransactions.length ? (
                                        recentTransactions.map(
                                            (transaction) => {
                                                const accounts =
                                                    transaction.entries
                                                        ?.map(
                                                            (entry) =>
                                                                entry
                                                                    .financial_account
                                                                    ?.account_no,
                                                        )
                                                        .filter(Boolean)
                                                        .join(', ') || '-';

                                                return (
                                                    <tr
                                                        key={transaction.id}
                                                        className="transition-colors hover:bg-muted/40"
                                                    >
                                                        <td className="px-3 py-2.5">
                                                            <div className="font-mono text-xs">
                                                                {
                                                                    transaction.transaction_no
                                                                }
                                                            </div>

                                                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                                                                Financial
                                                                transaction
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <div className="max-w-56 truncate text-xs">
                                                                {accounts}
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <span className="text-xs capitalize">
                                                                {formatTransactionType(
                                                                    transaction.transaction_type,
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="px-3 py-2.5 text-right">
                                                            <span className="text-xs font-medium tabular-nums">
                                                                {money(
                                                                    transaction.amount,
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="px-3 py-2.5">
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
                                                );
                                            },
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-3 py-8 text-center text-sm text-muted-foreground"
                                            >
                                                No financial transactions
                                                recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ResourceTableCard>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
