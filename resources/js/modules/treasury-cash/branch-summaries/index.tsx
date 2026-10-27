import HeadingSmall from '@/components/heading-small';
import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { Props } from '@/modules/treasury-cash/types/branch-summaries/index.types';
import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

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
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Branch Cash Summaries"
                        description="Compare branch cash movements with closing balances and differences."
                    />
                </div>
                <section className="rounded-lg border bg-card p-4">
                    <h2 className="text-sm font-semibold">Calculate summary</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {branchDays.map((day) => (
                            <Button
                                key={day.id}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    appSwal
                                        .fire({
                                            title: 'Calculate summary?',
                                            text: `Generate the cash summary for ${formatDate(day.business_date)}?`,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText:
                                                'Calculate summary',
                                            cancelButtonText: 'Cancel',
                                        })
                                        .then((result) => {
                                            if (!result.isConfirmed) return;

                                            router.post(
                                                route(
                                                    'branch-cash-summaries.calculate',
                                                    day.id,
                                                ),
                                            );
                                        });
                                }}
                            >
                                {formatDate(day.business_date)} · {day.status}
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
                                        {formatDate(
                                            summary.branch_day?.business_date,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Movement
                                    </p>
                                    <p>
                                        Received{' '}
                                        {formatBDTCurrency(
                                            summary.cash_received,
                                            false,
                                        )}{' '}
                                        · Paid{' '}
                                        {formatBDTCurrency(
                                            summary.cash_paid,
                                            false,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Closing cash
                                    </p>
                                    <p>
                                        Vault{' '}
                                        {formatBDTCurrency(
                                            summary.vault_balance,
                                            false,
                                        )}{' '}
                                        · Teller{' '}
                                        {formatBDTCurrency(
                                            summary.teller_balance,
                                            false,
                                        )}{' '}
                                        · Petty{' '}
                                        {formatBDTCurrency(
                                            summary.petty_cash_balance,
                                            false,
                                        )}
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
                                        {formatBDTCurrency(
                                            summary.cash_difference,
                                            false,
                                        )}
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
