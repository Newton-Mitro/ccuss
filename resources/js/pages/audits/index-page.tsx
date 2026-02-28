import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Archive, ListChecks } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { formatDateTime } from '../../lib/date_util';
import { BreadcrumbItem } from '../../types';

type Audit = {
    id: number;
    event: 'CREATED' | 'UPDATED' | 'DELETED';
    auditable_type: string;
    auditable_id: number;
    batch_id: string;
    created_at: string;
    user?: { id: number; name: string };
};

interface AuditsPageProps {
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
    const { audits, filters } = usePage().props as unknown as AuditsPageProps;

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

            <div className="space-y-4 p-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Audit Logs"
                        description="View system audit history for all auditable entities"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <select
                        value={data.event}
                        onChange={(e) => setData('event', e.target.value)}
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <option value="">All Events</option>
                        <option value="CREATED">CREATED</option>
                        <option value="UPDATED">UPDATED</option>
                        <option value="DELETED">DELETED</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full min-w-[600px] border-collapse text-sm">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Time',
                                    'Event',
                                    'Model',
                                    'User',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground"
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
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-2">
                                            {formatDateTime(a.created_at)}
                                        </td>
                                        <td className="px-2 py-2 font-medium">
                                            {a.event}
                                        </td>
                                        <td className="px-2 py-2">
                                            {a.auditable_type.split('\\').pop()}{' '}
                                            #{a.auditable_id}
                                        </td>
                                        <td className="px-2 py-2">
                                            {a.user?.name ?? 'System'}
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
                                                                className="text-green-600 hover:text-green-500 dark:text-green-400"
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
                                    <div className="text-xs text-gray-500">
                                        {formatDateTime(a.created_at)}
                                    </div>
                                </div>
                                <div className="text-sm">
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
                                        {a.user?.name ?? 'System'}
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
                                                    className="text-green-600 hover:text-green-500 dark:text-green-400"
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
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={data.per_page}
                            onChange={(e) => {
                                setData('per_page', Number(e.target.value));
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            {[5, 10, 20, 50, 100, 500].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-muted-foreground">
                            records
                        </span>
                    </div>

                    <div className="flex gap-1">
                        {audits.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() =>
                                    link.url &&
                                    router.get(
                                        link.url,
                                        {},
                                        { preserveState: true },
                                    )
                                }
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
