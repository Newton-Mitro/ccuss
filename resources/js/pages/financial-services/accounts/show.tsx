import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialAccountShowPageProps } from '@/types/financial-services';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Lock } from 'lucide-react';
import { route } from 'ziggy-js';

export default function FinancialAccountShow() {
    const { account } = usePage<FinancialAccountShowPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Financial Accounts',
            href: route('financial-accounts.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? account.name ?? 'Unassigned'} · ${account.product?.name ?? account.account_type}`}
                    action={
                        <div className="flex gap-2">
                            {account.status === 'PENDING' && (
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                'financial-accounts.activate',
                                                account.id,
                                            ),
                                        )
                                    }
                                >
                                    <Check className="mr-1 h-4 w-4" /> Activate
                                </Button>
                            )}
                            {['ACTIVE', 'DORMANT', 'FROZEN'].includes(
                                account.status,
                            ) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                'financial-accounts.close',
                                                account.id,
                                            ),
                                        )
                                    }
                                >
                                    <Lock className="mr-1 h-4 w-4" /> Close
                                </Button>
                            )}
                        </div>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
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
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {Number(account.balance).toFixed(4)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">
                            Available balance
                        </p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {Number(account.available_balance).toFixed(4)}
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Holders</h2>
                        <div className="mt-3 divide-y">
                            {(account.holders ?? []).map((holder) => (
                                <div
                                    key={holder.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {holder.name ?? holder.customer_no}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {holder.pivot?.role ?? 'HOLDER'}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground tabular-nums">
                                        {holder.pivot?.ownership_percent ?? 0}%
                                    </span>
                                </div>
                            ))}
                            {!account.holders?.length && (
                                <p className="py-2 text-sm text-muted-foreground">
                                    No additional holder records.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Nominees</h2>
                        <div className="mt-3 divide-y">
                            {(account.nominees ?? []).map((nominee) => (
                                <div
                                    key={nominee.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {nominee.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {nominee.relationship}
                                            {nominee.is_primary
                                                ? ' · Primary'
                                                : ''}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground tabular-nums">
                                        {nominee.share_percent ?? 0}%
                                    </span>
                                </div>
                            ))}
                            {!account.nominees?.length && (
                                <p className="py-2 text-sm text-muted-foreground">
                                    No nominee records.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
                {account.share_account && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Membership</h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Membership number
                                </p>
                                <p className="font-medium">
                                    {account.share_account.membership_no ??
                                        'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.share_account.membership_status ??
                                        'PENDING'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Member since
                                </p>
                                <p className="font-medium">
                                    {account.share_account.member_since ??
                                        'Not set'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
                {account.fixed_deposit && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Fixed deposit</h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Principal
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.principal_amount ??
                                        0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Rate
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.contractual_rate ??
                                        0}
                                    %
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Maturity
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.maturity_date ??
                                        'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.status ?? 'PENDING'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
                {account.recurring_deposit && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">
                            Recurring deposit
                        </h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Installment
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit
                                        .installment_amount ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Frequency
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit
                                        .installment_frequency ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Progress
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit
                                        .paid_installments ?? 0}{' '}
                                    /{' '}
                                    {account.recurring_deposit
                                        .total_installments ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit.status ??
                                        'PENDING'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
                {account.loan_account && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Loan</h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Loan number
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.loan_no ??
                                        'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Principal
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.principal_amount ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Maturity
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.maturity_date ??
                                        'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.status ?? 'PENDING'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </CustomAuthLayout>
    );
}
