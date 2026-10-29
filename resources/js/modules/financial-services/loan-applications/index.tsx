import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { ResourceEmptyState } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type {
    LoanApplication,
    LoanApplicationIndexPageProps,
} from '@/modules/financial-services/types/financial-services';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

function LoanApplicationActions({
    application,
    canUpdate,
}: {
    application: LoanApplication;
    canUpdate: boolean;
}) {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            aria-label={`View ${application.application_no}`}
                            className="flex size-8 items-center justify-center rounded-md text-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            href={route(
                                'loan-applications.show',
                                application.id,
                            )}
                        >
                            <Eye className="size-4" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                </Tooltip>
                {canUpdate && application.status === 'DRAFT' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                aria-label={`Edit ${application.application_no}`}
                                className="flex size-8 items-center justify-center rounded-md text-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                href={route(
                                    'loan-applications.edit',
                                    application.id,
                                )}
                            >
                                <Pencil className="size-4" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Edit draft</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}

export default function LoanApplicationsIndex() {
    const {
        applications,
        filters,
        can_update: canUpdate,
        can_manage_protection_products: canManageProtectionProducts,
    } = usePage<LoanApplicationIndexPageProps>().props;
    const { data, setData } = useForm({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route('loan-applications.index'),
                {
                    search: data.search,
                    status: data.status,
                    per_page: data.per_page,
                    page: data.page,
                },
                { preserveState: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        { title: 'Loan Applications', href: '' },
    ];
    const isEmpty = applications.data.length === 0;
    const statusOptions = [
        { value: 'all', label: 'All statuses' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SUBMITTED', label: 'Submitted' },
        { value: 'UNDER_REVIEW', label: 'Under review' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Applications" />
            <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Loan applications"
                        description="Originate, review, and decide customer loan requests."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <div className="flex flex-wrap gap-2">
                            {canManageProtectionProducts && (
                                <Button asChild size="sm" variant="outline">
                                    <Link
                                        href={route(
                                            'loan-protection-products.index',
                                        )}
                                    >
                                        Manage credit-life products
                                    </Link>
                                </Button>
                            )}
                            <Button asChild size="sm">
                                <Link href={route('loan-applications.create')}>
                                    <Plus className="mr-1 h-4 w-4" /> New
                                    application
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:w-72">
                        <Input
                            className="bg-card"
                            placeholder="Search applications..."
                            value={data.search}
                            onChange={(event) => {
                                setData('search', event.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                    <div className="w-full sm:w-56">
                        <Select
                            className="bg-card"
                            value={data.status}
                            onChange={(value) => {
                                setData('status', value);
                                setData('page', 1);
                            }}
                            options={statusOptions}
                        />
                    </div>
                </div>

                {isEmpty ? (
                    <ResourceEmptyState
                        title="No loan applications found"
                        description="Try adjusting your search or status filter."
                    />
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                                    <tr>
                                        {[
                                            'Application',
                                            'Customer',
                                            'Product',
                                            'Amount',
                                            'Status',
                                            'Actions',
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="border-b p-2 text-sm font-medium"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.data.map((application) => (
                                        <tr
                                            key={application.id}
                                            className="border-b even:bg-muted/40 hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-2">
                                                {application.application_no}
                                            </td>
                                            <td className="px-2 py-2">
                                                {application.customer?.name ??
                                                    application.customer
                                                        ?.customer_no ??
                                                    '—'}
                                            </td>
                                            <td className="px-2 py-2">
                                                {application.product?.code ??
                                                    application.product?.name ??
                                                    '—'}
                                            </td>
                                            <td className="px-2 py-2 tabular-nums">
                                                {formatBDTCurrency(
                                                    application.requested_amount,
                                                    false,
                                                )}
                                            </td>
                                            <td className="px-2 py-2">
                                                {application.status}
                                            </td>
                                            <td className="px-2 py-2">
                                                <LoanApplicationActions
                                                    application={application}
                                                    canUpdate={canUpdate}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {applications.data.map((application) => (
                                <div
                                    key={application.id}
                                    className="space-y-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {application.application_no}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {application.customer?.name ??
                                                    application.customer
                                                        ?.customer_no ??
                                                    '—'}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs">
                                            {application.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>
                                            {application.product?.name ??
                                                application.product?.code ??
                                                '—'}
                                        </span>
                                        <span className="tabular-nums">
                                            {formatBDTCurrency(
                                                application.requested_amount,
                                                false,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-end">
                                        <LoanApplicationActions
                                            application={application}
                                            canUpdate={canUpdate}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!isEmpty && (
                    <DataTablePagination
                        perPage={applications.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            setData('page', 1);
                        }}
                        links={applications.links}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}
