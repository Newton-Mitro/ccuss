import FinancialAccountPeopleManagement from '@/components/financial-account-people-management';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        status: string;
        holder?: { name?: string } | null;
        recurring_deposit?: {
            installment_amount?: string | number;
            installment_frequency?: string;
            total_installments?: number;
            paid_installments?: number;
            started_at?: string;
            maturity_date?: string;
            installments?: Array<{
                id: number;
                installment_no: number;
                due_date: string;
                status: string;
                amount_due?: string | number;
            }>;
        } | null;
    };
}
export default function RecurringDepositAccountShow() {
    const { account, customers } = usePage<
        Props & {
            customers: Array<{ id: number; customer_no: string; name: string }>;
        }
    >().props;
    const deposit = account.recurring_deposit;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Recurring Deposits',
            href: route('financial-accounts.recurring.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · Recurring deposit schedule`}
                    action={
                        <Button asChild>
                            <Link
                                href={route(
                                    'financial-accounts.recurring.edit',
                                    account.id,
                                )}
                            >
                                Edit account
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-4">
                    {[
                        ['Installment', deposit?.installment_amount ?? '0'],
                        ['Frequency', deposit?.installment_frequency ?? '-'],
                        [
                            'Progress',
                            `${deposit?.paid_installments ?? 0} / ${deposit?.total_installments ?? 0}`,
                        ],
                        ['Maturity', formatDate(deposit?.maturity_date)],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-card p-4"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 font-semibold tabular-nums">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
                <ResourceTableCard>
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Installment schedule</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">No.</th>
                                <th className="p-3 text-left">Due date</th>
                                <th className="p-3 text-right">Amount due</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(deposit?.installments ?? []).map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3">
                                        {item.installment_no}
                                    </td>
                                    <td className="p-3">
                                        {formatDate(item.due_date)}
                                    </td>
                                    <td className="p-3 text-right">
                                        {Number(item.amount_due ?? 0).toFixed(
                                            4,
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <StatusBadge
                                            tone={
                                                item.status === 'PAID'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {item.status}
                                        </StatusBadge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ResourceTableCard>
                <FinancialAccountPeopleManagement
                    account={account}
                    customers={customers}
                    nomineesEnabled
                />
            </div>
        </CustomAuthLayout>
    );
}
