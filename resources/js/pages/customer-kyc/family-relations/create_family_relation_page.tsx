import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    GitBranch,
    Loader2,
    UserRound,
    UsersRound,
} from 'lucide-react';

import React, { useState } from 'react';
import { route } from 'ziggy-js';
import BolderLessInfoBox from '../../../components/borderless-info-box';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '../../../types';
import type { Customer } from '../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../customers/components/customer-search-box';
import { getRelations } from './data/family_and_relative_relations';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customers.family-relations.store', customer.id), {
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
        { title: 'Add Relation', href: '' },
    ];

    const relations = getRelations(customer?.gender, selectedRelative?.gender);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Family Relation" />

            <div className="w-full max-w-6xl space-y-5 pb-8">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <GitBranch className="size-5" />
                        </div>
                        <div>
                            <HeadingSmall
                                title="Add Family Relation"
                                description="Link a relative to this customer and select their relationship."
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Customer ID: #{customer.id}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="size-4" />
                            Back to customer
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                            <UserRound className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">
                                Customer Information
                            </h2>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {customer.customer_no}
                            </span>
                        </div>
                        <div className="flex flex-col gap-4 p-4 sm:flex-row">
                            <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                                <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                    {customer?.photo?.url ? (
                                        <img
                                            src={customer.photo.url}
                                            alt={customer.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                                            {customer.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <Link
                                        href={route(
                                            'customers.show',
                                            customer.id,
                                        )}
                                        className="block truncate text-sm font-semibold hover:text-primary"
                                    >
                                        {customer.name}
                                    </Link>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {customer.status} · {customer.type}
                                    </p>
                                </div>
                            </div>
                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 border-t border-border pt-4 text-xs sm:grid-cols-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 lg:grid-cols-4">
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

                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border bg-muted/20 px-4 py-3">
                            <h2 className="text-sm font-semibold">
                                Relative Details
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Search and choose the customer to link as a
                                relative.
                            </p>
                        </div>
                        <div className="space-y-2 p-4">
                            <Label htmlFor="relative">Relative</Label>
                            <CustomerSearchBox
                                onSelect={(relative: Customer) => {
                                    setData('relative_id', relative.id);
                                    setSelectedRelative(relative);
                                }}
                            />
                            <InputError message={errors.relative_id} />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                            <UsersRound className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">
                                Relationship
                            </h2>
                        </div>
                        <div className="space-y-2 p-4">
                            <Label htmlFor="relation_type">Relation Type</Label>
                            <Select
                                id="relation_type"
                                value={data.relation_type}
                                onChange={(value) =>
                                    setData('relation_type', value)
                                }
                                options={relations}
                            />
                            <InputError message={errors.relation_type} />
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                        <Button variant="outline" type="button" asChild>
                            <Link href={route('customers.show', customer.id)}>
                                Cancel
                            </Link>
                        </Button>
                        <Button disabled={processing}>
                            {processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <CheckCheck className="size-4" />
                            )}
                            Save Relation
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

export default Create;
