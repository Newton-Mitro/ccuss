import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { FiscalYear } from '../../../types/accounting';

interface FiscalYearPageProps {
    fiscalYears: {
        data: FiscalYear[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function FiscalYearIndex() {
    const { fiscalYears, filters } = usePage()
        .props as unknown as FiscalYearPageProps;

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

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('fiscal-years.index'), {
                preserveScroll: true,
                preserveState: true,
            });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleDelete = (id: number, code: string) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: `Fiscal Year "${code}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('fiscal-years.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () =>
                        toast.success(
                            `Fiscal Year "${code}" deleted successfully!`,
                        ),
                    onError: () => toast.error('Failed to delete fiscal year.'),
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Fiscal Years', href: '/fiscal-years' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Fiscal Years" />

            <div className="space-y-4 p-2 text-foreground">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Fiscal Years"
                        description="Manage fiscal years"
                    />
                    <Link
                        href={route('fiscal-years.create')}
                        className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Create Fiscal Year
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search fiscal year..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Code',
                                    'Start Date',
                                    'End Date',
                                    'Active',
                                    'Closed',
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
                            {fiscalYears.data.length > 0 ? (
                                fiscalYears.data.map((fy) => (
                                    <tr
                                        key={fy.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{fy.code}</td>
                                        <td className="px-2 py-1">
                                            {new Date(
                                                fy.start_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1">
                                            {new Date(
                                                fy.end_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1">
                                            {fy.is_active ? 'Yes' : 'No'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {fy.is_closed ? 'Yes' : 'No'}
                                        </td>
                                        <td className="flex gap-2 px-2 py-1">
                                            <Link
                                                href={route(
                                                    'fiscal-years.edit',
                                                    fy.id,
                                                )}
                                                className="text-green-600 hover:text-green-500 dark:text-green-400"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={processing}
                                                onClick={() =>
                                                    handleDelete(fy.id, fy.code)
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
                                        No fiscal years found.
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
                            Total: {fiscalYears.data.length}
                        </span>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {fiscalYears.links.map((link, i) => (
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
