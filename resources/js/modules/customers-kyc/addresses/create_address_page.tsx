import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    ContactRound,
    Globe2,
    House,
    Loader2,
    MapPin,
    MapPinned,
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
import type { BreadcrumbItem } from '@/types';

import { addressTypes } from '@/modules/customers-kyc/addresses/data/address_types';
import type { Props } from '@/modules/customers-kyc/types/addresses/create_address_page.interfaces';

const Create = () => {
    const { customer } = usePage<Props>().props;

    useFlashToastHandler();

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('customers.addresses.store', customer.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '/customer-kyc' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer.name,
            href: route('customers.show', customer.id),
        },
        { title: 'Add Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer Address" />

            <div className="w-full space-y-3 pb-24">
                {/* Page heading */}
                <div
                    data-slot="customer-page-header"
                    className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div
                            data-slot="customer-page-header-icon"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
                        >
                            <MapPinned className="size-4.5" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Add Customer Address
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Add a residential, office, or mailing address.
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <ContactRound className="size-3" />
                                Customer ID: #{customer.id}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="size-3.5" />
                            Back to Customer
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Customer summary */}
                    <section className="overflow-hidden rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
                            <ContactRound className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">
                                Customer Information
                            </h2>
                            <span className="ml-auto text-[11px] text-muted-foreground">
                                Existing customer
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 items-center gap-2.5 sm:w-56 sm:shrink-0">
                                <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                    {customer.photo?.url ? (
                                        <img
                                            src={customer.photo.url}
                                            alt={customer.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center bg-primary/5 text-base font-semibold text-primary">
                                            {customer.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || 'C'}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <Link
                                        href={route(
                                            'customers.show',
                                            customer.id,
                                        )}
                                        className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                                    >
                                        {customer.name}
                                    </Link>

                                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                        {customer.customer_no ||
                                            'No customer number'}
                                    </p>

                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {customer.status && (
                                            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                {customer.status}
                                            </span>
                                        )}
                                        {customer.type && (
                                            <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                {customer.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 border-t border-border pt-3 sm:grid-cols-2 sm:border-t-0 sm:border-l sm:py-0 sm:pl-4">
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
                    </section>

                    {/* Address information */}
                    <section className="overflow-hidden rounded-lg border border-border bg-card">
                        <SectionHeader
                            icon={<House className="size-4" />}
                            title="Address Information"
                            description="Choose the address category and enter street details."
                            step="01"
                        />

                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-3 sm:grid-cols-2">
                            <FormField
                                label="Address Type"
                                required
                                error={errors.type}
                            >
                                <Select
                                    value={data.type}
                                    onChange={(value) => setData('type', value)}
                                    options={addressTypes.map((item) => ({
                                        value: item.value.toString(),
                                        label: item.label,
                                    }))}
                                    className="h-9"
                                    placeholder="Select address type"
                                />
                            </FormField>

                            <FormField
                                label="Country"
                                required
                                error={errors.country}
                            >
                                <div className="relative">
                                    <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) =>
                                            setData('country', e.target.value)
                                        }
                                        className="h-9 pl-9"
                                        placeholder="Enter country"
                                    />
                                </div>
                            </FormField>

                            <div className="sm:col-span-2">
                                <FormField
                                    label="Address Line 1"
                                    required
                                    error={errors.line1}
                                    hint="House, road, village, or street address."
                                >
                                    <Input
                                        id="line1"
                                        value={data.line1}
                                        onChange={(e) =>
                                            setData('line1', e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="e.g. House 12, Road 5, Dhanmondi"
                                    />
                                </FormField>
                            </div>

                            <div className="sm:col-span-2">
                                <FormField
                                    label="Address Line 2"
                                    error={errors.line2}
                                    hint="Optional: apartment, floor, landmark, or additional details."
                                >
                                    <Input
                                        id="line2"
                                        value={data.line2}
                                        onChange={(e) =>
                                            setData('line2', e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="Enter additional address details"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </section>

                    {/* Location details */}
                    <section className="overflow-hidden rounded-lg border border-border bg-card">
                        <SectionHeader
                            icon={<MapPin className="size-4" />}
                            title="Location Details"
                            description="Enter administrative area and postal information."
                            step="02"
                        />

                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                label="Division"
                                required
                                error={errors.division}
                            >
                                <Input
                                    id="division"
                                    value={data.division}
                                    onChange={(e) =>
                                        setData('division', e.target.value)
                                    }
                                    className="h-9"
                                    placeholder="e.g. Dhaka"
                                />
                            </FormField>

                            <FormField
                                label="District"
                                required
                                error={errors.district}
                            >
                                <Input
                                    id="district"
                                    value={data.district}
                                    onChange={(e) =>
                                        setData('district', e.target.value)
                                    }
                                    className="h-9"
                                    placeholder="e.g. Dhaka"
                                />
                            </FormField>

                            <FormField label="Upazila" error={errors.upazila}>
                                <Input
                                    id="upazila"
                                    value={data.upazila}
                                    onChange={(e) =>
                                        setData('upazila', e.target.value)
                                    }
                                    className="h-9"
                                    placeholder="Enter upazila"
                                />
                            </FormField>

                            <FormField
                                label="Union / Ward"
                                error={errors.union_ward}
                            >
                                <Input
                                    id="union_ward"
                                    value={data.union_ward}
                                    onChange={(e) =>
                                        setData('union_ward', e.target.value)
                                    }
                                    className="h-9"
                                    placeholder="Enter union or ward"
                                />
                            </FormField>

                            <FormField
                                label="Postal Code"
                                error={errors.postal_code}
                                hint="Postal or ZIP code."
                            >
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) =>
                                        setData('postal_code', e.target.value)
                                    }
                                    className="h-9"
                                    placeholder="Enter postal code"
                                />
                            </FormField>
                        </div>
                    </section>

                    {/* Compact sticky form actions */}
                    <div className="sticky bottom-2 z-20 flex flex-col-reverse gap-2 rounded-lg border border-border bg-background/95 p-2.5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-muted-foreground">
                            <span className="text-destructive">*</span> Required
                            fields
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={processing}
                                className="flex-1 sm:flex-none"
                                asChild
                            >
                                <Link
                                    href={route('customers.show', customer.id)}
                                >
                                    Cancel
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="flex-1 sm:min-w-36 sm:flex-none"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="size-3.5" />
                                        Save Address
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

const SectionHeader = ({
    icon,
    title,
    description,
    step,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    step: string;
}) => (
    <div className="flex items-center gap-2.5 border-b border-border bg-muted/20 px-3 py-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
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
            <p className="text-[11px] leading-4 text-muted-foreground">
                {description}
            </p>
        </div>
    </div>
);

const FormField = ({
    label,
    required = false,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) => (
    <div className="min-w-0 space-y-1">
        <Label className="text-xs font-medium">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        {children}

        {error ? (
            <InputError message={error} />
        ) : hint ? (
            <p className="text-[11px] leading-4 text-muted-foreground">
                {hint}
            </p>
        ) : null}
    </div>
);

export default Create;
