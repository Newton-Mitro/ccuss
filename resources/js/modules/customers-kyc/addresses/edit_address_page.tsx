import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    Globe2,
    Home,
    Loader2,
    MapPin,
    MapPinned,
    Save,
    UserRound,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import BolderLessInfoBox from '@/components/borderless-info-box';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type {
    AddressType,
    CustomerAddress,
} from '@/modules/customers-kyc/types/customer_kyc_module';
import { addressTypes } from '@/modules/customers-kyc/addresses/data/address_types';

interface Props extends SharedData {
    address: CustomerAddress;
}

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
}

const Edit = () => {
    const { address } = usePage<Props>().props;
    const customer = address.customer;

    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        customer_id: customer.id,
        line1: address.line1 || '',
        line2: address.line2 || '',
        division: address.division || '',
        district: address.district || '',
        upazila: address.upazila || '',
        union_ward: address.union_ward || '',
        postal_code: address.postal_code || '',
        country: address.country || 'Bangladesh',
        type: address.type,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route('customers.addresses.update', [customer.id, address.id]), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer.name,
            href: route('customers.show', customer.id),
        },
        { title: 'Edit Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Address - ${customer.name}`} />

            <div className="w-full max-w-7xl space-y-5 pb-24">
                {/* Page heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                            <MapPin className="size-5" />
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                Edit Customer Address
                            </h1>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Update the customer's address and location
                                details. Changes will be saved to this address
                                record.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('customers.index', {})}>
                                <ArrowLeft className="size-4" />
                                Back to Customers
                            </Link>
                        </Button>

                        <Button size="sm" asChild>
                            <Link href={route('customers.show', customer.id)}>
                                <Eye className="size-4" />
                                View Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Customer profile */}
                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                        <UserRound className="size-4 text-primary" />
                        <h2 className="text-sm font-semibold text-foreground">
                            Customer Information
                        </h2>
                        <span className="ml-auto rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                            {customer.customer_no}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                        <div className="flex shrink-0 items-center gap-3 sm:block">
                            <div className="size-16 overflow-hidden rounded-xl border border-border bg-muted sm:size-20">
                                {customer.photo?.url ? (
                                    <img
                                        src={customer.photo.url}
                                        alt={customer.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center bg-primary/5 text-xl font-semibold text-primary">
                                        {customer.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || 'C'}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 sm:hidden">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="font-semibold text-foreground transition-colors hover:text-primary"
                                >
                                    {customer.name}
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {customer.type} · {customer.status}
                                </p>
                            </div>
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                            <div className="hidden sm:block">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="text-base font-semibold text-foreground transition-colors hover:text-primary"
                                >
                                    {customer.name}
                                </Link>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>{customer.type}</span>
                                    <span>·</span>
                                    <span>{customer.status}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-x-5 gap-y-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
                                <BolderLessInfoBox
                                    label="Primary Phone"
                                    value={customer.primary_phone}
                                />
                                <BolderLessInfoBox
                                    label="Primary Email"
                                    value={customer.primary_email}
                                />
                                <BolderLessInfoBox
                                    label="Identification Type"
                                    value={customer.identification_type}
                                />
                                <BolderLessInfoBox
                                    label="Identification Number"
                                    value={customer.identification_number}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Address form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Address details */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <SectionHeading
                            icon={<Home className="size-4" />}
                            title="Address Details"
                            description="Select the address type and enter the street or house information."
                            step="01"
                        />

                        <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="type">
                                    Address Type
                                    <RequiredMark />
                                </Label>
                                <Select
                                    value={data.type}
                                    onChange={(value) =>
                                        setData('type', value as AddressType)
                                    }
                                    options={addressTypes.map((item) => ({
                                        value: item.value.toString(),
                                        label: item.label,
                                    }))}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="country">
                                    Country
                                    <RequiredMark />
                                </Label>
                                <div className="relative">
                                    <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) =>
                                            setData('country', e.target.value)
                                        }
                                        placeholder="Enter country"
                                        className="h-10 pl-9"
                                    />
                                </div>
                                <InputError message={errors.country} />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="line1">
                                    Address Line 1
                                    <RequiredMark />
                                </Label>
                                <Input
                                    id="line1"
                                    value={data.line1}
                                    onChange={(e) =>
                                        setData('line1', e.target.value)
                                    }
                                    placeholder="House, road, or village"
                                    className="h-10"
                                />
                                <InputError message={errors.line1} />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                                <Label htmlFor="line2">
                                    Address Line 2
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        (Optional)
                                    </span>
                                </Label>
                                <Input
                                    id="line2"
                                    value={data.line2}
                                    onChange={(e) =>
                                        setData('line2', e.target.value)
                                    }
                                    placeholder="Apartment, building, landmark, or additional details"
                                    className="h-10"
                                />
                                <InputError message={errors.line2} />
                            </div>
                        </div>
                    </section>

                    {/* Location details */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <SectionHeading
                            icon={<MapPinned className="size-4" />}
                            title="Location Details"
                            description="Provide the administrative location to keep the customer's address accurate."
                            step="02"
                        />

                        <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InputField
                                id="division"
                                label="Division"
                                value={data.division}
                                onChange={(value) => setData('division', value)}
                                error={errors.division}
                                placeholder="e.g. Dhaka"
                            />

                            <InputField
                                id="district"
                                label="District"
                                value={data.district}
                                onChange={(value) => setData('district', value)}
                                error={errors.district}
                                placeholder="e.g. Dhaka"
                            />

                            <InputField
                                id="upazila"
                                label="Upazila / Thana"
                                value={data.upazila}
                                onChange={(value) => setData('upazila', value)}
                                error={errors.upazila}
                                placeholder="Enter upazila or thana"
                            />

                            <InputField
                                id="union_ward"
                                label="Union / Ward"
                                value={data.union_ward}
                                onChange={(value) =>
                                    setData('union_ward', value)
                                }
                                error={errors.union_ward}
                                placeholder="Enter union or ward"
                            />

                            <InputField
                                id="postal_code"
                                label="Postal Code"
                                value={data.postal_code}
                                onChange={(value) =>
                                    setData('postal_code', value)
                                }
                                error={errors.postal_code}
                                placeholder="Enter postal code"
                            />
                        </div>
                    </section>

                    {/* Sticky form actions */}
                    <div className="fixed right-0 bottom-0 left-(--app-sidebar-offset) z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:rounded-xl sm:border sm:bg-card sm:px-5 sm:py-4 sm:backdrop-blur-none">
                        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Review the address details before saving your
                                changes.
                            </p>

                            <div className="flex w-full items-center gap-2 sm:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    className="flex-1 sm:flex-none"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'customers.show',
                                            customer.id,
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 sm:min-w-40 sm:flex-none"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-4" />
                                            Update Address
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

function SectionHeading({
    icon,
    title,
    description,
    step,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    step: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3.5">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">
                        {title}
                    </h2>
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {step}
                    </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function RequiredMark() {
    return <span className="ml-1 text-destructive">*</span>;
}

function InputField({
    id,
    label,
    value,
    onChange,
    error,
    placeholder,
    required,
}: InputFieldProps & { id: string }) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label htmlFor={id}>
                {label}
                {required && <RequiredMark />}
            </Label>

            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-10"
            />

            <InputError message={error} />
        </div>
    );
}

export default Edit;
