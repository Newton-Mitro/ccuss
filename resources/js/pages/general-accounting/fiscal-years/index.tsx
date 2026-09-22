import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem } from '@/types';
import type { FiscalYearsPageProps } from '@/types/general-accounting';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function FiscalYearIndex() {
    const { fiscalYears, filters, retainedEarningsAccounts } =
        usePage<FiscalYearsPageProps>().props;
    const [retainedEarningsAccountIds, setRetainedEarningsAccountIds] =
        useState<Record<number, string>>({});

    const getRetainedEarningsAccountId = (fiscalYearId: number) =>
        retainedEarningsAccountIds[fiscalYearId] ?? '';

    const setRetainedEarningsAccountId = (
        fiscalYearId: number,
        accountId: string,
    ) => {
        setRetainedEarningsAccountIds((current) => ({
            ...current,
            [fiscalYearId]: accountId,
        }));
    };

    useFlashToastHandler();

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 18,
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
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Fiscal Year "${code}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('fiscal-years.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Fiscal Years', href: route('fiscal-years.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Fiscal Years" />

            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Fiscal Years"
                    description="Manage fiscal years and close periods with a consistent, theme-aware workflow."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('fiscal-years.create')}>
                                <Plus className="h-4 w-4" />
                                Create Fiscal Year
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        type="text"
                        placeholder="Search fiscal year..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="w-full bg-card sm:w-72"
                    />

                    <span className="text-sm text-muted-foreground">
                        {fiscalYears.data.length} records
                    </span>
                </div>

                {fiscalYears.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No fiscal years found"
                        description="Try adjusting your search or create a new fiscal year."
                    />
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <ResourceTableCard>
                                <table className="w-full border-collapse text-sm">
                                    <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                        <tr>
                                            {[
                                                'Code',
                                                'Start Date',
                                                'End Date',
                                                'Status',
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
                                        {fiscalYears.data.map((fy) => (
                                            <tr
                                                key={fy.id}
                                                className="border-b border-border/80 transition-colors even:bg-muted/40 hover:bg-primary/5"
                                            >
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    {fy.name}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        fy.start_date,
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        fy.end_date,
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {fy.status === 'CLOSED' ? (
                                                        <StatusBadge tone="danger">
                                                            Closed
                                                        </StatusBadge>
                                                    ) : (
                                                        <StatusBadge tone="success">
                                                            Open
                                                        </StatusBadge>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            title="Edit fiscal year"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'fiscal-years.edit',
                                                                    fy.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-4 w-4 text-emerald-600" />
                                                            </Link>
                                                        </Button>

                                                        {!fy.is_closed && (
                                                            <>
                                                                <Select
                                                                    value={getRetainedEarningsAccountId(
                                                                        fy.id,
                                                                    )}
                                                                    onChange={(
                                                                        value,
                                                                    ) =>
                                                                        setRetainedEarningsAccountId(
                                                                            fy.id,
                                                                            value,
                                                                        )
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value: '',
                                                                            label: 'Retained earnings account',
                                                                        },
                                                                        ...retainedEarningsAccounts.map(
                                                                            (
                                                                                account,
                                                                            ) => ({
                                                                                value: String(
                                                                                    account.id,
                                                                                ),
                                                                                label: `${account.code} - ${account.name}`,
                                                                            }),
                                                                        ),
                                                                    ]}
                                                                    className="w-60"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Close fiscal year"
                                                                    disabled={
                                                                        processing ||
                                                                        !getRetainedEarningsAccountId(
                                                                            fy.id,
                                                                        )
                                                                    }
                                                                    onClick={() =>
                                                                        router.post(
                                                                            route(
                                                                                'fiscal-years.close-year',
                                                                                fy.id,
                                                                            ),
                                                                            {
                                                                                retained_earnings_account_id:
                                                                                    getRetainedEarningsAccountId(
                                                                                        fy.id,
                                                                                    ),
                                                                            },
                                                                            {
                                                                                preserveScroll: true,
                                                                                preserveState: true,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <Lock className="h-4 w-4 text-amber-600" />
                                                                </Button>
                                                            </>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    fy.id,
                                                                    fy.name,
                                                                )
                                                            }
                                                            title="Delete fiscal year"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
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
                            {fiscalYears.data.map((fy) => (
                                <div
                                    key={fy.id}
                                    className="space-y-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {fy.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    fy.start_date,
                                                ).toLocaleDateString()}{' '}
                                                -{' '}
                                                {new Date(
                                                    fy.end_date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            tone={
                                                fy.status === 'CLOSED'
                                                    ? 'danger'
                                                    : 'success'
                                            }
                                        >
                                            {fy.status === 'CLOSED'
                                                ? 'Closed'
                                                : 'Open'}
                                        </StatusBadge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'fiscal-years.edit',
                                                    fy.id,
                                                )}
                                            >
                                                <Pencil className="h-4 w-4" />{' '}
                                                Edit
                                            </Link>
                                        </Button>
                                        {!fy.is_closed && (
                                            <Select
                                                value={getRetainedEarningsAccountId(
                                                    fy.id,
                                                )}
                                                onChange={(value) =>
                                                    setRetainedEarningsAccountId(
                                                        fy.id,
                                                        value,
                                                    )
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Retained earnings account',
                                                    },
                                                    ...retainedEarningsAccounts.map(
                                                        (account) => ({
                                                            value: String(
                                                                account.id,
                                                            ),
                                                            label: `${account.code} - ${account.name}`,
                                                        }),
                                                    ),
                                                ]}
                                                className="min-w-52 flex-1"
                                            />
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                processing ||
                                                fy.is_closed ||
                                                !getRetainedEarningsAccountId(
                                                    fy.id,
                                                )
                                            }
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'fiscal-years.close-year',
                                                        fy.id,
                                                    ),
                                                    {
                                                        retained_earnings_account_id:
                                                            getRetainedEarningsAccountId(
                                                                fy.id,
                                                            ),
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                    },
                                                )
                                            }
                                        >
                                            <Lock className="h-4 w-4" /> Close
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={processing}
                                            onClick={() =>
                                                handleDelete(fy.id, fy.name)
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
                    links={fiscalYears.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
