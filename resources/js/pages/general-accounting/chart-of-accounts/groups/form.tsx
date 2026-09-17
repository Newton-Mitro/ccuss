import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
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

const types = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];

export default function AccountGroupForm({ accountGroup, parents = [] }: any) {
    const editing = Boolean(accountGroup);
    const { data, setData, post, put, processing, errors } = useForm({
        code: accountGroup?.code ?? '',
        name: accountGroup?.name ?? '',
        type: accountGroup?.type ?? '',
        normal_balance: accountGroup?.normal_balance ?? 'DEBIT',
        parent_id: accountGroup?.parent_id ?? '',
        status: accountGroup?.status ?? true,
    });
    useFlashToastHandler();

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        editing
            ? put(route('account-groups.update', accountGroup.id), options)
            : post(route('account-groups.store'), options);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Account Groups', href: route('account-groups.index') },
        {
            title: editing ? 'Edit Account Group' : 'Create Account Group',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={editing ? 'Edit Account Group' : 'Create Account Group'}
            />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title={
                        editing ? 'Edit Account Group' : 'Create Account Group'
                    }
                    description="Define a reporting group in the chart of accounts."
                />
                <form
                    onSubmit={submit}
                    className="grid gap-5 rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm md:grid-cols-2 md:p-6"
                >
                    <div>
                        <Label>Code</Label>
                        <Input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        <InputError message={errors.code} />
                    </div>
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label>Type</Label>
                        <Select
                            value={data.type}
                            onChange={(value) => setData('type', value)}
                            options={[
                                { value: '', label: 'Select type' },
                                ...types.map((value) => ({
                                    value,
                                    label: value,
                                })),
                            ]}
                        />
                        <InputError message={errors.type} />
                    </div>
                    <div>
                        <Label>Normal balance</Label>
                        <Select
                            value={data.normal_balance}
                            onChange={(value) =>
                                setData('normal_balance', value)
                            }
                            options={[
                                { value: 'DEBIT', label: 'Debit' },
                                { value: 'CREDIT', label: 'Credit' },
                            ]}
                        />
                        <InputError message={errors.normal_balance} />
                    </div>
                    <div>
                        <Label>Parent group</Label>
                        <Select
                            value={data.parent_id}
                            onChange={(value) => setData('parent_id', value)}
                            options={[
                                { value: '', label: 'None' },
                                ...parents.map((parent: any) => ({
                                    value: parent.id,
                                    label: `${parent.code} - ${parent.name}`,
                                })),
                            ]}
                        />
                        <InputError message={errors.parent_id} />
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary"
                            checked={data.status}
                            onChange={(e) =>
                                setData('status', e.target.checked)
                            }
                        />{' '}
                        Active
                    </label>
                    <div className="md:col-span-2">
                        <Button type="submit" disabled={processing}>
                            {editing ? 'Update group' : 'Create group'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
