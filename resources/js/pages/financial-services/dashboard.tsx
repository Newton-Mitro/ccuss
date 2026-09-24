import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Landmark,
    Plus,
    WalletCards,
} from 'lucide-react';
import { route } from 'ziggy-js';
import DashboardMetricCharts from '../../components/dashboard-metric-charts';

interface Props extends SharedData {
    metrics: {
        products: number;
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
        entries?: { financial_account?: { account_no?: string } | null }[];
    }[];
}

export default function FinancialServicesDashboard() {
    const { metrics, recentTransactions } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Financial Services',
            href: route('financial-services.dashboard'),
        },
        { title: 'Dashboard', href: '' },
    ];
    const cards = [
        {
            label: 'Active products',
            value: metrics.products,
            icon: Landmark,
            tone: 'text-sky-600',
        },
        {
            label: 'Financial accounts',
            value: metrics.accounts,
            icon: WalletCards,
            tone: 'text-emerald-600',
        },
        {
            label: 'Active accounts',
            value: metrics.activeAccounts,
            icon: ArrowUpFromLine,
            tone: 'text-amber-600',
        },
        {
            label: 'Posted transactions',
            value: metrics.postedTransactions,
            icon: ArrowDownToLine,
            tone: 'text-violet-600',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Services Dashboard" />
            <div className="space-y-5">
                <ResourcePageHeader
                    title="Financial Services"
                    description="A focused view of products, accounts, and operational activity."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('financial-accounts.create')}>
                                <Plus className="mr-1 h-4 w-4" /> Open account
                            </Link>
                        </Button>
                    }
                />
                <DashboardMetricCharts
                    metrics={{
                        'Active products': metrics.products,
                        'Financial accounts': metrics.accounts,
                        'Active accounts': metrics.activeAccounts,
                        'Posted transactions': metrics.postedTransactions,
                    }}
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="rounded-md border bg-card p-4"
                        >
                            <Icon className={`h-5 w-5 ${tone}`} />
                            <p className="mt-4 text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">Recent activity</h2>
                            <p className="text-xs text-muted-foreground">
                                Latest posted and pending account movements.
                            </p>
                        </div>
                        <Link
                            className="text-sm text-primary hover:underline"
                            href={route('financial-transactions.index')}
                        >
                            View all
                        </Link>
                    </div>
                    <ResourceTableCard>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2">Transaction</th>
                                    <th className="px-3 py-2">Account</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2 text-right">
                                        Amount
                                    </th>
                                    <th className="px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b last:border-0 even:bg-muted/30"
                                    >
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {transaction.transaction_no}
                                        </td>
                                        <td className="px-3 py-2">
                                            {transaction.entries
                                                ?.map(
                                                    (entry) =>
                                                        entry.financial_account
                                                            ?.account_no,
                                                )
                                                .filter(Boolean)
                                                .join(', ') || '-'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {transaction.transaction_type}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {Number(transaction.amount).toFixed(
                                                4,
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <StatusBadge
                                                tone={
                                                    transaction.status ===
                                                    'POSTED'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {transaction.status}
                                            </StatusBadge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResourceTableCard>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
