import InputError from '@/components/input-error';
import {
    ResourceEmptyState,
    ResourcePageHeader,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { LoanProtectionProduct } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface PageProps extends SharedData {
    products: LoanProtectionProduct[];
    can_manage: boolean;
}

const emptyProduct = {
    code: '',
    name: '',
    description: '',
    monthly_rate_percent: '',
    status: true,
};

export default function LoanProtectionProductsIndex() {
    const { products, can_manage: canManage } = usePage<PageProps>().props;
    const { data, setData, post, put, processing, errors, reset } =
        useForm(emptyProduct);
    const [editingProductId, setEditingProductId] = useState<number | null>(
        null,
    );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Protection Products', href: '' },
    ];

    const editProduct = (product: LoanProtectionProduct) => {
        setEditingProductId(product.id);
        setData({
            code: product.code,
            name: product.name,
            description: product.description ?? '',
            monthly_rate_percent: String(product.monthly_rate_percent),
            status: product.status,
        });
    };

    const clearForm = () => {
        setEditingProductId(null);
        reset();
        setData(emptyProduct);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { onSuccess: clearForm };
        if (editingProductId) {
            put(
                route('loan-protection-products.update', editingProductId),
                options,
            );
        } else {
            post(route('loan-protection-products.store'), options);
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Protection Products" />
            <div className="space-y-5">
                <ResourcePageHeader
                    title="Credit-life products"
                    description="Configure optional insurance that pays the remaining loan principal after an approved death claim."
                    action={
                        <Button asChild size="sm" variant="outline">
                            <Link href={route('loan-applications.index')}>
                                Back to applications
                            </Link>
                        </Button>
                    }
                />

                {canManage && (
                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-lg border bg-card p-4 sm:p-5"
                    >
                        <div>
                            <h2 className="text-sm font-semibold">
                                {editingProductId
                                    ? 'Edit insurance product'
                                    : 'Add insurance product'}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                The monthly premium is charged on principal
                                remaining after each scheduled repayment.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="protection-code">
                                    Product code
                                </Label>
                                <Input
                                    id="protection-code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    maxLength={60}
                                />
                                <InputError message={errors.code} />
                            </div>
                            <div>
                                <Label htmlFor="protection-name">
                                    Product name
                                </Label>
                                <Input
                                    id="protection-name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    maxLength={180}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div>
                                <Label htmlFor="protection-rate">
                                    Monthly premium rate (%)
                                </Label>
                                <Input
                                    id="protection-rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.0001"
                                    value={data.monthly_rate_percent}
                                    onChange={(event) =>
                                        setData(
                                            'monthly_rate_percent',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.monthly_rate_percent}
                                />
                            </div>
                            <div>
                                <Label htmlFor="protection-description">
                                    Description
                                </Label>
                                <Input
                                    id="protection-description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    maxLength={2000}
                                />
                                <InputError message={errors.description} />
                            </div>
                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={(event) =>
                                        setData('status', event.target.checked)
                                    }
                                />
                                Available for new loan applications
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3">
                            {editingProductId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearForm}
                                >
                                    Cancel edit
                                </Button>
                            )}
                            <Button type="submit" disabled={processing}>
                                {editingProductId ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                                {editingProductId
                                    ? 'Save product'
                                    : 'Create product'}
                            </Button>
                        </div>
                    </form>
                )}

                {products.length === 0 ? (
                    <ResourceEmptyState
                        title="No credit-life products"
                        description="Create a product before offering protection with a loan."
                    />
                ) : (
                    <div className="overflow-x-auto rounded-lg border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2">Code</th>
                                    <th className="px-3 py-2">Product</th>
                                    <th className="px-3 py-2">Monthly rate</th>
                                    <th className="px-3 py-2">Status</th>
                                    {canManage && (
                                        <th className="px-3 py-2 text-right">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-3 py-2 font-medium">
                                            {product.code}
                                        </td>
                                        <td className="px-3 py-2">
                                            <p>{product.name}</p>
                                            {product.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {product.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 tabular-nums">
                                            {product.monthly_rate_percent}%
                                        </td>
                                        <td className="px-3 py-2">
                                            {product.status
                                                ? 'Available'
                                                : 'Inactive'}
                                        </td>
                                        {canManage && (
                                            <td className="px-3 py-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${product.name}`}
                                                    onClick={() =>
                                                        editProduct(product)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
