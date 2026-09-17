import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Select } from '../../../components/ui/select';
import { subledgerSubTypes, subledgerTypes } from './data/type-sub-type';

export default function Create({ glAccounts }: any) {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        short_name: '',
        type: subledgerTypes[0]?.value || '',
        sub_type: subledgerSubTypes[0]?.value || '',
        gl_account_id: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('subledgers.store'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subledger Management', href: '' },
        { title: 'Subledgers', href: route('subledgers.index') },
        { title: 'Add Subledger', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Subledger" />

            <div className="text-foreground">
                <ResourcePageHeader
                    title="Create Subledger"
                    description="Define a new subledger account for transaction classification."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-6 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
                >
                    {/* 🔹 Basic Details */}
                    <div>
                        <h3 className="font-medium text-foreground">
                            Basic Details
                        </h3>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Give the subledger a clear code and display name.
                        </p>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                    placeholder="SL-001"
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
                                    placeholder="Savings Account"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label>Short Name</Label>
                                <Input
                                    value={data.short_name}
                                    onChange={(e) =>
                                        setData('short_name', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.short_name} />
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Classification */}
                    <div>
                        <h3 className="font-medium text-foreground">
                            Classification
                        </h3>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Connect it to a general ledger account and choose
                            its classification.
                        </p>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
                            <div>
                                <Label>Subledger Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={(value) => setData('type', value)}
                                    options={[
                                        { value: null, label: 'None' },
                                        ...subledgerTypes,
                                    ]}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div>
                                <Label>Sub Type</Label>
                                <Select
                                    value={data.sub_type}
                                    onChange={(value) =>
                                        setData('sub_type', value)
                                    }
                                    options={[
                                        { value: null, label: 'None' },
                                        ...subledgerSubTypes.filter((t) => {
                                            return t.type === data.type;
                                        }),
                                    ]}
                                />
                                <InputError message={errors.sub_type} />
                            </div>
                            <div>
                                <Label>GL Account</Label>
                                <Select
                                    value={data.gl_account_id}
                                    onChange={(value) =>
                                        setData('gl_account_id', value)
                                    }
                                    options={glAccounts.map((glAccount) => ({
                                        value: glAccount.id,
                                        label: glAccount.name,
                                    }))}
                                />

                                <InputError message={errors.gl_account_id} />
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 md:mt-5">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                />
                                <Label>Active</Label>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Action */}
                    <div className="flex justify-end border-t pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40"
                        >
                            {processing ? 'Saving...' : 'Create Subledger'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
