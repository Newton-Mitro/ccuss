import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
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
        { title: 'Teller Sessions', href: '/teller-sessions' },
        { title: 'Session Details', href: '' },
    ];

    useEffect(() => {
        if (!session) toast.error('Teller session not found');
    }, [session]);

    // Inline badge classes
    const getStatusClasses = (status: string) => {
        return status === 'open'
            ? 'bg-success text-success-foreground'
            : status === 'closed'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-gray-100 text-gray-800';
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Session Details" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Teller Session Details"
                    description="View teller session info, cash, and status"
                />
            </div>

            <div className="w-full space-y-6 rounded-md border bg-card p-6 sm:p-8 lg:w-5xl">
                {!session ? (
                    <p className="text-center text-gray-600">
                        No session details available.
                    </p>
                ) : (
                    <div className="space-y-4">
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Teller
                                </p>
                                <p className="font-medium">
                                    {session.teller?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Branch Day
                                </p>
                                <p className="font-medium">
                                    {session.branch_day?.business_date
                                        ? formatDate(
                                              session.branch_day.business_date,
                                          )
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Opening Cash
                                </p>
                                <p className="font-medium">
                                    {formatBDTCurrency(session.opening_cash)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Closing Cash
                                </p>
                                <p className="font-medium">
                                    {session.closing_cash !== null
                                        ? formatBDTCurrency(
                                              session.closing_cash,
                                          )
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Opened At
                                </p>
                                <p className="font-medium">
                                    {formatDateTime(session.opened_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Closed At
                                </p>
                                <p className="font-medium">
                                    {session.closed_at
                                        ? formatDateTime(session.closed_at)
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
