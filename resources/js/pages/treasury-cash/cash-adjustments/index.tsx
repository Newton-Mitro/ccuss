import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, ClipboardCheck, SlidersHorizontal } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface CashAdjustmentListItem {
    id: number;
    amount: string | number;
    type: 'SHORTAGE' | 'EXCESS';
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'POSTED' | 'CANCELLED';
    requested_at?: string | null;
    branch_day?: { business_date: string } | null;
    teller_session?: {
        teller?: { code: string; name: string } | null;
    } | null;
}

interface CashAdjustmentIndexProps extends SharedData {
    adjustments: {
        data: CashAdjustmentListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { adjustments, filters, auth } =
        usePage<CashAdjustmentIndexProps>().props;
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
    const canPost = permissions.has('cash_transactions.post');

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('cash-adjustments.list'), {
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
            title: 'Cash Adjustment Queue',
            href: route('cash-adjustments.list'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Adjustment Queue" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Cash Adjustment Queue"
                    description="Approve and post teller shortages and excesses after cash verification."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search teller, type, reason, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {adjustments.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No cash adjustments found"
                        description="Teller shortages and excesses will appear here."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-240 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Teller',
                                        'Business Date',
                                        'Type',
                                        'Amount',
                                        'Reason',
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
                                {adjustments.data.map((adjustment, index) => (
                                    <tr
                                        key={adjustment.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(adjustments.current_page - 1) *
                                                adjustments.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {adjustment
                                                            .teller_session
                                                            ?.teller?.name ??
                                                            '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {adjustment
                                                            .teller_session
                                                            ?.teller?.code ??
                                                            '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {adjustment.branch_day
                                                ?.business_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {adjustment.type}
                                        </td>
                                        <td className="px-2 py-2">
                                            {adjustment.amount}
                                        </td>
                                        <td
                                            className="max-w-72 truncate px-2 py-2"
                                            title={adjustment.reason}
                                        >
                                            {adjustment.reason}
                                        </td>
                                        <td className="px-2 py-2">
                                            <StatusBadge
                                                tone={
                                                    adjustment.status ===
                                                    'POSTED'
                                                        ? 'success'
                                                        : adjustment.status ===
                                                            'CANCELLED'
                                                          ? 'danger'
                                                          : adjustment.status ===
                                                              'APPROVED'
                                                            ? 'info'
                                                            : 'warning'
                                                }
                                            >
                                                {adjustment.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-1">
                                                {canPost &&
                                                    adjustment.status ===
                                                        'PENDING' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                router.post(
                                                                    route(
                                                                        'cash-adjustments.list.approve',
                                                                        adjustment.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label={`Approve adjustment for ${adjustment.teller_session?.teller?.name ?? 'teller'}`}
                                                        >
                                                            <ClipboardCheck className="h-4 w-4 text-success" />
                                                        </Button>
                                                    )}
                                                {canPost &&
                                                    adjustment.status ===
                                                        'APPROVED' && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                router.post(
                                                                    route(
                                                                        'cash-adjustments.list.post',
                                                                        adjustment.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label={`Post adjustment for ${adjustment.teller_session?.teller?.name ?? 'teller'}`}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                                        </Button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <DataTablePagination
                    perPage={adjustments.per_page}
                    currentPage={adjustments.current_page}
                    totalItems={adjustments.total}
                    totalPages={adjustments.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', adjustments.current_page + 1)}
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, adjustments.current_page - 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
