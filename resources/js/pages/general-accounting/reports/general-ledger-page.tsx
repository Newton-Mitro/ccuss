import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import ReportExportActions from '../../../components/report-export-actions';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem, SharedData } from '../../../types';

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
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <HeadingSmall
                        title="General Ledger"
                        description={
                            account
                                ? `${account.code} - ${account.name}`
                                : 'Select an account to view transactions'
                        }
                    />
                    <div className="flex w-full flex-col gap-2 sm:w-120 sm:flex-row">
                        <Select
                            value={accountId}
                            onChange={changeAccount}
                            className="w-full sm:flex-1"
                            options={accounts.map((item) => ({
                                value: String(item.id),
                                label: `${item.code} - ${item.name}`,
                            }))}
                        />
                        <Select
                            value={periodId}
                            onChange={changePeriod}
                            className="w-full sm:flex-1"
                            placeholder="All periods"
                            options={[
                                { value: '', label: 'All periods' },
                                ...fiscalPeriods.map((period) => ({
                                    value: String(period.id),
                                    label: period.name,
                                })),
                            ]}
                        />
                    </div>
                </div>
                <div className="overflow-auto rounded-md border">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    'Date',
                                    'Voucher',
                                    'Description',
                                    'Debit',
                                    'Credit',
                                    'Balance',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="border-b px-3 py-2 text-left font-medium"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? (
                                entries.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        className="border-b even:bg-muted/50"
                                    >
                                        <td className="px-3 py-2">
                                            {new Date(
                                                entry.voucher_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2">
                                            {entry.voucher_no}
                                        </td>
                                        <td className="px-3 py-2">
                                            {entry.entry_description || '-'}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatBDTCurrency(entry.debit)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatBDTCurrency(entry.credit)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatBDTCurrency(
                                                entry.running_balance,
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-8 text-center text-muted-foreground"
                                    >
                                        No ledger entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
