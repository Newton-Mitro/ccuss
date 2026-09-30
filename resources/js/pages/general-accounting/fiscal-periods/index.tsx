import type { FiscalPeriodsPageProps } from '@/types/general-accounting';
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
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';
import { periodStatuses } from './data/period_statuses';

export default function FiscalPeriodIndex() {
    const { fiscalPeriods, filters } = usePage<FiscalPeriodsPageProps>().props;

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
                                <table className="w-full table-fixed border-collapse text-sm">
                                    <colgroup>
                                        <col className="w-[20%]" />
                                        <col className="w-[20%]" />
                                        <col className="w-[15%]" />
                                        <col className="w-[15%]" />
                                        <col className="w-[12%]" />
                                        <col className="w-[18%]" />
                                    </colgroup>

                                    <thead className="sticky top-0 z-10 bg-muted text-sm text-muted-foreground">
                                        <tr>
                                            <th className="border-b border-border px-4 py-3 text-left font-medium">
                                                Period Name
                                            </th>

                                            <th className="border-b border-border px-4 py-3 text-left font-medium">
                                                Fiscal Year
                                            </th>

                                            <th className="border-b border-border px-4 py-3 text-left font-medium">
                                                Start Date
                                            </th>

                                            <th className="border-b border-border px-4 py-3 text-left font-medium">
                                                End Date
                                            </th>

                                            <th className="border-b border-border px-4 py-3 text-left font-medium">
                                                Status
                                            </th>

                                            <th className="border-b border-border px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {fiscalPeriods.data.map((fp) => (
                                            <tr
                                                key={fp.id}
                                                className="border-b border-border/80 transition-colors last:border-b-0 even:bg-muted/40 hover:bg-primary/5"
                                            >
                                                {/* Period Name */}
                                                <td className="px-4 py-3 align-middle font-medium text-foreground">
                                                    <span
                                                        className="block truncate"
                                                        title={fp.name}
                                                    >
                                                        {fp.name}
                                                    </span>
                                                </td>

                                                {/* Fiscal Year */}
                                                <td className="px-4 py-3 align-middle text-muted-foreground">
                                                    <span
                                                        className="block truncate"
                                                        title={
                                                            fp.fiscal_year
                                                                ?.name || ''
                                                        }
                                                    >
                                                        {fp.fiscal_year?.name ||
                                                            '-'}
                                                    </span>
                                                </td>

                                                {/* Start Date */}
                                                <td className="px-4 py-3 align-middle whitespace-nowrap text-muted-foreground">
                                                    {formatDate(fp.start_date)}
                                                </td>

                                                {/* End Date */}
                                                <td className="px-4 py-3 align-middle whitespace-nowrap text-muted-foreground">
                                                    {formatDate(fp.end_date)}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3 align-middle whitespace-nowrap">
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

                                                {/* Actions */}
                                                <td className="px-4 py-3 align-middle">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Edit */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            title="Edit fiscal period"
                                                            className="shrink-0"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'fiscal-periods.edit',
                                                                    fp.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-4 w-4 text-emerald-600" />
                                                            </Link>
                                                        </Button>

                                                        {/* Close / Reopen */}
                                                        {fp.status ===
                                                        'OPEN' ? (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Close fiscal period"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="shrink-0"
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
                                                            >
                                                                <Lock className="h-4 w-4 text-amber-600" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Reopen fiscal period"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="shrink-0"
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
                                                            >
                                                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        )}

                                                        {/* Delete */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                processing
                                                            }
                                                            title="Delete fiscal period"
                                                            className="shrink-0"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    fp.id,
                                                                    fp.name,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
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
                                                {formatDate(fp.start_date)} -{' '}
                                                {formatDate(fp.end_date)}
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
