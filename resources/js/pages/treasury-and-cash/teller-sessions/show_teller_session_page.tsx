import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import { BorderInfoBox } from '../../../components/border-info-box';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDate, formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { TellerSession } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    session: TellerSession | null;
}

export default function ShowTellerSessionPage({ session }: Props) {
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Session Details', href: '' },
    ];

    useEffect(() => {
        if (!session) toast.error('Teller session not found');
    }, [session]);

    // 🔥 Enhanced status handling
    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-success text-success-foreground';
            case 'closed':
                return 'bg-destructive text-destructive-foreground';
            case 'suspended':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Session Details" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Teller Session Details"
                    description="View teller session info, cash reconciliation, and status"
                />
            </div>

            <div className="w-full space-y-6 rounded-md border bg-card p-6 sm:p-8">
                {!session ? (
                    <p className="text-center text-gray-600">
                        No session details available.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Session Info
                            </h3>
                            <span
                                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
                                    session.status,
                                )}`}
                            >
                                {session.status}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Teller */}
                            <BorderInfoBox
                                label="Teller"
                                value={session.teller?.name || '—'}
                                className="bg-muted/30"
                            />

                            {/* Branch */}
                            <BorderInfoBox
                                label="Branch"
                                value={session.branch?.name || '—'}
                                className="bg-muted/30"
                            />

                            {/* Branch Day */}
                            <BorderInfoBox
                                label="Branch Day"
                                value={
                                    session.branch_day?.business_date
                                        ? formatDate(
                                              session.branch_day.business_date,
                                          )
                                        : '—'
                                }
                                className="bg-muted/30"
                            />

                            {/* Cash Account */}
                            <BorderInfoBox
                                label="Subledger Account"
                                value={`${session.subledger_account?.name} (${session.subledger_account?.account_number})`}
                                className="bg-muted/30"
                            />

                            {/* Expected Balance */}
                            <BorderInfoBox
                                label="Expected Balance"
                                value={
                                    session.expected_balance != null
                                        ? formatBDTCurrency(
                                              session.expected_balance,
                                          )
                                        : '—'
                                }
                                className="bg-muted/30"
                            />

                            {/* Closing Cash */}
                            <BorderInfoBox
                                label="Closing Cash"
                                value={
                                    session.closing_cash != null
                                        ? formatBDTCurrency(
                                              session.closing_cash,
                                          )
                                        : '—'
                                }
                                className="bg-muted/30"
                            />

                            {/* Difference */}
                            <BorderInfoBox
                                label="Difference"
                                value={
                                    session.difference != null
                                        ? formatBDTCurrency(session.difference)
                                        : '—'
                                }
                                className={`bg-muted/30 font-medium ${
                                    session.difference &&
                                    session.difference !== 0
                                        ? 'text-destructive'
                                        : ''
                                }`}
                            />

                            {/* Opened At */}
                            <BorderInfoBox
                                label="Opened At"
                                value={formatDateTime(session.opened_at)}
                                className="bg-muted/30"
                            />

                            {/* Closed At */}
                            <BorderInfoBox
                                label="Closed At"
                                value={
                                    session.closed_at
                                        ? formatDateTime(session.closed_at)
                                        : '—'
                                }
                                className="bg-muted/30"
                            />
                        </div>

                        {/* Remarks */}
                        {session.remarks && (
                            <BorderInfoBox
                                label="Remarks"
                                value={session.remarks}
                                className="bg-muted/30"
                            />
                        )}
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
