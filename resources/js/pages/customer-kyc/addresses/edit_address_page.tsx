import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Eye, Loader2 } from 'lucide-react';

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
import {
    AddressType,
    CustomerAddress,
} from '../../../types/customer_kyc_module';
import { addressTypes } from './data/address_types';

interface Props extends SharedData {
    address: CustomerAddress;
}

const Edit = () => {
    const { address } = usePage<Props>().props;
    const customer = address?.customer;

    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        customer_id: customer.id,
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        division: address?.division || '',
        district: address?.district || '',
        upazila: address?.upazila || '',
        union_ward: address?.union_ward || '',
        postal_code: address?.postal_code || '',
        country: address?.country || 'Bangladesh',
        type: address?.type,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('addresses.update', address.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        { title: 'Edit Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Customer Address" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Edit Customer Address"
                    description="Update customer address information."
                />

                <Link
                    type="button"
                    href={route('customers.show', customer.id)}
                    className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                >
                    <Eye className="h-4 w-4" />
                    Show Customer
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6"
            >
                {/* CUSTOMER INFO (UNCHANGED) */}
                <div className="mt-3 flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                    <div className="flex items-center justify-center">
                        <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                            {customer?.photo?.url ? (
                                <img
                                    src={customer.photo.url}
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

                    <div className="flex-1 space-y-1">
                        <Link
                            href={route('customers.show', customer.id)}
                            className="text-sm font-semibold text-info underline"
                        >
                            {customer.name} • {customer.customer_no}
                        </Link>

                        <p className="text-xs text-muted-foreground">
                            {customer.kyc_status} • {customer.type}
                        </p>

                        <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-4">
                            <Info label="Phone" value={customer.phone} />
                            <Info label="Email" value={customer.email} />
                            <Info
                                label="ID Type"
                                value={customer.identification_type}
                            />
                            <Info
                                label="ID Number"
                                value={customer.identification_number}
                            />
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Address Type</Label>
                        <Select
                            value={data.type}
                            onChange={(value) =>
                                setData('type', value as AddressType)
                            }
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

                {/* ADDRESS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                        label="Line 1"
                        value={data.line1}
                        onChange={(v) => setData('line1', v)}
                        error={errors.line1}
                    />
                    <InputField
                        label="Line 2"
                        value={data.line2}
                        onChange={(v) => setData('line2', v)}
                        error={errors.line2}
                    />
                </div>

                {/* LOCATION */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField
                        label="Division"
                        value={data.division}
                        onChange={(v) => setData('division', v)}
                        error={errors.division}
                    />
                    <InputField
                        label="District"
                        value={data.district}
                        onChange={(v) => setData('district', v)}
                        error={errors.district}
                    />
                    <InputField
                        label="Upazila"
                        value={data.upazila}
                        onChange={(v) => setData('upazila', v)}
                        error={errors.upazila}
                    />
                    <InputField
                        label="Union/Ward"
                        value={data.union_ward}
                        onChange={(v) => setData('union_ward', v)}
                        error={errors.union_ward}
                    />
                    <InputField
                        label="Postal Code"
                        value={data.postal_code}
                        onChange={(v) => setData('postal_code', v)}
                        error={errors.postal_code}
                    />
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 />
                                Updating...
                            </>
                        ) : (
                            <>
                                <CheckCheck />
                                Update Address
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Edit;

/* 🔹 Reusable Input */
function InputField({ label, value, onChange, error }: any) {
    return (
        <div>
            <Label className="text-xs">{label}</Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 text-sm"
            />
            <InputError message={error} />
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value}</p>
        </div>
    );
}
