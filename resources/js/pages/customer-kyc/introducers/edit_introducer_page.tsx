import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    GitBranch,
    HeartHandshake,
    Loader2,
    Save,
    UserRound,
    UsersRound,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';

import BolderLessInfoBox from '../../../components/borderless-info-box';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem } from '../../../types';
import type { Customer } from '../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../customers/components/customer-search-box';
import { relationshipTypes } from './data/relationship_types';

const Edit = () => {
    const { introducer } = usePage().props as any;
    const customer = introducer?.introduced_customer;

    const [selectedIntroducer, setSelectedIntroducer] =
        useState<Customer | null>(introducer?.introducer || null);

    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        introduced_customer_id: customer.id,
        introducer_customer_id: introducer?.introducer_customer_id || '',
        relationship_type: introducer?.relationship_type || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.introducer_customer_id) {
            toast.error('Please select an introducer.');
            return;
        }

        if (data.introducer_customer_id === customer.id) {
            toast.error('Customer cannot be their own introducer.');
            return;
        }

        put(
            route('customers.introducers.update', [customer.id, introducer.id]),
            {
                preserveScroll: true,
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer.name,
            href: route('customers.show', customer.id),
        },
        { title: 'Edit Introducer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Introducer - ${customer.name}`} />

            <div className="w-full max-w-7xl space-y-5 pb-24">
                {/* Page heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                            <HeartHandshake className="size-5" />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                Edit Introducer
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update the customer's introducer and
                                relationship details.
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="size-4" />
                            Back to Customer
                        </Link>
                    </Button>
                </div>

                {/* Introduced customer profile */}
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
                        <div className="flex items-center gap-3 sm:block">
                            <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-20">
                                {customer?.photo?.url ? (
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
                                    className="text-sm font-semibold text-foreground hover:text-primary"
                                >
                                    {customer.name}
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {customer.status} · {customer.type}
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
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {customer.status} · {customer.type}
                                </p>
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

                {/* Introducer relationship form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <SectionHeading
                            icon={<UsersRound className="size-4" />}
                            step="01"
                            title="Introducer Details"
                            description="Choose the existing customer who introduced this customer."
                        />

                        <div className="space-y-2 p-4 sm:p-5">
                            <Label className="text-sm">
                                Select Introducer
                                <span className="ml-1 text-destructive">*</span>
                            </Label>

                            <CustomerSearchBox
                                selectedCustomer={selectedIntroducer}
                                onSelect={(c: Customer) => {
                                    if (String(c.id) === String(customer.id)) {
                                        toast.error(
                                            'Customer cannot be their own introducer.',
                                        );
                                        return;
                                    }

                                    setSelectedIntroducer(c);
                                    setData('introducer_customer_id', c.id);
                                }}
                            />

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Search for a registered customer and select them
                                as the introducer. The customer cannot introduce
                                themselves.
                            </p>

                            <InputError
                                message={errors.introducer_customer_id}
                            />

                            {selectedIntroducer && (
                                <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background text-sm font-semibold text-primary">
                                        {selectedIntroducer.photo?.url ? (
                                            <img
                                                src={
                                                    selectedIntroducer.photo.url
                                                }
                                                alt={selectedIntroducer.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            selectedIntroducer.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || 'C'
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {selectedIntroducer.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {selectedIntroducer.customer_no}
                                            {selectedIntroducer.primary_phone
                                                ? ` · ${selectedIntroducer.primary_phone}`
                                                : ''}
                                        </p>
                                    </div>

                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-background px-2 py-1 text-xs text-primary">
                                        <CheckCheck className="size-3.5" />
                                        Selected
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <SectionHeading
                            icon={<GitBranch className="size-4" />}
                            step="02"
                            title="Relationship Details"
                            description="Specify how the introducer is related to the customer."
                        />

                        <div className="max-w-xl space-y-2 p-4 sm:p-5">
                            <Label
                                htmlFor="relationship_type"
                                className="text-sm"
                            >
                                Relationship Type
                                <span className="ml-1 text-destructive">*</span>
                            </Label>

                            <Select
                                value={data.relationship_type}
                                onChange={(value) =>
                                    setData('relationship_type', value)
                                }
                                options={relationshipTypes}
                            />

                            <p className="text-xs text-muted-foreground">
                                Choose the appropriate relationship from the
                                available options.
                            </p>

                            <InputError message={errors.relationship_type} />
                        </div>
                    </section>

                    {/* Sticky action bar */}
                    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:rounded-xl sm:border sm:bg-card sm:px-5 sm:py-4 sm:backdrop-blur-none">
                        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Verify the introducer and relationship before
                                saving.
                            </p>

                            <div className="flex w-full gap-2 sm:w-auto">
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
                                    className="flex-1 sm:min-w-44 sm:flex-none"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-4" />
                                            Update Introducer
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
    step,
    title,
    description,
}: {
    icon: React.ReactNode;
    step: string;
    title: string;
    description: string;
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

export default Edit;
