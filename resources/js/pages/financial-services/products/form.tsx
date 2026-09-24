import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialProductFormPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function FinancialProductForm() {
    const { product } = usePage<FinancialProductFormPageProps>().props;
    const editing = Boolean(product);
    const { data, setData, post, put, processing, errors } = useForm({
        code: product?.code ?? '',
        name: product?.name ?? '',
        category: product?.category ?? 'SAVINGS',
        balance_type: product?.balance_type ?? 'LIABILITY',
        interest_rate: String(product?.interest_rate ?? '0'),
        interest_calculation: product?.interest_calculation ?? 'NONE',
        interest_frequency: product?.interest_frequency ?? 'NONE',
        status: product?.status ?? true,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (editing) {
            put(route('financial-products.update', product!.id));
        } else {
            post(route('financial-products.store'));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Products', href: route('financial-products.index') },
        { title: editing ? 'Edit Product' : 'New Product', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing ? 'Edit Financial Product' : 'New Financial Product'
                }
            />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title={
                        editing
                            ? 'Edit financial product'
                            : 'New financial product'
                    }
                    description="Define the product rules used when financial accounts are opened."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-xl border bg-card p-4"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label>Code</Label>
                            <Input
                                value={data.code}
                                onChange={(event) =>
                                    setData(
                                        'code',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div>
                            <Label>Category</Label>
                            <Select
                                value={data.category}
                                onChange={(value) => setData('category', value)}
                                options={[
                                    'SAVINGS',
                                    'SHARE',
                                    'FIXED_DEPOSIT',
                                    'RECURRING_DEPOSIT',
                                    'LOAN',
                                    'OTHER',
                                ].map((value) => ({
                                    value,
                                    label: value.replaceAll('_', ' '),
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Balance type</Label>
                            <Select
                                value={data.balance_type}
                                onChange={(value) =>
                                    setData('balance_type', value)
                                }
                                options={['ASSET', 'LIABILITY', 'EQUITY'].map(
                                    (value) => ({ value, label: value }),
                                )}
                            />
                        </div>
                        <div>
                            <Label>Interest rate (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.000001"
                                value={data.interest_rate}
                                onChange={(event) =>
                                    setData('interest_rate', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Interest calculation</Label>
                            <Select
                                value={data.interest_calculation}
                                onChange={(value) =>
                                    setData('interest_calculation', value)
                                }
                                options={[
                                    'NONE',
                                    'SIMPLE',
                                    'COMPOUND',
                                    'FLAT',
                                    'REDUCING_BALANCE',
                                ].map((value) => ({
                                    value,
                                    label: value.replaceAll('_', ' '),
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Interest frequency</Label>
                            <Select
                                value={data.interest_frequency}
                                onChange={(value) =>
                                    setData('interest_frequency', value)
                                }
                                options={[
                                    'NONE',
                                    'DAILY',
                                    'MONTHLY',
                                    'QUARTERLY',
                                    'HALF_YEARLY',
                                    'YEARLY',
                                    'MATURITY',
                                ].map((value) => ({
                                    value,
                                    label: value.replaceAll('_', ' '),
                                }))}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={(event) =>
                                    setData('status', event.target.checked)
                                }
                            />
                            Active product
                        </label>
                        <div className="flex gap-2">
                            <Button asChild type="button" variant="outline">
                                <Link href={route('financial-products.index')}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editing ? 'Save changes' : 'Create product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
