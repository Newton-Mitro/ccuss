import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../../customer-kyc/customers/components/customer-search-box';

function Edit() {
    const { branch, flash } = usePage<any>().props;
    const manager = branch?.manager as Customer;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData, put, processing, errors } = useForm({
        code: branch.code || '',
        name: branch.name || '',
        address: branch.address || '',
        latitude: branch.latitude || '',
        longitude: branch.longitude || '',
        organization_id: 1,
        manager_id: branch.manager_id || null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/branches/${branch.id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/branches' },
        { title: 'Edit Branch', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Branch" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Edit Branch"
                    description="Update branch details to keep operations aligned."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-3 rounded-xl border bg-card p-8 shadow-sm backdrop-blur-sm transition-all duration-300"
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
                                <Label>Search Branch Manager</Label>
                                <CustomerSearchBox
                                    selectedCustomer={manager}
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
                            className="w-40 bg-primary text-info-foreground hover:bg-primary/90"
                        >
                            {processing ? 'Updating...' : 'Update Branch'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default Edit;
