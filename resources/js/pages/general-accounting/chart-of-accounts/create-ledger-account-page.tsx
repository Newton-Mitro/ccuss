import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { accountTypes } from './data/account-type';

export default function Create({ accountGroups = [], parents = [] }: any) {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        type: '',
        normal_balance: 'DEBIT',
        account_group_id: '',
        parent_id: '',
        is_control_account: false,
        is_reconcilable: false,
        is_system: false,
        status: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ledger-accounts.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: 'Create Ledger Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Ledger Account" />

            <div className="max-w-4xl space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Create Ledger Account"
                    description="Define the account's classification, hierarchy, and reconciliation behavior."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-4 rounded-xl border bg-card p-8"
                >
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Basic information
                        </h3>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    placeholder="1100"
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Cash on hand"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label>Account Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={(value) => setData('type', value)}
                                    options={[
                                        { value: '', label: 'Select Type' },
                                        ...accountTypes.map((t) => ({
                                            value: t.value,
                                            label: t.label,
                                        })),
                                    ]}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div>
                                <Label>Account group</Label>
                                <Select
                                    value={data.account_group_id}
                                    onChange={(value) =>
                                        setData('account_group_id', value)
                                    }
                                    options={[
                                        { value: '', label: 'Select group' },
                                        ...accountGroups.map((p: any) => ({
                                            value: p.id,
                                            label: `${p.code} - ${p.name}`,
                                        })),
                                    ]}
                                />
                                <InputError message={errors.account_group_id} />
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
                                <Label>Parent account</Label>
                                <Select
                                    value={data.parent_id}
                                    onChange={(value) =>
                                        setData('parent_id', value)
                                    }
                                    options={[
                                        { value: '', label: 'None' },
                                        ...parents.map((p: any) => ({
                                            value: p.id,
                                            label: `${p.code} - ${p.name}`,
                                        })),
                                    ]}
                                />
                                <InputError message={errors.parent_id} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Account settings
                        </h3>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_control_account}
                                    onChange={(e) =>
                                        setData(
                                            'is_control_account',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>Control account</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_reconcilable}
                                    onChange={(e) =>
                                        setData(
                                            'is_reconcilable',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>Reconcilable</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_system}
                                    onChange={(e) =>
                                        setData('is_system', e.target.checked)
                                    }
                                />
                                <span>System account</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.checked)
                                    }
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-48"
                        >
                            {processing ? 'Saving...' : 'Create ledger account'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
