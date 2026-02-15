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
import { Customer } from '../../types/customer';
import { CustomerSearchInput } from '../customer-mgmt/customers/customer-search-input';

function Create() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        manager_id: null as number | null,
        manager_name: '', // optional: to show selected manager name
    });

    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/branches', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Branch created successfully!');
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/branches' },
        { title: 'Add Branch', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Branch" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Create Branch"
                    description="Fill in the branch details below to register a new branch."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
                >
                    {/* 🧱 Section: Basic Details */}
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
                                    placeholder="Downtown Branch"
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>
                    </div>

                    {/* 🧱 Section: Address & Location */}
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
                                    className="h-8 text-sm"
                                    placeholder="123 Main Street, City"
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
                                    placeholder="e.g. 23.7808875"
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
                                    placeholder="e.g. 90.2792371"
                                />
                                <InputError message={errors.longitude} />
                            </div>
                        </div>
                    </div>

                    {/* 🧱 Section: Management */}

                    <div className="">
                        <h3 className="text-lg font-semibold text-primary">
                            Management
                        </h3>
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="">
                                    <Label>Search Branch Manager</Label>
                                    <CustomerSearchInput
                                        query={query}
                                        onQueryChange={setQuery}
                                        onSelect={(customer: Customer) => {
                                            setData('manager_id', customer.id);
                                            setData(
                                                'manager_name',
                                                customer.name,
                                            );
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
                                        disabled
                                        value={data.manager_id}
                                        className="h-8 text-sm"
                                        placeholder="Enter manager user ID"
                                    />
                                    <InputError message={errors.manager_id} />
                                </div>

                                <div>
                                    <Label>Manager Name</Label>
                                    <Input
                                        type="text"
                                        disabled
                                        value={data.manager_name}
                                        className="h-8 text-sm"
                                        placeholder="Enter manager user ID"
                                    />
                                    <InputError message={errors.manager_id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
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
