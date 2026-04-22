import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { periodStatuses } from './data/period_statuses';

interface FiscalPeriod {
    id: number;
    period_name: string;
    fiscal_year?: { code: string };
    start_date: string;
    end_date: string;
    status: 'open' | 'closed' | 'locked'; // ✅ FIXED
}

interface FiscalPeriodPageProps extends SharedData {
    fiscalPeriods: {
        data: FiscalPeriod[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function FiscalPeriodIndex() {
    const { fiscalPeriods, filters } = usePage<FiscalPeriodPageProps>().props;

    useFlashToastHandler();

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
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Fiscal Period "${periodName}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('fiscal-periods.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Fiscal Periods', href: route('fiscal-periods.index') },
    ];

    // 🔥 Status badge (NEW)
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            open: 'bg-green-100 text-green-700',
            closed: 'bg-gray-100 text-gray-700',
            locked: 'bg-red-100 text-red-700',
        };

        return (
            <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
            >
                {status}
            </span>
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Fiscal Periods" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
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
                    <Input
                        type="text"
                        placeholder="Search fiscal period..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="w-60 bg-card"
                    />

                    <div className="w-60">
                        <Select
                            className="bg-card"
                            value={data.status}
                            onChange={(value) => {
                                setData('status', value);
                                setData('page', 1);
                            }}
                            options={periodStatuses}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Period Name',
                                    'Fiscal Year',
                                    'Start Date',
                                    'End Date',
                                    'Status', // ✅ FIXED
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
                            {fiscalPeriods.data.length > 0 ? (
                                fiscalPeriods.data.map((fp) => (
                                    <tr
                                        key={fp.id}
                                        className="border-b transition-colors even:bg-muted hover:bg-accent/20"
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

                                        {/* 🔥 Status */}
                                        <td className="px-2 py-1">
                                            <StatusBadge status={fp.status} />
                                        </td>

                                        <td className="flex gap-2 px-2 py-1">
                                            <Link
                                                href={route(
                                                    'fiscal-periods.edit',
                                                    fp.id,
                                                )}
                                                className="text-success"
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

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={(value: number) => {
                        setData('per_page', Number(value));
                        setData('page', 1);
                    }}
                    links={fiscalPeriods.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
