import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';
import { PaginatedResponse } from '../../../types/paginated_response';
import { kycStatuses } from './data/customer_data_types';

interface Props extends SharedData {
    paginated_data: PaginatedResponse<Customer>;
    filters: Record<string, string>;
}

export default function Index() {
    const { paginated_data, filters } = usePage<Props>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        kyc_status: filters.kyc_status || 'all',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const isEmpty = paginated_data.data.length === 0;

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('customers.index'), { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.kyc_status, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Customer "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('customers.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Customers"
                        description="Manage your customers."
                    />

                    <Link
                        href={route('customers.create')}
                        className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Create Customer
                        </span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            className="bg-card"
                            placeholder="Search customers..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="w-60">
                        <Select
                            className="bg-card"
                            value={data.kyc_status}
                            onChange={(value) => {
                                setData('kyc_status', value);
                                setData('page', 1);
                            }}
                            options={kycStatuses}
                        />
                    </div>
                </div>

                {/* ===================== */}
                {/* EMPTY STATE */}
                {/* ===================== */}
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No customers found
                        </p>
                        <p className="text-xs">
                            Try adjusting filters or create a new customer
                        </p>

                        <Link
                            href={route('customers.create')}
                            className="mt-4 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Create Customer
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* ===================== */}
                        {/* Desktop Table */}
                        {/* ===================== */}
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Photo',
                                            'Customer No',
                                            'Name',
                                            'Type',
                                            'Phone',
                                            'Email',
                                            'KYC Status',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="border-b p-2 text-left text-sm font-medium"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginated_data.data.map((c: Customer) => (
                                        <tr
                                            key={c.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                <img
                                                    src={c.photo.url}
                                                    className="h-6 w-6 rounded-full"
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                {c.customer_no}
                                            </td>
                                            <td className="px-2 py-1">
                                                {c.name}
                                            </td>
                                            <td className="px-2 py-1 capitalize">
                                                {c.type}
                                            </td>
                                            <td className="px-2 py-1">
                                                {c.phone}
                                            </td>
                                            <td className="px-2 py-1">
                                                {c.email}
                                            </td>
                                            <td className="px-2 py-1">
                                                <Badge text={c.kyc_status} />
                                            </td>
                                            <td className="px-2 py-1">
                                                <TooltipProvider>
                                                    <div className="flex gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'customers.show',
                                                                        c.id,
                                                                    )}
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
                                                                <Link
                                                                    href={route(
                                                                        'customers.edit',
                                                                        c.id,
                                                                    )}
                                                                >
                                                                    <Pencil className="h-5 w-5" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Edit
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            c.id,
                                                                            c.name,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-5 w-5 text-destructive" />
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
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ===================== */}
                        {/* Mobile Cards */}
                        {/* ===================== */}
                        <div className="space-y-3 md:hidden">
                            {paginated_data.data.map((c: Customer) => (
                                <div
                                    key={c.id}
                                    className="space-y-2 rounded-md border bg-card p-3"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {c.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {c.customer_no} · {c.type}
                                            </p>
                                        </div>
                                        <Badge text={c.kyc_status} />
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        📞 {c.phone || '—'} <br />
                                        ✉️ {c.email || '—'}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Link
                                            href={route('customers.show', c.id)}
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('customers.edit', c.id)}
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(c.id, c.name)
                                            }
                                        >
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!isEmpty && (
                    <DataTablePagination
                        perPage={paginated_data.per_page}
                        onPerPageChange={(value: number) => {
                            setData('per_page', value);
                            setData('page', 1);
                        }}
                        links={paginated_data.links}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}
