import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

import { accountTypes } from './data/account-type';

export default function Edit({
    ledger,
    parents = [],
    accountGroups = [],
}: any) {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        code: ledger.code || '',
        name: ledger.name || '',
        type: ledger.type || ledger.account_type || '',
        normal_balance: ledger.normal_balance || 'DEBIT',
        account_group_id: ledger.account_group_id || '',
        parent_id: ledger.parent_id || '',
        is_control_account: !!ledger.is_control_account,
        is_reconcilable: !!ledger.is_reconcilable,
        is_system: !!ledger.is_system,
        status: ledger.status ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ledger-accounts.update', ledger.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: 'Edit Ledger Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Ledger Account" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Edit Ledger Account"
                    description="Update ledger account configuration and structure."
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
                                    className="h-8 text-sm"
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
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label>Ledger account type</Label>
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
                                        ...accountGroups.map((group: any) => ({
                                            value: group.id,
                                            label: `${group.code} - ${group.name}`,
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
                                        ...parents
                                            .filter(
                                                (p: any) => p.id !== ledger.id, // 🚫 prevent self-parent
                                            )
                                            .map((p: any) => ({
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
                            {processing
                                ? 'Updating...'
                                : 'Update ledger account'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
