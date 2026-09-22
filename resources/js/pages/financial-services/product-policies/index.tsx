import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { ProductPoliciesPageProps } from '@/types/financial-services';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit2, FileText } from 'lucide-react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';

export default function ProductPoliciesIndex() {
    const { products } = usePage<ProductPoliciesPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Product Policies', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Policies" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Product policies"
                    description="Operational rules and policy provenance for every financial product."
                />

                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <table className="w-full min-w-190 text-sm">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Product',
                                    'Category',
                                    'Opening minimum',
                                    'Deposit minimum',
                                    'Version',
                                    'Status',
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
                            {products.data.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b even:bg-muted hover:bg-accent/20"
                                >
                                    <td className="px-2 py-1">
                                        <Link
                                            className="flex items-center gap-2 font-medium text-primary hover:underline"
                                            href={route(
                                                'financial-products.show',
                                                product.id,
                                            )}
                                        >
                                            <FileText className="h-4 w-4" />
                                            {product.code} · {product.name}
                                        </Link>
                                    </td>
                                    <td className="px-2 py-1">
                                        {product.category.replaceAll('_', ' ')}
                                    </td>
                                    <td className="px-2 py-1 tabular-nums">
                                        {product.policy
                                            ?.minimum_opening_amount ?? '-'}
                                    </td>
                                    <td className="px-2 py-1 tabular-nums">
                                        {product.policy
                                            ?.minimum_deposit_amount ?? '-'}
                                    </td>
                                    <td className="px-2 py-1">
                                        {product.policy?.version ?? '-'}
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <StatusBadge
                                                tone={
                                                    product.policy?.status ===
                                                    'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {product.policy?.status ??
                                                    'MISSING'}
                                            </StatusBadge>
                                            <Link
                                                href={route(
                                                    'financial-product-policies.edit',
                                                    product.id,
                                                )}
                                                title="Configure policy"
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={products.per_page}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('financial-product-policies.index'),
                            { per_page: perPage, page: 1 },
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                    links={products.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
