import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialProductPageProps } from '@/types/financial-services';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

export default function FinancialProductShow() {
    const { product, ledgerAccounts } =
        usePage<FinancialProductPageProps>().props;
    const [editingMappingId, setEditingMappingId] = useState<number | null>(
        null,
    );
    const { data, setData, post, put, processing, errors, reset } = useForm({
        transaction_type: '',
        debit_account_id: '',
        credit_account_id: '',
        status: true,
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Products', href: route('financial-products.index') },
        { title: product.code, href: '' },
    ];

    const submitMapping = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                setEditingMappingId(null);
            },
        };
        if (editingMappingId) {
            put(
                route('financial-products.account-mappings.update', [
                    product.id,
                    editingMappingId,
                ]),
                options,
            );
        } else {
            post(
                route('financial-products.account-mappings.store', product.id),
                options,
            );
        }
    };

    const editMapping = (
        mapping: NonNullable<typeof product.account_mappings>[number],
    ) => {
        setEditingMappingId(mapping.id);
        setData({
            transaction_type: mapping.transaction_type,
            debit_account_id: mapping.debit_account_id?.toString() ?? '',
            credit_account_id: mapping.credit_account_id?.toString() ?? '',
            status: mapping.status,
        });
    };

    const cancelMappingEdit = () => {
        reset();
        setEditingMappingId(null);
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={product.name}
                    description={`${product.code} · ${product.category.replaceAll('_', ' ')}`}
                    action={
                        <Button asChild size="sm">
                            <Link
                                href={route(
                                    'financial-products.edit',
                                    product.id,
                                )}
                            >
                                <Pencil className="mr-1 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Balance type', product.balance_type],
                        ['Interest rate', `${product.interest_rate}%`],
                        ['Calculation', product.interest_calculation],
                        ['Frequency', product.interest_frequency],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-card p-3"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 font-medium">
                                {value.replaceAll('_', ' ')}
                            </p>
                        </div>
                    ))}
                </div>
                <StatusBadge tone={product.status ? 'success' : 'neutral'}>
                    {product.status ? 'Active' : 'Inactive'}
                </StatusBadge>
                <section className="space-y-3 rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Account mappings
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Define the ledger accounts used for each product
                                transaction type.
                            </p>
                        </div>
                        {editingMappingId && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelMappingEdit}
                            >
                                <X className="mr-1 h-4 w-4" /> Cancel
                            </Button>
                        )}
                    </div>
                    <form
                        onSubmit={submitMapping}
                        className="grid gap-3 rounded-md border p-3 md:grid-cols-4 md:items-end"
                    >
                        <div>
                            <Label>Transaction type</Label>
                            <Input
                                value={data.transaction_type}
                                onChange={(event) =>
                                    setData(
                                        'transaction_type',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="DEPOSIT"
                            />
                            <InputError message={errors.transaction_type} />
                        </div>
                        <div>
                            <Label>Debit account</Label>
                            <Select
                                value={data.debit_account_id}
                                onChange={(value) =>
                                    setData('debit_account_id', value)
                                }
                                options={[
                                    { value: '', label: 'Not specified' },
                                    ...ledgerAccounts.map((account) => ({
                                        value: account.id.toString(),
                                        label: `${account.code} · ${account.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.debit_account_id} />
                        </div>
                        <div>
                            <Label>Credit account</Label>
                            <Select
                                value={data.credit_account_id}
                                onChange={(value) =>
                                    setData('credit_account_id', value)
                                }
                                options={[
                                    { value: '', label: 'Not specified' },
                                    ...ledgerAccounts.map((account) => ({
                                        value: account.id.toString(),
                                        label: `${account.code} · ${account.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.credit_account_id} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={(event) =>
                                        setData('status', event.target.checked)
                                    }
                                />
                                Active
                            </label>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                            >
                                <Plus className="mr-1 h-4 w-4" />{' '}
                                {editingMappingId ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </form>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2">Transaction</th>
                                    <th className="px-3 py-2">Debit</th>
                                    <th className="px-3 py-2">Credit</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(product.account_mappings ?? []).map(
                                    (mapping) => (
                                        <tr key={mapping.id}>
                                            <td className="px-3 py-2 font-medium">
                                                {mapping.transaction_type}
                                            </td>
                                            <td className="px-3 py-2">
                                                {mapping.debit_account
                                                    ? `${mapping.debit_account.code} · ${mapping.debit_account.name}`
                                                    : 'Not specified'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {mapping.credit_account
                                                    ? `${mapping.credit_account.code} · ${mapping.credit_account.name}`
                                                    : 'Not specified'}
                                            </td>
                                            <td className="px-3 py-2">
                                                <StatusBadge
                                                    tone={
                                                        mapping.status
                                                            ? 'success'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {mapping.status
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        editMapping(mapping)
                                                    }
                                                >
                                                    <Pencil className="mr-1 h-4 w-4" />{' '}
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.delete(
                                                            route(
                                                                'financial-products.account-mappings.destroy',
                                                                [
                                                                    product.id,
                                                                    mapping.id,
                                                                ],
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" />{' '}
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                                {!product.account_mappings?.length && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-6 text-center text-sm text-muted-foreground"
                                        >
                                            No account mappings configured.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
