import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type Declaration = {
    id: number;
    declaration_no: string;
    declaration_date: string;
    dividend_rate: string | number;
    total_basis_amount: string | number;
    total_dividend_amount: string | number;
    status: string;
    note?: string;
    allocations?: {
        id: number;
        basis_amount: string | number;
        dividend_amount: string | number;
        status: string;
    }[];
};
type Props = {
    declarations: {
        data: Declaration[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        current_page: number;
        last_page: number;
    };
    fiscalYears: {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
    }[];
    filters: { search?: string; page?: number; per_page?: number };
};

export default function DividendsIndex() {
    const { declarations, fiscalYears, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [perPage, setPerPage] = useState(Number(filters.per_page) || 20);
    const [page, setPage] = useState(
        Number(filters.page) || declarations.current_page,
    );
    const { data, setData, post, processing } = useForm({
        fiscal_year_id: '',
        dividend_rate: '0',
        declaration_date: new Date().toISOString().slice(0, 10),
        note: '',
    });

    useEffect(() => {
        const delay = setTimeout(
            () =>
                router.get(
                    route('dividends.index'),
                    {
                        search: search || undefined,
                        per_page: perPage,
                        page,
                    },
                    {
                        preserveState: true,
                        replace: true,
                    },
                ),
            400,
        );

        return () => clearTimeout(delay);
    }, [search, perPage, page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Dividends', href: route('dividends.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Share Dividends" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Share Dividends"
                    description="Declare, calculate, review, and approve member dividends."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="grid gap-3 sm:grid-cols-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('dividends.store'));
                        }}
                    >
                        <div>
                            <Label>Fiscal year</Label>
                            <Select
                                className="h-9"
                                value={data.fiscal_year_id}
                                onChange={(value) =>
                                    setData('fiscal_year_id', value)
                                }
                                placeholder="Select fiscal year"
                                options={[
                                    {
                                        value: '',
                                        label: 'Select fiscal year',
                                    },
                                    ...fiscalYears.map((year) => ({
                                        value: String(year.id),
                                        label: `${year.name} · ${formatDate(year.start_date)} to ${formatDate(year.end_date)}`,
                                    })),
                                ]}
                            />
                        </div>
                        <div>
                            <Label>Dividend rate %</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.dividend_rate}
                                onChange={(event) =>
                                    setData('dividend_rate', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Declaration date</Label>
                            <AppDatePicker
                                value={data.declaration_date}
                                onChange={(value) =>
                                    setData('declaration_date', value)
                                }
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <Label>Note</Label>
                            <Input
                                value={data.note}
                                onChange={(event) =>
                                    setData('note', event.target.value)
                                }
                                placeholder="Optional declaration note"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <Button type="submit" disabled={processing}>
                                Create declaration
                            </Button>
                        </div>
                    </form>
                </section>
                <Input
                    className="w-full bg-card sm:w-96"
                    placeholder="Search declaration, status, or note..."
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                />
                <ResourceTableCard className="h-[calc(100vh-400px)] md:h-[calc(100vh-380px)]">
                    <div className="h-full overflow-auto">
                        <table
                            className="w-full text-sm"
                            style={{ minWidth: 900 }}
                        >
                            <thead className="sticky top-0 z-10 bg-muted">
                                <tr>
                                    <th className="p-3 text-left">
                                        Declaration
                                    </th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-right">Rate</th>
                                    <th className="p-3 text-right">Basis</th>
                                    <th className="p-3 text-right">Dividend</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {declarations.data.map((declaration) => (
                                    <tr
                                        key={declaration.id}
                                        className="border-t"
                                    >
                                        <td className="p-3">
                                            <p className="font-medium">
                                                {declaration.declaration_no}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {declaration.note ?? '-'}
                                            </p>
                                        </td>
                                        <td className="p-3">
                                            {formatDate(
                                                declaration.declaration_date,
                                            )}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {declaration.dividend_rate}%
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {declaration.total_basis_amount}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {declaration.total_dividend_amount}
                                        </td>
                                        <td className="p-3 text-center">
                                            <StatusBadge
                                                tone={
                                                    declaration.status ===
                                                    'APPROVED'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {declaration.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="p-3 text-right">
                                            {declaration.status === 'DRAFT' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                route(
                                                                    'dividends.calculate',
                                                                    declaration.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Calculate
                                                    </Button>
                                                    {(declaration.allocations
                                                        ?.length ?? 0) > 0 && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                appSwal
                                                                    .fire({
                                                                        title: 'Approve this declaration?',
                                                                        text: 'This will approve the dividend declaration.',
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText:
                                                                            'Approve',
                                                                        cancelButtonText:
                                                                            'Cancel',
                                                                    })
                                                                    .then(
                                                                        (
                                                                            result,
                                                                        ) => {
                                                                            if (
                                                                                result.isConfirmed
                                                                            ) {
                                                                                router.post(
                                                                                    route(
                                                                                        'dividends.approve',
                                                                                        declaration.id,
                                                                                    ),
                                                                                );
                                                                            }
                                                                        },
                                                                    );
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            {declaration.status ===
                                                'APPROVED' &&
                                                declaration.allocations
                                                    ?.filter(
                                                        (allocation) =>
                                                            allocation.status ===
                                                            'CALCULATED',
                                                    )
                                                    .map((allocation) => (
                                                        <Button
                                                            key={allocation.id}
                                                            size="sm"
                                                            onClick={() => {
                                                                appSwal
                                                                    .fire({
                                                                        title: 'Post this dividend allocation?',
                                                                        text: `Post dividend ${allocation.dividend_amount} for this allocation?`,
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText:
                                                                            'Post allocation',
                                                                        cancelButtonText:
                                                                            'Cancel',
                                                                    })
                                                                    .then(
                                                                        (
                                                                            result,
                                                                        ) => {
                                                                            if (
                                                                                !result.isConfirmed
                                                                            )
                                                                                return;

                                                                            router.post(
                                                                                route(
                                                                                    'dividend-allocations.post',
                                                                                    allocation.id,
                                                                                ),
                                                                            );
                                                                        },
                                                                    );
                                                            }}
                                                        >
                                                            Post{' '}
                                                            {
                                                                allocation.dividend_amount
                                                            }
                                                        </Button>
                                                    ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={declarations.per_page}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setPage(1);
                    }}
                    links={declarations.links}
                    currentPage={declarations.current_page}
                    totalPages={declarations.last_page}
                    onPageChange={setPage}
                    onPrevious={() =>
                        setPage(Math.max(1, declarations.current_page - 1))
                    }
                    onNext={() =>
                        setPage(
                            Math.min(
                                declarations.last_page,
                                declarations.current_page + 1,
                            ),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
