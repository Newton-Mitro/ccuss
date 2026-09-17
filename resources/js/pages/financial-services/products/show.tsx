import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { route } from 'ziggy-js';

interface Product {
    id: number;
    code: string;
    name: string;
    category: string;
    balance_type: string;
    interest_rate: string | number;
    interest_calculation: string;
    interest_frequency: string;
    status: boolean;
}

export default function FinancialProductShow() {
    const { product } = usePage<{ product: Product }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Products', href: route('financial-products.index') },
        { title: product.code, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={product.name}
                    description={`${product.code} · ${product.category.replaceAll('_', ' ')}`}
                    action={
                        <Button asChild size="sm">
                            <Link
                                href={route(
                                    'financial-products.edit',
                                    product.id,
                                )}
                            >
                                <Pencil className="mr-1 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Balance type', product.balance_type],
                        ['Interest rate', `${product.interest_rate}%`],
                        ['Calculation', product.interest_calculation],
                        ['Frequency', product.interest_frequency],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-card p-3"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 font-medium">
                                {value.replaceAll('_', ' ')}
                            </p>
                        </div>
                    ))}
                </div>
                <StatusBadge tone={product.status ? 'success' : 'neutral'}>
                    {product.status ? 'Active' : 'Inactive'}
                </StatusBadge>
            </div>
        </CustomAuthLayout>
    );
}
