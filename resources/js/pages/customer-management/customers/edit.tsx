import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, SpaceIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer';

interface EditProps {
    customer: Customer;
    backUrl: string;
    flash?: {
        error?: string;
        success?: string;
    };
}

const Edit = ({ customer, backUrl, flash }: EditProps) => {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () =>
        router.visit(backUrl, { preserveState: true, preserveScroll: true });

    const { data, setData, put, processing, errors } = useForm({
        customer_no: customer.customer_no || '',
        type: (customer.type as string) || '',
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        dob: customer.dob || '',
        gender: (customer.gender as string) || '',
        religion: customer.religion || '',
        identification_type: customer.identification_type || '',
        identification_number: customer.identification_number || '',
        photo: null as File | null,
        kyc_status: (customer.kyc_status as string) || 'PENDING',
        status: (customer.status as string) || 'ACTIVE',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        customer.photo?.url || null,
    );

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/auth/customers/${customer.id}`, {
            preserveScroll: true,
            onError: () => toast.error('Please fix errors in the form.'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: `Edit ${customer.name}`, href: '' },
    ];

    const isIndividual = data.type === 'Individual';
    const isOrganization = data.type === 'Organization';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer - ${customer.name}`} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Edit Customer"
                    description="Update customer information."
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href="/auth/customers"
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition hover:bg-secondary/90"
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Customers</span>
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-6 rounded-md border border-border bg-card p-6"
            >
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Customer No</Label>
                        <Input
                            value={data.customer_no}
                            disabled
                            className="h-8 text-sm"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Type</Label>
                        <select
                            value={data.type}
                            disabled
                            onChange={(e) => {
                                const newType = e.target.value;
                                setData('type', newType);
                                if (newType === 'Organization') {
                                    setData(
                                        'identification_type',
                                        'REGISTRATION_NO',
                                    );
                                    setData('identification_number', '');
                                } else {
                                    setData('identification_type', '');
                                    setData('identification_number', '');
                                }
                            }}
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option>Individual</option>
                            <option>Organization</option>
                        </select>
                        <InputError message={errors.type} />
                    </div>
                    <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label className="text-xs">Phone</Label>
                        <Input
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>
                </div>

                {/* PERSONAL DETAILS */}
                {isIndividual && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label className="text-xs">Date of Birth</Label>
                            <AppDatePicker
                                label=""
                                value={data.dob}
                                onChange={(val) => setData('dob', val)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Gender</Label>
                            <select
                                value={data.gender}
                                onChange={(e) =>
                                    setData('gender', e.target.value)
                                }
                                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>MALE</option>
                                <option>FEMALE</option>
                                <option>OTHER</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs">Religion</Label>
                            <select
                                value={data.religion}
                                onChange={(e) =>
                                    setData('religion', e.target.value)
                                }
                                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>ISLAM</option>
                                <option>HINDUISM</option>
                                <option>CHRISTIANITY</option>
                                <option>BUDDHISM</option>
                                <option>OTHER</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* IDENTIFICATION */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Identification Type</Label>
                        <select
                            value={data.identification_type}
                            onChange={(e) =>
                                setData('identification_type', e.target.value)
                            }
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            {isOrganization ? (
                                <option value="REGISTRATION_NO">
                                    Registration No
                                </option>
                            ) : (
                                <>
                                    <option value="">Select</option>
                                    <option value="NID">NID</option>
                                    <option value="BRN">BRN</option>
                                    <option value="PASSPORT">PASSPORT</option>
                                    <option value="DRIVING_LICENSE">
                                        DRIVING LICENSE
                                    </option>
                                </>
                            )}
                        </select>
                        <InputError message={errors.identification_type} />
                    </div>
                    <div>
                        <Label className="text-xs">Identification Number</Label>
                        <Input
                            value={data.identification_number}
                            onChange={(e) =>
                                setData('identification_number', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.identification_number} />
                    </div>
                </div>

                {/* PHOTO */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div>
                        <Label className="text-xs">Photo</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="w-full rounded-md border border-border p-1 text-sm sm:w-auto"
                        />
                        <InputError message={errors.photo} />
                    </div>

                    {photoPreview && (
                        <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-md border object-cover"
                        />
                    )}
                </div>

                {/* KYC & STATUS */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">KYC Status</Label>
                        <select
                            value={data.kyc_status}
                            disabled
                            onChange={(e) =>
                                setData('kyc_status', e.target.value)
                            }
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option>PENDING</option>
                            <option>VERIFIED</option>
                            <option>REJECTED</option>
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs">Account Status</Label>
                        <select
                            value={data.status}
                            disabled
                            onChange={(e) => setData('status', e.target.value)}
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option>ACTIVE</option>
                            <option>PENDING</option>
                            <option>SUSPENDED</option>
                            <option>CLOSED</option>
                        </select>
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="mt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
                    >
                        {processing ? (
                            <>
                                {/* spinning loader icon */}
                                <SpaceIcon className="" />
                                Saving...
                            </>
                        ) : (
                            <>
                                {/* check / save icon */}
                                <CheckCheck className="" />
                                Update
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Edit;
