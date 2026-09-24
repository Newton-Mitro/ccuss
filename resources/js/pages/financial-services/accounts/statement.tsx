import ReportExportActions from '@/components/report-export-actions';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { AccountStatementPageProps } from '@/types/financial-services';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarDays,
    FileText,
    WalletCards,
} from 'lucide-react';
import { route } from 'ziggy-js';

const statementPeriods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half-yearly' },
    { value: 'yearly', label: 'Yearly' },
];

const formatAmount = (value: string | number | null | undefined) =>
    Number(value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });

const statusTone = (status: string) => {
    if (status === 'POSTED') return 'success' as const;
    if (status === 'CANCELLED' || status === 'REVERSED')
        return 'danger' as const;
    return 'warning' as const;
};

export default function AccountStatement() {
    const {
        accounts,
        account,
        period,
        statementDate,
        periodStart,
        periodEnd,
        totals,
        openingBalance,
        closingBalance,
    } = usePage<AccountStatementPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Account Statements', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Statements" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account statements"
                    description="Follow every movement from opening balance to closing balance."
                />
                {account && (
                    <ReportExportActions
                        report="account-statement"
                        query={{
                            account_id: account.id,
                            period,
                            date: statementDate,
                        }}
                    />
                )}
                <div className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            Financial account
                        </Label>
                        <Select
                            value={account ? String(account.id) : ''}
                            onChange={(value) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: value,
                                        period,
                                        date: statementDate,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            options={[
                                { value: '', label: 'Select account' },
                                ...accounts.map((item) => ({
                                    value: String(item.id),
                                    label: `${item.account_no} - ${item.name ?? item.account_type}`,
                                })),
                            ]}
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            Statement period
                        </Label>
                        <Select
                            value={period}
                            onChange={(value) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: account?.id,
                                        period: value,
                                        date: statementDate,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            options={statementPeriods}
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            Reference date
                        </Label>
                        <Input
                            type="date"
                            value={statementDate}
                            onChange={(event) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: account?.id,
                                        period,
                                        date: event.target.value,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            className="bg-background"
                        />
                    </div>
                </div>
                {account ? (
                    <>
                        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <WalletCards className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-mono text-sm font-semibold">
                                        {account.account_no}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {account.name ?? account.account_type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <span>{periodStart}</span>
                                <span aria-hidden="true">to</span>
                                <span>{periodEnd}</span>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-300">
                                    <WalletCards className="h-4 w-4" />
                                    Opening balance
                                </div>
                                <p className="mt-2 text-xl font-semibold tabular-nums">
                                    {formatAmount(openingBalance)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                    <ArrowDownLeft className="h-4 w-4" />
                                    Total credits
                                </div>
                                <p className="mt-2 text-xl font-semibold tabular-nums">
                                    {formatAmount(totals.credit)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                                    <ArrowUpRight className="h-4 w-4" />
                                    Closing balance
                                </div>
                                <p className="mt-2 text-xl font-semibold tabular-nums">
                                    {formatAmount(closingBalance)}
                                </p>
                            </div>
                        </div>
                        <ResourceTableCard>
                            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-semibold">
                                        Account activity
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {totals.count} movement
                                    {totals.count === 1 ? '' : 's'}
                                </p>
                            </div>
                            <div className="max-h-[calc(100vh-530px)] overflow-auto">
                                <table className="w-full min-w-190 text-sm">
                                    <thead className="sticky top-0 z-10 bg-muted text-xs text-muted-foreground">
                                        <tr>
                                            <th className="border-b p-3 text-left font-medium">
                                                Date
                                            </th>
                                            <th className="border-b p-3 text-left font-medium">
                                                Description
                                            </th>
                                            <th className="border-b p-3 text-right font-medium">
                                                Debit
                                            </th>
                                            <th className="border-b p-3 text-right font-medium">
                                                Credit
                                            </th>
                                            <th className="border-b p-3 text-right font-medium">
                                                Balance
                                            </th>
                                            <th className="border-b p-3 text-left font-medium">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b bg-muted/20">
                                            <td className="p-3 text-muted-foreground">
                                                {periodStart}
                                            </td>
                                            <td className="p-3 font-medium">
                                                Opening balance
                                            </td>
                                            <td className="p-3 text-right text-muted-foreground tabular-nums">
                                                -
                                            </td>
                                            <td className="p-3 text-right text-muted-foreground tabular-nums">
                                                -
                                            </td>
                                            <td className="p-3 text-right font-medium tabular-nums">
                                                {formatAmount(openingBalance)}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge>
                                                    Opening
                                                </StatusBadge>
                                            </td>
                                        </tr>
                                        {(account.transactions ?? []).map(
                                            (movement) => (
                                                <tr
                                                    key={movement.id}
                                                    className="border-b even:bg-muted/30 hover:bg-accent/20"
                                                >
                                                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                                                        {
                                                            movement.transaction_date
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        <p className="font-mono text-xs font-medium">
                                                            {
                                                                movement.transaction_no
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                movement.transaction_type
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="p-3 text-right tabular-nums">
                                                        {Number(
                                                            movement.debit,
                                                        ) > 0
                                                            ? formatAmount(
                                                                  movement.debit,
                                                              )
                                                            : '-'}
                                                    </td>
                                                    <td className="p-3 text-right tabular-nums">
                                                        {Number(
                                                            movement.credit,
                                                        ) > 0
                                                            ? formatAmount(
                                                                  movement.credit,
                                                              )
                                                            : '-'}
                                                    </td>
                                                    <td className="p-3 text-right font-medium tabular-nums">
                                                        {formatAmount(
                                                            movement.running_balance,
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <StatusBadge
                                                            tone={statusTone(
                                                                movement.status,
                                                            )}
                                                        >
                                                            {movement.status}
                                                        </StatusBadge>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </ResourceTableCard>
                        {account.transactions?.length === 0 && (
                            <ResourceEmptyState
                                title="No activity in this period"
                                description="Try a different reference date or statement period."
                            />
                        )}
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                        Select an account to view its statement.
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
