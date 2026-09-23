import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Fine = {
    id: number;
    assessed_amount: string | number;
    paid_amount: string | number;
    waived_amount: string | number;
    status: string;
    assessed_at: string;
    financial_account?: { account_no?: string; name?: string };
    default_event?: { rule?: { name?: string } };
};
type Props = {
    fines: { data: Fine[] };
    filters: { page?: number; per_page?: number };
};

export default function FinesIndex() {
    const { fines } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Fines', href: route('account-fines.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Fines" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account Fines"
                    description="Review assessed fines, collect payment, or waive authorized balances."
                />
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {fines.data.map((fine) => (
                            <div
                                key={fine.id}
                                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {fine.financial_account?.account_no ??
                                            '-'}{' '}
                                        ·{' '}
                                        {fine.default_event?.rule?.name ??
                                            'Default fine'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Assessed {fine.assessed_at} · Total{' '}
                                        {fine.assessed_amount} · Paid{' '}
                                        {fine.paid_amount} · Waived{' '}
                                        {fine.waived_amount}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge
                                        tone={
                                            fine.status === 'PAID' ||
                                            fine.status === 'WAIVED'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {fine.status}
                                    </StatusBadge>
                                    {['ASSESSED', 'PARTIALLY_PAID'].includes(
                                        fine.status,
                                    ) && (
                                        <>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={route(
                                                        'financial-transactions.workflow',
                                                        'fine-payment',
                                                    )}
                                                >
                                                    Pay
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            'account-fines.waive',
                                                            fine.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Waive
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
