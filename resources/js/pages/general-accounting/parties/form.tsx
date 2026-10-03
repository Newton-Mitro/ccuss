import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

interface PartyFormProps {
    party?: {
        id: number;
        code: string;
        name: string;
        party_type: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        status: boolean;
    };
}

const partyTypes = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'CUSTOMER_SUPPLIER', label: 'Customer and Supplier' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'OTHER', label: 'Other' },
];

export default function PartyForm({ party }: PartyFormProps) {
    const editing = Boolean(party);
    const { data, setData, post, put, processing, errors } = useForm({
        code: party?.code ?? '',
        name: party?.name ?? '',
        party_type: party?.party_type ?? 'OTHER',
        phone: party?.phone ?? '',
        email: party?.email ?? '',
        address: party?.address ?? '',
        status: party?.status ?? true,
    });
    useFlashToastHandler();

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        editing
            ? put(route('parties.update', party.id), options)
            : post(route('parties.store'), options);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Parties', href: route('parties.index') },
        { title: editing ? 'Edit Party' : 'Create Party', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Party' : 'Create Party'} />
            <div className="max-w-3xl space-y-4">
                <HeadingSmall
                    title={editing ? 'Edit Party' : 'Create Party'}
                    description="Maintain an organization party record for accounting transactions."
                />
                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-md border bg-card p-6 md:grid-cols-2"
                >
                    <div>
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(event) => setData('code', event.target.value)}
                            required
                        />
                        <InputError message={errors.code} />
                    </div>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label>Party type</Label>
                        <Select
                            value={data.party_type}
                            onChange={(value) => setData('party_type', value)}
                            options={partyTypes}
                        />
                        <InputError message={errors.party_type} />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(event) => setData('phone', event.target.value)}
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <textarea
                            id="address"
                            value={data.address}
                            onChange={(event) => setData('address', event.target.value)}
                            maxLength={500}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <InputError message={errors.address} />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.status}
                            onChange={(event) => setData('status', event.target.checked)}
                        />
                        Active
                    </label>
                    <div className="flex justify-end gap-2 md:col-span-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {editing ? 'Update party' : 'Create party'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}