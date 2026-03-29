import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Plus, StopCircle } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { tellerSessionStatuses } from './data/teller_session_statuses';

interface TellerSessionPageProps extends SharedData {
    sessions: {
        data: {
            id: number;
            opening_cash: number;
            closing_cash: number | null;
            status: 'open' | 'closed';
            opened_at: string;
            closed_at: string | null;
            teller: { id: number; name: string };
            branch_day: { id: number; business_date: string };
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function TellerSessionsIndexPage() {
    const { sessions, filters } = usePage()
        .props as unknown as TellerSessionPageProps;

    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // 🔹 Fetch sessions on filters/search change
    const handleSearch = () => {
        get(route('teller-sessions.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Sessions', href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Sessions" />

            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Teller Sessions"
                        description="Manage teller daily cash sessions"
                    />
                    <Link
                        href={route('teller-sessions.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Open Session
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search teller sessions..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="w-48">
                        <Select
                            value={data.status}
                            onChange={(value) => {
                                setData('status', value);
                                setData('page', 1);
                            }}
                            options={tellerSessionStatuses}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Teller',
                                    'Business Date',
                                    'Opening Cash',
                                    'Closing Cash',
                                    'Status',
                                    'Opened At',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.data.length > 0 ? (
                                sessions.data.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            {s.teller.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.branch_day.business_date}
                                        </td>
                                        <td className="px-2 py-1">
                                            {Number(s.opening_cash).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.closing_cash !== null
                                                ? Number(
                                                      s.closing_cash,
                                                  ).toFixed(2)
                                                : '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.status}
                                        </td>
                                        <td className="px-2 py-1">
                                            {new Date(
                                                s.opened_at,
                                            ).toLocaleString()}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    {/* View */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'teller-sessions.show',
                                                                    s.id,
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

                                                    {/* Close Session */}
                                                    {s.status === 'open' && (
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'teller-sessions.close-page',
                                                                        s.id,
                                                                    )}
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    <StopCircle className="h-5 w-5" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Close Session
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
                                        No sessions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={sessions.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
