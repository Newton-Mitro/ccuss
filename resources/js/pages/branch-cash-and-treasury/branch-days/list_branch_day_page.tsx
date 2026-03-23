import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { route } from 'ziggy-js';
import Heading from '../../../components/heading';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { formatDate, formatDateTime } from '../../../lib/date_util';

interface BranchDayPageProps {
    branchDays: {
        data: {
            id: number;
            business_date: string;
            opened_at: string | null;
            closed_at: string | null;
            status: 'OPEN' | 'CLOSED';
            branch: { id: number; name: string };
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
    branches: { id: number; name: string }[];
}

export default function Index() {
    const { branchDays, filters, branches } = usePage()
        .props as unknown as BranchDayPageProps;

    const { data, setData, get, put } = useForm({
        search: filters.search || '',
        branch_id: filters.branch_id || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // Trigger search whenever filters change
    const handleSearch = () => {
        get(route('branch-days.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page, data.branch_id, data.status]);

    // Handle branch day close with confirmation
    const handleClose = (id: number, branchName: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Branch day for "${branchName}" will be closed!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, close it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    put(route('branch-days.close', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success('Branch day closed successfully!'),
                        onError: () =>
                            toast.error('Failed to close branch day.'),
                    });
                }
            });
    };

    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'Branch Days', href: route('branch-days.index') },
            ]}
        >
            <Heading title="Branch Days" />

            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Branch Days"
                        description="Manage branch daily operations"
                    />
                    <Link
                        href={route('branch-days.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" /> Add
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 max-w-sm rounded-md border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    <div className="flex gap-2">
                        {/* Branch Filter */}
                        <select
                            value={data.branch_id}
                            onChange={(e) => {
                                setData('branch_id', e.target.value);
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-card px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Branches</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={data.status}
                            onChange={(e) => {
                                setData('status', e.target.value);
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-card px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden h-[calc(100vh-360px)] overflow-auto rounded-md border border-border bg-card md:block">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    '#',
                                    'Branch',
                                    'Business Date',
                                    'Opened At',
                                    'Closed At',
                                    'Status',
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
                            {branchDays.data.length > 0 ? (
                                branchDays.data.map((bd, idx) => (
                                    <tr
                                        key={bd.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{idx + 1}</td>
                                        <td className="px-2 py-1">
                                            {bd.branch?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {formatDate(bd.business_date)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {formatDateTime(bd.opened_at) ??
                                                '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {formatDateTime(bd.closed_at) ??
                                                '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs ${
                                                    bd.status === 'OPEN'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {bd.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'branch-days.show',
                                                                    bd.id,
                                                                )}
                                                                className="text-gray-500"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {bd.status === 'OPEN' && (
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        handleClose(
                                                                            bd.id,
                                                                            bd
                                                                                .branch
                                                                                .name,
                                                                        )
                                                                    }
                                                                    className="text-destructive hover:text-destructive/80"
                                                                >
                                                                    Close
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Close Branch Day
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TooltipProvider>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No branch days found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                    {branchDays.data.map((bd, idx) => (
                        <div
                            key={bd.id}
                            className="rounded-md border border-border bg-card p-3 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        {bd.branch?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {bd.business_date}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        bd.status === 'OPEN'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    {bd.status}
                                </span>
                            </div>
                            <div className="mt-2 flex justify-end gap-2">
                                <Link
                                    href={route('branch-days.show', bd.id)}
                                    className="text-gray-500"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                {bd.status === 'OPEN' && (
                                    <button
                                        onClick={() =>
                                            handleClose(bd.id, bd.branch.name)
                                        }
                                        className="text-destructive hover:text-destructive/80"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <select
                        value={data.per_page}
                        onChange={(e) => {
                            setData('per_page', Number(e.target.value));
                            setData('page', 1);
                        }}
                        className="h-9 rounded-md border bg-card px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-1">
                        {branchDays.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${
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
