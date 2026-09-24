import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { ProductPolicyFormPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

const jsonValue = (value: unknown) =>
    value ? JSON.stringify(value, null, 2) : '';

export default function FinancialProductPolicyForm() {
    const { product, policy } = usePage<ProductPolicyFormPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        minimum_opening_amount: String(policy?.minimum_opening_amount ?? ''),
        minimum_deposit_amount: String(policy?.minimum_deposit_amount ?? ''),
        maximum_deposit_amount: String(policy?.maximum_deposit_amount ?? ''),
        maximum_loan_amount: String(policy?.maximum_loan_amount ?? ''),
        loan_to_value_percent: String(policy?.loan_to_value_percent ?? ''),
        interest_rebate_percent: String(policy?.interest_rebate_percent ?? ''),
        source_url: policy?.source_url ?? '',
        source_checked_at: policy?.source_checked_at ?? '',
        effective_from: policy?.effective_from ?? '',
        effective_until: policy?.effective_until ?? '',
        version: policy?.version ?? '',
        status: policy?.status ?? 'DRAFT',
        notes: policy?.notes ?? '',
        deposit_amount_rules: jsonValue(policy?.deposit_amount_rules),
        tenure_rules: jsonValue(policy?.tenure_rules),
        loan_ceiling_rules: jsonValue(policy?.loan_ceiling_rules),
        repayment_rules: jsonValue(policy?.repayment_rules),
        eligibility_rules: jsonValue(policy?.eligibility_rules),
        security_rules: jsonValue(policy?.security_rules),
        documentation_requirements: jsonValue(
            policy?.documentation_requirements,
        ),
        maturity_examples: jsonValue(policy?.maturity_examples),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-product-policies.store', product.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Product Policies',
            href: route('financial-product-policies.index'),
        },
        { title: product.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Policy: ${product.name}`} />
            <div className="max-w-5xl space-y-4">
                <ResourcePageHeader
                    title={`Policy for ${product.code} · ${product.name}`}
                    description="Configure the approved operating rules for this financial product."
                />
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-card p-4"
                >
                    <section className="space-y-3">
                        <h2 className="font-semibold">Limits and rates</h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                [
                                    'minimum_opening_amount',
                                    'Minimum opening amount',
                                ],
                                [
                                    'minimum_deposit_amount',
                                    'Minimum deposit amount',
                                ],
                                [
                                    'maximum_deposit_amount',
                                    'Maximum deposit amount',
                                ],
                                ['maximum_loan_amount', 'Maximum loan amount'],
                                ['loan_to_value_percent', 'Loan-to-value (%)'],
                                [
                                    'interest_rebate_percent',
                                    'Interest rebate (%)',
                                ],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <Label>{label}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={
                                            data[
                                                field as keyof typeof data
                                            ] as string
                                        }
                                        onChange={(event) =>
                                            setData(
                                                field as keyof typeof data,
                                                event.target.value as never,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors[field as keyof typeof errors]
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-3 border-t pt-4">
                        <h2 className="font-semibold">
                            Lifecycle and provenance
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <Label>Version</Label>
                                <Input
                                    value={data.version}
                                    onChange={(event) =>
                                        setData('version', event.target.value)
                                    }
                                />
                                <InputError message={errors.version} />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={data.status}
                                    onChange={(value) =>
                                        setData('status', value)
                                    }
                                    options={['DRAFT', 'ACTIVE', 'RETIRED'].map(
                                        (value) => ({ value, label: value }),
                                    )}
                                />
                                <InputError message={errors.status} />
                            </div>
                            <div>
                                <Label>Effective from</Label>
                                <Input
                                    type="date"
                                    value={data.effective_from}
                                    onChange={(event) =>
                                        setData(
                                            'effective_from',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.effective_from} />
                            </div>
                            <div>
                                <Label>Effective until</Label>
                                <Input
                                    type="date"
                                    value={data.effective_until}
                                    onChange={(event) =>
                                        setData(
                                            'effective_until',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.effective_until} />
                            </div>
                        </div>
                        <div>
                            <Label>Source URL</Label>
                            <Input
                                type="url"
                                value={data.source_url}
                                onChange={(event) =>
                                    setData('source_url', event.target.value)
                                }
                            />
                            <InputError message={errors.source_url} />
                        </div>
                        <div>
                            <Label>Source checked at</Label>
                            <Input
                                type="date"
                                value={data.source_checked_at}
                                onChange={(event) =>
                                    setData(
                                        'source_checked_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.source_checked_at} />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <textarea
                                className="min-h-24 w-full rounded-md border bg-background p-2 text-sm"
                                value={data.notes}
                                onChange={(event) =>
                                    setData('notes', event.target.value)
                                }
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </section>

                    <section className="space-y-3 border-t pt-4">
                        <h2 className="font-semibold">
                            Advanced rule configuration
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Enter valid JSON for product-specific rules. Leave
                            blank when not applicable.
                        </p>
                        <div className="grid gap-3 md:grid-cols-2">
                            {[
                                [
                                    'deposit_amount_rules',
                                    'Deposit amount rules',
                                ],
                                ['tenure_rules', 'Tenure rules'],
                                ['loan_ceiling_rules', 'Loan ceiling rules'],
                                ['repayment_rules', 'Repayment rules'],
                                ['eligibility_rules', 'Eligibility rules'],
                                ['security_rules', 'Security rules'],
                                [
                                    'documentation_requirements',
                                    'Documentation requirements',
                                ],
                                ['maturity_examples', 'Maturity examples'],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <Label>{label}</Label>
                                    <textarea
                                        className="min-h-28 w-full rounded-md border bg-background p-2 font-mono text-xs"
                                        value={
                                            data[
                                                field as keyof typeof data
                                            ] as string
                                        }
                                        onChange={(event) =>
                                            setData(
                                                field as keyof typeof data,
                                                event.target.value as never,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors[field as keyof typeof errors]
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('financial-product-policies.index')}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save policy
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
