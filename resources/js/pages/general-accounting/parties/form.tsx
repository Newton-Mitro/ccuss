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
    {
        value: 'CUSTOMER_SUPPLIER',
        label: 'Customer and Supplier',
    },
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

        const options = {
            preserveScroll: true,
        };

        if (editing && party) {
            put(route('parties.update', party.id), options);
        } else {
            post(route('parties.store'), options);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'General Accounting',
            href: '',
        },
        {
            title: 'Parties',
            href: route('parties.index'),
        },
        {
            title: editing ? 'Edit Party' : 'Create Party',
            href: '',
        },
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
                    {/* Code */}
                    <div className="space-y-1.5">
                        <Label htmlFor="code">Code</Label>

                        <Input
                            id="code"
                            value={data.code}
                            onChange={(event) =>
                                setData('code', event.target.value)
                            }
                            placeholder="e.g. P-001"
                            required
                        />

                        <InputError message={errors.code} />
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="Party name"
                            required
                        />

                        <InputError message={errors.name} />
                    </div>

                    {/* Party Type */}
                    <div className="space-y-1.5">
                        <Label htmlFor="party_type">Party Type</Label>

                        <Select
                            value={data.party_type}
                            onChange={(value) => setData('party_type', value)}
                            options={partyTypes}
                        />

                        <InputError message={errors.party_type} />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>

                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                            placeholder="Phone number"
                        />

                        <InputError message={errors.phone} />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="email">Email</Label>

                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            placeholder="example@email.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="address">Address</Label>

                        <textarea
                            id="address"
                            value={data.address}
                            onChange={(event) =>
                                setData('address', event.target.value)
                            }
                            maxLength={500}
                            rows={3}
                            placeholder="Party address"
                            className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        />

                        <InputError message={errors.address} />
                    </div>

                    {/* Status */}
                    <div className="flex items-center md:col-span-2">
                        <label
                            htmlFor="status"
                            className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                            <input
                                id="status"
                                type="checkbox"
                                checked={data.status}
                                onChange={(event) =>
                                    setData('status', event.target.checked)
                                }
                                className="h-4 w-4 rounded border-input accent-primary"
                            />

                            <span>Active</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t pt-4 md:col-span-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing
                                ? editing
                                    ? 'Updating...'
                                    : 'Creating...'
                                : editing
                                  ? 'Update Party'
                                  : 'Create Party'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
