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
import {
    ArrowLeft,
    BadgeCheck,
    CalendarClock,
    Eye,
    FileText,
    Percent,
} from 'lucide-react';
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
    const selectedProduct = scopedProducts.find(
        (product) => String(product.id) === data.financial_product_id,
    );
    const formatAmount = (value: string) => {
        const amount = Number(value);
        return `৳ ${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number.isFinite(amount) ? amount : 0)}`;
    };
    const formatDate = (value: string, emptyLabel = 'Not set') => {
        if (!value) return emptyLabel;
        const [year, month, day] = value.slice(0, 10).split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return Number.isNaN(date.getTime())
            ? value
            : new Intl.DateTimeFormat('en-BD', {
                  dateStyle: 'medium',
              }).format(date);
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
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
            <div className="mx-auto w-full max-w-screen-xl space-y-3 pb-20">
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
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
                        <div className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-foreground/[0.02]">
                            <section className="space-y-2.5 p-2.5 sm:p-3">
                                <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-gradient-to-r from-muted/50 to-transparent px-2.5 py-2">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                                        <FileText className="size-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <h2 className="text-[13px] font-semibold tracking-tight">
                                            Rule details
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Choose which accounts this rule
                                            applies to.
                                        </p>
                                    </div>
                                    <span className="rounded-md border bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-muted-foreground">
                                        01
                                    </span>
                                </div>
                                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="rule-name"
                                            className="text-xs"
                                        >
                                            Rule name
                                        </Label>
                                        <Input
                                            id="rule-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Standard loan late fee"
                                            className="h-9"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="account-type"
                                            className="text-xs"
                                        >
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
                                            options={accountTypes.map(
                                                (value) => ({
                                                    value,
                                                    label: value.replaceAll(
                                                        '_',
                                                        ' ',
                                                    ),
                                                }),
                                            )}
                                        />
                                        <InputError
                                            message={errors.account_type}
                                        />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                                        <Label
                                            htmlFor="financial-product"
                                            className="text-xs"
                                        >
                                            Product scope
                                        </Label>
                                        <Select
                                            id="financial-product"
                                            value={data.financial_product_id}
                                            onChange={(value) =>
                                                setData(
                                                    'financial_product_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'All products',
                                                },
                                                ...scopedProducts.map(
                                                    (product) => ({
                                                        value: String(
                                                            product.id,
                                                        ),
                                                        label: `${product.code} · ${product.name}`,
                                                    }),
                                                ),
                                            ]}
                                        />
                                        <p className="text-[11px] leading-snug text-muted-foreground">
                                            Leave as all products to apply this
                                            rule to every product of the
                                            selected account type.
                                        </p>
                                        <InputError
                                            message={
                                                errors.financial_product_id
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-2.5 border-t p-2.5 sm:p-3">
                                <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-gradient-to-r from-primary/[0.06] to-transparent px-2.5 py-2">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                                        <Percent className="size-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <h2 className="text-[13px] font-semibold tracking-tight">
                                            Fine and grace period
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Set how a fine is calculated and
                                            when it begins to apply.
                                        </p>
                                    </div>
                                    <span className="rounded-md border bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-muted-foreground">
                                        02
                                    </span>
                                </div>
                                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="fine-calculation"
                                            className="text-xs"
                                        >
                                            Fine calculation
                                        </Label>
                                        <Select
                                            id="fine-calculation"
                                            value={data.fine_calculation}
                                            onChange={(value) =>
                                                setData(
                                                    'fine_calculation',
                                                    value,
                                                )
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
                                        <InputError
                                            message={errors.fine_calculation}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="grace-days"
                                            className="text-xs"
                                        >
                                            Grace days
                                        </Label>
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
                                            className="h-9"
                                        />
                                        <InputError
                                            message={errors.grace_days}
                                        />
                                    </div>
                                    {data.fine_calculation === 'FIXED' ? (
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="fine-amount"
                                                className="text-xs"
                                            >
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
                                                className="h-9"
                                            />
                                            <InputError
                                                message={errors.fine_amount}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="fine-rate"
                                                className="text-xs"
                                            >
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
                                                className="h-9"
                                            />
                                            <InputError
                                                message={errors.fine_rate}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="maximum-fine"
                                            className="text-xs"
                                        >
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
                                            className="h-9"
                                        />
                                        <InputError
                                            message={errors.maximum_fine}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-2.5 border-t p-2.5 sm:p-3">
                                <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-gradient-to-r from-muted/50 to-transparent px-2.5 py-2">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                                        <CalendarClock className="size-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <h2 className="text-[13px] font-semibold tracking-tight">
                                            Effective dates and status
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Choose when the rule applies and
                                            whether it should be active.
                                        </p>
                                    </div>
                                    <span className="rounded-md border bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-muted-foreground">
                                        03
                                    </span>
                                </div>
                                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Effective from
                                        </Label>
                                        <AppDatePicker
                                            value={data.effective_from}
                                            onChange={(value) =>
                                                setData('effective_from', value)
                                            }
                                        />
                                        <InputError
                                            message={errors.effective_from}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Effective to
                                        </Label>
                                        <AppDatePicker
                                            value={data.effective_to}
                                            onChange={(value) =>
                                                setData('effective_to', value)
                                            }
                                        />
                                        <InputError
                                            message={errors.effective_to}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="maturity-extension-days"
                                            className="text-xs"
                                        >
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
                                            className="h-9"
                                        />
                                        <InputError
                                            message={
                                                errors.maturity_extension_days
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center gap-1.5 rounded-lg border border-border/70 bg-gradient-to-br from-muted/40 to-muted/10 p-2.5 sm:mt-5">
                                        <label className="flex cursor-pointer items-center gap-2 text-xs">
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
                                                <span className="text-[11px] text-muted-foreground">
                                                    Apply the extension days
                                                    when assessing a fine.
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2 text-xs">
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
                        </div>

                        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                            <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                                <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-3 py-3">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Eye className="size-3.5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-semibold tracking-[0.14em] text-primary uppercase">
                                                Rule overview
                                            </p>
                                            <h2 className="text-[13px] font-semibold">
                                                Live preview
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-0.5 text-[9px] font-semibold text-primary">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 p-3">
                                    <div className="rounded-lg bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3 ring-1 ring-primary/10">
                                        <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Rule name
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold break-words">
                                            {data.name || 'Default rule name'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-primary/15 bg-primary/[0.06] px-3 py-2.5">
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Percent className="size-3.5 text-primary" />
                                            {data.fine_calculation === 'FIXED'
                                                ? 'Fine amount'
                                                : 'Fine rate'}
                                        </div>
                                        <p className="mt-0.5 text-lg font-semibold tracking-tight text-primary tabular-nums">
                                            {data.fine_calculation === 'FIXED'
                                                ? formatAmount(data.fine_amount)
                                                : `${Number(data.fine_rate || 0).toFixed(2)}%`}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        {[
                                            {
                                                label: 'Account type',
                                                value: data.account_type.replaceAll(
                                                    '_',
                                                    ' ',
                                                ),
                                            },
                                            {
                                                label: 'Product scope',
                                                value: selectedProduct
                                                    ? `${selectedProduct.code} · ${selectedProduct.name}`
                                                    : 'All products',
                                            },
                                            {
                                                label: 'Fine calculation',
                                                value:
                                                    data.fine_calculation ===
                                                    'FIXED'
                                                        ? 'Fixed amount'
                                                        : 'Percentage',
                                            },
                                            {
                                                label: 'Grace period',
                                                value: `${data.grace_days || '0'} days`,
                                            },
                                            {
                                                label: 'Maximum fine',
                                                value: data.maximum_fine
                                                    ? formatAmount(
                                                          data.maximum_fine,
                                                      )
                                                    : 'No limit',
                                            },
                                            {
                                                label: 'Effective from',
                                                value: formatDate(
                                                    data.effective_from,
                                                ),
                                            },
                                            {
                                                label: 'Effective to',
                                                value: formatDate(
                                                    data.effective_to,
                                                    'No end date',
                                                ),
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex min-w-0 items-start justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5"
                                            >
                                                <span className="text-[10px] text-muted-foreground">
                                                    {item.label}
                                                </span>
                                                <span className="min-w-0 text-right text-[10px] font-medium break-words">
                                                    {item.value || 'Not set'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div
                                            className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[10px] font-medium ${
                                                data.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <BadgeCheck className="size-4" />
                                            {data.is_active
                                                ? 'Rule is active'
                                                : 'Rule is inactive'}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2.5 py-2 text-[10px]">
                                            <span className="text-muted-foreground">
                                                Extends maturity
                                            </span>
                                            <span className="font-medium">
                                                {data.extends_maturity
                                                    ? `${data.maturity_extension_days || '0'} days`
                                                    : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <footer
                        data-slot="form-actions"
                        className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6"
                    >
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
