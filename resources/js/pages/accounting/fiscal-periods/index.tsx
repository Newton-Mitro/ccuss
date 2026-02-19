import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface FiscalPeriodPageProps {
    fiscalPeriods: {
        data: {
            id: number;
            period_name: string;
            fiscal_year?: { code: string };
            start_date: string;
            end_date: string;
            is_open: boolean;
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function FiscalPeriodIndex() {
    const { fiscalPeriods, filters } = usePage()
        .props as unknown as FiscalPeriodPageProps;

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('fiscal-periods.index'), {
                preserveScroll: true,
                preserveState: true,
            });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, periodName: string) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: `Fiscal Period "${periodName}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('fiscal-periods.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () =>
                        toast.success(
                            `Fiscal Period "${periodName}" deleted successfully!`,
                        ),
                    onError: () =>
                        toast.error('Failed to delete fiscal period.'),
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Fiscal Periods', href: '/fiscal-periods' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Fiscal Periods" />

            <div className="space-y-4 p-2 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Fiscal Periods"
                        description="Manage fiscal periods"
                    />
                    <Link
                        href={route('fiscal-periods.create')}
                        className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Create Fiscal Period
                        </span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search fiscal period..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    <select
                        value={data.status}
                        onChange={(e) => {
                            setData('status', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none sm:max-w-xs"
                    >
                        <option value="all">All Periods</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Period Name',
                                    'Fiscal Year',
                                    'Start Date',
                                    'End Date',
                                    'Open',
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
                            {fiscalPeriods.data.length > 0 ? (
                                fiscalPeriods.data.map((fp) => (
                                    <tr
                                        key={fp.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            {fp.period_name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {fp.fiscal_year?.code || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {new Date(
                                                fp.start_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1">
                                            {new Date(
                                                fp.end_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1">
                                            {fp.is_open ? 'Yes' : 'No'}
                                        </td>
                                        <td className="flex gap-2 px-2 py-1">
                                            <Link
                                                href={route(
                                                    'fiscal-periods.edit',
                                                    fp.id,
                                                )}
                                                className="text-green-600 hover:text-green-500 dark:text-green-400"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={processing}
                                                onClick={() =>
                                                    handleDelete(
                                                        fp.id,
                                                        fp.period_name,
                                                    )
                                                }
                                                className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No fiscal periods found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination + Records */}
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
                        <span className="ml-2 text-sm text-muted-foreground">
                            Total: {fiscalPeriods.data.length}
                        </span>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {fiscalPeriods.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
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
