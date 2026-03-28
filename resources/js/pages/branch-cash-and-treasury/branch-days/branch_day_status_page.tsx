import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate, formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { BranchDay, TellerSession } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    branch_day: BranchDay | null;
    sessions: TellerSession[];
}

export default function BranchDayStatusPage({
    branch_day,
    sessions,
    flash,
}: Props) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleClose = () => {
        if (!branch_day) return;

        router.post(
            route('branch-days.close'),
            { branch_day_id: branch_day.id },
            {
                onSuccess: () =>
                    toast.success('Branch day closed successfully'),
                onError: () => toast.error('Failed to close branch day'),
                preserveState: true,
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branch Days', href: route('branch-days.index') },
        { title: 'Branch Day Status', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Day Status" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Branch Day Status"
                    description="Operational overview of the current branch day."
                />
            </div>

            <div className="space-y-6">
                {!branch_day ? (
                    <div className="rounded-md border bg-card p-8 text-center">
                        <p className="mb-4 text-muted-foreground">
                            No active branch day found.
                        </p>
                        <Link
                            href={route('branch-days.create')}
                            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            Open Branch Day
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Branch Day Info */}
                        <div className="rounded-md border bg-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Branch Day Info
                                </h3>
                                <StatusBadge status={branch_day.status} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Info
                                    label="Branch"
                                    value={branch_day.branch?.name}
                                />
                                <Info
                                    label="Business Date"
                                    value={formatDate(branch_day.business_date)}
                                />
                                <Info
                                    label="Opened At"
                                    value={
                                        branch_day.opened_at
                                            ? formatDateTime(
                                                  branch_day.opened_at,
                                              )
                                            : '—'
                                    }
                                />
                                <Info
                                    label="Closed At"
                                    value={
                                        branch_day.closed_at
                                            ? formatDateTime(
                                                  branch_day.closed_at,
                                              )
                                            : '—'
                                    }
                                />
                                <Info
                                    label="Opened By"
                                    value={branch_day.opened_by?.name}
                                />
                                <Info
                                    label="Closed By"
                                    value={branch_day.closed_by?.name || '—'}
                                />
                            </div>

                            {branch_day.status === 'open' && (
                                <div className="mt-6">
                                    <Button
                                        onClick={handleClose}
                                        className="bg-destructive hover:bg-destructive/80"
                                    >
                                        Close Branch Day
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Teller Sessions */}
                        <div className="rounded-md border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold">
                                Teller Sessions
                            </h3>

                            {sessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No teller sessions found.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left">
                                                    Teller
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Status
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Opened At
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Closed At
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessions.map((session) => (
                                                <tr
                                                    key={session.id}
                                                    className="border-b"
                                                >
                                                    <td className="px-3 py-2">
                                                        {session.teller?.name}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <StatusBadge
                                                            status={
                                                                session.status
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {session.opened_at
                                                            ? formatDateTime(
                                                                  session.opened_at,
                                                              )
                                                            : '—'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {session.closed_at
                                                            ? formatDateTime(
                                                                  session.closed_at,
                                                              )
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        open: 'bg-green-100 text-green-800',
        closed: 'bg-red-100 text-red-800',
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-800'}`}
        >
            {status.toUpperCase()}
        </span>
    );
};

/**
 * Small reusable info block
 */
function Info({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value || '—'}</p>
        </div>
    );
}
