// resources/js/Pages/BranchTreasury/TellerSessions/Index.jsx
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface TellerSessionPageProps {
    sessions: {
        data: {
            id: number;
            teller: { id: number; name: string };
            branch_day: { id: number; business_date: string };
            opening_cash: number;
            closing_cash: number | null;
            status: 'OPEN' | 'CLOSED';
            opened_at: string;
            closed_at: string | null;
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { sessions, filters } = usePage()
        .props as unknown as TellerSessionPageProps;

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // Auto-search on filter changes
    const handleSearch = () => {
        get(route('teller-sessions.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleCloseSession = (id: number, tellerName: string) => {
        const closingCash = prompt(`Enter closing cash for ${tellerName}:`);
        if (closingCash !== null) {
            router.post(
                route('teller-sessions.close', id),
                { closing_cash: closingCash },
                {
                    onSuccess: () =>
                        toast.success(`Session for ${tellerName} closed!`),
                    onError: () => toast.error('Failed to close session'),
                },
            );
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Sessions', href: '/teller-sessions' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Sessions" />

            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Teller Sessions"
                        description="Manage branch teller sessions"
                    />
                    <Link
                        href={route('teller-sessions.create')}
                        className="hover:bg-primary/90 flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" /> Open Session
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Teller',
                                    'Branch Date',
                                    'Opening Cash',
                                    'Closing Cash',
                                    'Status',
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
                                        className="even:bg-muted/30 border-b"
                                    >
                                        <td className="px-2 py-1">
                                            {s.teller.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.branch_day.business_date}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.opening_cash.toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.closing_cash?.toFixed(2) ?? '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.status}
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
                                                                className="text-blue-600 hover:text-blue-500"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View / Edit
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Close */}
                                                    {s.status === 'OPEN' && (
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        handleCloseSession(
                                                                            s.id,
                                                                            s
                                                                                .teller
                                                                                .name,
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-500 disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
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
                                        colSpan={6}
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
                            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/80 bg-muted text-muted-foreground'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
