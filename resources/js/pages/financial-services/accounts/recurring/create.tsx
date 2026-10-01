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
    products: Array<{ id: number; code: string; name: string }>;
    customers: Array<{ id: number; customer_no: string; name: string }>;
}

export default function RecurringDepositAccountCreate() {
    const { products, customers } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_id: '',
        account_no: '',
        name: '',
        account_type: 'RECURRING_DEPOSIT',
        installment_amount: '',
        installment_frequency: 'MONTHLY',
        total_installments: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_extension_days: '0',
        grace_days: '0',
    });
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-accounts.recurring.store'));
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Recurring Deposits',
            href: route('financial-accounts.recurring.index'),
        },
        { title: 'Open recurring deposit', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open recurring deposit" />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Open recurring deposit"
                    description="Define the installment schedule, grace period, and maturity extension for this recurring deposit."
                />
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-card p-5"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Deposit product</Label>
                            <Select
                                value={data.financial_product_id}
                                onChange={(value) =>
                                    setData('financial_product_id', value)
                                }
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
                            <Label>Depositor</Label>
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
                            <Label>Account number</Label>
                            <Input
                                value={data.account_no}
                                onChange={(event) =>
                                    setData('account_no', event.target.value)
                                }
                            />
                            <InputError message={errors.account_no} />
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
                            <Label>Installment amount</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.installment_amount}
                                onChange={(event) =>
                                    setData(
                                        'installment_amount',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.installment_amount} />
                        </div>
                        <div>
                            <Label>Frequency</Label>
                            <Select
                                value={data.installment_frequency}
                                onChange={(value) =>
                                    setData('installment_frequency', value)
                                }
                                options={['WEEKLY', 'MONTHLY', 'QUARTERLY'].map(
                                    (value) => ({ value, label: value }),
                                )}
                            />
                        </div>
                        <div>
                            <Label>Total installments</Label>
                            <Input
                                type="number"
                                min="1"
                                max="600"
                                value={data.total_installments}
                                onChange={(event) =>
                                    setData(
                                        'total_installments',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.total_installments} />
                        </div>
                        <div>
                            <Label>Start date</Label>
                            <Input
                                type="date"
                                value={data.started_at}
                                onChange={(event) =>
                                    setData('started_at', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Grace days</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.grace_days}
                                onChange={(event) =>
                                    setData('grace_days', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Maturity extension days</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.maturity_extension_days}
                                onChange={(event) =>
                                    setData(
                                        'maturity_extension_days',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route(
                                    'financial-accounts.recurring.index',
                                )}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Open recurring deposit
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
