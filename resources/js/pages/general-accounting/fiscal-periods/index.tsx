import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Lock, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge as ThemeStatusBadge,
} from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { periodStatuses } from './data/period_statuses';

interface FiscalPeriod {
    id: number;
    name: string;
    fiscal_year?: { name: string };
    start_date: string;
    end_date: string;
    status: 'OPEN' | 'CLOSED';
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
        per_page: Number(filters.per_page) || 18,
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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Fiscal Periods" />

            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Fiscal Periods"
                    description="Manage fiscal periods and their open or closed status."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('fiscal-periods.create')}>
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Create Fiscal Period
                                </span>
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        type="text"
                        placeholder="Search fiscal period..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="w-full bg-card sm:w-72"
                    />

                    <div className="w-full sm:w-60">
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
                    <span className="text-sm text-muted-foreground">
                        {fiscalPeriods.data.length} records
                    </span>
                </div>

                {fiscalPeriods.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No fiscal periods found
                        </p>
                        <p className="text-xs">
                            Try adjusting your filters or create a new fiscal
                            period
                        </p>
                        <Link
                            href={route('fiscal-periods.create')}
                            className="mt-4 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Create Fiscal Period
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <ResourceTableCard>
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
                                                    className="border-b border-border px-4 py-3 font-medium"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {fiscalPeriods.data.map((fp) => (
                                            <tr
                                                key={fp.id}
                                                className="border-b border-border/80 transition-colors even:bg-muted/40 hover:bg-primary/5"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {fp.name}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {fp.fiscal_year?.name ||
                                                        '-'}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        fp.start_date,
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        fp.end_date,
                                                    ).toLocaleDateString()}
                                                </td>

                                                {/* 🔥 Status */}
                                                <td className="px-4 py-3">
                                                    <ThemeStatusBadge
                                                        tone={
                                                            fp.status === 'OPEN'
                                                                ? 'success'
                                                                : 'neutral'
                                                        }
                                                    >
                                                        {fp.status}
                                                    </ThemeStatusBadge>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            href={route(
                                                                'fiscal-periods.edit',
                                                                fp.id,
                                                            )}
                                                            className="text-success"
                                                            title="Edit fiscal period"
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </Link>

                                                        {fp.status ===
                                                        'OPEN' ? (
                                                            <button
                                                                type="button"
                                                                title="Close fiscal period"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    router.post(
                                                                        route(
                                                                            'fiscal-periods.close',
                                                                            fp.id,
                                                                        ),
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                            preserveState: true,
                                                                        },
                                                                    )
                                                                }
                                                                className="text-amber-600 hover:text-amber-700 disabled:opacity-40"
                                                            >
                                                                <Lock className="h-5 w-5" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                title="Reopen fiscal period"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    router.post(
                                                                        route(
                                                                            'fiscal-periods.reopen',
                                                                            fp.id,
                                                                        ),
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                            preserveState: true,
                                                                        },
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-700 disabled:opacity-40"
                                                            >
                                                                <RotateCcw className="h-5 w-5" />
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    fp.id,
                                                                    fp.name,
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                                                            title="Delete fiscal period"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ResourceTableCard>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {fiscalPeriods.data.map((fp) => (
                                <div
                                    key={fp.id}
                                    className="space-y-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {fp.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {fp.fiscal_year?.name ||
                                                    'No fiscal year'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    fp.start_date,
                                                ).toLocaleDateString()}{' '}
                                                -{' '}
                                                {new Date(
                                                    fp.end_date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ThemeStatusBadge
                                            tone={
                                                fp.status === 'OPEN'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {fp.status}
                                        </ThemeStatusBadge>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'fiscal-periods.edit',
                                                    fp.id,
                                                )}
                                            >
                                                <Pencil className="h-4 w-4" />{' '}
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={processing}
                                            onClick={() =>
                                                fp.status === 'OPEN'
                                                    ? router.post(
                                                          route(
                                                              'fiscal-periods.close',
                                                              fp.id,
                                                          ),
                                                          {},
                                                          {
                                                              preserveScroll: true,
                                                              preserveState: true,
                                                          },
                                                      )
                                                    : router.post(
                                                          route(
                                                              'fiscal-periods.reopen',
                                                              fp.id,
                                                          ),
                                                          {},
                                                          {
                                                              preserveScroll: true,
                                                              preserveState: true,
                                                          },
                                                      )
                                            }
                                        >
                                            {fp.status === 'OPEN' ? (
                                                <Lock className="h-4 w-4" />
                                            ) : (
                                                <RotateCcw className="h-4 w-4" />
                                            )}
                                            {fp.status === 'OPEN'
                                                ? 'Close'
                                                : 'Reopen'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={processing}
                                            onClick={() =>
                                                handleDelete(fp.id, fp.name)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />{' '}
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

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
