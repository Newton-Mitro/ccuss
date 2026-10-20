import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Camera,
    CheckCheck,
    ClipboardList,
    Fingerprint,
    Loader2,
    Mail,
    Phone,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem } from '../../../types';
import {
    bloodGroups,
    CUSTOMER_PHOTO_MAX_FILE_SIZE,
    customerStatuses,
    customerTypes,
    educations,
    genders,
    individualIdentificationTypes,
    maritalStatuses,
    nationalities,
    occupations,
    organizationIdentificationTypes,
    religions,
} from './data/customer_data_types';

const Create = () => {
    useFlashToastHandler();

    const photoInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        customer_no: '',
        type: '',
        name: '',
        primary_phone: '',
        primary_email: '',
        alternate_phone: '',
        alternate_email: '',
        dob: '',
        gender: '',
        religion: '',
        marital_status: '',
        blood_group: '',
        nationality: '',
        occupation: '',
        education: '',
        identification_type: '',
        identification_number: '',
        photo: null as File | null,
        status: 'PENDING',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    const handleDataChange = (
        key: keyof typeof data,
        value: string | File | null,
    ) => {
        clearErrors(key);
        setData(key, value as never);
    };

    const handleTypeChange = (value: string) => {
        clearErrors();
        setData('type', value);

        if (value === 'ORGANIZATION') {
            setData({
                ...data,
                type: value,
                identification_type: 'REGISTRATION_NO',
                identification_number: '',
                dob: '',
                gender: '',
                religion: '',
                marital_status: '',
                blood_group: '',
                nationality: '',
                occupation: '',
                education: '',
            });
        } else {
            setData({
                ...data,
                type: value,
                identification_type: '',
                identification_number: '',
            });
        }
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            window.alert('Please select a valid image file.');
            event.target.value = '';
            return;
        }

        if (file.size > CUSTOMER_PHOTO_MAX_FILE_SIZE) {
            window.alert('The photo must be 2 MB or smaller.');
            event.target.value = '';
            return;
        }

        setData('photo', file);
        clearErrors('photo');
        setPhotoPreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);

        if (photoInputRef.current) {
            photoInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('customers.store'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        { title: 'Add Customer', href: '' },
    ];

    const isOrganization = data.type === 'ORGANIZATION';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />

            <div className="mx-auto w-full max-w-400 space-y-5 pb-24">
                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <Users className="size-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                Create Customer
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Register a new customer and complete their
                                identification details.
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('customers.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Customers
                        </Link>
                    </Button>
                </div>

                {/* Customer type summary */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <ClipboardList className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                Customer Registration
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Fields marked by your validation rules will be
                                checked when you submit the form.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 sm:self-auto">
                        <span className="size-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-medium text-foreground">
                            Pending Verification
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Personal / organization details */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserRound className="size-4" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Basic Information
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Customer type and primary contact details
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-12">
                            <div className="space-y-1.5 lg:col-span-3">
                                <Label>Customer Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={handleTypeChange}
                                    options={customerTypes}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2 lg:col-span-5">
                                <Label>
                                    {isOrganization
                                        ? 'Organization Name'
                                        : 'Full Name'}
                                </Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        handleDataChange('name', e.target.value)
                                    }
                                    placeholder={
                                        isOrganization
                                            ? 'Enter organization name'
                                            : 'Enter full name'
                                    }
                                    autoComplete="name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5 lg:col-span-4">
                                <Label>Primary Phone</Label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={data.primary_phone}
                                        onChange={(e) =>
                                            handleDataChange(
                                                'primary_phone',
                                                e.target.value,
                                            )
                                        }
                                        className="pl-9"
                                        placeholder="Enter phone number"
                                        type="tel"
                                    />
                                </div>
                                <InputError message={errors.primary_phone} />
                            </div>

                            <div className="space-y-1.5 lg:col-span-6">
                                <Label>Primary Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={data.primary_email}
                                        onChange={(e) =>
                                            handleDataChange(
                                                'primary_email',
                                                e.target.value,
                                            )
                                        }
                                        className="pl-9"
                                        placeholder="name@example.com"
                                        type="email"
                                    />
                                </div>
                                <InputError message={errors.primary_email} />
                            </div>

                            <div className="space-y-1.5 lg:col-span-3">
                                <Label>Alternate Phone</Label>
                                <Input
                                    value={data.alternate_phone}
                                    onChange={(e) =>
                                        handleDataChange(
                                            'alternate_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Optional"
                                    type="tel"
                                />
                                <InputError message={errors.alternate_phone} />
                            </div>

                            <div className="space-y-1.5 lg:col-span-3">
                                <Label>Alternate Email</Label>
                                <Input
                                    value={data.alternate_email}
                                    onChange={(e) =>
                                        handleDataChange(
                                            'alternate_email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Optional"
                                    type="email"
                                />
                                <InputError message={errors.alternate_email} />
                            </div>
                        </div>
                    </section>

                    {/* Individual information */}
                    {data.type === 'INDIVIDUAL' && (
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <UserRound className="size-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Personal Details
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Demographic and personal information
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                                <div className="space-y-1.5">
                                    <Label>Date of Birth</Label>
                                    <AppDatePicker
                                        value={data.dob}
                                        onChange={(value) =>
                                            handleDataChange('dob', value)
                                        }
                                    />
                                    <InputError message={errors.dob} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Gender</Label>
                                    <Select
                                        value={data.gender}
                                        onChange={(value) =>
                                            handleDataChange('gender', value)
                                        }
                                        options={genders}
                                    />
                                    <InputError message={errors.gender} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Religion</Label>
                                    <Select
                                        value={data.religion}
                                        onChange={(value) =>
                                            handleDataChange('religion', value)
                                        }
                                        options={religions}
                                    />
                                    <InputError message={errors.religion} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Marital Status</Label>
                                    <Select
                                        value={data.marital_status}
                                        onChange={(value) =>
                                            handleDataChange(
                                                'marital_status',
                                                value,
                                            )
                                        }
                                        options={maritalStatuses}
                                    />
                                    <InputError
                                        message={errors.marital_status}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Blood Group</Label>
                                    <Select
                                        value={data.blood_group}
                                        onChange={(value) =>
                                            handleDataChange(
                                                'blood_group',
                                                value,
                                            )
                                        }
                                        options={bloodGroups}
                                    />
                                    <InputError message={errors.blood_group} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Nationality</Label>
                                    <Select
                                        value={data.nationality}
                                        onChange={(value) =>
                                            handleDataChange(
                                                'nationality',
                                                value,
                                            )
                                        }
                                        options={nationalities}
                                    />
                                    <InputError message={errors.nationality} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Occupation</Label>
                                    <Select
                                        value={data.occupation}
                                        onChange={(value) =>
                                            handleDataChange(
                                                'occupation',
                                                value,
                                            )
                                        }
                                        options={occupations}
                                    />
                                    <InputError message={errors.occupation} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Education</Label>
                                    <Select
                                        value={data.education}
                                        onChange={(value) =>
                                            handleDataChange('education', value)
                                        }
                                        options={educations}
                                    />
                                    <InputError message={errors.education} />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Identification */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Fingerprint className="size-4" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Identification & Verification
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Official identification details for KYC
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label>Identification Type</Label>
                                <Select
                                    value={data.identification_type}
                                    onChange={(value) =>
                                        handleDataChange(
                                            'identification_type',
                                            value,
                                        )
                                    }
                                    options={
                                        isOrganization
                                            ? organizationIdentificationTypes
                                            : individualIdentificationTypes
                                    }
                                />
                                <InputError
                                    message={errors.identification_type}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Identification Number</Label>
                                <Input
                                    value={data.identification_number}
                                    onChange={(e) =>
                                        handleDataChange(
                                            'identification_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        isOrganization
                                            ? 'Enter registration number'
                                            : 'Enter identification number'
                                    }
                                />
                                <InputError
                                    message={errors.identification_number}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Initial Status</Label>
                                <Select
                                    value={data.status}
                                    disabled
                                    onChange={(value) =>
                                        handleDataChange('status', value)
                                    }
                                    options={customerStatuses}
                                />
                                <InputError message={errors.status} />
                                <p className="text-xs text-muted-foreground">
                                    Status is assigned during registration.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Photo upload */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Camera className="size-4" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Customer Photograph
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Upload a clear customer or organization
                                    representative photo
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-6">
                            <button
                                type="button"
                                onClick={() => photoInputRef.current?.click()}
                                className="group relative flex h-40 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition hover:border-primary/50 hover:bg-muted sm:h-44 sm:w-40"
                                aria-label="Upload customer photograph"
                            >
                                {photoPreview ? (
                                    <>
                                        <img
                                            src={photoPreview}
                                            alt="Customer photograph preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                                            <Camera className="mr-2 size-4" />
                                            Change photo
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                                            <Camera className="size-5" />
                                        </div>
                                        <span className="text-xs font-medium">
                                            Upload photo
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            Click to browse
                                        </span>
                                    </div>
                                )}
                            </button>

                            <div className="min-w-0 flex-1 space-y-2">
                                <p className="text-sm font-medium">
                                    Photograph requirements
                                </p>
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    <li>• Supported formats: JPG, PNG, WebP</li>
                                    <li>• Maximum file size: 2 MB</li>
                                    <li>• Use a clear, well-lit photograph</li>
                                </ul>

                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            photoInputRef.current?.click()
                                        }
                                    >
                                        <Camera className="mr-2 size-4" />
                                        {photoPreview
                                            ? 'Change Photo'
                                            : 'Choose Photo'}
                                    </Button>

                                    {photoPreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removePhoto}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <Input
                                    ref={photoInputRef}
                                    id="photoInput"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />

                                <InputError message={errors.photo} />
                            </div>
                        </div>
                    </section>

                    {/* Sticky form actions */}
                    <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-border bg-background/95 shadow-lg backdrop-blur-md">
                        <div className="mx-auto flex w-full max-w-400 flex-col-reverse gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                            <p className="hidden text-xs text-muted-foreground md:block">
                                Review the customer details before submitting.
                            </p>

                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    asChild
                                >
                                    <Link href={route('customers.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-36"
                                >
                                    {processing ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <CheckCheck className="mr-2 size-4" />
                                    )}
                                    {processing
                                        ? 'Saving...'
                                        : 'Create Customer'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

export default Create;
