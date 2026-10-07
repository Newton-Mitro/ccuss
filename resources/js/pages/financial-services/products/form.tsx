import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialProductFormPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type ProductTermData = {
    id?: number;
    code: string;
    name: string;
    tenure_value: string;
    tenure_unit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    interest_rate: string;
    interest_calculation: string;
    interest_frequency: string;
    minimum_amount: string;
    maximum_amount: string;
    status: boolean;
    effective_from: string;
    effective_until: string;
};

export default function FinancialProductForm() {
    const { product } = usePage<FinancialProductFormPageProps>().props;
    const editing = Boolean(product);
    const { data, setData, post, put, processing, errors } = useForm<{
        code: string;
        name: string;
        category: string;
        balance_type: string;
        interest_calculation: string;
        interest_frequency: string;
        customer_can_open_multiple_account: boolean;
        status: boolean;
        terms: ProductTermData[];
    }>({
        code: product?.code ?? '',
        name: product?.name ?? '',
        category: product?.category ?? 'SAVINGS',
        balance_type: product?.balance_type ?? 'LIABILITY',
        interest_calculation: product?.interest_calculation ?? 'NONE',
        interest_frequency: product?.interest_frequency ?? 'NONE',
        terms: product?.terms?.map((term) => ({
            ...term,
            id: term.id,
            tenure_value: String(term.tenure_value),
            interest_rate: String(term.interest_rate),
            minimum_amount:
                term.minimum_amount == null ? '' : String(term.minimum_amount),
            maximum_amount:
                term.maximum_amount == null ? '' : String(term.maximum_amount),
            effective_from: term.effective_from ?? '',
            effective_until: term.effective_until ?? '',
            status: term.status ?? true,
        })) ?? [
            {
                code: 'BASE',
                name: 'Base term',
                tenure_value: '1',
                tenure_unit: 'MONTH',
                interest_rate: '0',
                interest_calculation: product?.interest_calculation ?? 'NONE',
                interest_frequency: product?.interest_frequency ?? 'NONE',
                minimum_amount: '',
                maximum_amount: '',
                status: true,
                effective_from: '',
                effective_until: '',
            },
        ],
        customer_can_open_multiple_account:
            product?.customer_can_open_multiple_account ?? true,
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

    const updateTerm = <K extends keyof ProductTermData>(
        index: number,
        field: K,
        value: ProductTermData[K],
    ) => {
        setData(
            'terms',
            data.terms.map((term, termIndex) =>
                termIndex === index ? { ...term, [field]: value } : term,
            ),
        );
    };

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
                    <section className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Product terms</h2>
                                <p className="text-sm text-muted-foreground">
                                    Configure the tenure and interest choices
                                    shown when an account is opened.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setData('terms', [
                                        ...data.terms,
                                        {
                                            code: `TERM-${data.terms.length + 1}`,
                                            name: `Term ${data.terms.length + 1}`,
                                            tenure_value: '12',
                                            tenure_unit: 'MONTH',
                                            interest_rate: '0',
                                            interest_calculation:
                                                data.interest_calculation,
                                            interest_frequency:
                                                data.interest_frequency,
                                            minimum_amount: '',
                                            maximum_amount: '',
                                            status: true,
                                            effective_from: '',
                                            effective_until: '',
                                        },
                                    ])
                                }
                            >
                                Add term
                            </Button>
                        </div>
                        {data.terms.map((term, index) => (
                            <fieldset
                                key={term.id ?? `${term.code}-${index}`}
                                className="space-y-3 border-t pt-3"
                            >
                                <div className="flex items-center justify-between">
                                    <legend className="font-medium">
                                        {term.name || `Term ${index + 1}`}
                                    </legend>
                                    {term.code !== 'BASE' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setData(
                                                    'terms',
                                                    data.terms.filter(
                                                        (_, termIndex) =>
                                                            termIndex !== index,
                                                    ),
                                                )
                                            }
                                        >
                                            Remove term
                                        </Button>
                                    )}
                                </div>
                                <input
                                    type="hidden"
                                    name={`terms.${index}.id`}
                                    value={term.id ?? ''}
                                />
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <Label>Code</Label>
                                        <Input
                                            value={term.code}
                                            readOnly={term.code === 'BASE'}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'code',
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[`terms.${index}.code`]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Name</Label>
                                        <Input
                                            value={term.name}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[`terms.${index}.name`]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Tenure</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={term.tenure_value}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'tenure_value',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `terms.${index}.tenure_value`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Tenure unit</Label>
                                        <Select
                                            value={term.tenure_unit}
                                            onChange={(value) =>
                                                updateTerm(
                                                    index,
                                                    'tenure_unit',
                                                    value,
                                                )
                                            }
                                            options={[
                                                'DAY',
                                                'WEEK',
                                                'MONTH',
                                                'QUARTER',
                                                'YEAR',
                                            ].map((value) => ({
                                                value,
                                                label: value,
                                            }))}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `terms.${index}.tenure_unit`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Annual interest rate (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.000001"
                                            value={term.interest_rate}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'interest_rate',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `terms.${index}.interest_rate`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Interest calculation</Label>
                                        <Select
                                            value={term.interest_calculation}
                                            onChange={(value) =>
                                                updateTerm(
                                                    index,
                                                    'interest_calculation',
                                                    value,
                                                )
                                            }
                                            options={[
                                                'NONE',
                                                'SIMPLE',
                                                'COMPOUND',
                                                'FLAT',
                                                'REDUCING_BALANCE',
                                            ].map((value) => ({
                                                value,
                                                label: value.replaceAll(
                                                    '_',
                                                    ' ',
                                                ),
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Interest frequency</Label>
                                        <Select
                                            value={term.interest_frequency}
                                            onChange={(value) =>
                                                updateTerm(
                                                    index,
                                                    'interest_frequency',
                                                    value,
                                                )
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
                                                label: value.replaceAll(
                                                    '_',
                                                    ' ',
                                                ),
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Minimum amount</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={term.minimum_amount ?? ''}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'minimum_amount',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `terms.${index}.minimum_amount`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Maximum amount</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={term.maximum_amount ?? ''}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'maximum_amount',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `terms.${index}.maximum_amount`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Effective from</Label>
                                        <AppDatePicker
                                            value={term.effective_from ?? ''}
                                            onChange={(value) =>
                                                updateTerm(
                                                    index,
                                                    'effective_from',
                                                    value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Effective until</Label>
                                        <AppDatePicker
                                            value={term.effective_until ?? ''}
                                            onChange={(value) =>
                                                updateTerm(
                                                    index,
                                                    'effective_until',
                                                    value,
                                                )
                                            }
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={term.status}
                                            onChange={(event) =>
                                                updateTerm(
                                                    index,
                                                    'status',
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        Active term
                                    </label>
                                </div>
                            </fieldset>
                        ))}
                    </section>
                    <div className="flex items-center justify-between border-t pt-3">
                        <div className="space-y-2">
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
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={
                                        data.customer_can_open_multiple_account
                                    }
                                    onChange={(event) =>
                                        setData(
                                            'customer_can_open_multiple_account',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Allow multiple accounts per customer
                            </label>
                            <InputError
                                message={
                                    errors.customer_can_open_multiple_account
                                }
                            />
                        </div>
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
