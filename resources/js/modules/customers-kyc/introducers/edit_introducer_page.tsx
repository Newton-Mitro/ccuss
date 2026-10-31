import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Eye,
    GitBranch,
    HeartHandshake,
    Loader2,
    Save,
    ShieldCheck,
    UserRound,
    UsersRound,
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
import type { BreadcrumbItem } from '@/types';

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

        if (String(data.introducer_customer_id) === String(customer.id)) {
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
        { title: 'Customer & KYC', href: '/customer-kyc' },
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

            <div className="w-full space-y-4 pb-28 sm:pb-6">
                {/* Page heading */}
                <div
                    data-slot="customer-page-header"
                    className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            data-slot="customer-page-header-icon"
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
                        >
                            <HeartHandshake className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Edit Introducer
                                </h1>
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
                                    <ShieldCheck className="size-3.5" />
                                    Relationship
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update the introducer and relationship details
                                for this customer.
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

                {/* Customer information */}
                <section className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                        <UserRound className="size-4 text-primary" />
                        <h2 className="text-sm font-semibold text-foreground">
                            Customer Information
                        </h2>
                        <span className="ml-auto rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
                            {customer.customer_no || 'No customer number'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                        <div className="flex min-w-0 items-center gap-3 sm:w-56 sm:shrink-0 sm:items-start">
                            <CustomerAvatar
                                name={customer.name}
                                photoUrl={customer?.photo?.url}
                                className="size-14 sm:size-[4.5rem]"
                            />

                            <div className="min-w-0 sm:hidden">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
                                >
                                    {customer.name}
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {customer.status || '—'} ·{' '}
                                    {customer.type || '—'}
                                </p>
                            </div>

                            <div className="hidden min-w-0 sm:block">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                                >
                                    {customer.name}
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {customer.status || '—'} ·{' '}
                                    {customer.type || '—'}
                                </p>
                            </div>
                        </div>

                        <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-5 gap-y-3 border-t border-border pt-3 sm:grid-cols-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 lg:grid-cols-4">
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

                <form
                    onSubmit={handleSubmit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="min-w-0 space-y-4 xl:col-start-1">
                        {/* Introducer selection */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <SectionHeading
                                icon={<UsersRound className="size-4" />}
                                step="01"
                                title="Introducer Details"
                                description="Select the existing customer who introduced this customer."
                            />

                            <div className="space-y-3 p-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        Select Introducer
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <CustomerSearchBox
                                        selectedCustomer={selectedIntroducer}
                                        onSelect={(c: Customer) => {
                                            if (
                                                String(c.id) ===
                                                String(customer.id)
                                            ) {
                                                toast.error(
                                                    'Customer cannot be their own introducer.',
                                                );
                                                return;
                                            }

                                            setSelectedIntroducer(c);
                                            setData(
                                                'introducer_customer_id',
                                                c.id,
                                            );
                                        }}
                                    />

                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Search by customer name or available
                                        customer details. A customer cannot
                                        introduce themselves.
                                    </p>

                                    <InputError
                                        message={errors.introducer_customer_id}
                                    />
                                </div>

                                {selectedIntroducer && (
                                    <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 sm:flex-row sm:items-center">
                                        <CustomerAvatar
                                            name={selectedIntroducer.name}
                                            photoUrl={
                                                selectedIntroducer.photo?.url
                                            }
                                            className="size-11"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {selectedIntroducer.name}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {selectedIntroducer.customer_no ||
                                                    'No customer number'}
                                                {selectedIntroducer.primary_phone
                                                    ? ` · ${selectedIntroducer.primary_phone}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-background px-2.5 py-1 text-xs font-medium text-primary">
                                            <CheckCheck className="size-3.5" />
                                            Selected
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Relationship details */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <SectionHeading
                                icon={<GitBranch className="size-4" />}
                                step="02"
                                title="Relationship Details"
                                description="Specify the relationship between the customer and their introducer."
                            />

                            <div className="max-w-2xl space-y-2 p-4">
                                <Label
                                    htmlFor="relationship_type"
                                    className="text-sm font-medium"
                                >
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
                                />

                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Choose the relationship that best describes
                                    the connection between these customers.
                                </p>

                                <InputError
                                    message={errors.relationship_type}
                                />
                            </div>
                        </section>
                    </div>

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
                                        <CustomerAvatar
                                            name={customer.name}
                                            photoUrl={customer?.photo?.url}
                                            className="size-11"
                                        />
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
                                                name={selectedIntroducer.name}
                                                photoUrl={
                                                    selectedIntroducer.photo
                                                        ?.url
                                                }
                                                className="size-11"
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

                    {/* Sticky action bar */}
                    <div
                        data-slot="mobile-page-action-bar"
                        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:rounded-xl sm:border sm:bg-card sm:px-4 sm:py-3 sm:backdrop-blur-none"
                    >
                        <div className="mx-auto flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                                <ShieldCheck className="size-4 shrink-0" />
                                <span>
                                    Review the relationship before saving.
                                </span>
                            </div>

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

function CustomerAvatar({
    name,
    photoUrl,
    className = '',
}: {
    name?: string | null;
    photoUrl?: string | null;
    className?: string;
}) {
    const initials = name?.trim()?.charAt(0)?.toUpperCase() || 'C';

    return (
        <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-lg font-semibold text-primary ${className}`}
        >
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name || 'Customer'}
                    className="size-full object-cover"
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}

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
        <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
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
