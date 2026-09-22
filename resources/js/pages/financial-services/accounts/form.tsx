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
    customers: {
        id: number;
        customer_no: string;
        name: string;
        type: 'INDIVIDUAL' | 'ORGANIZATION';
        dob?: string | null;
    }[];
    category?: string | null;
}

export default function FinancialAccountForm() {
    const { products, customers, category } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_type: 'customer',
        holder_id: '',
        account_no: '',
        name: '',
        account_type: category ?? 'SAVINGS',
        metadata: {},
        joint_holder_ids: [] as string[],
        guardian_customer_id: '',
    });
    const primaryCustomer = customers.find(
        (customer) => String(customer.id) === data.holder_id,
    );
    const selectedProduct = products.find(
        (product) => String(product.id) === data.financial_product_id,
    );
    const selectedAccountType = selectedProduct?.category ?? data.account_type;
    const isDepositAccount = [
        'SAVINGS',
        'FIXED_DEPOSIT',
        'RECURRING_DEPOSIT',
    ].includes(selectedAccountType);
    const isMinorPrimary = primaryCustomer ? isMinor(primaryCustomer) : false;
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
        {
            title: category
                ? `Open ${category.replaceAll('_', ' ')} Account`
                : 'Open Account',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    category
                        ? `Open ${category.replaceAll('_', ' ')} Account`
                        : 'Open Financial Account'
                }
            />
            <div className="mx-auto max-w-3xl space-y-4">
                <ResourcePageHeader
                    title={
                        category
                            ? `Open ${category.replaceAll('_', ' ')} account`
                            : 'Open financial account'
                    }
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
                                        label: `${customer.customer_no} - ${customer.name} (${customer.type.toLowerCase()})`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.holder_id} />
                        </div>
                        {isDepositAccount && (
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Joint holders</Label>
                                <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                                    {customers
                                        .filter(
                                            (customer) =>
                                                String(customer.id) !==
                                                data.holder_id,
                                        )
                                        .map((customer) => (
                                            <label
                                                key={customer.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.joint_holder_ids.includes(
                                                        String(customer.id),
                                                    )}
                                                    onChange={(event) => {
                                                        const id = String(
                                                            customer.id,
                                                        );
                                                        const next = event
                                                            .target.checked
                                                            ? [
                                                                  ...data.joint_holder_ids,
                                                                  id,
                                                              ]
                                                            : data.joint_holder_ids.filter(
                                                                  (holderId) =>
                                                                      holderId !==
                                                                      id,
                                                              );
                                                        setData(
                                                            'joint_holder_ids',
                                                            next,
                                                        );
                                                    }}
                                                />
                                                <span>
                                                    {customer.customer_no} -{' '}
                                                    {customer.name} (
                                                    {customer.type.toLowerCase()}
                                                    )
                                                </span>
                                            </label>
                                        ))}
                                </div>
                                <InputError message={errors.joint_holder_ids} />
                            </div>
                        )}
                        {isMinorPrimary && (
                            <div>
                                <Label>Guardian</Label>
                                <Select
                                    value={data.guardian_customer_id}
                                    onChange={(value) =>
                                        setData('guardian_customer_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select adult guardian',
                                        },
                                        ...customers
                                            .filter(
                                                (customer) =>
                                                    customer.type ===
                                                        'INDIVIDUAL' &&
                                                    !isMinor(customer) &&
                                                    String(customer.id) !==
                                                        data.holder_id,
                                            )
                                            .map((customer) => ({
                                                value: String(customer.id),
                                                label: `${customer.customer_no} - ${customer.name}`,
                                            })),
                                    ]}
                                />
                                <InputError
                                    message={errors.guardian_customer_id}
                                />
                            </div>
                        )}
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
                                ]
                                    .filter(
                                        (value) =>
                                            !category || value === category,
                                    )
                                    .map((value) => ({
                                        value,
                                        label: value.replaceAll('_', ' '),
                                    }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={
                                    category
                                        ? route('financial-accounts.category', {
                                              category,
                                          })
                                        : route('financial-accounts.index')
                                }
                            >
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

function isMinor(customer: Props['customers'][number]): boolean {
    if (customer.type !== 'INDIVIDUAL' || !customer.dob) return false;

    const birthDate = new Date(customer.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const birthdayNotReached =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate());

    if (birthdayNotReached) age -= 1;

    return age < 18;
}
