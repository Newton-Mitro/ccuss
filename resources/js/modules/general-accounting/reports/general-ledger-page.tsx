import ReportExportActions from '@/components/report-export-actions';
import {
    ResourceEmptyState,
    ResourcePageHeader,
} from '@/components/resource-page-shell';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, BookOpen, Scale } from 'lucide-react';
import { useState } from 'react';

interface LedgerEntry {
    id: number;
    voucher_no: string;
    voucher_type: string;
    voucher_date: string;
    entry_description?: string;
    debit: number;
    credit: number;
    running_balance: number;
}

interface FiscalPeriod {
    id: number;
    name: string;
}

interface Props extends SharedData {
    account: { id: number; code: string; name: string } | null;
    entries: LedgerEntry[];
    accounts: { id: number; code: string; name: string }[];
    fiscalPeriods: FiscalPeriod[];
    filters: { account_id?: string; fiscal_period_id?: string };
}

export default function GeneralLedgerPage() {
    const { account, entries, accounts, fiscalPeriods, filters } =
        usePage<Props>().props;
    const [accountId, setAccountId] = useState(
        account ? String(account.id) : '',
    );
    const [periodId, setPeriodId] = useState(filters.fiscal_period_id || '');

    const reloadLedger = (nextAccountId: string, nextPeriodId: string) => {
        router.get(
            '/financial-reports/general-ledger',
            {
                account_id: nextAccountId,
                fiscal_period_id: nextPeriodId || undefined,
            },
            { preserveState: true },
        );
    };

    const changeAccount = (value: string) => {
        setAccountId(value);
        reloadLedger(value, periodId);
    };

    const changePeriod = (value: string) => {
        setPeriodId(value);
        reloadLedger(accountId, value);
    };

    const totalDebits = entries.reduce(
        (total, entry) => total + Number(entry.debit),
        0,
    );
    const totalCredits = entries.reduce(
        (total, entry) => total + Number(entry.credit),
        0,
    );
    const closingBalance = entries.at(-1)?.running_balance ?? 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Reports', href: '' },
        { title: 'General Ledger', href: '/financial-reports/general-ledger' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="General Ledger" />
            <div className="space-y-4 text-foreground">
                <ReportExportActions
                    report="general-ledger"
                    query={{
                        account_id: accountId,
                        fiscal_period_id: periodId,
                    }}
                />
                <ResourcePageHeader
                    title="General Ledger"
                    description={
                        account
                            ? `${account.code} · ${account.name} — review posted activity and its running balance.`
                            : 'Select a ledger account to review its posted activity and running balance.'
                    }
                    action={
                        account ? (
                            <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                <BookOpen className="size-3.5 text-primary" />
                                {entries.length} entries
                            </span>
                        ) : undefined
                    }
                />

                <section className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold">
                            Report filters
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Choose an account and optionally narrow the report
                            to one fiscal period.
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                            Ledger account
                            <Select
                                value={accountId}
                                onChange={changeAccount}
                                className="w-full bg-background text-sm text-foreground"
                                placeholder="Select ledger account"
                                options={accounts.map((item) => ({
                                    value: String(item.id),
                                    label: `${item.code} · ${item.name}`,
                                }))}
                            />
                        </label>
                        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                            Fiscal period
                            <Select
                                value={periodId}
                                onChange={changePeriod}
                                className="w-full bg-background text-sm text-foreground"
                                placeholder="All periods"
                                options={[
                                    { value: '', label: 'All periods' },
                                    ...fiscalPeriods.map((period) => ({
                                        value: String(period.id),
                                        label: period.name,
                                    })),
                                ]}
                            />
                        </label>
                    </div>
                </section>

                {account && (
                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            {
                                label: 'Total debits',
                                amount: totalDebits,
                                icon: ArrowDownLeft,
                                color: 'text-sky-600 bg-sky-500/10',
                            },
                            {
                                label: 'Total credits',
                                amount: totalCredits,
                                icon: ArrowUpRight,
                                color: 'text-violet-600 bg-violet-500/10',
                            },
                            {
                                label: 'Closing balance',
                                amount: closingBalance,
                                icon: Scale,
                                color: 'text-primary bg-primary/10',
                            },
                        ].map(({ label, amount, icon: Icon, color }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
                            >
                                <div
                                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}
                                >
                                    <Icon className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="truncate text-lg font-semibold tabular-nums">
                                        {formatBDTCurrency(amount, false)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {account ? (
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Ledger activity
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {account.code} · {account.name}
                                </p>
                            </div>
                            <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                {periodId
                                    ? fiscalPeriods.find(
                                          (period) =>
                                              String(period.id) === periodId,
                                      )?.name
                                    : 'All periods'}
                            </span>
                        </div>
                        {entries.length > 0 ? (
                            <div className="max-h-[calc(100vh-430px)] min-h-64 overflow-auto">
                                <table className="w-full min-w-[850px] border-collapse text-sm">
                                    <thead className="sticky top-0 z-10 bg-muted/95 text-xs text-muted-foreground backdrop-blur">
                                        <tr>
                                            {[
                                                ['Date', 'text-left'],
                                                ['Voucher', 'text-left'],
                                                ['Description', 'text-left'],
                                                ['Debit', 'text-right'],
                                                ['Credit', 'text-right'],
                                                ['Balance', 'text-right'],
                                            ].map(([label, align]) => (
                                                <th
                                                    key={label}
                                                    className={`border-b px-4 py-3 font-semibold ${align}`}
                                                >
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/70">
                                        {entries.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                    {formatDate(
                                                        entry.voucher_date,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs font-medium text-primary">
                                                    {entry.voucher_no}
                                                </td>
                                                <td className="max-w-sm truncate px-4 py-3">
                                                    {entry.entry_description ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    {formatBDTCurrency(
                                                        entry.debit,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    {formatBDTCurrency(
                                                        entry.credit,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                                    {formatBDTCurrency(
                                                        entry.running_balance,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ResourceEmptyState
                                title="No ledger activity"
                                description="There are no posted voucher entries for this account and period."
                            />
                        )}
                    </div>
                ) : (
                    <ResourceEmptyState
                        title="No ledger accounts available"
                        description="Create or activate a ledger account before viewing its general ledger."
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}
