import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCheck,
    ContactRound,
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
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import { CustomerSearchBox } from '@/modules/customers-kyc/customers/components/customer-search-box';
import { relationshipTypes } from '@/modules/customers-kyc/introducers/data/relationship_types';

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
        { title: 'Customer & KYC', href: '' },
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

            <div className="w-full max-w-6xl space-y-5 pb-8">
                {/* Page heading */}
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <Handshake className="size-5" />
                        </div>

                        <div>
                            <HeadingSmall
                                title="Add Customer Introducer"
                                description="Link an existing customer as the introducer for this customer."
                            />

                            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="size-3.5" />
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
                    {/* Customer profile */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <SectionHeader
                            icon={<ContactRound className="size-4" />}
                            title="Customer being introduced"
                            description="Confirm the customer who will be linked to an introducer."
                            step="01"
                        />

                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                            <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                                <CustomerAvatar customer={customer} />

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

                    {/* Introducer selection */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <SectionHeader
                            icon={<UserRound className="size-4" />}
                            title="Select introducer"
                            description="Search for an existing customer who introduced this customer."
                            step="02"
                        />

                        <div className="space-y-4 p-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Introducer customer
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

                                <p className="text-[11px] leading-4 text-muted-foreground">
                                    Search by customer name, customer number, or
                                    other available identifiers.
                                </p>

                                <InputError
                                    message={errors.introducer_customer_id}
                                />
                            </div>

                            {selectedIntroducer ? (
                                <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary/3">
                                    <div className="flex items-center justify-between gap-3 border-b border-primary/15 px-3 py-2">
                                        <span className="flex items-center gap-2 text-xs font-medium text-primary">
                                            <CheckCheck className="size-3.5" />
                                            Introducer selected
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

                                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                                        <CustomerAvatar
                                            customer={selectedIntroducer}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {selectedIntroducer.name}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Customer No:{' '}
                                                {selectedIntroducer.customer_no ||
                                                    '—'}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {[
                                                    selectedIntroducer.type,
                                                    selectedIntroducer.status,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-start rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:self-center">
                                            <ShieldCheck className="size-3.5" />
                                            Selected
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-7 text-center">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                        <Users className="size-5" />
                                    </div>

                                    <p className="mt-3 text-sm font-medium">
                                        No introducer selected
                                    </p>

                                    <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                                        Use the search field above to find and
                                        select the customer who acted as the
                                        introducer.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Relationship */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <SectionHeader
                            icon={<GitBranch className="size-4" />}
                            title="Relationship details"
                            description="Specify how the introducer is related to the customer."
                            step="03"
                        />

                        <div className="grid gap-5 p-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Relationship type
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

                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                                    <Handshake className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold">
                                        Relationship preview
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="max-w-full truncate rounded-md border border-border bg-card px-2 py-1 font-medium">
                                            {selectedIntroducer?.name ||
                                                'Introducer'}
                                        </span>

                                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />

                                        <span className="max-w-full truncate rounded-md border border-border bg-card px-2 py-1 font-medium">
                                            {customer.name}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        {data.relationship_type
                                            ? `Relationship: ${
                                                  relationshipTypes.find(
                                                      (item) =>
                                                          item.value ===
                                                          data.relationship_type,
                                                  )?.label ??
                                                  data.relationship_type
                                              }`
                                            : 'Select a relationship type to complete the link.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sticky form actions */}
                    <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p className="text-xs text-muted-foreground">
                            Verify the selected introducer and relationship
                            before saving.
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
                                className="min-w-40"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="mr-2 size-4" />
                                        Save introducer
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

const CustomerAvatar = ({ customer }: { customer: Customer }) => (
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

export default Create;
