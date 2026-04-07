import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Archive, ListChecks } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Audit } from '../../../types/audit_models';
import { auditEvents } from './data/audit_events';

interface AuditsPageProps extends SharedData {
    audits: {
        data: Audit[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        event?: string;
        user_id?: number;
        page?: number;
        per_page?: number;
    };
}

export default function Index() {
    const { audits, filters, flash } = usePage<AuditsPageProps>().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData } = useForm({
        event: filters.event || '',
        page: filters.page || 1,
        per_page: filters.per_page || 10,
    });

    const handleFilterChange = () => {
        router.get(
            route('audits.index'),
            { event: data.event, page: data.page, per_page: data.per_page },
            { preserveState: true },
        );
    };

    useEffect(() => {
        const timer = setTimeout(handleFilterChange, 300);
        return () => clearTimeout(timer);
    }, [data.event, data.page, data.per_page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit Logs', href: '/audits' },
    ];

    const handleViewBatch = (batchId: string) => {
        router.get(route('audits.batch', batchId), {}, { preserveState: true });
    };

    const handleViewModel = (auditable_type: string, auditable_id: number) => {
        router.get(
            route('audits.model'),
            { type: auditable_type, id: auditable_id },
            { preserveState: true },
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Audit Logs"
                        description="View system audit history for all auditable entities"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Select
                            value={data.event}
                            onChange={(value) => setData('event', value)}
                            options={auditEvents}
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:block md:h-[calc(100vh-300px)]">
                    <table className="w-full min-w-150 border-collapse text-sm">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Time',
                                    'IP Address',
                                    'User Agent',
                                    'Event',
                                    'Model',
                                    'User',
                                    'Actions',
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
                            {audits.data.length > 0 ? (
                                audits.data.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-2">
                                            {formatDateTime(a.created_at)}
                                        </td>
                                        <td className="px-2 py-2 font-medium">
                                            {a.ip_address}
                                        </td>
                                        <td className="px-2 py-2 font-medium">
                                            {a.user_agent}
                                        </td>
                                        <td className="px-2 py-2 font-medium">
                                            {a.event}
                                        </td>
                                        <td className="px-2 py-2">
                                            {a.auditable_type.split('\\').pop()}{' '}
                                            #{a.auditable_id}
                                        </td>
                                        <td className="px-2 py-2">
                                            {a.user?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() =>
                                                                    handleViewModel(
                                                                        a.auditable_type,
                                                                        a.auditable_id,
                                                                    )
                                                                }
                                                                className="text-info"
                                                            >
                                                                <ListChecks className="h-5 w-5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View Model History
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() =>
                                                                    handleViewBatch(
                                                                        a.batch_id,
                                                                    )
                                                                }
                                                                className="text-success"
                                                            >
                                                                <Archive className="h-5 w-5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View Batch
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No audit logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {audits.data.length > 0 ? (
                        audits.data.map((a) => (
                            <div
                                key={a.id}
                                className="rounded border bg-background p-3 shadow-sm"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                        {a.event}
                                    </div>
                                    <div className="text-xs text-info">
                                        {formatDateTime(a.created_at)}
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <div>
                                        <span className="font-semibold">
                                            IP Address:
                                        </span>{' '}
                                        {a.ip_address ?? '-'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            User Agent:
                                        </span>{' '}
                                        {a.user_agent ?? '-'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Model:
                                        </span>{' '}
                                        {a.auditable_type.split('\\').pop()} #
                                        {a.auditable_id}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            User:
                                        </span>{' '}
                                        {a.creator?.name ?? '-'}
                                    </div>
                                </div>
                                <div className="mt-2 flex space-x-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() =>
                                                        handleViewModel(
                                                            a.auditable_type,
                                                            a.auditable_id,
                                                        )
                                                    }
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <ListChecks className="h-5 w-5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                View Model History
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() =>
                                                        handleViewBatch(
                                                            a.batch_id,
                                                        )
                                                    }
                                                    className="text-success"
                                                >
                                                    <Archive className="h-5 w-5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                View Batch
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground">
                            No audit logs found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={audits.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
