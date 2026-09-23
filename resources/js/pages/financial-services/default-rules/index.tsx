import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
    is_active: boolean;
    product?: { code: string; name: string } | null;
};

type Props = {
    rules: Rule[];
    products: { id: number; code: string; name: string }[];
};

export default function DefaultRulesIndex() {
    const { rules, products } = usePage<Props>().props;
    const { data, setData, post, processing } = useForm({
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
                            post(route('account-default-rules.store'));
                        }}
                    >
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
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.account_type}
                                onChange={(event) =>
                                    setData('account_type', event.target.value)
                                }
                            >
                                {[
                                    'SAVINGS',
                                    'SHARE',
                                    'FIXED_DEPOSIT',
                                    'RECURRING_DEPOSIT',
                                    'LOAN',
                                    'OTHER',
                                ].map((value) => (
                                    <option key={value}>{value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Product scope</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.financial_product_id}
                                onChange={(event) =>
                                    setData(
                                        'financial_product_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">All products</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.code} · {product.name}
                                    </option>
                                ))}
                            </select>
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
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={processing}>
                                Create rule
                            </Button>
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
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
