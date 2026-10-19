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

export interface CostCenter {
    id: number;
    parent_id?: number | null;
    code: string;
    name: string;
    level: number;
    status: boolean;
    parent?: { code: string; name: string } | null;
}

export interface CostCenterParent {
    id: number;
    code: string;
    name: string;
}

interface CostCenterFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parents: CostCenterParent[];
    costCenter?: CostCenter | null;
}

export function CostCenterFormDialog({
    open,
    onOpenChange,
    parents,
    costCenter,
}: CostCenterFormDialogProps) {
    const form = useForm({
        code: '',
        name: '',
        parent_id: '',
        status: true,
    });

    useEffect(() => {
        form.setData({
            code: costCenter?.code ?? '',
            name: costCenter?.name ?? '',
            parent_id: costCenter?.parent_id
                ? String(costCenter.parent_id)
                : '',
            status: costCenter?.status ?? true,
        });
        form.clearErrors();
    }, [costCenter, open]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (costCenter) {
            form.put(route('cost-centers.update', costCenter.id), options);
        } else {
            form.post(route('cost-centers.store'), options);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!form.processing) onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {costCenter ? 'Edit cost center' : 'Create cost center'}
                    </DialogTitle>
                    <DialogDescription>
                        Define an organization unit for expense tracking.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="cost-center-code">Code</Label>
                            <Input
                                id="cost-center-code"
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData('code', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.code} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cost-center-name">Name</Label>
                            <Input
                                id="cost-center-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label>Parent cost center</Label>
                            <Select
                                value={form.data.parent_id}
                                onChange={(value) =>
                                    form.setData('parent_id', value)
                                }
                                options={[
                                    { value: '', label: 'None (top level)' },
                                    ...parents
                                        .filter(
                                            (parent) =>
                                                parent.id !== costCenter?.id,
                                        )
                                        .map((parent) => ({
                                            value: String(parent.id),
                                            label: `${parent.code} - ${parent.name}`,
                                        })),
                                ]}
                            />
                            <InputError message={form.errors.parent_id} />
                        </div>
                    </div>
                    {costCenter && (
                        <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                            <Input
                                type="checkbox"
                                checked={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.checked)
                                }
                            />
                            Active
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
                                : costCenter
                                  ? 'Save changes'
                                  : 'Create cost center'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface CostCenterDetailsDialogProps {
    costCenter: CostCenter | null;
    onOpenChange: (open: boolean) => void;
}

export function CostCenterDetailsDialog({
    costCenter,
    onOpenChange,
}: CostCenterDetailsDialogProps) {
    const details = [
        { label: 'Code', value: costCenter?.code },
        {
            label: 'Parent',
            value: costCenter?.parent
                ? `${costCenter.parent.code} - ${costCenter.parent.name}`
                : 'Top-level cost center',
        },
        { label: 'Hierarchy level', value: costCenter?.level },
    ];

    return (
        <Dialog
            open={costCenter !== null}
            onOpenChange={(open) => {
                if (!open) onOpenChange(false);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader className="rounded-lg border bg-linear-to-br from-emerald-500/10 via-background to-teal-500/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                Cost center
                            </p>
                            <DialogTitle className="text-2xl">
                                {costCenter?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Organization unit and hierarchy details.
                            </DialogDescription>
                        </div>
                        {costCenter && (
                            <StatusBadge
                                tone={costCenter.status ? 'success' : 'danger'}
                            >
                                {costCenter.status ? 'Active' : 'Inactive'}
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
                                {detail.value ?? '—'}
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
