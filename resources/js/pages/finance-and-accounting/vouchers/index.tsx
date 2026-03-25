import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem } from '../../../types';
import { Voucher } from '../../../types/accounting';

interface VoucherPageProps {
    vouchers: {
        data: Voucher[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { vouchers, filters } = usePage()
        .props as unknown as VoucherPageProps;

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

    // Fetch vouchers on filter/search change
    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('vouchers.index'), {
                preserveScroll: true,
                preserveState: true,
            });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, voucherNo: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Voucher "${voucherNo}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('vouchers.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Voucher "${voucherNo}" deleted successfully!`,
                            ),
                        onError: () => toast.error('Failed to delete voucher.'),
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers' },
    ];

    const getTotals = (lines?: { debit: number; credit: number }[]) => {
        const totalDebit =
            lines?.reduce((sum, l) => sum + Number(l.debit), 0) || 0;
        const totalCredit =
            lines?.reduce((sum, l) => sum + Number(l.credit), 0) || 0;
        return { totalDebit, totalCredit };
    };

    const editRouteMap = {
        DEBIT_OR_PAYMENT: 'vouchers.edit.debit',
        CREDIT_OR_RECEIPT: 'vouchers.edit.credit',
        JOURNAL_OR_NON_CASH: 'vouchers.edit.journal',
        CONTRA: 'vouchers.edit.contra',
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Vouchers" />

            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Vouchers"
                        description="Manage all vouchers with ease"
                    />

                    {/* Voucher Type Buttons */}
                    <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                        {[
                            {
                                label: 'Debit / Payment',
                                route: 'vouchers.create.debit',
                                color: 'bg-blue-600',
                            },
                            {
                                label: 'Credit / Receipt',
                                route: 'vouchers.create.credit',
                                color: 'bg-green-600',
                            },
                            {
                                label: 'Journal / Non-Cash',
                                route: 'vouchers.create.journal',
                                color: 'bg-purple-600',
                            },
                            {
                                label: 'Contra',
                                route: 'vouchers.create.contra',
                                color: 'bg-gray-600',
                            },
                        ].map((v) => (
                            <Link
                                key={v.route}
                                href={route(v.route)}
                                className={`min-w-[120px] flex-1 rounded-md px-3 py-2 text-center text-sm font-medium text-white hover:opacity-90 sm:flex-none ${v.color}`}
                            >
                                {v.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search vouchers..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    <select
                        value={data.status}
                        onChange={(e) => {
                            setData('status', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 rounded-md border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none sm:max-w-xs"
                    >
                        <option value="all">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="approved">Approved</option>
                        <option value="POSTED">Posted</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Voucher Date',
                                    'Voucher Type',
                                    'Voucher No',
                                    'Fiscal Year',
                                    'Period',
                                    'Branch',
                                    'Total Debit',
                                    'Total Credit',
                                    'Status',
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
                            {vouchers.data.length > 0 ? (
                                vouchers.data.map((v) => {
                                    const NON_EDITABLE = [
                                        'OPENING_BALANCE',
                                        'CLOSING_BALANCE',
                                    ];
                                    const canEdit = !NON_EDITABLE.includes(
                                        v.voucher_type,
                                    );

                                    const { totalDebit, totalCredit } =
                                        getTotals(v.lines);
                                    return (
                                        <tr
                                            key={v.id}
                                            className="border-b even:bg-muted/30"
                                        >
                                            <td className="px-2 py-1">
                                                {new Date(
                                                    v.voucher_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-2 py-1">
                                                {v.voucher_type || '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {v.voucher_no}
                                            </td>
                                            <td className="px-2 py-1">
                                                {v.fiscal_year?.code || '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {v.fiscal_period?.period_name ||
                                                    '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {v.branch?.name || '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {totalDebit.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-1">
                                                {totalCredit.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-1">
                                                {v.status}
                                            </td>
                                            <td className="px-2 py-1">
                                                <TooltipProvider>
                                                    <div className="flex space-x-2">
                                                        {/* View */}
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'vouchers.show',
                                                                        v.id,
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

                                                        {/* Edit */}
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                {canEdit ? (
                                                                    <Link
                                                                        href={route(
                                                                            editRouteMap[
                                                                                v
                                                                                    .voucher_type
                                                                            ],
                                                                            v.id,
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

                                                        {/* Delete */}
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            v.id,
                                                                            v.voucher_no,
                                                                        )
                                                                    }
                                                                    className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Delete
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
                </div>

                {/* Pagination + Records Dropdown */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={data.per_page}
                            onChange={(e) => {
                                setData('per_page', Number(e.target.value));
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            {[5, 10, 20, 50, 100, 500].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-muted-foreground">
                            records
                        </span>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {vouchers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
