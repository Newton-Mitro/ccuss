import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface Product {
    id: number;
    code: string;
    name: string;
    category: string;
    financial_accounts_count: number;
    financial_accounts_sum_balance: string | number | null;
}
export default function ProductSummaryReport() {
    const { products } = usePage<{ products: Product[] }>().props;
    return (
        <ReportTable
            title="Product summary"
            description="Accounts and balances grouped by financial product."
            breadcrumbs={[
                { title: 'Financial Services', href: '' },
                { title: 'Product Summary', href: '' },
            ]}
            products={products}
        />
    );
}
function ReportTable({
    title,
    description,
    breadcrumbs,
    products,
}: {
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    products: Product[];
}) {
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-4">
                <ResourcePageHeader title={title} description={description} />
                <ResourceTableCard>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-right">
                                    Accounts
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Balance
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="px-3 py-2 font-medium">
                                        {product.code} · {product.name}
                                    </td>
                                    <td className="px-3 py-2">
                                        {product.category}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {product.financial_accounts_count}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {Number(
                                            product.financial_accounts_sum_balance ??
                                                0,
                                        ).toFixed(4)}
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
