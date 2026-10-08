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
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type Provision = {
    id: number;
    period_start: string;
    period_end: string;
    basis_amount: string | number;
    annual_rate: string | number;
    provisioned_amount: string | number;
    status: string;
    financial_account?: { account_no?: string; name?: string };
    product?: { code?: string; name?: string };
};
type Props = {
    provisions: {
        data: Provision[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
};

export default function InterestProvisionsIndex() {
    const { provisions, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [perPage, setPerPage] = useState(Number(filters.per_page) || 20);
    const [page, setPage] = useState(
        Number(filters.page) || provisions.current_page,
    );
    const { data, setData, post, processing } = useForm({
        period_start: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
        )
            .toISOString()
            .slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        const delay = setTimeout(
            () =>
                router.get(
                    route('interest-provisions.index'),
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
        {
            title: 'Interest Provisions',
            href: route('interest-provisions.index'),
        },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Interest Provisions" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Interest Provisions"
                    description="Calculate, review, approve, and reject account interest provisions."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="flex flex-wrap items-end gap-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('interest-provisions.calculate'));
                        }}
                    >
                        <div>
                            <Label>Period start</Label>
                            <AppDatePicker
                                value={data.period_start}
                                onChange={(value) =>
                                    setData('period_start', value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Period end</Label>
                            <AppDatePicker
                                value={data.period_end}
                                onChange={(value) =>
                                    setData('period_end', value)
                                }
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            Calculate provisions
                        </Button>
                    </form>
                </section>
                <Input
                    className="w-full bg-card sm:w-96"
                    placeholder="Search account, product, or status..."
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
                                    <th className="p-3 text-left">Account</th>
                                    <th className="p-3 text-left">Product</th>
                                    <th className="p-3 text-left">Period</th>
                                    <th className="p-3 text-right">Basis</th>
                                    <th className="p-3 text-right">Rate</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {provisions.data.map((provision) => (
                                    <tr key={provision.id} className="border-t">
                                        <td className="p-3 font-mono text-xs">
                                            {provision.financial_account
                                                ?.account_no ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {provision.product?.code ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {provision.period_start} to{' '}
                                            {provision.period_end}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {provision.basis_amount}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {provision.annual_rate}%
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {provision.provisioned_amount}
                                        </td>
                                        <td className="p-3 text-center">
                                            <StatusBadge
                                                tone={
                                                    provision.status ===
                                                    'APPROVED'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {provision.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="p-3 text-right">
                                            {provision.status ===
                                                'CALCULATED' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            appSwal
                                                                .fire({
                                                                    title: 'Approve this provision?',
                                                                    text: 'This will approve the calculated interest provision.',
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
                                                                                    'interest-provisions.approve',
                                                                                    provision.id,
                                                                                ),
                                                                            );
                                                                        }
                                                                    },
                                                                );
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            appSwal
                                                                .fire({
                                                                    title: 'Reject this provision?',
                                                                    text: 'This will reject the calculated interest provision.',
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonText:
                                                                        'Reject',
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
                                                                                    'interest-provisions.reject',
                                                                                    provision.id,
                                                                                ),
                                                                            );
                                                                        }
                                                                    },
                                                                );
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {provision.status ===
                                                'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        appSwal
                                                            .fire({
                                                                title: 'Post this provision?',
                                                                text: `Post the approved interest provision for ${provision.financial_account?.account_no ?? 'this account'}?`,
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonText:
                                                                    'Post provision',
                                                                cancelButtonText:
                                                                    'Cancel',
                                                            })
                                                            .then((result) => {
                                                                if (
                                                                    !result.isConfirmed
                                                                )
                                                                    return;

                                                                router.post(
                                                                    route(
                                                                        'interest-provisions.post',
                                                                        provision.id,
                                                                    ),
                                                                );
                                                            });
                                                    }}
                                                >
                                                    Post
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={provisions.per_page}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setPage(1);
                    }}
                    links={provisions.links}
                    currentPage={provisions.current_page}
                    totalPages={provisions.last_page}
                    onPageChange={setPage}
                    onPrevious={() =>
                        setPage(Math.max(1, provisions.current_page - 1))
                    }
                    onNext={() =>
                        setPage(
                            Math.min(
                                provisions.last_page,
                                provisions.current_page + 1,
                            ),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
