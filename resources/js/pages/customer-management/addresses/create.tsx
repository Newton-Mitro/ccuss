import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: null as number | null,
        customer_name: '',
        line1: '',
        line2: '',
        division: '',
        district: '',
        upazila: '',
        union_ward: '',
        village_locality: '',
        postal_code: '',
        country_code: 'BD',
        type: 'CURRENT',
    });

    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/auth/addresses', {
            preserveScroll: true,
            onSuccess: () => toast.success('Address created successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/auth/addresses' },
        { title: 'Add Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Address" />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Create Address"
                    description="Add a new address for a customer"
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Customer
                        </h3>
                        <div className="mt-2">
                            <CustomerSearch
                                query={query}
                                onQueryChange={setQuery}
                                onSelect={(customer) => {
                                    setData('customer_id', customer.id);
                                    setData('customer_name', customer.name);
                                    setQuery(customer.name);
                                }}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Customer ID</Label>
                                <Input
                                    value={data.customer_id ?? ''}
                                    disabled
                                    className="bg-disabled mt-1 cursor-not-allowed"
                                />
                                <InputError message={errors.customer_id} />
                            </div>
                            <div>
                                <Label>Customer Name</Label>
                                <Input
                                    value={data.customer_name}
                                    disabled
                                    className="bg-disabled mt-1 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Fields */}
                    <div>
                        <Label>Address Line 1</Label>
                        <Input
                            value={data.line1}
                            onChange={(e) => setData('line1', e.target.value)}
                            placeholder="Street, Road, House No"
                        />
                        <InputError message={errors.line1} />
                    </div>

                    <div>
                        <Label>Address Line 2</Label>
                        <Input
                            value={data.line2}
                            onChange={(e) => setData('line2', e.target.value)}
                            placeholder="Apartment, Building, etc."
                        />
                        <InputError message={errors.line2} />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <Label>Division</Label>
                            <Input
                                value={data.division}
                                onChange={(e) =>
                                    setData('division', e.target.value)
                                }
                                placeholder="Division"
                            />
                            <InputError message={errors.division} />
                        </div>

                        <div>
                            <Label>District</Label>
                            <Input
                                value={data.district}
                                onChange={(e) =>
                                    setData('district', e.target.value)
                                }
                                placeholder="District"
                            />
                            <InputError message={errors.district} />
                        </div>

                        <div>
                            <Label>Upazila</Label>
                            <Input
                                value={data.upazila}
                                onChange={(e) =>
                                    setData('upazila', e.target.value)
                                }
                                placeholder="Upazila"
                            />
                            <InputError message={errors.upazila} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <Label>Union/Ward</Label>
                            <Input
                                value={data.union_ward}
                                onChange={(e) =>
                                    setData('union_ward', e.target.value)
                                }
                                placeholder="Union or Ward"
                            />
                        </div>

                        <div>
                            <Label>Village/Locality</Label>
                            <Input
                                value={data.village_locality}
                                onChange={(e) =>
                                    setData('village_locality', e.target.value)
                                }
                                placeholder="Village / Locality"
                            />
                        </div>

                        <div>
                            <Label>Postal Code</Label>
                            <Input
                                value={data.postal_code}
                                onChange={(e) =>
                                    setData('postal_code', e.target.value)
                                }
                                placeholder="Postal Code"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Country Code</Label>
                            <Input
                                value={data.country_code}
                                onChange={(e) =>
                                    setData('country_code', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Address Type</Label>
                            <select
                                value={data.type}
                                onChange={(e) =>
                                    setData('type', e.target.value)
                                }
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option>CURRENT</option>
                                <option>PERMANENT</option>
                                <option>MAILING</option>
                                <option>WORK</option>
                                <option>REGISTERED</option>
                                <option>OTHER</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Create Address'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
