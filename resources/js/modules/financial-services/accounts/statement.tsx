import HeadingSmall from '@/components/heading-small';
import ReportExportActions from '@/components/report-export-actions';
import {
    ResourceEmptyState,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import {
    FinancialAccountSearchInput,
    type FinancialAccountSearchResult,
} from '@/modules/financial-services/components/financial-account-search-input';
import type { AccountStatementPageProps } from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarDays,
    FileText,
    WalletCards,
} from 'lucide-react';
import { useMemo } from 'react';
import { route } from 'ziggy-js';

const statementPeriods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half-yearly' },
    { value: 'yearly', label: 'Yearly' },
];

const formatAmount = (value: string | number | null | undefined) =>
    formatBDTCurrency(value, false);

const statusTone = (status: string) => {
    if (status === 'POSTED') return 'success' as const;
    if (status === 'CANCELLED' || status === 'REVERSED')
        return 'danger' as const;
    return 'warning' as const;
};

export default function AccountStatement() {
    const {
        account,
        period,
        statementDate,
        periodStart,
        periodEnd,
        totals,
        openingBalance,
        closingBalance,
    } = usePage<AccountStatementPageProps>().props;
    const initialAccount = useMemo<FinancialAccountSearchResult | null>(
        () =>
            account
                ? {
                      id: account.id,
                      account_no: account.account_no,
                      name: account.name ?? null,
                      account_type: account.account_type,
                      status: account.status ?? 'ACTIVE',
                      balance: Number(account.balance ?? 0),
                      available_balance: Number(account.balance ?? 0),
                      holder: null,
                      holders: [],
                  }
                : null,
        [account],
    );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Account Statements', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Statements" />
            <div className="space-y-3">
                <div className="flex flex-col items-start justify-between gap-3 py-3 sm:flex-row sm:items-center sm:py-3">
                    <HeadingSmall
                        title="Account statements"
                        description="Review account movements and balances for a selected period."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        {account ? (
                            <ReportExportActions
                                report="account-statement"
                                query={{
                                    account_id: account.id,
                                    period,
                                    date: statementDate,
                                }}
                            />
                        ) : undefined}
                    </div>
                </div>
                <section className="grid gap-3 rounded-xl border bg-card p-3 shadow-sm sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Financial account
                        </p>
                        <FinancialAccountSearchInput
                            scope="statement"
                            initialAccount={initialAccount}
                            placeholder="Search account number, name, or holder"
                            onSelect={(selectedAccount) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: selectedAccount.id,
                                        period,
                                        date: statementDate,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            clearSelectedAccount={() =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        period,
                                        date: statementDate,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Statement period
                        </Label>
                        <Select
                            className="h-9"
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
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Reference date
                        </Label>
                        <AppDatePicker
                            value={statementDate}
                            onChange={(value) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: account?.id,
                                        period,
                                        date: value,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            className="h-9 bg-background"
                        />
                    </div>
                </section>
                {account ? (
                    <>
                        <section className="flex flex-col gap-2 rounded-xl border bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <WalletCards className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {account.account_no}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {account.name &&
                                        account.name !== account.account_type
                                            ? `${account.name} · `
                                            : ''}
                                        {account.account_type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:justify-end">
                                <CalendarDays className="size-3.5 shrink-0" />
                                <span>{formatDate(periodStart)}</span>
                                <span aria-hidden="true">–</span>
                                <span>{formatDate(periodEnd)}</span>
                            </div>
                        </section>
                        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 shadow-sm">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Opening balance
                                    </p>
                                    <p className="mt-1 truncate text-base font-semibold tabular-nums">
                                        {formatAmount(openingBalance)}
                                    </p>
                                </div>
                                <WalletCards className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 shadow-sm">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total debits
                                    </p>
                                    <p className="mt-1 truncate text-base font-semibold tabular-nums">
                                        {formatAmount(totals.debit)}
                                    </p>
                                </div>
                                <ArrowUpRight className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 shadow-sm">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total credits
                                    </p>
                                    <p className="mt-1 truncate text-base font-semibold tabular-nums">
                                        {formatAmount(totals.credit)}
                                    </p>
                                </div>
                                <ArrowDownLeft className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 shadow-sm">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Closing balance
                                    </p>
                                    <p className="mt-1 truncate text-base font-semibold tabular-nums">
                                        {formatAmount(closingBalance)}
                                    </p>
                                </div>
                                <WalletCards className="size-4 shrink-0 text-primary" />
                            </div>
                        </section>
                        <ResourceTableCard className="shadow-sm">
                            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    <p className="text-sm font-semibold">
                                        Account activity
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground tabular-nums">
                                    {totals.count} movement
                                    {totals.count === 1 ? '' : 's'}
                                </p>
                            </div>
                            <div className="max-h-[calc(100vh-390px)] overflow-auto">
                                <table className="w-full min-w-180 text-sm">
                                    <thead className="sticky top-0 z-10 bg-muted/95 text-xs text-muted-foreground backdrop-blur">
                                        <tr>
                                            <th className="border-b px-3 py-2 text-left font-medium">
                                                Date
                                            </th>
                                            <th className="border-b px-3 py-2 text-left font-medium">
                                                Description
                                            </th>
                                            <th className="border-b px-3 py-2 text-right font-medium">
                                                Debit
                                            </th>
                                            <th className="border-b px-3 py-2 text-right font-medium">
                                                Credit
                                            </th>
                                            <th className="border-b px-3 py-2 text-right font-medium">
                                                Balance
                                            </th>
                                            <th className="border-b px-3 py-2 text-left font-medium">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b bg-sky-500/5">
                                            <td className="px-3 py-2 text-xs whitespace-nowrap text-muted-foreground">
                                                {formatDate(periodStart)}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                Opening balance
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                                                -
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                                                -
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium tabular-nums">
                                                {formatAmount(openingBalance)}
                                            </td>
                                            <td className="px-3 py-2">
                                                <StatusBadge>
                                                    Opening
                                                </StatusBadge>
                                            </td>
                                        </tr>
                                        {(account.transactions ?? []).map(
                                            (movement) => (
                                                <tr
                                                    key={movement.id}
                                                    className="border-b even:bg-muted/20 hover:bg-accent/20"
                                                >
                                                    <td className="px-3 py-2 text-xs whitespace-nowrap text-muted-foreground">
                                                        {formatDate(
                                                            movement.transaction_date,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <p className="font-mono text-xs font-medium">
                                                            {
                                                                movement.transaction_no
                                                            }
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {
                                                                movement.transaction_type
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-2 text-right tabular-nums">
                                                        {Number(
                                                            movement.debit,
                                                        ) > 0 ? (
                                                            <span className="text-rose-600 dark:text-rose-400">
                                                                {formatAmount(
                                                                    movement.debit,
                                                                )}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right tabular-nums">
                                                        {Number(
                                                            movement.credit,
                                                        ) > 0 ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                                {formatAmount(
                                                                    movement.credit,
                                                                )}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium tabular-nums">
                                                        {formatAmount(
                                                            movement.running_balance,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
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
