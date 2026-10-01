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
        holder?: { name?: string } | null;
        loan_account?: {
            loan_no?: string;
            principal_amount?: string | number;
            disbursed_amount?: string | number;
            contractual_rate?: string | number;
            term_value?: number;
            term_unit?: string;
            maturity_date?: string;
            status?: string;
            schedules?: Array<{
                id: number;
                installment_no: number;
                due_date: string;
                total_due?: string | number;
                total_paid?: string | number;
                status: string;
            }>;
        } | null;
    };
}
export default function LoanAccountShow() {
    const { account, customers } = usePage<
        Props & {
            customers: Array<{ id: number; customer_no: string; name: string }>;
        }
    >().props;
    const loan = account.loan_account;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Accounts', href: route('loan-accounts.index') },
        { title: loan?.loan_no ?? account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={loan?.loan_no ?? account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={loan?.loan_no ?? account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · Loan contract`}
                    action={
                        <Button asChild>
                            <Link
                                href={route('loan-accounts.edit', account.id)}
                            >
                                Edit account
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-4">
                    {[
                        ['Principal', loan?.principal_amount ?? '0'],
                        ['Disbursed', loan?.disbursed_amount ?? '0'],
                        ['Rate', `${loan?.contractual_rate ?? '0'}%`],
                        [
                            'Tenure',
                            `${loan?.term_value ?? '-'} ${loan?.term_unit ?? ''}`,
                        ],
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
                <section className="rounded-lg border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Repayment contract</h2>
                        <StatusBadge
                            tone={
                                loan?.status === 'ACTIVE'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {loan?.status ?? 'APPROVED'}
                        </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Maturity date: {formatDate(loan?.maturity_date)}
                    </p>
                </section>
                <ResourceTableCard>
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Repayment schedule</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">Installment</th>
                                <th className="p-3 text-left">Due date</th>
                                <th className="p-3 text-right">Due</th>
                                <th className="p-3 text-right">Paid</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(loan?.schedules ?? []).map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3">
                                        {item.installment_no}
                                    </td>
                                    <td className="p-3">
                                        {formatDate(item.due_date)}
                                    </td>
                                    <td className="p-3 text-right">
                                        {Number(item.total_due ?? 0).toFixed(4)}
                                    </td>
                                    <td className="p-3 text-right">
                                        {Number(item.total_paid ?? 0).toFixed(
                                            4,
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        {item.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ResourceTableCard>
                <FinancialAccountPeopleManagement
                    account={account}
                    customers={customers}
                    nomineesEnabled={false}
                />
            </div>
        </CustomAuthLayout>
    );
}
