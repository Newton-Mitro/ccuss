import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    ContactRound,
    Eye,
    GitBranch,
    Handshake,
    Loader2,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';

import BolderLessInfoBox from '@/components/borderless-info-box';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { CustomerSearchBox } from '@/modules/customers-kyc/customers/components/customer-search-box';
import { relationshipTypes } from '@/modules/customers-kyc/introducers/data/relationship_types';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { BreadcrumbItem, SharedData } from '@/types';

const Create = () => {
    const { customer } = usePage<SharedData & { customer: Customer }>().props;

    const [selectedIntroducer, setSelectedIntroducer] =
        useState<Customer | null>(null);

    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        introduced_customer_id: customer.id,
        introducer_customer_id: null as number | null,
        relationship_type: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.introducer_customer_id) {
            toast.error('Please select an introducer');
            return;
        }

        if (data.introducer_customer_id === customer.id) {
            toast.error('Customer cannot be their own introducer');
            return;
        }

        post(route('customers.introducers.store', customer.id), {
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
        { title: 'Add Introducer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer Introducer" />

            <div className="w-full space-y-4 pb-6">
                {/* Page header */}
                <div
                    data-slot="customer-page-header"
                    className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            data-slot="customer-page-header-icon"
                            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary"
                        >
                            <Handshake className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold tracking-tight">
                                Add Customer Introducer
                            </h1>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Link an existing customer as the introducer.
                                <span className="mx-1.5">·</span>
                                Customer ID: #{customer.id}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full sm:w-auto"
                    >
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="mr-1.5 size-4" />
                            Back to customer
                        </Link>
                    </Button>
                </div>

                {/* Customer being introduced */}
                <section className="overflow-hidden rounded-lg border border-border bg-card">
                    <SectionHeader
                        icon={<ContactRound className="size-4" />}
                        title="Customer Being Introduced"
                        description="The customer who will be linked to an introducer."
                        step="01"
                    />

                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-3.5">
                        <div className="flex min-w-0 items-center gap-3 sm:w-56 sm:shrink-0">
                            <CustomerAvatar customer={customer} />

                            <div className="min-w-0">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="block truncate text-sm font-semibold hover:text-primary"
                                >
                                    {customer.name}
                                </Link>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {customer.customer_no ||
                                        'No customer number'}
                                </p>

                                <div className="mt-1.5 flex flex-wrap gap-1">
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

                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 lg:grid-cols-4">
                            <BolderLessInfoBox
                                label="Primary Phone"
                                value={customer.primary_phone}
                            />
                            <BolderLessInfoBox
                                label="Primary Email"
                                value={customer.primary_email}
                            />
                            <BolderLessInfoBox
                                label="ID Type"
                                value={customer.identification_type}
                            />
                            <BolderLessInfoBox
                                label="ID Number"
                                value={customer.identification_number}
                            />
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={handleSubmit}
                    className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                    {/* Introducer selection */}
                    <section className="overflow-hidden rounded-lg border border-border bg-card xl:col-start-1">
                        <SectionHeader
                            icon={<UserRound className="size-4" />}
                            title="Select Introducer"
                            description="Search for the existing customer who introduced this customer."
                            step="02"
                        />

                        <div className="space-y-3 p-3 sm:p-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Introducer Customer
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <CustomerSearchBox
                                    onSelect={(selected: Customer) => {
                                        if (selected.id === customer.id) {
                                            toast.error(
                                                'Customer cannot be their own introducer',
                                            );
                                            return;
                                        }

                                        setSelectedIntroducer(selected);
                                        setData(
                                            'introducer_customer_id',
                                            selected.id,
                                        );
                                    }}
                                />

                                <p className="text-[11px] text-muted-foreground">
                                    Search by customer name, number, or another
                                    available identifier.
                                </p>

                                <InputError
                                    message={errors.introducer_customer_id}
                                />
                            </div>

                            {selectedIntroducer ? (
                                <div className="overflow-hidden rounded-lg border border-primary/20">
                                    <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/20 px-3 py-2">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                            <CheckCheck className="size-3.5" />
                                            Selected Introducer
                                        </span>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => {
                                                setSelectedIntroducer(null);
                                                setData(
                                                    'introducer_customer_id',
                                                    null,
                                                );
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 p-3">
                                        <CustomerAvatar
                                            customer={selectedIntroducer}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {selectedIntroducer.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Customer No:{' '}
                                                {selectedIntroducer.customer_no ||
                                                    '—'}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {[
                                                    selectedIntroducer.type,
                                                    selectedIntroducer.status,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </p>
                                        </div>

                                        <span className="flex shrink-0 items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary">
                                            <ShieldCheck className="size-3.5" />
                                            Selected
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <Users className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium">
                                            No introducer selected
                                        </p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                            Use the search field above to select
                                            the customer who acted as the
                                            introducer.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Relationship details */}
                    <section className="overflow-hidden rounded-lg border border-border bg-card xl:col-start-1">
                        <SectionHeader
                            icon={<GitBranch className="size-4" />}
                            title="Relationship Details"
                            description="Specify the relationship between the introducer and customer."
                            step="03"
                        />

                        <div className="p-3 sm:p-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Relationship Type
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <Select
                                    value={data.relationship_type}
                                    onChange={(value) =>
                                        setData('relationship_type', value)
                                    }
                                    options={relationshipTypes}
                                    placeholder="Select relationship"
                                />

                                <InputError
                                    message={errors.relationship_type}
                                />
                            </div>
                        </div>
                    </section>

                    <aside className="min-w-0 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1 xl:self-start">
                        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                            Customer relationship
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Introducer preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        Introduced customer
                                    </p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <CustomerAvatar customer={customer} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold break-words">
                                                {customer.name}
                                            </p>
                                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                {customer.customer_no ||
                                                    'No customer number'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] px-3 py-2.5 text-xs font-medium text-primary">
                                    <GitBranch className="mr-2 size-3.5 shrink-0" />
                                    {relationshipTypes.find(
                                        (item) =>
                                            item.value ===
                                            data.relationship_type,
                                    )?.label || 'Relationship not selected'}
                                </div>

                                <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        Introducer
                                    </p>
                                    {selectedIntroducer ? (
                                        <div className="mt-2 flex items-center gap-3">
                                            <CustomerAvatar
                                                customer={selectedIntroducer}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold break-words">
                                                    {selectedIntroducer.name}
                                                </p>
                                                <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                    {selectedIntroducer.customer_no ||
                                                        'No customer number'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Select a customer to preview the
                                            introducer.
                                        </p>
                                    )}
                                </div>

                                {selectedIntroducer?.primary_phone && (
                                    <div className="rounded-xl border border-border/60 px-3 py-2.5">
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Introducer phone
                                        </p>
                                        <p className="mt-1 text-xs font-medium">
                                            {selectedIntroducer.primary_phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>

                    {/* Form actions */}
                    <div
                        data-slot="page-sticky-action-bar"
                        className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-2 border-t border-border bg-background/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between xl:col-span-2"
                    >
                        <p className="hidden text-xs text-muted-foreground md:block">
                            Review the introducer and relationship before
                            saving.
                        </p>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                asChild
                                className="w-full sm:w-auto"
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
                                className="w-full sm:w-auto sm:min-w-36"
                            >
                                {processing ? (
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                ) : (
                                    <CheckCheck className="mr-1.5 size-4" />
                                )}
                                {processing ? 'Saving...' : 'Save Introducer'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

const CustomerAvatar = ({ customer }: { customer: Customer }) => (
    <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {customer.photo?.url ? (
            <img
                src={customer.photo.url}
                alt={customer.name}
                className="size-full object-cover"
            />
        ) : (
            <div className="flex size-full items-center justify-center text-base font-semibold text-muted-foreground">
                {customer.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
        )}
    </div>
);

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
    <div className="flex items-center gap-2.5 border-b border-border bg-muted/20 px-3 py-2.5 sm:px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/10 text-primary">
            {icon}
        </div>

        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">{title}</h2>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {step}
                </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    </div>
);

export default Create;
