import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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
import { CustomerFamilyRelation } from '../../../types/customer_kyc_module';
import { PaginatedResponse } from '../../../types/paginated_response';
import { familyRelationStatuses } from './data/family_relation_statuses';

interface Props extends SharedData {
    paginated_data: PaginatedResponse<CustomerFamilyRelation>;
    filters: Record<string, string | number>;
}

export default function FamilyRelationIndex() {
    const { paginated_data, filters } = usePage<Props>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
        verification_status: filters.verification_status || null,
    });

    const isEmpty = paginated_data.data.length === 0;

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('family-relations.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page, data.verification_status]);

    const handleDelete = (id: number, customerName: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Relation of "${customerName}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('family-relations.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Family Relations', href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Family Relations" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <HeadingSmall
                    title="Family Relations"
                    description="Manage family and relative relationships."
                />

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            className="bg-card"
                            placeholder="Search relations..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="w-48">
                        <Select
                            className="bg-card"
                            value={data.verification_status as string}
                            onChange={(value) => {
                                setData('verification_status', value);
                                setData('page', 1);
                            }}
                            options={familyRelationStatuses}
                        />
                    </div>
                </div>

                {/* ===================== */}
                {/* EMPTY STATE */}
                {/* ===================== */}
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No family relations found
                        </p>
                        <p className="text-xs">
                            Try changing filters or add a new relation
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ===================== */}
                        {/* Desktop Table */}
                        {/* ===================== */}
                        <div className="hidden h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Relative Photo',
                                            'Customer',
                                            'Relative Name',
                                            'Phone',
                                            'Relation',
                                            'Status',
                                            'Actions',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className="border-b p-2 text-left text-sm font-medium"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginated_data.data.map((f) => (
                                        <tr
                                            key={f.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                <img
                                                    src={f.relative?.photo?.url}
                                                    className="h-6 w-6 rounded-full"
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                {f.customer?.name || '—'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {f.relative?.name}
                                            </td>
                                            <td className="px-2 py-1">
                                                {f.relative?.phone || '—'}
                                            </td>
                                            <td className="px-2 py-1 capitalize">
                                                {f.relation_type.replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                <Badge
                                                    text={f.verification_status}
                                                />
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
                                                                        'family-relations.show',
                                                                        f.id,
                                                                    )}
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'family-relations.edit',
                                                                        f.id,
                                                                    )}
                                                                >
                                                                    <Pencil className="h-5 w-5 text-yellow-500" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            f.id,
                                                                            f
                                                                                .customer
                                                                                ?.name ||
                                                                                '',
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-5 w-5 text-destructive" />
                                                                </button>
                                                            </TooltipTrigger>
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
                            {paginated_data.data.map((f) => (
                                <div
                                    key={f.id}
                                    className="rounded-md border bg-card p-3"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {f.relative?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {f.customer?.name || '—'}
                                            </p>
                                        </div>
                                        <span className="text-xs">
                                            <Badge
                                                text={f.verification_status}
                                            />
                                        </span>
                                    </div>

                                    <div className="mt-2 text-xs text-muted-foreground">
                                        📞 {f.relative?.phone || '—'}
                                    </div>

                                    <div className="mt-2 flex justify-end gap-3">
                                        <Link
                                            href={route(
                                                'family-relations.show',
                                                f.id,
                                            )}
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route(
                                                'family-relations.edit',
                                                f.id,
                                            )}
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    f.id,
                                                    f.customer?.name || '',
                                                )
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
                        perPage={data.per_page}
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
