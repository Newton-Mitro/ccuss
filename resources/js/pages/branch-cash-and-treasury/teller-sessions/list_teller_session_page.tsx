import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Plus, StopCircle } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem } from '../../../types';

interface TellerSessionPageProps {
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

    const handleCloseSession = (id: number, tellerName: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Close the teller session for "${tellerName}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, close it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    const closingCash = prompt(
                        'Enter closing cash amount:',
                        '0',
                    );
                    if (closingCash === null) return;

                    router.post(
                        route('teller-sessions.close', id),
                        { closing_cash: closingCash },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    `Session for "${tellerName}" closed successfully!`,
                                );
                            },
                            onError: () => {
                                toast.error(
                                    `Failed to close session for "${tellerName}".`,
                                );
                            },
                        },
                    );
                }
            });
    };

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
                    <input
                        type="text"
                        placeholder="Search teller sessions..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    <select
                        value={data.status}
                        onChange={(e) => {
                            setData('status', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 max-w-xs rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border md:h-[calc(100vh-300px)]">
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
                                                                className="text-gray-500"
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
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleCloseSession(
                                                                            s.id,
                                                                            s
                                                                                .teller
                                                                                .name,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    <StopCircle className="h-5 w-5" />
                                                                </button>
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
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        >
                            {[5, 10, 20, 50, 100].map((n) => (
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
                        {sessions.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm ${
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
