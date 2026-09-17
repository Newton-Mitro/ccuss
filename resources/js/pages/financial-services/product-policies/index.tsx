import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, ShieldCheck } from 'lucide-react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';

interface Policy {
    status?: string;
    version?: string;
    minimum_opening_amount?: string | number | null;
    minimum_deposit_amount?: string | number | null;
    effective_from?: string | null;
}
interface Product {
    id: number;
    code: string;
    name: string;
    category: string;
    policy?: Policy | null;
}

export default function ProductPoliciesIndex() {
    const { products } = usePage<{
        products: {
            data: Product[];
            links: { url: string | null; label: string; active: boolean }[];
            per_page: number;
        };
    }>().props;
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
                <div className="rounded-md border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-900 dark:text-sky-100">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            Rates and conditions should follow the latest
                            approved internal policy. The AI reference catalog
                            is a guide, not a binding contract.
                        </p>
                    </div>
                </div>
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
