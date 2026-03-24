import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

const Create = () => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const { data, setData, post, processing, errors } = useForm({
        customer_no: '',
        type: '', // individual or organization
        name: '',
        phone: '',
        email: '',
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
        kyc_status: 'pending',
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
        post(route('customers.store'), {
            data: formData,
            preserveScroll: true,
            forceFormData: true,
            onError: (e) => toast.error(JSON.stringify(e)),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: route('customers.index') },
        { title: 'Add Customer', href: '' },
    ];

    // Handle Customer Type change
    const handleTypeChange = (value: string) => {
        setData('type', value);

        if (value === 'organization') {
            setData('identification_type', 'REGISTRATION_NO');
            setData('identification_number', '');
            // Clear individual-only fields
            setData('dob', '');
            setData('gender', '');
            setData('religion', '');
            setData('marital_status', '');
            setData('blood_group', '');
            setData('nationality', '');
            setData('occupation', '');
            setData('education', '');
        } else {
            setData('identification_type', '');
            setData('identification_number', '');
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Create Customer"
                    description="Customer onboarding."
                />
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href={route('customers.index')}
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/90"
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Customers</span>
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6 lg:w-5xl"
            >
                {/* photo */}
                <div className="flex flex-col gap-4">
                    {photoPreview && (
                        <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-md border object-cover sm:h-24 sm:w-24"
                        />
                    )}
                    <div className="flex items-center gap-1">
                        <Label className="text-xs">Photo</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="h-8 rounded-md border px-2 py-1 text-sm"
                        />
                        <InputError message={errors.photo} />
                    </div>
                </div>

                {/* basic INFO */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Customer Type</Label>
                        <select
                            value={data.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select Customer Type</option>
                            <option value="individual">Individual</option>
                            <option value="organization">Organization</option>
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

                {/* individual ONLY FIELDS */}
                {data.type === 'individual' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                            <select
                                value={data.gender}
                                onChange={(e) =>
                                    setData('gender', e.target.value)
                                }
                                className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>male</option>
                                <option>female</option>
                                <option>other</option>
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
                                className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>islam</option>
                                <option>hinduism</option>
                                <option>christianity</option>
                                <option>buddhism</option>
                                <option>other</option>
                            </select>
                            <InputError message={errors.religion} />
                        </div>
                        <div>
                            <Label className="text-xs">Marital Status</Label>
                            <select
                                value={data.marital_status}
                                onChange={(e) =>
                                    setData('marital_status', e.target.value)
                                }
                                className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>single</option>
                                <option>married</option>
                                <option>widowed</option>
                                <option>divorced</option>
                                <option>other</option>
                            </select>
                            <InputError message={errors.marital_status} />
                        </div>
                        <div>
                            <Label className="text-xs">Blood Group</Label>
                            <select
                                value={data.blood_group}
                                onChange={(e) =>
                                    setData('blood_group', e.target.value)
                                }
                                className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                                <option>O+</option>
                                <option>O-</option>
                            </select>
                            <InputError message={errors.blood_group} />
                        </div>
                        <div>
                            <Label className="text-xs">Nationality</Label>
                            <Input
                                value={data.nationality}
                                onChange={(e) =>
                                    setData('nationality', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.nationality} />
                        </div>
                        <div>
                            <Label className="text-xs">Occupation</Label>
                            <Input
                                value={data.occupation}
                                onChange={(e) =>
                                    setData('occupation', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.occupation} />
                        </div>
                        <div>
                            <Label className="text-xs">Education</Label>
                            <Input
                                value={data.education}
                                onChange={(e) =>
                                    setData('education', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.education} />
                        </div>
                    </div>
                )}

                {/* IDENTIFICATION */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Identification Type</Label>
                        <select
                            value={data.identification_type}
                            onChange={(e) =>
                                setData('identification_type', e.target.value)
                            }
                            className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            {data.type === 'organization' ? (
                                <option value="REGISTRATION_NO">
                                    Registration No
                                </option>
                            ) : (
                                <>
                                    <option value="">Select</option>
                                    <option value="NID">NID</option>
                                    <option value="BRN">BRN</option>
                                    <option value="passport">passport</option>
                                    <option value="driving_license">
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

                {/* KYC STATUS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">KYC Status</Label>
                        <select
                            value={data.kyc_status}
                            disabled
                            className="h-8 w-full rounded-md border bg-background px-2 text-sm text-foreground"
                        >
                            <option>pending</option>
                            <option>verified</option>
                            <option>rejected</option>
                        </select>
                        <InputError message={errors.kyc_status} />
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
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

export default Create;
