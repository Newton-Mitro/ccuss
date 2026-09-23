import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Summary = {
    id: number;
    opening_cash: string | number;
    cash_received: string | number;
    cash_paid: string | number;
    vault_balance: string | number;
    teller_balance: string | number;
    petty_cash_balance: string | number;
    closing_cash: string | number;
    cash_difference: string | number;
    branch_day?: { business_date: string; status: string };
};
type Props = {
    summaries: { data: Summary[] };
    branchDays: { id: number; business_date: string; status: string }[];
};

export default function BranchCashSummariesIndex() {
    const { summaries, branchDays } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        {
            title: 'Branch Cash Summaries',
            href: route('branch-cash-summaries.index'),
        },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Cash Summaries" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Branch Cash Summaries"
                    description="Compare branch cash movements with closing balances and differences."
                />
                <section className="rounded-lg border bg-card p-4">
                    <h2 className="text-sm font-semibold">Calculate summary</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {branchDays.map((day) => (
                            <Button
                                key={day.id}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    router.post(
                                        route(
                                            'branch-cash-summaries.calculate',
                                            day.id,
                                        ),
                                    )
                                }
                            >
                                {day.business_date} · {day.status}
                            </Button>
                        ))}
                    </div>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {summaries.data.map((summary) => (
                            <div
                                key={summary.id}
                                className="grid gap-2 p-4 text-sm sm:grid-cols-4"
                            >
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Business day
                                    </p>
                                    <p className="font-medium">
                                        {summary.branch_day?.business_date ??
                                            '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Movement
                                    </p>
                                    <p>
                                        Received {summary.cash_received} · Paid{' '}
                                        {summary.cash_paid}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Closing cash
                                    </p>
                                    <p>
                                        Vault {summary.vault_balance} · Teller{' '}
                                        {summary.teller_balance} · Petty{' '}
                                        {summary.petty_cash_balance}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Difference
                                    </p>
                                    <StatusBadge
                                        tone={
                                            Number(summary.cash_difference) ===
                                            0
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {summary.cash_difference}
                                    </StatusBadge>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
