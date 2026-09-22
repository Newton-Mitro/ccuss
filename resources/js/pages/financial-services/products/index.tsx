import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialProductsPageProps } from '@/types/financial-services';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';

export default function FinancialProductIndex() {
    const { products, filters } = usePage<FinancialProductsPageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    useFlashToastHandler();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('financial-products.index'),
                { search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Products', href: route('financial-products.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Products" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Financial Products"
                    description="Configure savings, deposits, shares, and loan products."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('financial-products.create')}>
                                <Plus className="mr-1 h-4 w-4" /> New product
                            </Link>
                        </Button>
                    }
                />

                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search code or product name..."
                    className="w-full bg-card sm:w-96"
                />

                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <div className="overflow-auto">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                <tr>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Code
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Product
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Category
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Balance
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Interest
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="border-b p-2 text-left text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b even:bg-muted hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-1 font-mono text-xs">
                                            {product.code}
                                        </td>
                                        <td className="px-2 py-1 font-medium">
                                            {product.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {product.category.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </td>
                                        <td className="px-2 py-1">
                                            {product.balance_type}
                                        </td>
                                        <td className="px-2 py-1 tabular-nums">
                                            {product.interest_rate}%
                                        </td>
                                        <td className="px-2 py-1">
                                            <StatusBadge
                                                tone={
                                                    product.status
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {product.status
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route(
                                                        'financial-products.show',
                                                        product.id,
                                                    )}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                    aria-label="View product"
                                                    title="View product"
                                                >
                                                    <Eye className="h-4 w-4 text-info" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'financial-products.edit',
                                                        product.id,
                                                    )}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                    aria-label="Edit product"
                                                    title="Edit product"
                                                >
                                                    <Pencil className="h-4 w-4 text-success" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={products.per_page}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('financial-products.index'),
                            { search, per_page: perPage, page: 1 },
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                    links={products.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
