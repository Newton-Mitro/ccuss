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
        terms: FinancialProductTermOption[];
    }>;
    customers: Array<{ id: number; customer_no: string; name: string }>;
}

export default function RecurringDepositAccountCreate() {
    const { products, customers } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        financial_product_term_id: '',
        holder_id: '',
        name: '',
        account_type: 'RECURRING_DEPOSIT',
        installment_amount: '',
        installment_frequency: 'MONTHLY',
        total_installments: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_extension_days: '0',
        grace_days: '0',
    });
    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );
    const selectedTerm = product?.terms.find(
        (term) => String(term.id) === data.financial_product_term_id,
    );
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
                                onChange={(value) => {
                                    setData('financial_product_id', value);
                                    const selected = products.find(
                                        (item) => String(item.id) === value,
                                    );
                                    const term = selected?.terms.find(
                                        (item) => item.code === 'BASE',
                                    );
                                    setData(
                                        'financial_product_term_id',
                                        String(term?.id ?? ''),
                                    );
                                    if (term)
                                        setData(
                                            'total_installments',
                                            String(
                                                term.tenure_unit === 'YEAR'
                                                    ? term.tenure_value * 12
                                                    : term.tenure_value,
                                            ),
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
                                        if (term)
                                            setData(
                                                'total_installments',
                                                String(
                                                    term.tenure_unit === 'YEAR'
                                                        ? term.tenure_value * 12
                                                        : term.tenure_value,
                                                ),
                                            );
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
                                value={
                                    selectedTerm?.tenure_unit === 'QUARTER'
                                        ? 'QUARTERLY'
                                        : selectedTerm?.tenure_unit ===
                                                'WEEK' ||
                                            selectedTerm?.tenure_unit === 'DAY'
                                          ? 'WEEKLY'
                                          : data.installment_frequency
                                }
                                onChange={(value) =>
                                    setData('installment_frequency', value)
                                }
                                options={['WEEKLY', 'MONTHLY', 'QUARTERLY'].map(
                                    (value) => ({ value, label: value }),
                                )}
                                disabled={Boolean(selectedTerm)}
                            />
                        </div>
                        <div>
                            <Label>Total installments</Label>
                            <Input
                                type="number"
                                min="1"
                                max="600"
                                value={
                                    selectedTerm
                                        ? String(
                                              selectedTerm.tenure_unit ===
                                                  'YEAR'
                                                  ? selectedTerm.tenure_value *
                                                        12
                                                  : selectedTerm.tenure_unit ===
                                                      'QUARTER'
                                                    ? selectedTerm.tenure_value
                                                    : selectedTerm.tenure_value,
                                          )
                                        : data.total_installments
                                }
                                onChange={(event) =>
                                    setData(
                                        'total_installments',
                                        event.target.value,
                                    )
                                }
                                readOnly={Boolean(selectedTerm)}
                            />
                            <InputError message={errors.total_installments} />
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
