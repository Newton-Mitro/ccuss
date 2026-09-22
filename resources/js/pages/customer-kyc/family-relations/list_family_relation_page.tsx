import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceEmptyState,
    ResourceTableViewport,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerFamilyRelation } from '../../../types/customer_kyc_module';
import { PaginatedResponse } from '../../../types/paginated_response';
import ApprovalActions from '../components/approval-actions';

interface Props extends SharedData {
    paginated_data: PaginatedResponse<CustomerFamilyRelation>;
    filters: Record<string, string | number>;
}

export default function FamilyRelationIndex() {
    const { paginated_data, filters } = usePage<Props>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
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
    }, [data.search, data.per_page, data.page, get]);

    const handleDelete = (relation: CustomerFamilyRelation) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Relation of "${relation.customer?.name || ''}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(
                        route('customers.family-relations.destroy', [
                            relation.customer_id,
                            relation.id,
                        ]),
                        {
                            preserveScroll: true,
                            preserveState: true,
                        },
                    );
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        {
            title: 'Family Relations',
            href: route('family-relations.index'),
        },
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
                </div>

                {/* ===================== */}
                {/* EMPTY STATE */}
                {/* ===================== */}
                {isEmpty ? (
                    <ResourceEmptyState
                        title="No family relations found"
                        description="Try changing filters or add a new relation."
                    />
                ) : (
                    <>
                        {/* ===================== */}
                        {/* Desktop Table */}
                        {/* ===================== */}
                        <ResourceTableViewport
                            heightClassName="h-[calc(100vh-360px)]"
                            mobile={
                                <FamilyRelationCards
                                    relations={paginated_data.data}
                                    onDelete={handleDelete}
                                />
                            }
                        >
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
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
                                                <Link
                                                    href={route(
                                                        'customers.show',
                                                        f.customer_id,
                                                    )}
                                                    className="text-primary hover:underline"
                                                >
                                                    {f.customer?.name || '—'}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-1">
                                                <Link
                                                    href={route(
                                                        'customers.show',
                                                        f.relative_id,
                                                    )}
                                                    className="text-primary hover:underline"
                                                >
                                                    {f.relative?.name || '—'}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-1">
                                                {f.relative?.primary_phone ||
                                                    '—'}
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
                                                    <div className="flex items-center gap-2">
                                                        <ApprovalActions
                                                            approveUrl={route(
                                                                'customers.family-relations.approve',
                                                                [
                                                                    f.customer_id,
                                                                    f.id,
                                                                ],
                                                            )}
                                                            rejectUrl={route(
                                                                'customers.family-relations.reject',
                                                                [
                                                                    f.customer_id,
                                                                    f.id,
                                                                ],
                                                            )}
                                                            pending={
                                                                f.verification_status ===
                                                                'PENDING'
                                                            }
                                                        />
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'customers.family-relations.show',
                                                                        [
                                                                            f.customer_id,
                                                                            f.id,
                                                                        ],
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
                                                                        'customers.family-relations.edit',
                                                                        [
                                                                            f.customer_id,
                                                                            f.id,
                                                                        ],
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
                                                                            f,
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
                        </ResourceTableViewport>
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

function FamilyRelationCards({
    relations,
    onDelete,
}: {
    relations: CustomerFamilyRelation[];
    onDelete: (relation: CustomerFamilyRelation) => void;
}) {
    return (
        <div className="space-y-3">
            {relations.map((relation) => (
                <div
                    key={relation.id}
                    className="rounded-md border bg-card p-3"
                >
                    <div className="flex justify-between">
                        <div>
                            <Link
                                href={route(
                                    'customers.show',
                                    relation.relative_id,
                                )}
                                className="block font-medium text-primary hover:underline"
                            >
                                {relation.relative?.name || '—'}
                            </Link>
                            <Link
                                href={route(
                                    'customers.show',
                                    relation.customer_id,
                                )}
                                className="block text-xs text-primary hover:underline"
                            >
                                {relation.customer?.name || '—'}
                            </Link>
                        </div>
                        <Badge text={relation.verification_status} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        {relation.relative?.primary_phone || '—'}
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                        <ApprovalActions
                            approveUrl={route(
                                'customers.family-relations.approve',
                                [relation.customer_id, relation.id],
                            )}
                            rejectUrl={route(
                                'customers.family-relations.reject',
                                [relation.customer_id, relation.id],
                            )}
                            pending={relation.verification_status === 'PENDING'}
                        />
                        <Link
                            href={route('customers.family-relations.show', [
                                relation.customer_id,
                                relation.id,
                            ])}
                            title="View relation"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                            href={route('customers.family-relations.edit', [
                                relation.customer_id,
                                relation.id,
                            ])}
                            title="Edit relation"
                        >
                            <Pencil className="h-5 w-5" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => onDelete(relation)}
                            title="Delete relation"
                        >
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
