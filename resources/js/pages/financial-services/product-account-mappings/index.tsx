import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialProductAccountMappingsPageProps } from '@/types/financial-services';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function FinancialProductAccountMappings() {
    const { mappings, products, filters } =
        usePage<FinancialProductAccountMappingsPageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('financial-product-account-mappings.index'),
                {
                    search: search || undefined,
                    product_id: filters.product_id || undefined,
                    status: filters.status || undefined,
                    per_page: mappings.per_page,
                    page: 1,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [
        search,
        filters.search,
        filters.product_id,
        filters.status,
        mappings.per_page,
    ]);

    const updateFilters = (
        values: Record<string, string | number | undefined>,
    ) =>
        router.get(
            route('financial-product-account-mappings.index'),
            {
                search: search || undefined,
                product_id:
                    values.product_id ?? filters.product_id ?? undefined,
                status: values.status ?? filters.status ?? undefined,
                per_page: values.per_page ?? mappings.per_page,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Account Mappings',
            href: route('financial-product-account-mappings.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Mappings" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account mappings"
                    description="Connect each financial product transaction to its general-ledger accounts."
                />

                <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search product or transaction type..."
                        className="bg-background sm:w-80"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                            className="bg-background sm:w-64"
                            value={String(filters.product_id ?? '')}
                            onChange={(value) =>
                                updateFilters({
                                    product_id: value || undefined,
                                })
                            }
                            options={[
                                { value: '', label: 'All products' },
                                ...products.map((product) => ({
                                    value: String(product.id),
                                    label: `${product.code} · ${product.name}`,
                                })),
                            ]}
                        />
                        <Select
                            className="bg-background sm:w-40"
                            value={filters.status ?? ''}
                            onChange={(value) =>
                                updateFilters({ status: value || undefined })
                            }
                            options={[
                                { value: '', label: 'All statuses' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                    </div>
                </div>

                {mappings.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No account mappings found"
                        description="Create a mapping from a product detail page or adjust the filters."
                    />
                ) : (
                    <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                        <table className="w-full min-w-240 text-sm">
                            <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                <tr>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Product
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Transaction
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Debit account
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Credit account
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mappings.data.map((mapping) => {
                                    const incomplete =
                                        !mapping.debit_account_id ||
                                        !mapping.credit_account_id;

                                    return (
                                        <tr
                                            key={mapping.id}
                                            className="border-b even:bg-muted/30 hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                <Link
                                                    href={route(
                                                        'financial-products.show',
                                                        mapping.product.id,
                                                    )}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {mapping.product.code}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {mapping.product.name} ·{' '}
                                                    {mapping.product.category.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-2 py-1 font-medium">
                                                {mapping.transaction_type}
                                            </td>
                                            <td className="px-2 py-1">
                                                {mapping.debit_account ? (
                                                    <>
                                                        <p className="font-mono text-xs">
                                                            {
                                                                mapping
                                                                    .debit_account
                                                                    .code
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                mapping
                                                                    .debit_account
                                                                    .name
                                                            }
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Not specified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                {mapping.credit_account ? (
                                                    <>
                                                        <p className="font-mono text-xs">
                                                            {
                                                                mapping
                                                                    .credit_account
                                                                    .code
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                mapping
                                                                    .credit_account
                                                                    .name
                                                            }
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Not specified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge
                                                        tone={
                                                            mapping.status
                                                                ? 'success'
                                                                : 'neutral'
                                                        }
                                                    >
                                                        {mapping.status
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </StatusBadge>
                                                    {incomplete && (
                                                        <span
                                                            className="text-amber-600"
                                                            title="Debit or credit account is missing"
                                                        >
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-1">
                                                <Link
                                                    href={route(
                                                        'financial-products.show',
                                                        mapping.product.id,
                                                    )}
                                                    className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-muted"
                                                >
                                                    <Settings2 className="h-3.5 w-3.5" />
                                                    Manage
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </ResourceTableCard>
                )}

                <DataTablePagination
                    perPage={mappings.per_page}
                    links={mappings.links}
                    onPerPageChange={(perPage) =>
                        updateFilters({ per_page: perPage })
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
