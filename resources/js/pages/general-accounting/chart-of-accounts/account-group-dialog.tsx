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
import { Select } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import { accountTypes } from './data/account-type';

export interface AccountGroupDialogItem {
    id: number;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    status: boolean;
    parent_id?: number | null;
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: AccountGroupDialogItem[];
    group?: AccountGroupDialogItem | null;
};

export default function AccountGroupDialog({
    open,
    onOpenChange,
    groups,
    group,
}: Props) {
    const form = useForm({
        code: '',
        name: '',
        type: '',
        normal_balance: 'DEBIT',
        parent_id: '',
        status: true,
    });

    useEffect(() => {
        if (group) {
            form.setData({
                code: group.code,
                name: group.name,
                type: group.type,
                normal_balance: group.normal_balance,
                parent_id: String(group.parent_id ?? ''),
                status: group.status,
            });
        } else {
            form.setData({
                code: '',
                name: '',
                type: '',
                normal_balance: 'DEBIT',
                parent_id: '',
                status: true,
            });
        }
        form.clearErrors();
    }, [group, open]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };
        if (group) {
            form.put(route('account-groups.update', group.id), options);
        } else {
            form.post(route('account-groups.store'), options);
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
                        {group ? 'Edit account group' : 'Create account group'}
                    </DialogTitle>
                    <DialogDescription>
                        Configure the reporting category and its place in the
                        account-group hierarchy.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="group-code">Code</Label>
                            <Input
                                id="group-code"
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData('code', event.target.value)
                                }
                            />
                            <InputError message={form.errors.code} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="group-name">Name</Label>
                            <Input
                                id="group-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Account type</Label>
                            <Select
                                value={form.data.type}
                                onChange={(value) =>
                                    form.setData('type', value)
                                }
                                options={[
                                    { value: '', label: 'Select type' },
                                    ...accountTypes,
                                ]}
                            />
                            <InputError message={form.errors.type} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Normal balance</Label>
                            <Select
                                value={form.data.normal_balance}
                                onChange={(value) =>
                                    form.setData('normal_balance', value)
                                }
                                options={[
                                    { value: 'DEBIT', label: 'Debit' },
                                    { value: 'CREDIT', label: 'Credit' },
                                ]}
                            />
                            <InputError message={form.errors.normal_balance} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label>Parent group</Label>
                            <Select
                                value={form.data.parent_id}
                                onChange={(value) =>
                                    form.setData('parent_id', value)
                                }
                                options={[
                                    { value: '', label: 'None (root group)' },
                                    ...groups
                                        .filter((item) => item.id !== group?.id)
                                        .map((item) => ({
                                            value: String(item.id),
                                            label: `${item.code} - ${item.name}`,
                                        })),
                                ]}
                            />
                            <InputError message={form.errors.parent_id} />
                        </div>
                    </div>
                    {group && (
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
                                : group
                                  ? 'Save changes'
                                  : 'Create account group'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
