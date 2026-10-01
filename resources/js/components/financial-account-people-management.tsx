import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Customer {
    id: number;
    customer_no: string;
    name: string;
    primary_phone?: string | null;
}
interface Holder {
    id: number;
    name?: string;
    customer_no?: string;
    pivot?: { role?: string; ownership_percent?: string | number };
}
interface Nominee {
    id: number;
    customer_id?: number | null;
    name: string;
    relationship: string;
    phone?: string | null;
    share_percent?: string | number;
    is_primary?: boolean;
}

export default function FinancialAccountPeopleManagement({
    account,
    customers,
    nomineesEnabled,
}: {
    account: { id: number; holders?: Holder[]; nominees?: Nominee[] };
    customers: Customer[];
    nomineesEnabled: boolean;
}) {
    const [editingHolder, setEditingHolder] = useState<number | null>(null);
    const [editingNominee, setEditingNominee] = useState<number | null>(null);
    const holderForm = useForm({
        customer_id: '',
        role: 'JOINT',
        ownership_percent: '100',
        guardian_customer_id: '',
    });
    const nomineeForm = useForm({
        customer_id: '',
        name: '',
        relationship: '',
        phone: '',
        share_percent: '100',
        is_primary: false,
    });
    const saveHolder = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                holderForm.reset();
                setEditingHolder(null);
            },
        };
        if (editingHolder)
            holderForm.put(
                route('financial-accounts.holders.update', [
                    account.id,
                    editingHolder,
                ]),
                options,
            );
        else
            holderForm.post(
                route('financial-accounts.holders.store', account.id),
                options,
            );
    };
    const saveNominee = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                nomineeForm.reset();
                setEditingNominee(null);
            },
        };
        if (editingNominee)
            nomineeForm.put(
                route('financial-accounts.nominees.update', [
                    account.id,
                    editingNominee,
                ]),
                options,
            );
        else
            nomineeForm.post(
                route('financial-accounts.nominees.store', account.id),
                options,
            );
    };
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Account holders</h2>
                    <span className="text-xs text-muted-foreground">
                        Primary, joint, or signatory
                    </span>
                </div>
                <div className="mt-3 divide-y">
                    {(account.holders ?? []).map((holder) => (
                        <div
                            key={holder.id}
                            className="flex items-center justify-between gap-3 py-2 text-sm"
                        >
                            <div>
                                <p className="font-medium">
                                    {holder.name ?? holder.customer_no}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {holder.pivot?.role ?? 'JOINT'} ·{' '}
                                    {holder.pivot?.ownership_percent ?? 0}%
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEditingHolder(holder.id);
                                        holderForm.setData({
                                            customer_id: String(holder.id),
                                            role: holder.pivot?.role ?? 'JOINT',
                                            ownership_percent: String(
                                                holder.pivot
                                                    ?.ownership_percent ?? 100,
                                            ),
                                            guardian_customer_id: '',
                                        });
                                    }}
                                >
                                    <Pencil className="mr-1 h-4 w-4" />
                                    Edit
                                </Button>
                                {holder.pivot?.role !== 'PRIMARY' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    'financial-accounts.holders.destroy',
                                                    [account.id, holder.id],
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="mr-1 h-4 w-4" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <form
                    onSubmit={saveHolder}
                    className="mt-3 space-y-3 border-t pt-3"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label>Customer</Label>
                            <Select
                                value={holderForm.data.customer_id}
                                disabled={Boolean(editingHolder)}
                                onChange={(value) =>
                                    holderForm.setData('customer_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select customer' },
                                    ...customers
                                        .filter(
                                            (customer) =>
                                                !account.holders?.some(
                                                    (holder) =>
                                                        holder.id ===
                                                            customer.id &&
                                                        holder.id !==
                                                            editingHolder,
                                                ),
                                        )
                                        .map((customer) => ({
                                            value: String(customer.id),
                                            label: `${customer.customer_no} - ${customer.name}`,
                                        })),
                                ]}
                            />
                            <InputError
                                message={holderForm.errors.customer_id}
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select
                                value={holderForm.data.role}
                                onChange={(value) =>
                                    holderForm.setData('role', value)
                                }
                                options={[
                                    { value: 'PRIMARY', label: 'Primary' },
                                    { value: 'JOINT', label: 'Joint' },
                                    { value: 'SIGNATORY', label: 'Signatory' },
                                ]}
                            />
                            <InputError message={holderForm.errors.role} />
                        </div>
                        <div>
                            <Label>Ownership percentage</Label>
                            <Input
                                type="number"
                                min="0.0001"
                                max="100"
                                step="0.0001"
                                value={holderForm.data.ownership_percent}
                                onChange={(event) =>
                                    holderForm.setData(
                                        'ownership_percent',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={holderForm.errors.ownership_percent}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={holderForm.processing}>
                            <Plus className="mr-1 h-4 w-4" />
                            {editingHolder ? 'Update holder' : 'Add holder'}
                        </Button>
                    </div>
                </form>
            </section>
            {nomineesEnabled && (
                <section className="rounded-lg border bg-card p-4">
                    <h2 className="font-semibold">Nominees</h2>
                    <div className="mt-3 divide-y">
                        {(account.nominees ?? []).map((nominee) => (
                            <div
                                key={nominee.id}
                                className="flex items-center justify-between gap-3 py-2 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {nominee.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {nominee.relationship}
                                        {nominee.is_primary
                                            ? ' · Primary'
                                            : ''}{' '}
                                        · {nominee.share_percent ?? 0}%
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setEditingNominee(nominee.id);
                                            nomineeForm.setData({
                                                customer_id: nominee.customer_id
                                                    ? String(
                                                          nominee.customer_id,
                                                      )
                                                    : '',
                                                name: nominee.name,
                                                relationship:
                                                    nominee.relationship,
                                                phone: nominee.phone ?? '',
                                                share_percent: String(
                                                    nominee.share_percent ??
                                                        100,
                                                ),
                                                is_primary: Boolean(
                                                    nominee.is_primary,
                                                ),
                                            });
                                        }}
                                    >
                                        <Pencil className="mr-1 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    'financial-accounts.nominees.destroy',
                                                    [account.id, nominee.id],
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="mr-1 h-4 w-4" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form
                        onSubmit={saveNominee}
                        className="mt-3 space-y-3 border-t pt-3"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label>Existing customer (optional)</Label>
                                <Select
                                    value={nomineeForm.data.customer_id}
                                    onChange={(value) => {
                                        const customer = customers.find(
                                            (item) => String(item.id) === value,
                                        );
                                        nomineeForm.setData(
                                            'customer_id',
                                            value,
                                        );
                                        if (customer) {
                                            nomineeForm.setData(
                                                'name',
                                                customer.name,
                                            );
                                            nomineeForm.setData(
                                                'phone',
                                                customer.primary_phone ?? '',
                                            );
                                        }
                                    }}
                                    options={[
                                        {
                                            value: '',
                                            label: 'Independent nominee',
                                        },
                                        ...customers.map((customer) => ({
                                            value: String(customer.id),
                                            label: `${customer.customer_no} - ${customer.name}`,
                                        })),
                                    ]}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Select a customer to autofill nominee
                                    details, or leave blank to enter an
                                    independent nominee.
                                </p>
                            </div>
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={nomineeForm.data.name}
                                    onChange={(event) =>
                                        nomineeForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={nomineeForm.errors.name} />
                            </div>
                            <div>
                                <Label>Relationship</Label>
                                <Input
                                    value={nomineeForm.data.relationship}
                                    onChange={(event) =>
                                        nomineeForm.setData(
                                            'relationship',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={nomineeForm.errors.relationship}
                                />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={nomineeForm.data.phone}
                                    onChange={(event) =>
                                        nomineeForm.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Share percentage</Label>
                                <Input
                                    type="number"
                                    min="0.0001"
                                    max="100"
                                    step="0.0001"
                                    value={nomineeForm.data.share_percent}
                                    onChange={(event) =>
                                        nomineeForm.setData(
                                            'share_percent',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={nomineeForm.errors.share_percent}
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={nomineeForm.data.is_primary}
                                onChange={(event) =>
                                    nomineeForm.setData(
                                        'is_primary',
                                        event.target.checked,
                                    )
                                }
                            />
                            Primary nominee
                        </label>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={nomineeForm.processing}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                {editingNominee
                                    ? 'Update nominee'
                                    : 'Add nominee'}
                            </Button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}
