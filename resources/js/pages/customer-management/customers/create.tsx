import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';

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

const Create = ({ backUrl }: { backUrl: string }) => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => {
        router.visit(backUrl, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    const { data, setData, post, processing, errors } = useForm({
        customer_no: '',
        type: '',
        name: '',
        phone: '',
        email: '',
        dob: '',
        gender: '',
        religion: '',
        identification_type: '',
        identification_number: '',
        photo: null as File | null,
        kyc_status: 'PENDING',
        status: 'PENDING',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null) formData.append(key, value as any);
        });
        post('/auth/customers', {
            data: formData,
            preserveScroll: true,
            onError: (e) => toast.error(JSON.stringify(e)),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: 'Add Customer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Create Customer"
                    description="Customer onboarding."
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
                className="mt-4 space-y-6 rounded-md border border-border bg-card p-4 sm:p-6"
            >
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Customer No</Label>
                        <Input
                            value={data.customer_no}
                            disabled
                            onChange={(e) =>
                                setData('customer_no', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.customer_no} />
                    </div>
                    <div>
                        <Label className="text-xs">Customer Type</Label>
                        <select
                            value={data.type}
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
                            <option value={''}>Select Customer Type</option>
                            <option value="Individual">Individual</option>
                            <option value="Organization">Organization</option>
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
                {data.type === 'Individual' && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label className="text-xs">DOB</Label>
                            <AppDatePicker
                                label=""
                                value={data.dob}
                                onChange={(val) => setData('dob', val)}
                            />
                            <InputError message={errors.dob} />
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
                            <InputError message={errors.gender} />
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
                            <InputError message={errors.religion} />
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
                            {data.type === 'Organization' ? (
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div>
                        <Label className="text-xs">Photo</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="rounded-md border border-border p-1 text-sm"
                        />
                        <InputError message={errors.photo} />
                    </div>
                    {photoPreview && (
                        <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-md border object-cover sm:h-24 sm:w-24"
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
                        <InputError message={errors.kyc_status} />
                    </div>
                    <div>
                        <Label className="text-xs">Account Status</Label>
                        <select
                            value={data.status}
                            disabled
                            onChange={(e) => setData('status', e.target.value)}
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option>PENDING</option>
                            <option>ACTIVE</option>
                            <option>SUSPENDED</option>
                            <option>CLOSED</option>
                        </select>
                        <InputError message={errors.status} />
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
                                <Loader2 className="" />
                                Saving...
                            </>
                        ) : (
                            <>
                                {/* check / save icon */}
                                <CheckCheck className="" />
                                Store/Submit
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Create;
