import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { ResourceEmptyState } from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import formatUndersoreString from '../../../lib/formatUnderscoreString';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerIntroducer } from '../../../types/customer_kyc_module';
import { PaginatedResponse } from '../../../types/paginated_response';
import ApprovalActions from '../components/approval-actions';

interface Props extends SharedData {
    paginated_data: PaginatedResponse<CustomerIntroducer>;
    filters: Record<string, string>;
}

export default function IntroducersIndex() {
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
            get(route('introducers.index'), { preserveState: true });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page, get]);

    const handleDelete = (introducer: CustomerIntroducer) => {
        appSwal
            .fire({
                title: 'Delete introducer?',
                text: 'This introducer will be permanently removed.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((res) => {
                if (res.isConfirmed) {
                    router.delete(
                        route('customers.introducers.destroy', [
                            introducer.introduced_customer_id,
                            introducer.id,
                        ]),
                        {
                            preserveScroll: true,
                        },
                    );
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Introducers', href: route('introducers.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Introducers" />

            <div className="space-y-4">
                {/* Header */}
                <HeadingSmall
                    title="Introducers"
                    description="Manage customer introducers."
                />

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            className="bg-card"
                            placeholder="Search introducers..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                </div>

                {isEmpty ? (
                    <ResourceEmptyState
                        title="No introducers found"
                        description="Try adjusting filters or add new records."
                    />
                ) : (
                    <>
                        {/* ================= Desktop Table ================= */}
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Introduced Customer',
                                            'Introducer',
                                            'Relationship',
                                            'Status',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="border-b p-2 text-left text-sm"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginated_data.data.map((i) => (
                                        <tr
                                            key={i.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                <Link
                                                    href={route(
                                                        'customers.show',
                                                        i.introduced_customer_id,
                                                    )}
                                                    className="text-primary hover:underline"
                                                >
                                                    {i.introduced_customer
                                                        ?.name ?? '—'}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-1">
                                                {i.introducer_customer_id ? (
                                                    <Link
                                                        href={route(
                                                            'customers.show',
                                                            i.introducer_customer_id,
                                                        )}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {i.introducer_customer
                                                            ?.name ?? '—'}
                                                    </Link>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-2 py-1 capitalize">
                                                {i.relationship_type.replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                <Badge
                                                    text={i.verification_status}
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                <TooltipProvider>
                                                    <div className="flex items-center gap-2">
                                                        <ApprovalActions
                                                            approveUrl={route(
                                                                'customers.introducers.approve',
                                                                [
                                                                    i.introduced_customer_id,
                                                                    i.id,
                                                                ],
                                                            )}
                                                            rejectUrl={route(
                                                                'customers.introducers.reject',
                                                                [
                                                                    i.introduced_customer_id,
                                                                    i.id,
                                                                ],
                                                            )}
                                                            pending={
                                                                i.verification_status ===
                                                                'PENDING'
                                                            }
                                                        />
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'customers.introducers.show',
                                                                        [
                                                                            i.introduced_customer_id,
                                                                            i.id,
                                                                        ],
                                                                    )}
                                                                >
                                                                    <Eye className="h-5 w-5 text-info" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'customers.introducers.edit',
                                                                        [
                                                                            i.introduced_customer_id,
                                                                            i.id,
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
                                                                            i,
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

                        {/* ================= Mobile Cards ================= */}
                        <div className="space-y-3 md:hidden">
                            {paginated_data.data.map((i) => (
                                <div
                                    key={i.id}
                                    className="space-y-2 rounded-md border bg-card p-3"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    i.introduced_customer_id,
                                                )}
                                                className="block font-medium text-primary hover:underline"
                                            >
                                                {i.introduced_customer?.name}
                                            </Link>
                                            {i.introducer_customer_id ? (
                                                <Link
                                                    href={route(
                                                        'customers.show',
                                                        i.introducer_customer_id,
                                                    )}
                                                    className="block text-xs text-primary hover:underline"
                                                >
                                                    {
                                                        i.introducer_customer
                                                            ?.name
                                                    }
                                                </Link>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">
                                                    —
                                                </p>
                                            )}
                                        </div>

                                        <Badge text={i.verification_status} />
                                    </div>

                                    <p className="text-xs text-muted-foreground capitalize">
                                        {formatUndersoreString(
                                            i.relationship_type,
                                        )}
                                    </p>

                                    <div className="flex items-center justify-end gap-2">
                                        <ApprovalActions
                                            approveUrl={route(
                                                'customers.introducers.approve',
                                                [
                                                    i.introduced_customer_id,
                                                    i.id,
                                                ],
                                            )}
                                            rejectUrl={route(
                                                'customers.introducers.reject',
                                                [
                                                    i.introduced_customer_id,
                                                    i.id,
                                                ],
                                            )}
                                            pending={
                                                i.verification_status ===
                                                'PENDING'
                                            }
                                        />
                                        <Link
                                            href={route(
                                                'customers.introducers.show',
                                                [
                                                    i.introduced_customer_id,
                                                    i.id,
                                                ],
                                            )}
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>

                                        <Link
                                            href={route(
                                                'customers.introducers.edit',
                                                [
                                                    i.introduced_customer_id,
                                                    i.id,
                                                ],
                                            )}
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Link>

                                        <button onClick={() => handleDelete(i)}>
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ================= Pagination ================= */}
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
