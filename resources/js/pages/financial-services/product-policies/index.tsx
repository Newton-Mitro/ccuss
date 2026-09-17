import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, ShieldCheck } from 'lucide-react';
import { route } from 'ziggy-js';

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
    const { products } = usePage<{ products: Product[] }>().props;
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
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-900 dark:text-sky-100">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            Rates and conditions should follow the latest
                            approved internal policy. The AI reference catalog
                            is a guide, not a binding contract.
                        </p>
                    </div>
                </div>
                <ResourceTableCard>
                    <table className="w-full min-w-190 text-sm">
                        <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2">Opening minimum</th>
                                <th className="px-3 py-2">Deposit minimum</th>
                                <th className="px-3 py-2">Version</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b last:border-0 even:bg-muted/30"
                                >
                                    <td className="px-3 py-3">
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
                                    <td className="px-3 py-3">
                                        {product.category.replaceAll('_', ' ')}
                                    </td>
                                    <td className="px-3 py-3 tabular-nums">
                                        {product.policy
                                            ?.minimum_opening_amount ?? '-'}
                                    </td>
                                    <td className="px-3 py-3 tabular-nums">
                                        {product.policy
                                            ?.minimum_deposit_amount ?? '-'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {product.policy?.version ?? '-'}
                                    </td>
                                    <td className="px-3 py-3">
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
            </div>
        </CustomAuthLayout>
    );
}
