import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

type Rule = {
    id: number;
    name: string;
    account_type: string;
    fine_calculation: string;
    fine_amount: string | number;
    fine_rate: string | number;
    maximum_fine?: string | number | null;
    grace_days: number;
    financial_product_id: number | null;
    extends_maturity: boolean;
    maturity_extension_days: number;
    effective_from: string | null;
    effective_to: string | null;
    is_active: boolean;
    product?: { code: string; name: string } | null;
};

type Props = SharedData & {
    rules: Rule[];
    products: { id: number; code: string; name: string }[];
};

export default function DefaultRulesIndex() {
    const { rules, products, auth } = usePage<Props>().props;
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
    const canUpdate = (auth.user.permissions ?? []).some(
        (permission) => permission.slug === 'financial.products.update',
    );
    const { data, setData, post, put, reset, processing } = useForm({
        financial_product_id: '',
        account_type: 'LOAN',
        name: '',
        grace_days: '0',
        fine_calculation: 'FIXED',
        fine_amount: '0',
        fine_rate: '0',
        maximum_fine: '',
        extends_maturity: false,
        maturity_extension_days: '0',
        effective_from: new Date().toISOString().slice(0, 10),
        effective_to: '',
        is_active: true,
    });
    const cancelEdit = () => {
        setEditingRuleId(null);
        reset();
    };
    const editRule = (rule: Rule) => {
        setEditingRuleId(rule.id);
        setData({
            financial_product_id: rule.financial_product_id
                ? String(rule.financial_product_id)
                : '',
            account_type: rule.account_type,
            name: rule.name,
            grace_days: String(rule.grace_days),
            fine_calculation: rule.fine_calculation,
            fine_amount: String(rule.fine_amount ?? 0),
            fine_rate: String(rule.fine_rate ?? 0),
            maximum_fine: String(rule.maximum_fine ?? ''),
            extends_maturity: rule.extends_maturity,
            maturity_extension_days: String(rule.maturity_extension_days),
            effective_from: rule.effective_from?.slice(0, 10) ?? '',
            effective_to: rule.effective_to?.slice(0, 10) ?? '',
            is_active: rule.is_active,
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Default Rules', href: route('account-default-rules.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Default Rules" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Default Rules"
                    description="Configure effective account and product fine rules."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="grid gap-3 sm:grid-cols-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const options = {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setEditingRuleId(null);
                                    reset();
                                },
                            };

                            if (editingRuleId === null) {
                                post(
                                    route('account-default-rules.store'),
                                    options,
                                );
                            } else {
                                put(
                                    route(
                                        'account-default-rules.update',
                                        editingRuleId,
                                    ),
                                    options,
                                );
                            }
                        }}
                    >
                        {editingRuleId !== null && (
                            <div className="text-sm font-medium sm:col-span-3">
                                Editing rule #{editingRuleId}
                            </div>
                        )}
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Account type</Label>
                            <Select
                                className="h-9"
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
                                    'OTHER',
                                ].map((value) => ({ value, label: value }))}
                            />
                        </div>
                        <div>
                            <Label>Product scope</Label>
                            <Select
                                className="h-9"
                                value={data.financial_product_id}
                                onChange={(value) =>
                                    setData('financial_product_id', value)
                                }
                                placeholder="All products"
                                options={[
                                    { value: '', label: 'All products' },
                                    ...products.map((product) => ({
                                        value: String(product.id),
                                        label: `${product.code} · ${product.name}`,
                                    })),
                                ]}
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
                            <Label>Fine amount</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.fine_amount}
                                onChange={(event) =>
                                    setData('fine_amount', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Fine rate %</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.fine_rate}
                                onChange={(event) =>
                                    setData('fine_rate', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Maximum fine</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.maximum_fine}
                                onChange={(event) =>
                                    setData('maximum_fine', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Effective from</Label>
                            <AppDatePicker
                                value={data.effective_from}
                                onChange={(value) =>
                                    setData('effective_from', value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Effective to</Label>
                            <AppDatePicker
                                value={data.effective_to}
                                onChange={(value) =>
                                    setData('effective_to', value)
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
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.extends_maturity}
                                onChange={(event) =>
                                    setData(
                                        'extends_maturity',
                                        event.target.checked,
                                    )
                                }
                            />
                            Extend maturity
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) =>
                                    setData('is_active', event.target.checked)
                                }
                            />
                            Active
                        </label>
                        <div className="flex items-end gap-2">
                            <Button type="submit" disabled={processing}>
                                {editingRuleId === null
                                    ? 'Create rule'
                                    : 'Save changes'}
                            </Button>
                            {editingRuleId !== null && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {rule.name} · {rule.account_type}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {rule.product?.code ?? 'All products'} ·
                                        Grace {rule.grace_days} days ·{' '}
                                        {rule.fine_calculation === 'PERCENTAGE'
                                            ? `${rule.fine_rate}%`
                                            : rule.fine_amount}{' '}
                                        ·{' '}
                                        {rule.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {canUpdate && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => editRule(rule)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    'account-default-rules.destroy',
                                                    rule.id,
                                                ),
                                            )
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
