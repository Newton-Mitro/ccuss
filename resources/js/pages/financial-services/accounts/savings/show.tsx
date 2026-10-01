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
        name?: string;
        balance: string | number;
        available_balance: string | number;
        status: string;
        opened_at?: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        saving_account?: { minimum_balance?: string | number } | null;
    };
}
export default function SavingsAccountShow() {
    const { account, customers } = usePage<
        Props & {
            customers: Array<{ id: number; customer_no: string; name: string }>;
        }
    >().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Savings Accounts',
            href: route('financial-accounts.savings.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · ${account.product?.name ?? 'Savings'}`}
                    action={
                        <Button asChild>
                            <Link
                                href={route(
                                    'financial-accounts.savings.edit',
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
                        ['Status', account.status],
                        ['Balance', Number(account.balance).toFixed(4)],
                        [
                            'Available',
                            Number(account.available_balance).toFixed(4),
                        ],
                        [
                            'Minimum',
                            Number(
                                account.saving_account?.minimum_balance ?? 0,
                            ).toFixed(4),
                        ],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-card p-4"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            {label === 'Status' ? (
                                <StatusBadge
                                    tone={
                                        account.status === 'ACTIVE'
                                            ? 'success'
                                            : 'neutral'
                                    }
                                >
                                    {value}
                                </StatusBadge>
                            ) : (
                                <p className="mt-1 font-semibold tabular-nums">
                                    {value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                <section className="rounded-lg border bg-card p-5">
                    <h2 className="font-semibold">Savings rules</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Account holder
                            </dt>
                            <dd>{account.holder?.name ?? '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Opened
                            </dt>
                            <dd>{formatDate(account.opened_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Product
                            </dt>
                            <dd>{account.product?.name ?? '-'}</dd>
                        </div>
                    </dl>
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
