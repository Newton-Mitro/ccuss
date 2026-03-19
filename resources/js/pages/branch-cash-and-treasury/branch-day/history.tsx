import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';
import { BranchDay } from '../../../types/cash_treasury_module';

interface Props {
    history: BranchDay[];
    branch_id: number;
    from_date?: string;
    to_date?: string;
}

export default function BranchDayHistoryPage({
    history: initialHistory,
    branch_id,
    from_date,
    to_date,
}: Props) {
    const { flash } = usePage().props;

    const { data, setData } = useForm({
        from_date: from_date || '',
        to_date: to_date || '',
    });

    const history = initialHistory || [];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const fetchHistory = () => {
        router.get(
            '/branch-day/history',
            {
                branch_id,
                from_date: data.from_date || undefined,
                to_date: data.to_date || undefined,
            },
            {
                preserveState: true,
                onError: (errors) => toast.error(JSON.stringify(errors)),
            },
        );
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const bgClass =
            status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : status === 'CLOSED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800';
        return (
            <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${bgClass}`}
            >
                {status}
            </span>
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branch Day', href: '/branch-day/status' },
        { title: 'History', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Day History" />
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Branch Day History"
                    description="View past branch days for the branch."
                />
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border bg-card p-4 sm:p-6">
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500">From Date</label>
                    <AppDatePicker
                        value={data.from_date}
                        onChange={(val) => setData('from_date', val)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500">To Date</label>
                    <AppDatePicker
                        value={data.to_date}
                        onChange={(val) => setData('to_date', val)}
                    />
                </div>
                <Button
                    onClick={fetchHistory}
                    className="hover:bg-primary/90 bg-primary"
                >
                    Apply Filter
                </Button>
            </div>

            {/* ===================== */}
            {/* Desktop Table */}
            {/* ===================== */}
            <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border md:block">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-muted">
                        <tr>
                            {[
                                'Business Date',
                                'Status',
                                'Opened At',
                                'Closed At',
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((bd) => (
                            <tr
                                key={bd.id}
                                className="even:bg-muted/30 border-b hover:opacity-80"
                            >
                                <td className="px-2 py-1">
                                    {formatDateTime(bd.business_date)}
                                </td>
                                <td className="px-2 py-1">
                                    <StatusBadge status={bd.status} />
                                </td>
                                <td className="px-2 py-1">
                                    {bd.opened_at
                                        ? formatDateTime(bd.opened_at)
                                        : '—'}
                                </td>
                                <td className="px-2 py-1">
                                    {bd.closed_at
                                        ? formatDateTime(bd.closed_at)
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===================== */}
            {/* Mobile Cards */}
            {/* ===================== */}
            <div className="space-y-3 md:hidden">
                {history.map((bd) => (
                    <div
                        key={bd.id}
                        className="space-y-2 rounded-md border bg-card p-3"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-medium">
                                    {formatDateTime(bd.business_date)}
                                </p>
                                <StatusBadge status={bd.status} />
                            </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <p>
                                Opened At:{' '}
                                {bd.opened_at
                                    ? formatDateTime(bd.opened_at)
                                    : '—'}
                            </p>
                            <p>
                                Closed At:{' '}
                                {bd.closed_at
                                    ? formatDateTime(bd.closed_at)
                                    : '—'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </CustomAuthLayout>
    );
}
