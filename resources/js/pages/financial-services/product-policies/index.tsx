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
    const { products, family = '' } = usePage<ProductPoliciesPageProps>().props;
    const productRoute =
        family === 'loan' ? 'loan-products' : 'deposit-products';
    const policyRoute =
        family === 'loan'
            ? 'loan-product-policies'
            : 'deposit-product-policies';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title:
                family === 'loan'
                    ? 'Loan Product Policies'
                    : family === 'deposit'
                      ? 'Deposit Product Policies'
                      : 'Product Policies',
            href: route(`${policyRoute}.index`),
        },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    family === 'loan'
                        ? 'Loan Product Policies'
                        : family === 'deposit'
                          ? 'Deposit Product Policies'
                          : 'Product Policies'
                }
            />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={
                        family === 'loan'
                            ? 'Loan product policies'
                            : family === 'deposit'
                              ? 'Deposit product policies'
                              : 'Product policies'
                    }
                    description={
                        family === 'loan'
                            ? 'Configure operating rules for loan products.'
                            : family === 'deposit'
                              ? 'Configure operating rules for savings, share, and deposit products.'
                              : 'Operational rules and policy provenance for every financial product.'
                    }
                />

                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <table className="w-full min-w-190 text-sm">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Product',
                                    'Category',
                                    family === 'loan'
                                        ? 'Loan maximum'
                                        : 'Opening minimum',
                                    family === 'loan'
                                        ? 'Loan-to-value'
                                        : 'Deposit minimum',
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
                                                `${productRoute}.show`,
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
                                        {(family === 'loan'
                                            ? product.policy
                                                  ?.maximum_loan_amount
                                            : product.policy
                                                  ?.minimum_opening_amount) ??
                                            '-'}
                                    </td>
                                    <td className="px-2 py-1 tabular-nums">
                                        {(family === 'loan'
                                            ? product.policy
                                                  ?.loan_to_value_percent
                                            : product.policy
                                                  ?.minimum_deposit_amount) ??
                                            '-'}
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
                                                    `${policyRoute}.edit`,
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
                            route(`${policyRoute}.index`),
                            {
                                per_page: perPage,
                                page: 1,
                            },
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                    links={products.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
