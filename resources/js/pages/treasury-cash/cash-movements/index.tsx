import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface CashTransferListItem {
    id: number;
    transfer_no: string;
    amount: string | number;
    status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
    note?: string | null;
    requested_at?: string | null;
    branch_day?: { business_date: string } | null;
    from_cash_location?: { code: string; name: string } | null;
    to_cash_location?: { code: string; name: string } | null;
}

interface CashTransferIndexProps extends SharedData {
    transfers: {
        data: CashTransferListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { transfers, filters, auth } =
        usePage<CashTransferIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canApprove = permissions.has('cash_transfers.approve');
    const canComplete = permissions.has('cash_transfers.complete');

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('cash-movements.transfers.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Cash Transfer Queue',
            href: route('cash-movements.transfers.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Transfer Queue" />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Cash Transfer Queue"
                    description="Approve and complete cash transfers between active branch locations."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search transfer, location, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-260 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Transfer',
                                    'From',
                                    'To',
                                    'Business Date',
                                    'Amount',
                                    'Status',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left font-medium"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.data.length > 0 ? (
                                transfers.data.map((transfer, index) => (
                                    <tr
                                        key={transfer.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(transfers.current_page - 1) *
                                                transfers.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {transfer.transfer_no}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {transfer.note ?? '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {transfer.from_cash_location
                                                ?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transfer.to_cash_location?.name ??
                                                '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transfer.branch_day
                                                ?.business_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transfer.amount}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {transfer.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-1">
                                                {canApprove &&
                                                    transfer.status ===
                                                        'PENDING' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                router.post(
                                                                    route(
                                                                        'cash-movements.transfers.approve',
                                                                        transfer.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label={`Approve ${transfer.transfer_no}`}
                                                        >
                                                            <ClipboardCheck className="h-4 w-4 text-success" />
                                                        </Button>
                                                    )}
                                                {canComplete &&
                                                    transfer.status ===
                                                        'APPROVED' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                router.post(
                                                                    route(
                                                                        'cash-movements.transfers.complete',
                                                                        transfer.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label={`Complete ${transfer.transfer_no}`}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                                        </Button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No cash transfers found for this branch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={transfers.per_page}
                    currentPage={transfers.current_page}
                    totalItems={transfers.total}
                    totalPages={transfers.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', transfers.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, transfers.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
