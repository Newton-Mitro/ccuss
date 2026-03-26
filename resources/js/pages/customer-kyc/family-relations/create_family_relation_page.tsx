import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../customers/components/customer-search-box';
import { getRelations } from './data/family_and_relative_relations';

const Create = () => {
    const { customer, flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();
    const [selectedRelative, setSelectedRelative] = useState<Customer | null>(
        null,
    );

    const { data, setData, post, processing, errors } = useForm({
        customer_id: customer.id,
        relative_id: null,
        relation_type: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('family-relations.store'), {
            preserveScroll: true,
            onError: (e) => toast.error(JSON.stringify(e)),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: route('family-relations.index') },
        { title: 'Add Relation', href: '' },
    ];

    const relations = getRelations(customer?.gender, selectedRelative?.gender);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Family Relation" />

            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Create Family Relation"
                    description="Link customer relatives."
                />

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href={route('family-relations.index')}
                        className="btn-secondary"
                    >
                        <ListFilter className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6 lg:w-5xl"
            >
                <div className="">
                    <Label htmlFor="customer_id">Customer</Label>
                    <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                        <div className="flex items-center justify-center">
                            {/* Avatar */}
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {customer?.photo?.url ? (
                                    <img
                                        src={customer?.photo?.url}
                                        alt={customer.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {customer.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-1">
                            <div>
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="cursor-pointer text-sm font-semibold text-info underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {`${customer.name} • ${customer.customer_no}`}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    {customer.kyc_status} • {customer.type}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-4">
                                <Info label="Phone" value={customer.phone} />
                                <Info label="Email" value={customer.email} />
                                <Info
                                    label="Identification Type"
                                    value={customer.identification_type}
                                />
                                <Info
                                    label="Identification Number"
                                    value={customer.identification_number}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="">
                    <Label className="text-xs">Relative</Label>
                    <CustomerSearchBox
                        onSelect={(customer: Customer) => {
                            setData('relative_id', customer.id);
                            setSelectedRelative(customer);
                        }}
                    />
                </div>
                <div>
                    <Label className="text-xs">Relation Type</Label>
                    <Select
                        value={data.relation_type}
                        onChange={(value) => {
                            setData('relation_type', value);
                        }}
                        options={relations}
                    />

                    <InputError message={errors.relation_type} />
                </div>

                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? <Loader2 /> : <CheckCheck />}
                        Save Relation
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Create;

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value}</p>
        </div>
    );
}
