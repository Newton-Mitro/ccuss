import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface TellerPageProps {
    tellers: {
        data: {
            id: number;
            code: string;
            name: string;
            max_cash_limit: number;
            max_transaction_limit: number;
            is_active: boolean;
            branch: { id: number; name: string };
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { tellers, filters } = usePage().props as unknown as TellerPageProps;

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get('/tellers', { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        const isDark = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: 'Are you sure?',
            text: `Teller "${name}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('tellers.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        toast.success(`Teller "${name}" deleted successfully!`);
                    },
                    onError: () => {
                        toast.error('Failed to delete the teller.');
                    },
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tellers', href: '/tellers' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Tellers" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Tellers"
                        description="Manage branch tellers and their limits"
                    />
                    <Link
                        href="/tellers/create"
                        className="hover:bg-primary/90 flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Teller
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search tellers..."
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
                                    'Code',
                                    'Name',
                                    'Branch',
                                    'Max Cash Limit',
                                    'Max Transaction Limit',
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
                            {tellers.data.length > 0 ? (
                                tellers.data.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="even:bg-muted/30 border-b"
                                    >
                                        <td className="px-2 py-1">{t.code}</td>
                                        <td className="px-2 py-1">{t.name}</td>
                                        <td className="px-2 py-1">
                                            {t.branch?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {(
                                                Number(t.max_cash_limit) || 0
                                            ).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {(
                                                Number(
                                                    t.max_transaction_limit,
                                                ) || 0
                                            ).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {t.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    {/* Edit */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'tellers.edit',
                                                                    t.id,
                                                                )}
                                                                className="text-green-600 hover:text-green-500 dark:text-green-400"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Delete */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        t.id,
                                                                        t.name,
                                                                    )
                                                                }
                                                                className="hover:text-destructive/80 text-destructive disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Delete
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
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No tellers found.
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
                        {tellers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted/80 bg-muted text-muted-foreground'
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
