import InputError from '@/components/input-error';
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
import { useForm } from '@inertiajs/react';
import { useEffect, type FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { Branch } from '@/modules/branch-operations/types/branch';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import { CustomerSearchBox } from '@/modules/customers-kyc/customers/components/customer-search-box';

interface BranchFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch?: Branch | null;
}

export function BranchFormDialog({
    open,
    onOpenChange,
    branch,
}: BranchFormDialogProps) {
    const form = useForm({
        code: '',
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        manager_id: null as number | null,
    });
    const { setData, clearErrors } = form;

    useEffect(() => {
        setData({
            code: branch?.code ?? '',
            name: branch?.name ?? '',
            address: branch?.address ?? '',
            latitude:
                branch?.latitude === null || branch?.latitude === undefined
                    ? ''
                    : String(branch.latitude),
            longitude:
                branch?.longitude === null || branch?.longitude === undefined
                    ? ''
                    : String(branch.longitude),
            manager_id: branch?.manager_id ?? null,
        });
        clearErrors();
    }, [branch, clearErrors, open, setData]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (branch) {
            form.put(route('branches.update', branch.id), options);
        } else {
            form.post(route('branches.store'), options);
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
                        {branch ? 'Edit branch' : 'Add branch'}
                    </DialogTitle>
                    <DialogDescription>
                        {branch
                            ? `Update the details for ${branch.name}.`
                            : 'Enter the details for the new branch.'}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-5" onSubmit={submit}>
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Basic details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="branch-code">Branch code</Label>
                                <Input
                                    id="branch-code"
                                    value={form.data.code}
                                    onChange={(event) =>
                                        form.setData('code', event.target.value)
                                    }
                                    placeholder="BR-001"
                                    required
                                />
                                <InputError message={form.errors.code} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="branch-name">Branch name</Label>
                                <Input
                                    id="branch-name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Main Branch"
                                    required
                                />
                                <InputError message={form.errors.name} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">
                            Address and location
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="branch-address">Address</Label>
                                <Input
                                    id="branch-address"
                                    value={form.data.address}
                                    onChange={(event) =>
                                        form.setData(
                                            'address',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Full branch address"
                                />
                                <InputError message={form.errors.address} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="branch-latitude">
                                    Latitude
                                </Label>
                                <Input
                                    id="branch-latitude"
                                    type="number"
                                    step="any"
                                    value={form.data.latitude}
                                    onChange={(event) =>
                                        form.setData(
                                            'latitude',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="23.7808875"
                                />
                                <InputError message={form.errors.latitude} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="branch-longitude">
                                    Longitude
                                </Label>
                                <Input
                                    id="branch-longitude"
                                    type="number"
                                    step="any"
                                    value={form.data.longitude}
                                    onChange={(event) =>
                                        form.setData(
                                            'longitude',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="90.2792371"
                                />
                                <InputError message={form.errors.longitude} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            Branch manager
                        </h3>
                        <CustomerSearchBox
                            key={branch?.id ?? 'new-branch'}
                            selectedCustomer={
                                (branch?.manager as Customer | null) ??
                                undefined
                            }
                            onSelect={(customer: Customer) =>
                                form.setData('manager_id', customer.id)
                            }
                        />
                        <InputError message={form.errors.manager_id} />
                    </div>

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
                                : branch
                                  ? 'Save changes'
                                  : 'Create branch'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface BranchDetailsDialogProps {
    branch: Branch | null;
    onOpenChange: (open: boolean) => void;
}

export function BranchDetailsDialog({
    branch,
    onOpenChange,
}: BranchDetailsDialogProps) {
    const details = [
        { label: 'Branch code', value: branch?.code || '—' },
        { label: 'Branch name', value: branch?.name || '—' },
        {
            label: 'Branch manager',
            value: branch?.manager?.name || 'Not assigned',
        },
        { label: 'Address', value: branch?.address || 'No address provided' },
        { label: 'Latitude', value: branch?.latitude ?? '—' },
        { label: 'Longitude', value: branch?.longitude ?? '—' },
    ];

    return (
        <Dialog
            open={branch !== null}
            onOpenChange={(open) => {
                if (!open) onOpenChange(false);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{branch?.name}</DialogTitle>
                    <DialogDescription>
                        Branch details for {branch?.organization?.name}.
                    </DialogDescription>
                </DialogHeader>
                <dl className="grid gap-4 sm:grid-cols-2">
                    {details.map(({ label, value }) => (
                        <div key={label} className="space-y-1">
                            <dt className="text-xs font-medium text-muted-foreground">
                                {label}
                            </dt>
                            <dd className="text-sm font-medium break-words">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
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
