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
        interest_rate?: string | number;
    }>;
    customers: Array<{ id: number; customer_no: string; name: string }>;
}

export default function FixedDepositAccountCreate() {
    const { products, customers } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_id: '',
        account_no: '',
        name: '',
        account_type: 'FIXED_DEPOSIT',
        principal_amount: '',
        contractual_rate: '',
        term_months: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_instruction: 'PAYOUT',
    });
    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-accounts.fixed.store'));
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Fixed Deposits',
            href: route('financial-accounts.fixed.index'),
        },
        { title: 'Open fixed deposit', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open fixed deposit" />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Open fixed deposit"
                    description="Capture the contracted principal, rate, tenure, and maturity instruction for this term deposit."
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
                                onChange={(value) => {
                                    setData('financial_product_id', value);
                                    const selected = products.find(
                                        (item) => String(item.id) === value,
                                    );
                                    if (selected?.interest_rate)
                                        setData(
                                            'contractual_rate',
                                            String(selected.interest_rate),
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
                            <Label>Principal amount</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.principal_amount}
                                onChange={(event) =>
                                    setData(
                                        'principal_amount',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.principal_amount} />
                        </div>
                        <div>
                            <Label>Contractual annual rate (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.000001"
                                value={data.contractual_rate}
                                onChange={(event) =>
                                    setData(
                                        'contractual_rate',
                                        event.target.value,
                                    )
                                }
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Product rate:{' '}
                                {product?.interest_rate ?? 'Not specified'}
                            </p>
                            <InputError message={errors.contractual_rate} />
                        </div>
                        <div>
                            <Label>Term in months</Label>
                            <Input
                                type="number"
                                min="1"
                                max="600"
                                value={data.term_months}
                                onChange={(event) =>
                                    setData('term_months', event.target.value)
                                }
                            />
                            <InputError message={errors.term_months} />
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
                            <Label>Maturity instruction</Label>
                            <Select
                                value={data.maturity_instruction}
                                onChange={(value) =>
                                    setData('maturity_instruction', value)
                                }
                                options={[
                                    ['PAYOUT', 'Pay out'],
                                    ['RENEW_PRINCIPAL', 'Renew principal'],
                                    [
                                        'RENEW_PRINCIPAL_AND_INTEREST',
                                        'Renew principal and interest',
                                    ],
                                ].map(([value, label]) => ({ value, label }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('financial-accounts.fixed.index')}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Open fixed deposit
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
