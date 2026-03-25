import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate, formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';
import { BranchDay } from '../../../types/cash_treasury_module';

interface Props {
    branch_day: BranchDay | null;
}

export default function BranchDayStatusPage({ branch_day }: Props) {
    const { flash } = usePage().props;

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
                onError: (errors) => toast.error(JSON.stringify(errors)),
                preserveState: true,
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branch Days', href: route('branch-days.index') },
        { title: 'Branch Daty Status', href: '' },
    ];

    const StatusBadge = ({ status }: { status: string }) => {
        const bgClass =
            status === 'open'
                ? 'bg-green-100 text-green-800'
                : status === 'closed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800';
        return (
            <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${bgClass}`}
            >
                {status}
            </span>
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Day Status" />
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Branch Day Status"
                    description="View and manage current branch day."
                />
            </div>

            <div className="w-full space-y-6 rounded-md border bg-card p-6 sm:p-8 lg:w-5xl">
                {!branch_day ? (
                    <div className="space-y-4 text-center">
                        <p className="text-gray-600">
                            No branch day opened yet.
                        </p>
                        <Link
                            href={`/branch-cash/branch-day/open`}
                            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                        >
                            Open Branch Day
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-info">
                                Branch Day Info
                            </h3>
                            {StatusBadge({ status: branch_day.status })}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Business Date
                                </p>
                                <p className="font-medium">
                                    {formatDate(branch_day.business_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Opened At
                                </p>
                                <p className="font-medium">
                                    {branch_day.opened_at
                                        ? formatDateTime(branch_day.opened_at)
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-card-foreground">
                                    Closed At
                                </p>
                                <p className="font-medium">
                                    {branch_day.closed_at
                                        ? formatDateTime(branch_day.closed_at)
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                            {branch_day.status === 'open' && (
                                <Button
                                    onClick={handleClose}
                                    className="bg-destructive hover:bg-destructive/80"
                                >
                                    Close Branch Day
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
