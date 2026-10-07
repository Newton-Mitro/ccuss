import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        policy?: { minimum_opening_amount?: string | number } | null;
    }>;
    customers: Array<{ id: number; customer_no: string; name: string }>;
}

export default function SavingsAccountCreate() {
    const { products, customers } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_id: '',
        name: '',
        account_type: 'SAVINGS',
        minimum_balance: '0',
    });
    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-accounts.savings.store'));
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Savings Accounts',
            href: route('financial-accounts.savings.index'),
        },
        { title: 'Open savings account', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open savings account" />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Open savings account"
                    description="Create a savings account and apply its product minimum-balance policy."
                />
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-card p-5"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Saving product</Label>
                            <Select
                                value={data.financial_product_id}
                                onChange={(value) => {
                                    setData('financial_product_id', value);
                                    const selected = products.find(
                                        (item) => String(item.id) === value,
                                    );
                                }}
                                options={[
                                    { value: '', label: 'Select product' },
                                    ...products.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.code} - ${item.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.financial_product_id} />
                        </div>
                        <div>
                            <Label>Primary customer</Label>
                            <Select
                                value={data.holder_id}
                                onChange={(value) =>
                                    setData('holder_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select customer' },
                                    ...customers.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.customer_no} - ${item.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.holder_id} />
                        </div>
                        <div>
                            <Label>Display name</Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Minimum balance</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.minimum_balance}
                                onChange={(event) =>
                                    setData(
                                        'minimum_balance',
                                        event.target.value,
                                    )
                                }
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Product minimum:{' '}
                                {product?.policy?.minimum_opening_amount ??
                                    'Not specified'}
                            </p>
                            <InputError message={errors.minimum_balance} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('financial-accounts.savings.index')}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Open savings account
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
