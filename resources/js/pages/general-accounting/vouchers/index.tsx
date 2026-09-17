import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    ResourceToolbar,
    StatusBadge,
} from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { SharedData } from '../../../types';
import { transactionStatus } from './data/transaction_statuses';

interface Voucher {
    id: number;
    voucher_no: string;
    voucher_type: string;
    voucher_date: string;
    status: string;
    fiscal_year?: { code?: string };
    fiscal_period?: { name?: string; period_name?: string };
    branch?: { name: string };
    entries?: { debit: number; credit: number }[];
}

interface VoucherPageProps extends SharedData {
    vouchers: {
        data: Voucher[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { vouchers, filters } = usePage<VoucherPageProps>().props;
    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });

    useFlashToastHandler();

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('vouchers.index'), {
                preserveScroll: true,
                preserveState: true,
            });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const getTotals = (entries: Voucher['entries']) => ({
        totalDebit:
            entries?.reduce((sum, entry) => sum + Number(entry.debit), 0) || 0,
        totalCredit:
            entries?.reduce((sum, entry) => sum + Number(entry.credit), 0) || 0,
    });

    const createTypes = [
        { label: 'Payment', type: 'PAYMENT' },
        { label: 'Receipt', type: 'RECEIPT' },
        { label: 'Journal', type: 'JOURNAL' },
        { label: 'Contra', type: 'CONTRA' },
    ];

    return (
        <CustomAuthLayout
            breadcrumbs={[{ title: 'Vouchers', href: '/vouchers' }]}
        >
            <Head title="Vouchers" />
            <div className="space-y-4 p-2 text-foreground">
                <ResourcePageHeader
                    title="Vouchers"
                    description="Manage all vouchers with ease"
                    action={
                        <div className="flex flex-wrap gap-2">
                            {createTypes.map((item) => (
                                <Button
                                    key={item.type}
                                    asChild
                                    size="sm"
                                    variant="outline"
                                >
                                    <Link
                                        href={route('vouchers.create', {
                                            query: { type: item.type },
                                        })}
                                    >
                                        {item.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    }
                />
                <ResourceToolbar>
                    <input
                        type="text"
                        placeholder="Search vouchers..."
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                    <Select
                        value={data.status}
                        onChange={(value) => {
                            setData('status', value);
                            setData('page', 1);
                        }}
                        options={transactionStatus}
                    />
                    <span className="text-sm text-muted-foreground">
                        {vouchers.data.length} records
                    </span>
                </ResourceToolbar>
                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Date',
                                    'Type',
                                    'Voucher No',
                                    'Fiscal Year',
                                    'Period',
                                    'Branch',
                                    'Debit',
                                    'Credit',
                                    'Status',
                                    'Actions',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="border-b p-2 text-left text-sm font-medium"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.data.length > 0 ? (
                                vouchers.data.map((voucher) => {
                                    const { totalDebit, totalCredit } =
                                        getTotals(voucher.entries);
                                    const canEdit = ![
                                        'OPENING',
                                        'CLOSING',
                                    ].includes(voucher.voucher_type);
                                    return (
                                        <tr
                                            key={voucher.id}
                                            className="border-b transition-colors even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                {new Date(
                                                    voucher.voucher_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-2 py-1">
                                                {voucher.voucher_type || '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {voucher.voucher_no}
                                            </td>
                                            <td className="px-2 py-1">
                                                {voucher.fiscal_year?.code ||
                                                    '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {voucher.fiscal_period
                                                    ?.period_name ||
                                                    voucher.fiscal_period
                                                        ?.name ||
                                                    '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {voucher.branch?.name || '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {totalDebit.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-1">
                                                {totalCredit.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-1">
                                                <StatusBadge
                                                    tone={
                                                        voucher.status ===
                                                        'POSTED'
                                                            ? 'success'
                                                            : voucher.status ===
                                                                'CANCELLED'
                                                              ? 'danger'
                                                              : 'warning'
                                                    }
                                                >
                                                    {voucher.status}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-2 py-1">
                                                <TooltipProvider>
                                                    <div className="flex space-x-2">
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'vouchers.show',
                                                                        voucher.id,
                                                                    )}
                                                                    className="text-primary hover:text-primary/80"
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                View
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                {canEdit ? (
                                                                    <Link
                                                                        href={route(
                                                                            'vouchers.edit',
                                                                            voucher.id,
                                                                        )}
                                                                        className="text-success"
                                                                    >
                                                                        <Pencil className="h-5 w-5" />
                                                                    </Link>
                                                                ) : (
                                                                    <span className="cursor-not-allowed text-gray-400">
                                                                        <Pencil className="h-5 w-5" />
                                                                    </span>
                                                                )}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {canEdit
                                                                    ? 'Edit'
                                                                    : 'Editing disabled'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No vouchers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', Number(value));
                        setData('page', 1);
                    }}
                    links={vouchers.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
