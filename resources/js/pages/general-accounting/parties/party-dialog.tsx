import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: boolean;
}

interface PartyFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    party?: Party | null;
}

const partyTypes = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'CUSTOMER_SUPPLIER', label: 'Customer and Supplier' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'OTHER', label: 'Other' },
];

export function PartyFormDialog({
    open,
    onOpenChange,
    party,
}: PartyFormDialogProps) {
    const form = useForm({
        code: '',
        name: '',
        party_type: 'OTHER',
        phone: '',
        email: '',
        address: '',
        status: true,
    });

    useEffect(() => {
        form.setData({
            code: party?.code ?? '',
            name: party?.name ?? '',
            party_type: party?.party_type ?? 'OTHER',
            phone: party?.phone ?? '',
            email: party?.email ?? '',
            address: party?.address ?? '',
            status: party?.status ?? true,
        });
        form.clearErrors();
    }, [party, open]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (party) {
            form.put(route('parties.update', party.id), options);
        } else {
            form.post(route('parties.store'), options);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!form.processing) onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {party ? 'Edit party' : 'Create party'}
                    </DialogTitle>
                    <DialogDescription>
                        Maintain the party details used for accounting
                        transactions.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="party-code">Code</Label>
                            <Input
                                id="party-code"
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData('code', event.target.value)
                                }
                                placeholder="e.g. P-001"
                                required
                            />
                            <InputError message={form.errors.code} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="party-name">Name</Label>
                            <Input
                                id="party-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="Party name"
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Party type</Label>
                            <Select
                                value={form.data.party_type}
                                onChange={(value) =>
                                    form.setData('party_type', value)
                                }
                                options={partyTypes}
                            />
                            <InputError message={form.errors.party_type} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="party-phone">Phone</Label>
                            <Input
                                id="party-phone"
                                type="tel"
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData('phone', event.target.value)
                                }
                                placeholder="Phone number"
                            />
                            <InputError message={form.errors.phone} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="party-email">Email</Label>
                            <Input
                                id="party-email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                placeholder="example@email.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="party-address">Address</Label>
                            <textarea
                                id="party-address"
                                value={form.data.address}
                                onChange={(event) =>
                                    form.setData('address', event.target.value)
                                }
                                maxLength={500}
                                rows={3}
                                placeholder="Party address"
                                className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <InputError message={form.errors.address} />
                        </div>
                    </div>
                    {party && (
                        <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                            <Input
                                type="checkbox"
                                checked={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.checked)
                                }
                            />
                            <span>Active</span>
                        </label>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : party
                                  ? 'Save changes'
                                  : 'Create party'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface PartyDetailsDialogProps {
    party: Party | null;
    onOpenChange: (open: boolean) => void;
}

export function PartyDetailsDialog({
    party,
    onOpenChange,
}: PartyDetailsDialogProps) {
    const details = [
        { label: 'Party code', value: party?.code },
        {
            label: 'Party type',
            value: party?.party_type.replaceAll('_', ' '),
        },
        { label: 'Phone', value: party?.phone },
        { label: 'Email', value: party?.email },
        { label: 'Address', value: party?.address },
    ];

    return (
        <Dialog
            open={party !== null}
            onOpenChange={(open) => {
                if (!open) onOpenChange(false);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader className="rounded-lg border bg-linear-to-br from-sky-500/10 via-background to-indigo-500/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                Accounting party
                            </p>
                            <DialogTitle className="text-2xl">
                                {party?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Party profile and contact information.
                            </DialogDescription>
                        </div>
                        {party && (
                            <StatusBadge
                                tone={party.status ? 'success' : 'danger'}
                            >
                                {party.status ? 'Active' : 'Inactive'}
                            </StatusBadge>
                        )}
                    </div>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                    {details.map((detail) => (
                        <div
                            key={detail.label}
                            className="min-w-0 rounded-lg border bg-card p-3"
                        >
                            <p className="text-xs font-medium text-muted-foreground">
                                {detail.label}
                            </p>
                            <p className="mt-1 text-sm font-medium wrap-break-word">
                                {detail.value || '—'}
                            </p>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
