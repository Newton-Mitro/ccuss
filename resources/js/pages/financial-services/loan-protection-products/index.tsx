import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import type { LoanProtectionProductsPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function LoanProtectionProductsIndex() {
    const {
        products,
        can_manage: canManage,
        filters,
    } = usePage<LoanProtectionProductsPageProps>().props;
    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useFlashToastHandler();

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('loan-protection-products.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Loan Protection Products',
            href: route('loan-protection-products.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Protection Products" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Credit-life products"
                    description="Configure optional insurance that pays the remaining loan principal after an approved death claim."
                    action={
                        canManage ? (
                            <Button asChild size="sm">
                                <Link
                                    href={route(
                                        'loan-protection-products.create',
                                    )}
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    New product
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search product code or name..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />

                {products.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No credit-life products found"
                        description="Try a different search or create a new product."
                    />
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full min-w-180 border-collapse text-sm">
                                <thead className="sticky top-0 z-10 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        <th className="border-b p-2 text-left font-medium">
                                            Code
                                        </th>
                                        <th className="border-b p-2 text-left font-medium">
                                            Product
                                        </th>
                                        <th className="border-b p-2 text-left font-medium">
                                            Monthly rate
                                        </th>
                                        <th className="border-b p-2 text-left font-medium">
                                            Status
                                        </th>
                                        {canManage && (
                                            <th className="border-b p-2 text-right font-medium">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-2 font-mono text-xs">
                                                {product.code}
                                            </td>
                                            <td className="px-2 py-2">
                                                <p className="font-medium">
                                                    {product.name}
                                                </p>
                                                {product.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 tabular-nums">
                                                {product.monthly_rate_percent}%
                                            </td>
                                            <td className="px-2 py-2">
                                                {product.status
                                                    ? 'Available'
                                                    : 'Inactive'}
                                            </td>
                                            {canManage && (
                                                <td className="px-2 py-2 text-right">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'loan-protection-products.edit',
                                                                product.id,
                                                            )}
                                                            aria-label={`Edit ${product.name}`}
                                                            title="Edit product"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="space-y-3 md:hidden">
                            {products.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="space-y-2 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.code}
                                            </p>
                                        </div>
                                        {canManage && (
                                            <Link
                                                href={route(
                                                    'loan-protection-products.edit',
                                                    product.id,
                                                )}
                                                aria-label={`Edit ${product.name}`}
                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                                            >
                                                <Pencil className="size-4" />
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-muted-foreground">
                                            Monthly rate
                                        </span>
                                        <span className="tabular-nums">
                                            {product.monthly_rate_percent}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {product.status
                                            ? 'Available for new applications'
                                            : 'Inactive'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DataTablePagination
                            perPage={products.per_page}
                            onPerPageChange={(value) => {
                                setData('per_page', value);
                                setData('page', 1);
                            }}
                            links={products.links}
                        />
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
