import InputError from '@/components/input-error';

import HeadingSmall from '@/components/heading-small';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/financial-services/types/default-rules/form.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, FileText, Percent } from 'lucide-react';
import { route } from 'ziggy-js';

const accountTypes = [
    'SAVINGS',
    'SHARE',
    'FIXED_DEPOSIT',
    'RECURRING_DEPOSIT',
    'LOAN',
    'OTHER',
];

export default function DefaultRuleForm() {
    const { rule, products } = usePage<Props>().props;
    const editing = rule !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        financial_product_id: rule?.financial_product_id
            ? String(rule.financial_product_id)
            : '',
        account_type: rule?.account_type ?? 'LOAN',
        name: rule?.name ?? '',
        grace_days: String(rule?.grace_days ?? 0),
        fine_calculation: rule?.fine_calculation ?? 'FIXED',
        fine_amount: String(rule?.fine_amount ?? 0),
        fine_rate: String(rule?.fine_rate ?? 0),
        maximum_fine: String(rule?.maximum_fine ?? ''),
        extends_maturity: rule?.extends_maturity ?? false,
        maturity_extension_days: String(rule?.maturity_extension_days ?? 0),
        effective_from:
            rule?.effective_from?.slice(0, 10) ??
            new Date().toISOString().slice(0, 10),
        effective_to: rule?.effective_to?.slice(0, 10) ?? '',
        is_active: rule?.is_active ?? true,
    });
    const scopedProducts = products.filter((product) =>
        data.account_type === 'LOAN'
            ? product.category === 'LOAN'
            : [
                  'SAVINGS',
                  'SHARE',
                  'FIXED_DEPOSIT',
                  'RECURRING_DEPOSIT',
              ].includes(product.category),
    );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Default Rules',
            href: route('account-default-rules.index'),
        },
        { title: editing ? 'Edit rule' : 'Create rule', href: '' },
    ];
    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => router.visit(route('account-default-rules.index')),
        };
        if (rule) {
            put(route('account-default-rules.update', rule.id), options);
        } else {
            post(route('account-default-rules.store'), options);
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={editing ? 'Edit default rule' : 'Create default rule'}
            />
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={
                            editing
                                ? 'Edit default rule'
                                : 'Create default rule'
                        }
                        description="Configure the account scope, fine, and effective dates for this rule."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <Button asChild variant="outline">
                            <Link href={route('account-default-rules.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to rules
                            </Link>
                        </Button>
                    </div>
                </div>
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                >
                    <section className="space-y-5 p-5 sm:p-7">
                        <div className="flex items-start gap-3 border-b pb-5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                <FileText className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-semibold tracking-tight">
                                    Rule details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose which accounts this rule applies to.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="rule-name">Rule name</Label>
                                <Input
                                    id="rule-name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="e.g. Standard loan late fee"
                                    className="h-11"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-type">
                                    Account type
                                </Label>
                                <Select
                                    id="account-type"
                                    value={data.account_type}
                                    onChange={(value) =>
                                        setData((current) => ({
                                            ...current,
                                            account_type: value,
                                            financial_product_id: '',
                                        }))
                                    }
                                    options={accountTypes.map((value) => ({
                                        value,
                                        label: value.replaceAll('_', ' '),
                                    }))}
                                />
                                <InputError message={errors.account_type} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="financial-product">
                                    Product scope
                                </Label>
                                <Select
                                    id="financial-product"
                                    value={data.financial_product_id}
                                    onChange={(value) =>
                                        setData('financial_product_id', value)
                                    }
                                    options={[
                                        { value: '', label: 'All products' },
                                        ...scopedProducts.map((product) => ({
                                            value: String(product.id),
                                            label: `${product.code} · ${product.name}`,
                                        })),
                                    ]}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave as all products to apply this rule to
                                    every product of the selected account type.
                                </p>
                                <InputError
                                    message={errors.financial_product_id}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-5 border-t p-5 sm:p-7">
                        <div className="flex items-start gap-3 border-b pb-5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Percent className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-semibold tracking-tight">
                                    Fine and grace period
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Set how a fine is calculated and when it
                                    begins to apply.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="fine-calculation">
                                    Fine calculation
                                </Label>
                                <Select
                                    id="fine-calculation"
                                    value={data.fine_calculation}
                                    onChange={(value) =>
                                        setData('fine_calculation', value)
                                    }
                                    options={[
                                        {
                                            value: 'FIXED',
                                            label: 'Fixed amount',
                                        },
                                        {
                                            value: 'PERCENTAGE',
                                            label: 'Percentage',
                                        },
                                    ]}
                                />
                                <InputError message={errors.fine_calculation} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grace-days">Grace days</Label>
                                <Input
                                    id="grace-days"
                                    type="number"
                                    min="0"
                                    value={data.grace_days}
                                    onChange={(event) =>
                                        setData(
                                            'grace_days',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11"
                                />
                                <InputError message={errors.grace_days} />
                            </div>
                            {data.fine_calculation === 'FIXED' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="fine-amount">
                                        Fine amount
                                    </Label>
                                    <Input
                                        id="fine-amount"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={data.fine_amount}
                                        onChange={(event) =>
                                            setData(
                                                'fine_amount',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11"
                                    />
                                    <InputError message={errors.fine_amount} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="fine-rate">
                                        Fine rate %
                                    </Label>
                                    <Input
                                        id="fine-rate"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={data.fine_rate}
                                        onChange={(event) =>
                                            setData(
                                                'fine_rate',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11"
                                    />
                                    <InputError message={errors.fine_rate} />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="maximum-fine">
                                    Maximum fine
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="maximum-fine"
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={data.maximum_fine}
                                    onChange={(event) =>
                                        setData(
                                            'maximum_fine',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11"
                                />
                                <InputError message={errors.maximum_fine} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-5 border-t p-5 sm:p-7">
                        <div className="flex items-start gap-3 border-b pb-5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                <CalendarClock className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-semibold tracking-tight">
                                    Effective dates and status
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose when the rule applies and whether it
                                    should be active.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Effective from</Label>
                                <AppDatePicker
                                    value={data.effective_from}
                                    onChange={(value) =>
                                        setData('effective_from', value)
                                    }
                                />
                                <InputError message={errors.effective_from} />
                            </div>
                            <div className="space-y-2">
                                <Label>Effective to</Label>
                                <AppDatePicker
                                    value={data.effective_to}
                                    onChange={(value) =>
                                        setData('effective_to', value)
                                    }
                                />
                                <InputError message={errors.effective_to} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maturity-extension-days">
                                    Maturity extension days
                                </Label>
                                <Input
                                    id="maturity-extension-days"
                                    type="number"
                                    min="0"
                                    value={data.maturity_extension_days}
                                    onChange={(event) =>
                                        setData(
                                            'maturity_extension_days',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11"
                                />
                                <InputError
                                    message={errors.maturity_extension_days}
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-3 rounded-xl border bg-muted/20 p-4 sm:mt-6">
                                <label className="flex cursor-pointer items-center gap-3 text-sm">
                                    <Input
                                        type="checkbox"
                                        checked={data.extends_maturity}
                                        onChange={(event) =>
                                            setData(
                                                'extends_maturity',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    <span>
                                        <span className="block font-medium">
                                            Extend account maturity
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Apply the extension days when
                                            assessing a fine.
                                        </span>
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3 text-sm">
                                    <Input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(event) =>
                                            setData(
                                                'is_active',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Active rule
                                </label>
                            </div>
                        </div>
                    </section>

                    <footer className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                        <Button asChild variant="outline">
                            <Link href={route('account-default-rules.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : editing
                                  ? 'Save changes'
                                  : 'Create rule'}
                        </Button>
                    </footer>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
