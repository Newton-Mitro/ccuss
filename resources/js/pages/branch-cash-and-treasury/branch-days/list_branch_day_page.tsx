import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Plus, StopCircle } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import Heading from '../../../components/heading';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { formatDate, formatDateTime } from '../../../lib/date_util';
import { SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { branchDayStatuses } from './data/branch_day_status';

interface BranchDayPageProps extends SharedData {
    branchDays: {
        data: {
            id: number;
            business_date: string;
            opened_at: string | null;
            closed_at: string | null;
            status: 'open' | 'closed';
            branch: Branch;
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
    branches: Branch[];
}

export default function Index() {
    const { branchDays, filters, branches } =
        usePage<BranchDayPageProps>().props;

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
                        <Plus className="h-4 w-4" /> Open Branch Day
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Branch Filter */}
                        <div className="w-48">
                            <Select
                                value={data.branch_id}
                                onChange={(value) => {
                                    setData('branch_id', value);
                                    setData('page', 1);
                                }}
                                options={branches.map((branch) => ({
                                    value: branch.id.toString(),
                                    label: branch.name,
                                }))}
                            ></Select>
                        </div>
                        {/* Status Filter */}
                        <div className="w-48">
                            <Select
                                value={data.branch_id}
                                onChange={(value) => {
                                    setData('status', value);
                                    setData('page', 1);
                                }}
                                options={branchDayStatuses.map(
                                    (branchDayStats) => ({
                                        value: branchDayStats.value,
                                        label: branchDayStats.label,
                                    }),
                                )}
                            ></Select>
                        </div>
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
                                                    bd.status === 'open'
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
                                                                className="text-info"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {bd.status === 'open' && (
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'branch-days.show',
                                                                        bd.id,
                                                                    )}
                                                                    className="text-info"
                                                                >
                                                                    <StopCircle className="h-5 w-5 text-destructive" />
                                                                </Link>
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
                    {branchDays.data.map((bd) => (
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
                                        bd.status === 'open'
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
                                    className="text-info"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                {bd.status === 'open' && (
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

                <DataTablePagination
                    links={branchDays.links}
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', Number(value));
                        setData('page', 1);
                    }}
                />
            </div>
        </CustomAuthLayout>
    );
}
