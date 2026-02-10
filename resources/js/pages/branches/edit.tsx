import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../components/heading-small';
import InputError from '../../components/input-error';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../types';
import { Branch } from '../../types/branch';
import { Customer } from '../../types/customer';
import { CustomerSearchInput } from '../customer-management/customers/customer-search-input';

interface EditBranchProps {
    branch: Branch;
}

function Edit({ branch }: EditBranchProps) {
    console.log('Branch:', branch);
    const { data, setData, put, processing, errors } = useForm({
        code: branch.code,
        name: branch.name,
        address: branch.address || '',
        latitude: branch.latitude || '',
        longitude: branch.longitude || '',
        manager_id: branch.manager_id || null,
        manager_name: branch.manager.name || '',
    });

    const [query, setQuery] = useState(branch?.manager?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/auth/branches/${branch.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Branch updated successfully!');
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/auth/branches' },
        { title: 'Edit Branch', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Branch" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Branch"
                    description="Update the branch details below."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
                >
                    {/* Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Basic Details
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Branch Code</Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
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
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>
                    </div>

                    {/* Address & Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Address & Location
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Label>Address</Label>
                                <Input
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
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
                                />
                                <InputError message={errors.longitude} />
                            </div>
                        </div>
                    </div>

                    {/* Management */}
                    <h3 className="text-lg font-semibold text-primary">
                        Branch Manager
                    </h3>

                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Search Manager</Label>
                                <CustomerSearchInput
                                    query={query}
                                    onQueryChange={setQuery}
                                    onSelect={(customer: Customer) => {
                                        setData('manager_id', customer.id);
                                        setData('manager_name', customer.name);
                                        setQuery(customer.name);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Manager ID</Label>
                                <Input
                                    type="number"
                                    value={data.manager_id || ''}
                                    disabled
                                />
                            </div>
                            <div>
                                <Label>Manager Name</Label>
                                <Input
                                    type="text"
                                    value={data.manager_name || ''}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
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
