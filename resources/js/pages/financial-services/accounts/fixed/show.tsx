import FinancialAccountPeopleManagement from '@/components/financial-account-people-management';
import {
    ResourcePageHeader,
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
        balance: string | number;
        status: string;
        holder?: { name?: string } | null;
        fixed_deposit?: {
            principal_amount?: string | number;
            contractual_rate?: string | number;
            term_value?: number;
            term_unit?: string;
            started_at?: string;
            maturity_date?: string;
            maturity_amount?: string | number;
            maturity_instruction?: string;
        } | null;
    };
}
export default function FixedDepositAccountShow() {
    const { account, customers } = usePage<
        Props & {
            customers: Array<{ id: number; customer_no: string; name: string }>;
        }
    >().props;
    const deposit = account.fixed_deposit;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Fixed Deposits',
            href: route('financial-accounts.fixed.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · Fixed deposit contract`}
                    action={
                        <Button asChild>
                            <Link
                                href={route(
                                    'financial-accounts.fixed.edit',
                                    account.id,
                                )}
                            >
                                Edit account
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        ['Principal', deposit?.principal_amount ?? '0'],
                        ['Rate', `${deposit?.contractual_rate ?? '0'}%`],
                        ['Maturity value', deposit?.maturity_amount ?? '0'],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-card p-4"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 text-lg font-semibold tabular-nums">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
                <section className="rounded-lg border bg-card p-5">
                    <h2 className="font-semibold">Term contract</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-4">
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Tenure
                            </dt>
                            <dd>
                                {deposit?.term_value ?? '-'}{' '}
                                {deposit?.term_unit ?? ''}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Started
                            </dt>
                            <dd>{formatDate(deposit?.started_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Maturity
                            </dt>
                            <dd>{formatDate(deposit?.maturity_date)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Instruction
                            </dt>
                            <dd>
                                {deposit?.maturity_instruction?.replaceAll(
                                    '_',
                                    ' ',
                                ) ?? '-'}
                            </dd>
                        </div>
                    </dl>
                    <div className="mt-4">
                        <StatusBadge
                            tone={
                                account.status === 'ACTIVE'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {account.status}
                        </StatusBadge>
                    </div>
                </section>
                <FinancialAccountPeopleManagement
                    account={account}
                    customers={customers}
                    nomineesEnabled
                />
            </div>
        </CustomAuthLayout>
    );
}
