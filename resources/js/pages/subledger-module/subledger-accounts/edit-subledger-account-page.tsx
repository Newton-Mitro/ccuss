import { Head, Link, useForm } from '@inertiajs/react';
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

export default function Edit({ account, subledgers, types, statuses }: any) {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        account_number: account.account_number || '',
        name: account.name || '',
        type: account.type || '',
        status: account.status || 'pending',
        accountable_type: account.accountable_type || '',
        accountable_id: account.accountable_id || '',
        subledger_id: account.subledger_id || '',
        organization_id: account.organization_id || '',
        branch_id: account.branch_id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('subledger-accounts.update', account.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounts', href: '' },
        {
            title: 'Subledger Accounts',
            href: route('subledger-accounts.index'),
        },
        { title: 'Edit Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Account" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Edit Subledger Account"
                    description="Update account configuration and classification."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-3 rounded-xl border bg-card p-8 shadow-sm"
                >
                    {/* 🔹 Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                            <div>
                                <Label>Account Number</Label>
                                <Input
                                    value={data.account_number}
                                    onChange={(e) =>
                                        setData(
                                            'account_number',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.account_number} />
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
                        </div>
                    </div>

                    {/* 🔹 Classification */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Classification
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={(value) => setData('type', value)}
                                    options={types.map((t: string) => ({
                                        value: t,
                                        label: t,
                                    }))}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={data.status}
                                    onChange={(value) =>
                                        setData('status', value)
                                    }
                                    options={statuses.map((s: string) => ({
                                        value: s,
                                        label: s,
                                    }))}
                                />
                                <InputError message={errors.status} />
                            </div>

                            <div>
                                <Label>Subledger</Label>
                                <Select
                                    value={data.subledger_id}
                                    onChange={(value) =>
                                        setData('subledger_id', value)
                                    }
                                    options={subledgers.map((s: any) => ({
                                        value: s.id,
                                        label: s.name,
                                    }))}
                                />
                                <InputError message={errors.subledger_id} />
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    checked={data.status !== 'closed'}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.checked
                                                ? 'active'
                                                : 'closed',
                                        )
                                    }
                                />
                                <Label>Active</Label>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Action */}
                    <div className="flex justify-end gap-2">
                        <Link href={route('subledger-accounts.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40"
                        >
                            {processing ? 'Updating...' : 'Update Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
