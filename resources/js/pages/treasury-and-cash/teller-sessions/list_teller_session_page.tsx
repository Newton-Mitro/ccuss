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
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { TellerSession } from '../../../types/cash_treasury_module';
import { tellerSessionStatuses } from './data/teller_session_statuses';

interface TellerSessionPageProps extends SharedData {
    sessions: {
        data: TellerSession[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function TellerSessionsIndexPage() {
    const { sessions, filters } = usePage<TellerSessionPageProps>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('teller-sessions.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
    ];

    const StatusBadge = ({ status }: { status: string }) => {
        const map: Record<string, string> = {
            open: 'bg-green-100 text-green-700',
            closed: 'bg-gray-200 text-gray-700',
            suspended: 'bg-red-100 text-red-600',
        };

        return (
            <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                    map[status] || 'bg-muted'
                }`}
            >
                {status}
            </span>
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Sessions" />

            <div className="space-y-4 text-foreground">
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
                            className="bg-card"
                            type="text"
                            placeholder="Search teller sessions..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="w-60">
                        <Select
                            className="bg-card"
                            value={data.status}
                            onChange={(value) => {
                                setData('status', value);
                                setData('page', 1);
                            }}
                            options={tellerSessionStatuses}
                            placeholder="All Status"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Teller',
                                    'Business Date',
                                    'Cash Account',
                                    'Expected',
                                    'Closing',
                                    'Difference',
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
                                        className="border-b transition-colors even:bg-muted hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-1">
                                            {s.teller?.name}
                                        </td>

                                        <td className="px-2 py-1">
                                            {formatDateTime(
                                                s.branch_day?.business_date,
                                            )}
                                        </td>

                                        <td className="px-2 py-1">
                                            {s.cash_account?.name || '—'}
                                        </td>

                                        <td className="px-2 py-1">
                                            {s.expected_balance !== null
                                                ? formatBDTCurrency(
                                                      s.expected_balance,
                                                  )
                                                : '—'}
                                        </td>

                                        <td className="px-2 py-1">
                                            {s.closing_cash !== null
                                                ? formatBDTCurrency(
                                                      s.closing_cash,
                                                  )
                                                : '—'}
                                        </td>

                                        <td className="px-2 py-1">
                                            {s.difference !== null ? (
                                                <span
                                                    className={
                                                        s.difference === 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {formatBDTCurrency(
                                                        s.difference,
                                                    )}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>

                                        <td className="px-2 py-1 capitalize">
                                            <StatusBadge status={s.status} />
                                        </td>

                                        <td className="px-2 py-1">
                                            {formatDateTime(s.opened_at)}
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

                                                    {/* Close */}
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
                                        colSpan={9}
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
                    onPerPageChange={(value: number) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={sessions.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
