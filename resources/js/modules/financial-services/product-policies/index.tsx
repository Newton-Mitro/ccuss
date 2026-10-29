import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { ProductPoliciesPageProps } from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Edit2, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function ProductPoliciesIndex() {
    const {
        products,
        family = '',
        filters,
    } = usePage<ProductPoliciesPageProps>().props;
    const productRoute =
        family === 'loan' ? 'loan-products' : 'deposit-products';
    const policyRoute =
        family === 'loan'
            ? 'loan-product-policies'
            : 'deposit-product-policies';
    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route(`${policyRoute}.index`), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get, policyRoute]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
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
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
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
                </div>

                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search product code or name..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />

                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <table className="w-full min-w-190 text-sm">
                        <thead className="sticky top-0 z-10 bg-muted text-sm text-muted-foreground">
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
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
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
                                            {product.category.replaceAll(
                                                '_',
                                                ' ',
                                            )}
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
                                                        product.policy
                                                            ?.status ===
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        No products found for this organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={products.per_page}
                    onPerPageChange={(perPage) =>
                        setData((currentData) => ({
                            ...currentData,
                            per_page: perPage,
                            page: 1,
                        }))
                    }
                    links={products.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
