import { Head, router, usePage } from '@inertiajs/react';
import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface FiscalYear {
    id: number;
    name: string;
    status: 'OPEN' | 'CLOSED';
    periods_count: number;
    closed_periods_count: number;
    draft_vouchers_count: number;
}

interface Props extends SharedData {
    fiscalYears: FiscalYear[];
    retainedEarningsAccounts: { id: number; code: string; name: string }[];
}

export default function YearEndClosingPage() {
    const { fiscalYears, retainedEarningsAccounts } = usePage<Props>().props;
    const [accountId, setAccountId] = useState('');

    useFlashToastHandler();

    const closeYear = (year: FiscalYear) => {
        if (!accountId || year.status === 'CLOSED' || !canClose(year)) return;
        if (
            !window.confirm(
                `Create the closing voucher and close fiscal year "${year.name}"?`,
            )
        )
            return;

        router.post(
            route('fiscal-years.close-year', year.id),
            {
                retained_earnings_account_id: accountId,
            },
            { preserveScroll: true },
        );
    };

    const canClose = (year: FiscalYear) =>
        year.periods_count > 0 &&
        year.closed_periods_count === year.periods_count &&
        year.draft_vouchers_count === 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Period-End Operations', href: '' },
        { title: 'Year-End Closing', href: '/period-end/year-end-closing' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Year-End Closing" />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Year-End Closing"
                    description="Create the closing voucher and close a fiscal year after all periods are closed."
                />
                <div className="w-full sm:w-96">
                    <Select
                        value={accountId}
                        onChange={setAccountId}
                        placeholder="Select retained earnings account"
                        options={retainedEarningsAccounts.map((account) => ({
                            value: String(account.id),
                            label: `${account.code} - ${account.name}`,
                        }))}
                    />
                </div>
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    'Fiscal Year',
                                    'Periods',
                                    'Closed Periods',
                                    'Draft Vouchers',
                                    'Status',
                                    'Action',
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
                            {fiscalYears.map((year) => {
                                const blocked =
                                    year.status === 'CLOSED' || !canClose(year);
                                return (
                                    <tr
                                        key={year.id}
                                        className="border-b even:bg-muted/50"
                                    >
                                        <td className="px-3 py-2">
                                            {year.name}
                                        </td>
                                        <td className="px-3 py-2">
                                            {year.periods_count}
                                        </td>
                                        <td className="px-3 py-2">
                                            {year.closed_periods_count}
                                        </td>
                                        <td className="px-3 py-2">
                                            {year.draft_vouchers_count}
                                        </td>
                                        <td className="px-3 py-2">
                                            {year.status}
                                        </td>
                                        <td className="px-3 py-2">
                                            <button
                                                type="button"
                                                disabled={blocked || !accountId}
                                                onClick={() => closeYear(year)}
                                                title={
                                                    blocked
                                                        ? 'Close all periods and resolve drafts first'
                                                        : undefined
                                                }
                                                className="text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <CalendarCheck className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
