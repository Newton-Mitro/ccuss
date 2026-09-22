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
            </div>
        </CustomAuthLayout>
    );
}
