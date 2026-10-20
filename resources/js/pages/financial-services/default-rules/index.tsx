import DataTablePagination from '@/components/data-table-pagination';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
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
    products: { id: number; code: string; name: string; category: string }[];
};

export default function DefaultRulesIndex() {
    const { rules, products, auth } = usePage<Props>().props;
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
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
    const cancelEdit = () => {
        setIsFormOpen(false);
        setEditingRuleId(null);
        reset();
    };
    const editRule = (rule: Rule) => {
        setEditingRuleId(rule.id);
        setIsFormOpen(true);
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
    const normalizedSearch = search.trim().toLowerCase();
    const filteredRules = rules.filter((rule) =>
        [
            rule.name,
            rule.account_type,
            rule.fine_calculation,
            rule.fine_amount,
            rule.fine_rate,
            rule.maximum_fine,
            rule.grace_days,
            rule.effective_from,
            rule.effective_to,
            rule.is_active ? 'active' : 'inactive',
            rule.product?.code,
            rule.product?.name,
        ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch),
    );
    const totalPages = Math.max(1, Math.ceil(filteredRules.length / perPage));
    const currentPage = Math.min(page, totalPages);
    const visibleRules = filteredRules.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );
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
                    action={
                        canUpdate && (
                            <Button
                                onClick={() => {
                                    setEditingRuleId(null);
                                    reset();
                                    setIsFormOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Create rule
                            </Button>
                        )
                    }
                />
                <div className="flex items-center gap-2 sm:max-w-sm">
                    <Input
                        className="bg-card"
                        type="search"
                        placeholder="Search rules..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                {isFormOpen && (
                    <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                {editingRuleId === null
                                    ? 'Create default rule'
                                    : 'Edit default rule'}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Configure the account scope, fine, and effective
                                dates for this rule.
                            </p>
                        </div>
                        <form
                            className="grid gap-3 sm:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const options = {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setIsFormOpen(false);
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
                                        setData((current) => ({
                                            ...current,
                                            account_type: value,
                                            financial_product_id: '',
                                        }))
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
                                        ...scopedProducts.map((product) => ({
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
                                        setData(
                                            'grace_days',
                                            event.target.value,
                                        )
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
                                        setData(
                                            'fine_amount',
                                            event.target.value,
                                        )
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
                                        setData(
                                            'maximum_fine',
                                            event.target.value,
                                        )
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
                                Extend maturity
                            </label>
                            <label className="flex items-center gap-2 text-sm">
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
                                Active
                            </label>
                            <div className="flex items-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {editingRuleId === null
                                        ? 'Create rule'
                                        : 'Save changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </section>
                )}
                <div className="h-[calc(100vh-360px)] min-h-60 overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    'Name',
                                    'Product scope',
                                    'Fine',
                                    'Grace days',
                                    'Effective dates',
                                    'Status',
                                    'Actions',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="border-b p-3 text-left font-medium"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRules.map((rule) => (
                                <tr
                                    key={rule.id}
                                    className="border-b even:bg-muted/40 hover:bg-accent/20"
                                >
                                    <td className="p-3">
                                        <p className="font-medium">
                                            {rule.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {rule.account_type}
                                        </p>
                                    </td>
                                    <td className="p-3">
                                        {rule.product
                                            ? `${rule.product.code} · ${rule.product.name}`
                                            : 'All products'}
                                    </td>
                                    <td className="p-3">
                                        {rule.fine_calculation === 'PERCENTAGE'
                                            ? `${rule.fine_rate}%`
                                            : rule.fine_amount}
                                    </td>
                                    <td className="p-3">{rule.grace_days}</td>
                                    <td className="p-3">
                                        {rule.effective_from?.slice(0, 10) ??
                                            '—'}
                                        {' – '}
                                        {rule.effective_to?.slice(0, 10) ??
                                            'No end date'}
                                    </td>
                                    <td className="p-3">
                                        {rule.is_active ? 'Active' : 'Inactive'}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {canUpdate && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        editRule(rule)
                                                    }
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
                                    </td>
                                </tr>
                            ))}
                            {visibleRules.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-8 text-center text-muted-foreground"
                                    >
                                        {rules.length === 0
                                            ? 'No default rules found.'
                                            : 'No rules match your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredRules.length > 0 && (
                    <DataTablePagination
                        perPage={perPage}
                        onPerPageChange={(value) => {
                            setPerPage(value);
                            setPage(1);
                        }}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRules.length}
                        onPageChange={setPage}
                        onNext={() =>
                            setPage((current) =>
                                Math.min(current + 1, totalPages),
                            )
                        }
                        onPrevious={() =>
                            setPage((current) => Math.max(current - 1, 1))
                        }
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}
