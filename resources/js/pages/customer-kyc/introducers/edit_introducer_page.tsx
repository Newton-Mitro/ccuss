import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../customers/components/customer-search-box';
import { relationshipTypes } from './data/relationship_types';

const Edit = () => {
    const { introducer } = usePage().props as any;
    const customer = introducer?.introduced_customer;
    console.log(introducer);

    const [selectedIntroducer, setSelectedIntroducer] =
        useState<Customer | null>(introducer?.introducer || null);

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const { data, setData, put, processing, errors } = useForm({
        introduced_customer_id: customer.id,
        introducer_customer_id: introducer?.introducer_customer_id || '',
        relationship_type: introducer?.relationship_type || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('introducers.update', introducer.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Introducers', href: route('introducers.index') },
        { title: 'Edit Introducer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Introducer" />

            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Edit Introducer"
                    description="Update introducer relationship."
                />

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="btn-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <Link
                        href={route('introducers.index')}
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
                {/* CUSTOMER */}
                <div>
                    <Label>Customer</Label>

                    <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                        <div className="flex items-center justify-center">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {customer?.photo?.url ? (
                                    <img
                                        src={customer.photo.url}
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

                        <div className="flex-1 space-y-1">
                            <Link
                                href={route('customers.show', customer.id)}
                                className="text-sm font-semibold text-info underline"
                            >
                                {customer.name} • {customer.customer_no}
                            </Link>

                            <p className="text-xs text-muted-foreground">
                                {customer.kyc_status} • {customer.type}
                            </p>

                            <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-4">
                                <Info label="Phone" value={customer.phone} />
                                <Info label="Email" value={customer.email} />
                                <Info
                                    label="ID Type"
                                    value={customer.identification_type}
                                />
                                <Info
                                    label="ID Number"
                                    value={customer.identification_number}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* INTRODUCER */}
                <div>
                    <Label className="text-xs">Introducer</Label>

                    <CustomerSearchBox
                        selectedCustomer={selectedIntroducer}
                        onSelect={(c: Customer) => {
                            if (c.id === customer.id) {
                                toast.error(
                                    'Customer cannot be their own introducer',
                                );
                                return;
                            }

                            setSelectedIntroducer(c);
                            setData('introducer_customer_id', c.id);
                        }}
                    />

                    <InputError message={errors.introducer_customer_id} />
                </div>

                {/* RELATIONSHIP TYPE */}
                <div>
                    <Label className="text-xs">Relationship Type</Label>

                    <Select
                        value={data.relationship_type}
                        onChange={(value) =>
                            setData('relationship_type', value)
                        }
                        options={relationshipTypes}
                    />

                    <InputError message={errors.relationship_type} />
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 />
                                Updating...
                            </>
                        ) : (
                            <>
                                <CheckCheck />
                                Update Introducer
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Edit;

/* INFO COMPONENT */
function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value}</p>
        </div>
    );
}
