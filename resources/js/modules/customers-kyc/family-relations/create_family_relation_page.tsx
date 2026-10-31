import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Eye,
    GitBranch,
    Loader2,
    UserRound,
    UsersRound,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import BolderLessInfoBox from '@/components/borderless-info-box';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { CustomerSearchBox } from '@/modules/customers-kyc/customers/components/customer-search-box';
import { getRelations } from '@/modules/customers-kyc/family-relations/data/family_and_relative_relations';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { BreadcrumbItem, SharedData } from '@/types';

const Create = () => {
    const { customer } = usePage<SharedData & { customer: Customer }>().props;

    useFlashToastHandler();

    const [selectedRelative, setSelectedRelative] = useState<Customer | null>(
        null,
    );

    const { data, setData, post, processing, errors } = useForm({
        customer_id: customer.id,
        relative_id: null as number | null,
        relation_type: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('customers.family-relations.store', customer.id), {
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
        { title: 'Add Relation', href: '' },
    ];

    const relations = getRelations(customer?.gender, selectedRelative?.gender);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Family Relation" />

            <div className="w-full space-y-3 pb-20">
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
                            <GitBranch className="size-4.5" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Add Family Relation
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Link a relative and define their relationship.
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
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

                <form
                    onSubmit={handleSubmit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="min-w-0 space-y-3 xl:col-start-1">
                        {/* Customer summary */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
                                <UserRound className="size-4 text-primary" />
                                <h2 className="text-sm font-semibold">
                                    Customer Information
                                </h2>
                                <span className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                    {customer.customer_no}
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

                                        <div className="mt-1 flex flex-wrap gap-1">
                                            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                                {customer.status}
                                            </span>
                                            <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary">
                                                {customer.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 border-t border-border pt-3 sm:grid-cols-2 sm:border-t-0 sm:border-l sm:py-0 sm:pl-4 lg:grid-cols-4">
                                    <BolderLessInfoBox
                                        label="Phone"
                                        value={customer.primary_phone}
                                    />
                                    <BolderLessInfoBox
                                        label="Email"
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

                        {/* Relative selection */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={<UsersRound className="size-4" />}
                                title="Relative Details"
                                description="Search for the existing customer to link as a relative."
                                step="01"
                            />

                            <div className="p-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">
                                        Select Relative
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <CustomerSearchBox
                                        onSelect={(relative: Customer) => {
                                            setData('relative_id', relative.id);
                                            setSelectedRelative(relative);
                                        }}
                                    />

                                    <InputError message={errors.relative_id} />
                                </div>

                                {selectedRelative && (
                                    <div className="mt-2 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                                        <UserRound className="size-4 shrink-0 text-primary" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-foreground">
                                                {selectedRelative.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {selectedRelative.customer_no ||
                                                    `Customer #${selectedRelative.id}`}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded border border-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                                            Selected
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Relationship type */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={<GitBranch className="size-4" />}
                                title="Relationship"
                                description="Choose the relationship between the customer and the selected relative."
                                step="02"
                            />

                            <div className="p-3">
                                <div className="max-w-xl space-y-1">
                                    <Label className="text-xs font-medium">
                                        Relation Type
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <Select
                                        value={data.relation_type}
                                        onChange={(value) =>
                                            setData('relation_type', value)
                                        }
                                        options={relations}
                                        placeholder="Select relationship"
                                    />

                                    <InputError
                                        message={errors.relation_type}
                                    />
                                </div>
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
                                            Family relation preview
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
                                        Customer
                                    </p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-base font-semibold text-primary">
                                            {customer.photo?.url ? (
                                                <img
                                                    src={customer.photo.url}
                                                    alt={customer.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                customer.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'C'
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold break-words">
                                                {customer.name}
                                            </p>
                                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                {customer.customer_no ||
                                                    `Customer #${customer.id}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] px-3 py-2.5 text-xs font-medium text-primary">
                                    <GitBranch className="mr-2 size-3.5 shrink-0" />
                                    {relations.find(
                                        (item) =>
                                            item.value === data.relation_type,
                                    )?.label || 'Relationship not selected'}
                                </div>

                                <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        Relative
                                    </p>
                                    {selectedRelative ? (
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-base font-semibold text-primary">
                                                {selectedRelative.photo?.url ? (
                                                    <img
                                                        src={
                                                            selectedRelative
                                                                .photo.url
                                                        }
                                                        alt={
                                                            selectedRelative.name
                                                        }
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    selectedRelative.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || 'R'
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold break-words">
                                                    {selectedRelative.name}
                                                </p>
                                                <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                    {selectedRelative.customer_no ||
                                                        `Customer #${selectedRelative.id}`}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Select a customer to preview the
                                            relative.
                                        </p>
                                    )}
                                </div>

                                {selectedRelative?.primary_phone && (
                                    <div className="rounded-xl border border-border/60 px-3 py-2.5">
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Relative phone
                                        </p>
                                        <p className="mt-1 text-xs font-medium">
                                            {selectedRelative.primary_phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>

                    {/* Sticky actions */}
                    <div className="sticky bottom-2 z-20 flex flex-col-reverse gap-2 rounded-lg border border-border bg-background/95 p-2.5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-muted-foreground">
                            Verify the selected relative and relationship before
                            saving.
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
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
                                        Save Relation
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

export default Create;
