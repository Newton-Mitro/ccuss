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

import {
    subledgerSubTypes,
    subledgerTypes,
} from '../../subledger-module/subledgers/data/type-sub-type';
import { accountTypes } from './data/account-type';

export default function Edit({ ledger, parents }: any) {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        code: ledger.code || '',
        name: ledger.name || '',
        description: ledger.description || '',
        type: ledger.type || '',
        is_group: !!ledger.is_group,
        is_control_account: !!ledger.is_control_account,
        subledger_type: ledger.subledger_type || '',
        subledger_sub_type: ledger.subledger_sub_type || '',
        parent_id: ledger.parent_id || '',
        is_active: !!ledger.is_active,
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
                    {/* 🔹 Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Basic Information
                        </h3>

                        <div className="grid gap-4 md:grid-cols-4">
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
                                <Label>Parent Account</Label>
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

                    {/* 🔹 Account Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Account Settings
                        </h3>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    checked={data.is_group}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setData('is_group', checked);

                                        // 🔒 enforce rule
                                        if (checked) {
                                            setData(
                                                'is_control_account',
                                                false,
                                            );
                                            setData('subledger_type', '');
                                            setData('subledger_sub_type', '');
                                        }
                                    }}
                                />
                                <Label>Group Account</Label>
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    checked={data.is_control_account}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setData('is_control_account', checked);

                                        if (checked) {
                                            setData('is_group', false);
                                            setData('subledger_type', '');
                                            setData('subledger_sub_type', '');
                                        }
                                    }}
                                />
                                <Label>Control Account</Label>
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                />
                                <Label>Active</Label>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Subledger Config */}
                    {!data.is_group && data.is_control_account && (
                        <div>
                            <h3 className="text-lg font-semibold text-muted-foreground">
                                Subledger Configuration
                            </h3>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label>Subledger Type</Label>
                                    <Select
                                        value={data.subledger_type}
                                        onChange={(value) =>
                                            setData('subledger_type', value)
                                        }
                                        options={[
                                            { value: '', label: 'None' },
                                            ...subledgerTypes,
                                        ]}
                                    />
                                    <InputError
                                        message={errors.subledger_type}
                                    />
                                </div>

                                <div>
                                    <Label>Subledger Sub Type</Label>
                                    <Select
                                        value={data.subledger_sub_type}
                                        onChange={(value) =>
                                            setData('subledger_sub_type', value)
                                        }
                                        options={[
                                            { value: null, label: 'None' },
                                            ...subledgerSubTypes.filter((t) => {
                                                return (
                                                    t.type ===
                                                    data.subledger_type
                                                );
                                            }),
                                        ]}
                                    />
                                    <InputError
                                        message={errors.subledger_sub_type}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🔹 Description */}
                    <div>
                        <Label>Description</Label>
                        <Input
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* 🔹 Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-48"
                        >
                            {processing ? 'Updating...' : 'Update Ledger'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
