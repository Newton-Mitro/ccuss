import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../../customer-kyc/customers/components/customer-search-box';

function Create() {
    useFlashToastHandler();
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        organization_id: 1,
        manager_id: null as number | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/branches', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Branches', href: route('branches.index') },
        { title: 'Add Branch', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Branch" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Create Branch"
                    description="Fill in the branch details below to register a new branch."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-3 rounded-xl border bg-card p-8 backdrop-blur-sm transition-all duration-300"
                >
                    {/* 🔹 Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Basic Details
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
                            <div>
                                <Label>Branch Code</Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                    placeholder="BR-001"
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div>
                                <Label>Branch Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                    placeholder="Main Branch"
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Address & Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Address & Location
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
                            <div className="md:col-span-4">
                                <Label>Address</Label>
                                <Input
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                    placeholder="Full branch address"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div>
                                <Label>Latitude</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={data.latitude}
                                    onChange={(e) =>
                                        setData('latitude', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                    placeholder="23.7808875"
                                />
                                <InputError message={errors.latitude} />
                            </div>

                            <div>
                                <Label>Longitude</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={data.longitude}
                                    onChange={(e) =>
                                        setData('longitude', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                    placeholder="90.2792371"
                                />
                                <InputError message={errors.longitude} />
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Management */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Management
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <Label>Branch Manager</Label>
                                <CustomerSearchBox
                                    onSelect={(customer: Customer) => {
                                        setData('manager_id', customer.id);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Action */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-info-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Create Branch'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default Create;
