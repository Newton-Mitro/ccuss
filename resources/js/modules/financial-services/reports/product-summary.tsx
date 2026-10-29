import HeadingSmall from '@/components/heading-small';
import ReportExportActions from '@/components/report-export-actions';
import { ResourceTableCard } from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type {
    ProductSummaryItem,
    ProductSummaryReportPageProps,
} from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function ProductSummaryReport() {
    const { products } = usePage<ProductSummaryReportPageProps>().props;
    return (
        <ReportTable
            title="Product summary"
            description="Accounts and balances grouped by financial product."
            breadcrumbs={[
                { title: 'Financial Services', href: '/financial-services' },
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
    products: ProductSummaryItem[];
}) {
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-4">
                <ReportExportActions report="product-summary" />
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall title={title} description={description} />
                </div>
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
                                        {formatBDTCurrency(
                                            product.financial_accounts_sum_balance ??
                                                0,
                                            false,
                                        )}
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
