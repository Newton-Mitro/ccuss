import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import {
    Customer,
    CustomerType,
    Gender,
    IdentificationType,
    KycStatus,
    Religion,
} from '../../../types/customer_kyc_module';
import {
    bloodGroups,
    customerTypes,
    educations,
    genders,
    individualIdentificationTypes,
    kycStatuses,
    maritalStatuses,
    nationalities,
    occupations,
    organizationIdentificationTypes,
    religions,
} from './data/customer_data_types';

interface EditProps extends SharedData {
    customer: Customer;
}

const Edit = ({ customer }: EditProps) => {
    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const { data, setData, processing, errors } = useForm({
        customer_no: customer.customer_no,
        type: customer.type,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        dob: customer.dob,
        gender: customer.gender,
        religion: customer.religion,
        marital_status: customer.marital_status,
        blood_group: customer.blood_group,
        nationality: customer.nationality,
        occupation: customer.occupation,
        education: customer.education,
        identification_type: customer.identification_type,
        identification_number: customer.identification_number,
        photo: null as File | null,
        kyc_status: customer.kyc_status || 'pending',
    });

    console.log(data);

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        customer.photo?.url || null,
    );

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file) return;
            // Validate type
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed');
                return;
            }
            // Optional: limit size (e.g., 3MB)
            if (file.size > 3 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            route('customers.update', customer.id),
            {
                ...data,
                _method: 'put',
            },
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    const handleTypeChange = (value: string) => {
        setData('type', value as CustomerType);

        if (value === 'organization') {
            setData('identification_type', 'registration_no');
            setData('identification_number', '');
            // Clear individual-only fields
            setData('dob', '');
            setData('gender', null);
            setData('religion', null);
            setData('marital_status', '');
            setData('blood_group', '');
            setData('nationality', '');
            setData('occupation', '');
            setData('education', '');
        } else {
            setData('identification_type', null);
            setData('identification_number', '');
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: route('customers.index') },
        { title: `Edit ${customer.name}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={`Edit Customer - ${customer.name} (${customer.customer_no})`}
                    description="Update customer information."
                />
                <div className="flex flex-wrap gap-2">
                    <div className="">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>

                    <Link
                        href={route('customers.index')}
                        className="flex items-center gap-1 rounded border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-all hover:bg-secondary/50"
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Customers</span>
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-6 rounded-md border bg-card p-4 lg:px-10 lg:py-12"
            >
                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="w-full space-y-4 lg:w-11/12">
                        {/* basic INFO */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <Label className="text-xs">Customer Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={(value) =>
                                        handleTypeChange(value)
                                    }
                                    options={customerTypes}
                                />

                                <InputError message={errors.type} />
                            </div>

                            <div>
                                <Label className="text-xs">Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label className="text-xs">Phone</Label>
                                <Input
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div>
                                <Label className="text-xs">Email</Label>
                                <Input
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        {/* individual ONLY FIELDS */}
                        {data.type === 'individual' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <Label className="text-xs">DOB</Label>
                                    <AppDatePicker
                                        value={data.dob}
                                        onChange={(val) => setData('dob', val)}
                                    />
                                    <InputError message={errors.dob} />
                                </div>
                                <div>
                                    <Label className="text-xs">Gender</Label>
                                    <Select
                                        value={data.gender}
                                        onChange={(value) =>
                                            setData('gender', value as Gender)
                                        }
                                        options={genders}
                                    />

                                    <InputError message={errors.gender} />
                                </div>
                                <div>
                                    <Label className="text-xs">Religion</Label>
                                    <Select
                                        value={data.religion}
                                        onChange={(value) =>
                                            setData(
                                                'religion',
                                                value as Religion,
                                            )
                                        }
                                        options={religions}
                                    />

                                    <InputError message={errors.religion} />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Marital Status
                                    </Label>
                                    <Select
                                        value={data.marital_status}
                                        onChange={(value) =>
                                            setData('marital_status', value)
                                        }
                                        options={maritalStatuses}
                                    />

                                    <InputError
                                        message={errors.marital_status}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Blood Group
                                    </Label>

                                    <Select
                                        value={data.blood_group}
                                        onChange={(value) =>
                                            setData('blood_group', value)
                                        }
                                        options={bloodGroups}
                                    />

                                    <InputError message={errors.blood_group} />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Nationality
                                    </Label>
                                    <Select
                                        value={data.nationality}
                                        onChange={(value) =>
                                            setData('nationality', value)
                                        }
                                        options={nationalities}
                                    />

                                    <InputError message={errors.nationality} />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Occupation
                                    </Label>
                                    <Select
                                        value={data.occupation}
                                        onChange={(value) =>
                                            setData('occupation', value)
                                        }
                                        options={occupations}
                                    />

                                    <InputError message={errors.occupation} />
                                </div>
                                <div>
                                    <Label className="text-xs">Education</Label>
                                    <Select
                                        value={data.education}
                                        onChange={(value) =>
                                            setData('education', value)
                                        }
                                        options={educations}
                                    />

                                    <InputError message={errors.education} />
                                </div>
                            </div>
                        )}

                        {/* IDENTIFICATION */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <Label className="text-xs">
                                    Identification Type
                                </Label>
                                <Select
                                    value={data.identification_type}
                                    onChange={(value) =>
                                        setData(
                                            'identification_type',
                                            value as IdentificationType,
                                        )
                                    }
                                    options={
                                        data.type === 'organization'
                                            ? organizationIdentificationTypes
                                            : individualIdentificationTypes
                                    }
                                />

                                <InputError
                                    message={errors.identification_type}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">
                                    Identification Number
                                </Label>
                                <Input
                                    value={data.identification_number}
                                    onChange={(e) =>
                                        setData(
                                            'identification_number',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError
                                    message={errors.identification_number}
                                />
                            </div>
                        </div>

                        {/* KYC STATUS */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <Label className="text-xs">KYC Status</Label>
                                <Select
                                    value={data.kyc_status}
                                    disabled
                                    onChange={(value) =>
                                        setData(
                                            'kyc_status',
                                            value as KycStatus,
                                        )
                                    }
                                    options={kycStatuses}
                                />

                                <InputError message={errors.kyc_status} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/12">
                        <div className="w-full space-y-2">
                            <Label className="text-xs">Photo</Label>

                            {/* Preview Box */}
                            <div
                                className="group relative h-40 w-full cursor-pointer overflow-hidden rounded-md border bg-muted"
                                onClick={() =>
                                    document
                                        .getElementById('photoInput')
                                        .click()
                                }
                            >
                                {photoPreview ? (
                                    <>
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />

                                        {/* Overlay (hover actions) */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                            <span className="text-xs font-medium text-white">
                                                Change Photo
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        Click to Upload
                                    </div>
                                )}
                            </div>

                            {/* Hidden Input */}
                            <input
                                id="photoInput"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />

                            {/* Optional Remove Button */}
                            {photoPreview && (
                                <button
                                    type="button"
                                    onClick={() => setPhotoPreview(null)}
                                    className="w-full text-xs text-red-500 hover:underline"
                                >
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* SUBMIT */}
                <div className="flex">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />{' '}
                                Store/Submit
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Edit;
