import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

const Create = () => {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        line1: '',
        line2: '',
        division: '',
        district: '',
        upazila: '',
        union_ward: '',
        postal_code: '',
        country: 'Bangladesh',
        type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer-addresses', {
            preserveScroll: true,
            onError: (e) => toast.error(JSON.stringify(e)),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer Addresses', href: '/customer-addresses' },
        { title: 'Add Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer Address" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Create Customer Address"
                    description="Add new address for customer."
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href="/customer-addresses"
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition hover:bg-secondary/90"
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Addresses</span>
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6 lg:w-5xl"
            >
                {/* CUSTOMER */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Customer ID</Label>
                        <Input
                            value={data.customer_id}
                            onChange={(e) =>
                                setData('customer_id', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.customer_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Address Type</Label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select</option>
                            <option>CURRENT</option>
                            <option>PERMANENT</option>
                            <option>MAILING</option>
                            <option>WORK</option>
                            <option>REGISTERED</option>
                            <option>OTHER</option>
                        </select>
                        <InputError message={errors.type} />
                    </div>

                    <div>
                        <Label className="text-xs">Country</Label>
                        <Input
                            value={data.country}
                            onChange={(e) => setData('country', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.country} />
                    </div>
                </div>

                {/* ADDRESS LINES */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label className="text-xs">Address Line 1</Label>
                        <Input
                            value={data.line1}
                            onChange={(e) => setData('line1', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.line1} />
                    </div>

                    <div>
                        <Label className="text-xs">Address Line 2</Label>
                        <Input
                            value={data.line2}
                            onChange={(e) => setData('line2', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.line2} />
                    </div>
                </div>

                {/* LOCATION */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Division</Label>
                        <Input
                            value={data.division}
                            onChange={(e) =>
                                setData('division', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.division} />
                    </div>

                    <div>
                        <Label className="text-xs">District</Label>
                        <Input
                            value={data.district}
                            onChange={(e) =>
                                setData('district', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.district} />
                    </div>

                    <div>
                        <Label className="text-xs">Upazila</Label>
                        <Input
                            value={data.upazila}
                            onChange={(e) => setData('upazila', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.upazila} />
                    </div>

                    <div>
                        <Label className="text-xs">Union/Ward</Label>
                        <Input
                            value={data.union_ward}
                            onChange={(e) =>
                                setData('union_ward', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.union_ward} />
                    </div>

                    <div>
                        <Label className="text-xs">Postal Code</Label>
                        <Input
                            value={data.postal_code}
                            onChange={(e) =>
                                setData('postal_code', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.postal_code} />
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                    >
                        {processing ? (
                            <>
                                <Loader2 />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck />
                                Store Address
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Create;
