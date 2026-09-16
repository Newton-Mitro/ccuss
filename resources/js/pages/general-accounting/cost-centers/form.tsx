import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
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

interface CostCenterFormProps {
    costCenter?: {
        id: number;
        code: string;
        name: string;
        parent_id: number | null;
        status: boolean;
    };
    parents: { id: number; code: string; name: string }[];
}

export default function CostCenterForm({
    costCenter,
    parents = [],
}: CostCenterFormProps) {
    const editing = Boolean(costCenter);
    const { data, setData, post, put, processing, errors } = useForm({
        code: costCenter?.code ?? '',
        name: costCenter?.name ?? '',
        parent_id: costCenter?.parent_id?.toString() ?? '',
        status: costCenter?.status ?? true,
    });
    useFlashToastHandler();

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        editing
            ? put(route('cost-centers.update', costCenter.id), options)
            : post(route('cost-centers.store'), options);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Cost Centers', href: route('cost-centers.index') },
        {
            title: editing ? 'Edit Cost Center' : 'Create Cost Center',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Cost Center' : 'Create Cost Center'} />
            <div className="max-w-3xl space-y-4">
                <HeadingSmall
                    title={editing ? 'Edit Cost Center' : 'Create Cost Center'}
                    description="Define an organization unit for expense tracking."
                />
                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-md border bg-card p-6 md:grid-cols-2"
                >
                    <div>
                        <Label>Code</Label>
                        <Input
                            value={data.code}
                            onChange={(event) =>
                                setData('code', event.target.value)
                            }
                        />
                        <InputError message={errors.code} />
                    </div>
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label>Parent cost center</Label>
                        <Select
                            value={data.parent_id}
                            onChange={(value) => setData('parent_id', value)}
                            options={[
                                { value: '', label: 'None' },
                                ...parents.map((parent) => ({
                                    value: parent.id.toString(),
                                    label: `${parent.code} - ${parent.name}`,
                                })),
                            ]}
                        />
                        <InputError message={errors.parent_id} />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.status}
                            onChange={(event) =>
                                setData('status', event.target.checked)
                            }
                        />
                        Active
                    </label>
                    <div className="md:col-span-2">
                        <Button type="submit" disabled={processing}>
                            {editing
                                ? 'Update cost center'
                                : 'Create cost center'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
