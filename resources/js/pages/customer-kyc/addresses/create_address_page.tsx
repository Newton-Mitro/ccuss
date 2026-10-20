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
import BolderLessInfoBox from '../../../components/borderless-info-box';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '../../../types';
import type { Customer } from '../../../types/customer_kyc_module';
import { addressTypes } from './data/address_types';

interface Props extends SharedData {
    customer: Customer;
}

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('customers.addresses.store', customer.id), {
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
        { title: 'Add Address', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer Address" />

            <div className="w-full max-w-6xl space-y-5 pb-8">
                {/* Page heading */}
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <MapPinned className="size-5" />
                        </div>

                        <div>
                            <HeadingSmall
                                title="Add Customer Address"
                                description="Add a residential, office, or mailing address to the customer profile."
                            />
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ContactRound className="size-3.5" />
                                Customer ID: #{customer.id}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to customer
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Customer summary */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                            <ContactRound className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">
                                Customer information
                            </h2>
                            <span className="ml-auto text-xs text-muted-foreground">
                                Existing customer
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                            <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                                <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                    {customer.photo?.url ? (
                                        <img
                                            src={customer.photo.url}
                                            alt={customer.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                                            {customer.name?.charAt(0) || 'C'}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <Link
                                        href={route(
                                            'customers.show',
                                            customer.id,
                                        )}
                                        className="block truncate text-sm font-semibold text-foreground transition hover:text-primary"
                                    >
                                        {customer.name}
                                    </Link>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {customer.customer_no ||
                                            'No customer number'}
                                    </p>

                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {customer.status && (
                                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                {customer.status}
                                            </span>
                                        )}
                                        {customer.type && (
                                            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                {customer.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-3 border-t border-border pt-4 sm:grid-cols-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 lg:grid-cols-4">
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

                    {/* Address type and country */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <SectionHeader
                            icon={<House className="size-4" />}
                            title="Address information"
                            description="Choose the address category and enter the main address details."
                            step="01"
                        />

                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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
                                    placeholder="Select address type"
                                />
                            </FormField>

                            <FormField
                                label="Country"
                                required
                                error={errors.country}
                            >
                                <div className="relative">
                                    <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
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
                                    hint="Optional additional address information."
                                >
                                    <Input
                                        value={data.line2}
                                        onChange={(e) =>
                                            setData('line2', e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="Apartment, floor, landmark, or additional details"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </section>

                    {/* Location details */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <SectionHeader
                            icon={<MapPin className="size-4" />}
                            title="Location details"
                            description="Provide the administrative area and postal information."
                            step="02"
                        />

                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                label="Division"
                                required
                                error={errors.division}
                            >
                                <Input
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

                    {/* Form actions */}
                    <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p className="text-xs text-muted-foreground">
                            Fields marked with{' '}
                            <span className="text-destructive">*</span> are
                            required.
                        </p>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
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
                                disabled={processing}
                                className="min-w-36"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving address...
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="mr-2 size-4" />
                                        Save address
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
    <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
            {icon}
        </div>

        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                    {title}
                </h2>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    STEP {step}
                </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
    <div className="min-w-0 space-y-1.5">
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
