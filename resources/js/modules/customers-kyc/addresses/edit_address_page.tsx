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
import { addressTypes } from '@/modules/customers-kyc/addresses/data/address_types';
import type {
    InputFieldProps,
    Props,
} from '@/modules/customers-kyc/types/addresses/edit_address_page.interfaces';
import type { AddressType } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { BreadcrumbItem } from '@/types';

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

    const selectedAddressType =
        addressTypes.find((item) => item.value === data.type)?.label ??
        data.type;
    const addressLocation = [
        data.union_ward,
        data.upazila,
        data.district,
        data.division,
    ]
        .filter(Boolean)
        .join(', ');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route('customers.addresses.update', [customer.id, address.id]), {
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
        { title: 'Edit Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Address - ${customer.name}`} />

            <div className="w-full space-y-3 pb-24">
                {/* Compact page header */}
                <div
                    data-slot="customer-page-header"
                    className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div
                            data-slot="customer-page-header-icon"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
                        >
                            <MapPin className="size-4.5" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Edit Customer Address
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Update address and location information.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('customers.index', {})}>
                                <ArrowLeft className="size-3.5" />
                                Customers
                            </Link>
                        </Button>

                        <Button size="sm" asChild>
                            <Link href={route('customers.show', customer.id)}>
                                <Eye className="size-3.5" />
                                View Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Compact customer information */}
                <section className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
                        <UserRound className="size-4 text-primary" />
                        <h2 className="text-sm font-semibold">
                            Customer Information
                        </h2>
                        <span className="ml-auto rounded border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                            {customer.customer_no}
                        </span>
                    </div>

                    <div className="flex items-start gap-3 p-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-14">
                            {customer.photo?.url ? (
                                <img
                                    src={customer.photo.url}
                                    alt={customer.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center bg-primary/5 text-lg font-semibold text-primary">
                                    {customer.name?.charAt(0)?.toUpperCase() ||
                                        'C'}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="truncate text-sm font-semibold text-foreground hover:text-primary"
                                >
                                    {customer.name}
                                </Link>

                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span className="rounded bg-muted px-1.5 py-0.5">
                                        {customer.type}
                                    </span>
                                    <span className="rounded bg-muted px-1.5 py-0.5">
                                        {customer.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 border-t border-border pt-2 sm:grid-cols-2 lg:grid-cols-4">
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

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-3">
                            {/* Address details */}
                            <section className="overflow-hidden rounded-lg border border-border bg-card">
                                <SectionHeading
                                    icon={<Home className="size-4" />}
                                    title="Address Details"
                                    description="Address type, country, and street details."
                                    step="01"
                                />

                                <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor="type">
                                            Address Type
                                            <RequiredMark />
                                        </Label>
                                        <Select
                                            value={data.type}
                                            onChange={(value) =>
                                                setData(
                                                    'type',
                                                    value as AddressType,
                                                )
                                            }
                                            options={addressTypes.map(
                                                (item) => ({
                                                    value: item.value.toString(),
                                                    label: item.label,
                                                }),
                                            )}
                                        />
                                        <InputError message={errors.type} />
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor="country">
                                            Country
                                            <RequiredMark />
                                        </Label>
                                        <div className="relative">
                                            <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="country"
                                                value={data.country}
                                                onChange={(e) =>
                                                    setData(
                                                        'country',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter country"
                                                className="h-9 pl-9"
                                            />
                                        </div>
                                        <InputError message={errors.country} />
                                    </div>

                                    <div className="min-w-0 space-y-1 sm:col-span-2 lg:col-span-1">
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
                                            className="h-9"
                                        />
                                        <InputError message={errors.line1} />
                                    </div>

                                    <div className="min-w-0 space-y-1 sm:col-span-2 lg:col-span-3">
                                        <Label htmlFor="line2">
                                            Address Line 2
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
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
                                            className="h-9"
                                        />
                                        <InputError message={errors.line2} />
                                    </div>
                                </div>
                            </section>

                            {/* Location details */}
                            <section className="overflow-hidden rounded-lg border border-border bg-card">
                                <SectionHeading
                                    icon={<MapPinned className="size-4" />}
                                    title="Location Details"
                                    description="Administrative location and postal information."
                                    step="02"
                                />

                                <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <InputField
                                        id="division"
                                        label="Division"
                                        value={data.division}
                                        onChange={(value) =>
                                            setData('division', value)
                                        }
                                        error={errors.division}
                                        placeholder="e.g. Dhaka"
                                    />

                                    <InputField
                                        id="district"
                                        label="District"
                                        value={data.district}
                                        onChange={(value) =>
                                            setData('district', value)
                                        }
                                        error={errors.district}
                                        placeholder="e.g. Dhaka"
                                    />

                                    <InputField
                                        id="upazila"
                                        label="Upazila / Thana"
                                        value={data.upazila}
                                        onChange={(value) =>
                                            setData('upazila', value)
                                        }
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
                        </div>

                        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                                <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Eye className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                                Customer address
                                            </p>
                                            <h2 className="text-sm font-semibold">
                                                Address preview
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 p-3">
                                    <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    {selectedAddressType}
                                                    {' address'}
                                                </p>
                                                <p className="mt-1 text-sm font-semibold break-words">
                                                    {data.line1 ||
                                                        'Address line 1'}
                                                </p>
                                                {data.line2 && (
                                                    <p className="mt-1 text-xs leading-relaxed break-words text-muted-foreground">
                                                        {data.line2}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <div className="flex items-start gap-2 text-xs">
                                            <MapPinned className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    Location
                                                </p>
                                                <p className="mt-0.5 font-medium break-words">
                                                    {addressLocation ||
                                                        'Location details will appear here'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/60 pt-2">
                                            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                Postal code
                                            </p>
                                            <p className="mt-0.5 text-xs font-medium">
                                                {data.postal_code ||
                                                    'Not provided'}
                                            </p>
                                        </div>

                                        <div className="border-t border-border/60 pt-2">
                                            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                Country
                                            </p>
                                            <p className="mt-0.5 text-xs font-medium">
                                                {data.country ||
                                                    'Country not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="flex items-start gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                                        <Eye className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                        This preview updates as you edit the
                                        address details.
                                    </p>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Sticky form actions */}
                    <div
                        data-slot="mobile-page-action-bar"
                        className="fixed right-0 bottom-0 left-(--app-sidebar-offset) z-30 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur-md sm:static sm:rounded-lg sm:border sm:bg-card sm:px-3 sm:py-2.5 sm:backdrop-blur-none"
                    >
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-xs text-muted-foreground md:block">
                                Review the address details before saving.
                            </p>

                            <div className="flex items-center gap-2 sm:ml-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
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
                                    size="sm"
                                    disabled={processing}
                                    className="flex-1 sm:min-w-36 sm:flex-none"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-3.5" />
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
                <p className="text-[11px] leading-relaxed text-muted-foreground">
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
        <div className="min-w-0 space-y-1">
            <Label htmlFor={id}>
                {label}
                {required && <RequiredMark />}
            </Label>

            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9"
            />

            <InputError message={error} />
        </div>
    );
}

export default Edit;
