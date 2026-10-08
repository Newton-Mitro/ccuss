import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatDateTime } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

type Fine = {
    id: number;
    assessed_amount: string | number;
    paid_amount: string | number;
    waived_amount: string | number;
    status: string;
    assessed_at: string;
    financial_account?: { account_no?: string; name?: string };
    default_event?: { rule?: { name?: string } };
};
type Props = {
    fines: {
        data: Fine[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
};

export default function FinesIndex() {
    const { fines, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 20,
        page: Number(filters.page) || fines.current_page,
    });

    useEffect(() => {
        const delay = setTimeout(
            () =>
                get(route('account-fines.index'), {
                    preserveState: true,
                    replace: true,
                }),
            400,
        );

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Fines', href: route('account-fines.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Fines" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account Fines"
                    description="Review assessed fines or waive authorized balances."
                />
                <Input
                    className="w-full bg-card sm:w-96"
                    placeholder="Search account, rule, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <ResourceTableCard className="h-[calc(100vh-360px)] md:h-[calc(100vh-340px)]">
                    <div className="h-full overflow-auto">
                        <table
                            className="w-full text-sm"
                            style={{ minWidth: 900 }}
                        >
                            <thead className="sticky top-0 z-10 bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Account</th>
                                    <th className="p-3 text-left">Rule</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 text-right">Paid</th>
                                    <th className="p-3 text-right">Waived</th>
                                    <th className="p-3 text-left">Assessed</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fines.data.map((fine) => (
                                    <tr key={fine.id} className="border-t">
                                        <td className="p-3 font-mono text-xs">
                                            {fine.financial_account
                                                ?.account_no ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {fine.default_event?.rule?.name ??
                                                'Default fine'}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {fine.assessed_amount}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {fine.paid_amount}
                                        </td>
                                        <td className="p-3 text-right tabular-nums">
                                            {fine.waived_amount}
                                        </td>
                                        <td className="p-3">
                                            {formatDateTime(fine.assessed_at)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <StatusBadge
                                                tone={
                                                    fine.status === 'PAID' ||
                                                    fine.status === 'WAIVED'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {fine.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="p-3 text-right">
                                            {[
                                                'ASSESSED',
                                                'PARTIALLY_PAID',
                                            ].includes(fine.status) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        appSwal
                                                            .fire({
                                                                title: 'Waive this fine?',
                                                                text: `Waive the outstanding fine for ${fine.financial_account?.account_no ?? 'this account'}?`,
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonText:
                                                                    'Waive fine',
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
                                                                        'account-fines.waive',
                                                                        fine.id,
                                                                    ),
                                                                );
                                                            });
                                                    }}
                                                >
                                                    Waive
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
                    perPage={fines.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={fines.links}
                    currentPage={fines.current_page}
                    totalPages={fines.last_page}
                    onPageChange={(page) => setData('page', page)}
                    onPrevious={() =>
                        setData('page', Math.max(1, fines.current_page - 1))
                    }
                    onNext={() =>
                        setData(
                            'page',
                            Math.min(fines.last_page, fines.current_page + 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
