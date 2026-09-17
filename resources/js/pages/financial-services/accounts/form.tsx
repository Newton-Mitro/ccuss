import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    products: { id: number; code: string; name: string; category: string }[];
    customers: { id: number; customer_no: string; name: string }[];
}

export default function FinancialAccountForm() {
    const { products, customers } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_type: 'customer',
        holder_id: '',
        account_no: '',
        name: '',
        account_type: 'SAVINGS',
        metadata: {},
    });
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-accounts.store'));
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Financial Accounts',
            href: route('financial-accounts.index'),
        },
        { title: 'Open Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Financial Account" />
            <div className="mx-auto max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Open financial account"
                    description="Create an account for a customer and financial product."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label>Product</Label>
                            <Select
                                value={data.financial_product_id}
                                onChange={(value) => {
                                    const product = products.find(
                                        (item) => String(item.id) === value,
                                    );
                                    setData('financial_product_id', value);
                                    if (product)
                                        setData(
                                            'account_type',
                                            product.category,
                                        );
                                }}
                                options={[
                                    { value: '', label: 'Select product' },
                                    ...products.map((product) => ({
                                        value: String(product.id),
                                        label: `${product.code} - ${product.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.financial_product_id} />
                        </div>
                        <div>
                            <Label>Holder</Label>
                            <Select
                                value={data.holder_id}
                                onChange={(value) =>
                                    setData('holder_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select customer' },
                                    ...customers.map((customer) => ({
                                        value: String(customer.id),
                                        label: `${customer.customer_no} - ${customer.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.holder_id} />
                        </div>
                        <div>
                            <Label>Account number</Label>
                            <Input
                                value={data.account_no}
                                onChange={(event) =>
                                    setData(
                                        'account_no',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                            />
                            <InputError message={errors.account_no} />
                        </div>
                        <div>
                            <Label>Account name</Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Optional display name"
                            />
                        </div>
                        <div>
                            <Label>Account type</Label>
                            <Select
                                value={data.account_type}
                                onChange={(value) =>
                                    setData('account_type', value)
                                }
                                options={[
                                    'SAVINGS',
                                    'SHARE',
                                    'FIXED_DEPOSIT',
                                    'RECURRING_DEPOSIT',
                                    'LOAN',
                                    'CASH',
                                    'BANK',
                                    'OTHER',
                                ].map((value) => ({
                                    value,
                                    label: value.replaceAll('_', ' '),
                                }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                        <Button asChild type="button" variant="outline">
                            <Link href={route('financial-accounts.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Open account
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
