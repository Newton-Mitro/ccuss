import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Product {
    id: number;
    code: string;
    name: string;
    category: string;
    balance_type: string;
    interest_rate: string | number;
    status: boolean;
}

interface Props extends SharedData {
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string };
}

export default function FinancialProductIndex() {
    const { products, filters } = usePage<Props>().props;
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
                    className="w-full bg-background sm:w-96"
                />

                <ResourceTableCard>
                    <div className="overflow-auto">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="bg-muted/80 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="border-b px-3 py-2">Code</th>
                                    <th className="border-b px-3 py-2">
                                        Product
                                    </th>
                                    <th className="border-b px-3 py-2">
                                        Category
                                    </th>
                                    <th className="border-b px-3 py-2">
                                        Balance
                                    </th>
                                    <th className="border-b px-3 py-2">
                                        Interest
                                    </th>
                                    <th className="border-b px-3 py-2">
                                        Status
                                    </th>
                                    <th className="border-b px-3 py-2 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b even:bg-muted/30 hover:bg-primary/5"
                                    >
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {product.code}
                                        </td>
                                        <td className="px-3 py-2 font-medium">
                                            {product.name}
                                        </td>
                                        <td className="px-3 py-2">
                                            {product.category.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            {product.balance_type}
                                        </td>
                                        <td className="px-3 py-2 tabular-nums">
                                            {product.interest_rate}%
                                        </td>
                                        <td className="px-3 py-2">
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
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route(
                                                        'financial-products.show',
                                                        product.id,
                                                    )}
                                                    title="View product"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'financial-products.edit',
                                                        product.id,
                                                    )}
                                                    title="Edit product"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
            </div>
        </CustomAuthLayout>
    );
}
