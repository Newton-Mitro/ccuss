import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import type { LoanApplicationFormPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function LoanApplicationForm() {
    const { customers, products } =
        usePage<LoanApplicationFormPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        financial_product_id: '',
        requested_amount: '',
        requested_term_months: '12',
        purpose: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Applications', href: route('loan-applications.index') },
        { title: 'New Application', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="New Loan Application" />
            <div className="mx-auto max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="New loan application"
                    description="Create a draft loan request for review."
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('loan-applications.store'));
                    }}
                    className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2"
                >
                    <div>
                        <Label>Customer</Label>
                        <Select
                            value={data.customer_id}
                            onChange={(value) => setData('customer_id', value)}
                            options={[
                                { value: '', label: 'Select customer' },
                                ...customers.map((customer) => ({
                                    value: String(customer.id),
                                    label: `${customer.customer_no} - ${customer.name}`,
                                })),
                            ]}
                        />
                        <InputError message={errors.customer_id} />
                    </div>
                    <div>
                        <Label>Loan product</Label>
                        <Select
                            value={data.financial_product_id}
                            onChange={(value) =>
                                setData('financial_product_id', value)
                            }
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
                        <Label>Requested amount</Label>
                        <Input
                            type="number"
                            min="0.0001"
                            step="0.0001"
                            value={data.requested_amount}
                            onChange={(event) =>
                                setData('requested_amount', event.target.value)
                            }
                        />
                        <InputError message={errors.requested_amount} />
                    </div>
                    <div>
                        <Label>Term (months)</Label>
                        <Input
                            type="number"
                            min="1"
                            step="1"
                            value={data.requested_term_months}
                            onChange={(event) =>
                                setData(
                                    'requested_term_months',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.requested_term_months} />
                    </div>
                    <div className="sm:col-span-2">
                        <Label>Purpose</Label>
                        <Input
                            value={data.purpose}
                            onChange={(event) =>
                                setData('purpose', event.target.value)
                            }
                        />
                        <InputError message={errors.purpose} />
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3 sm:col-span-2">
                        <Button asChild type="button" variant="outline">
                            <Link href={route('loan-applications.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save draft
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
