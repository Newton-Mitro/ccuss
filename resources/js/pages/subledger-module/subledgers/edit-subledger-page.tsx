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
import { subledgerSubTypes, subledgerTypes } from './data/type-sub-type';

export default function Edit({ subledger, glAccounts }: any) {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        code: subledger.code || '',
        name: subledger.name || '',
        short_name: subledger.short_name || '',
        type: subledger.type || subledgerTypes[0]?.value || '',
        sub_type: subledger.sub_type || subledgerSubTypes[0]?.value || '',
        gl_account_id: subledger.gl_account_id || '',
        is_active: subledger.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('subledgers.update', subledger.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subledger Management', href: '' },
        { title: 'Subledgers', href: route('subledgers.index') },
        { title: 'Edit Subledger', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Subledger" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Edit Subledger"
                    description="Update subledger account details and classification."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-3 rounded-xl border bg-card p-8"
                >
                    {/* 🔹 Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Basic Details
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
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
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Classification
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={(value) => setData('type', value)}
                                    options={subledgerTypes.map((t) => ({
                                        value: t.value,
                                        label: t.label,
                                    }))}
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
                                    options={subledgerSubTypes.map((st) => ({
                                        value: st.value,
                                        label: st.label,
                                    }))}
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
                                    options={glAccounts.map((gl: any) => ({
                                        value: gl.id,
                                        label: gl.name,
                                    }))}
                                />
                                <InputError message={errors.gl_account_id} />
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

                    {/* 🔹 Action */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40"
                        >
                            {processing ? 'Updating...' : 'Update Subledger'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
