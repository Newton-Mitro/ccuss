import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';

import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';
import { addressTypes } from './data/address_types';

interface Props extends SharedData {
    customer: Customer;
}

const Create = () => {
    const { customer } = usePage<Props>().props;

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const { data, setData, post, processing, errors } = useForm({
        customer_id: customer.id,
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
        post(route('addresses.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: route('customers.index') },
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

                <div className="">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6"
            >
                <div className="mt-3 flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                    <div className="flex items-center justify-center">
                        {/* Avatar */}
                        <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                            {customer?.photo?.url ? (
                                <img
                                    src={customer?.photo?.url}
                                    alt={customer.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                    {customer.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                        <div>
                            <Link
                                href={route('customers.show', customer.id)}
                                className="cursor-pointer text-sm font-semibold text-info underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {`${customer.name} • ${customer.customer_no}`}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {customer.kyc_status} • {customer.type}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-4">
                            <Info label="Phone" value={customer.phone} />
                            <Info label="Email" value={customer.email} />
                            <Info
                                label="Identification Type"
                                value={customer.identification_type}
                            />
                            <Info
                                label="Identification Number"
                                value={customer.identification_number}
                            />
                        </div>
                    </div>
                </div>

                {/* CUSTOMER */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Address Type</Label>
                        <Select
                            value={data.type}
                            onChange={(value) => setData('type', value)}
                            options={addressTypes.map((addressType) => ({
                                value: addressType.value.toString(),
                                label: addressType.label,
                            }))}
                        ></Select>
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

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value}</p>
        </div>
    );
}
