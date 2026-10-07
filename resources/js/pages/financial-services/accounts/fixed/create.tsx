import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { FinancialProductTermOption } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        base_interest_rate?: string | number | null;
        terms: FinancialProductTermOption[];
    }>;
    customers: Array<{
        id: number;
        customer_no: string;
        name: string;
        type: 'INDIVIDUAL' | 'ORGANIZATION';
        dob?: string | null;
    }>;
}

export default function FixedDepositAccountCreate() {
    const { products, customers } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        financial_product_term_id: '',
        holder_id: '',
        guardian_customer_id: '',
        name: '',
        account_type: 'FIXED_DEPOSIT',
        principal_amount: '',
        contractual_rate: '',
        term_months: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_instruction: 'PAYOUT',
    });
    const depositor = customers.find(
        (customer) => String(customer.id) === data.holder_id,
    );
    const isMinorDepositor = depositor ? isMinor(depositor) : false;
    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );
    const selectedTerm = product?.terms.find(
        (term) => String(term.id) === data.financial_product_term_id,
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
                                    const baseTerm = selected?.terms.find(
                                        (term) => term.code === 'BASE',
                                    );
                                    setData(
                                        'financial_product_term_id',
                                        String(baseTerm?.id ?? ''),
                                    );
                                    if (baseTerm)
                                        setData(
                                            'contractual_rate',
                                            String(baseTerm.interest_rate),
                                        );
                                    if (baseTerm?.tenure_unit === 'MONTH')
                                        setData(
                                            'term_months',
                                            String(baseTerm.tenure_value),
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
                        {product?.terms.length ? (
                            <div>
                                <Label>Product term</Label>
                                <Select
                                    value={data.financial_product_term_id}
                                    onChange={(value) => {
                                        setData(
                                            'financial_product_term_id',
                                            value,
                                        );
                                        const term = product.terms.find(
                                            (item) => String(item.id) === value,
                                        );
                                        if (term) {
                                            setData(
                                                'contractual_rate',
                                                String(term.interest_rate),
                                            );
                                            if (term.tenure_unit === 'MONTH')
                                                setData(
                                                    'term_months',
                                                    String(term.tenure_value),
                                                );
                                        }
                                    }}
                                    options={product.terms.map((term) => ({
                                        value: String(term.id),
                                        label: `${term.name} · ${term.tenure_value} ${term.tenure_unit.toLowerCase()} · ${term.interest_rate}%`,
                                    }))}
                                />
                                <InputError
                                    message={errors.financial_product_term_id}
                                />
                            </div>
                        ) : null}
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
                        {isMinorDepositor && (
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
                                value={
                                    selectedTerm
                                        ? String(selectedTerm.interest_rate)
                                        : data.contractual_rate
                                }
                                onChange={(event) =>
                                    setData(
                                        'contractual_rate',
                                        event.target.value,
                                    )
                                }
                                readOnly={Boolean(selectedTerm)}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Product rate:{' '}
                                {product?.base_interest_rate ?? 'Not specified'}
                            </p>
                            <InputError message={errors.contractual_rate} />
                        </div>
                        <div>
                            <Label>Term in months</Label>
                            <Input
                                type="number"
                                min="1"
                                max="600"
                                value={
                                    selectedTerm
                                        ? String(selectedTerm.tenure_value)
                                        : data.term_months
                                }
                                onChange={(event) =>
                                    setData('term_months', event.target.value)
                                }
                                readOnly={Boolean(selectedTerm)}
                            />
                            <InputError message={errors.term_months} />
                        </div>
                        <div>
                            <Label>Start date</Label>
                            <AppDatePicker
                                value={data.started_at}
                                onChange={(value) =>
                                    setData('started_at', value)
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
