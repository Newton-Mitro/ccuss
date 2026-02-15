import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerSearchBox } from '../customers/customer-search-box';
import { CustomerSearchInput } from '../customers/customer-search-input';

export default function CreateFamilyRelation() {
    const relations = [
        'FATHER',
        'MOTHER',
        'SON',
        'DAUGHTER',
        'BROTHER',
        'COUSIN_BROTHER',
        'COUSIN_SISTER',
        'SISTER',
        'HUSBAND',
        'WIFE',
        'GRANDFATHER',
        'GRANDMOTHER',
        'GRANDSON',
        'GRANDDAUGHTER',
        'UNCLE',
        'AUNT',
        'NEPHEW',
        'NIECE',
        'FATHER-IN-LAW',
        'MOTHER-IN-LAW',
        'SON-IN-LAW',
        'DAUGHTER-IN-LAW',
        'BROTHER-IN-LAW',
        'SISTER-IN-LAW',
    ];

    const { data, setData, post, processing, errors } = useForm({
        customer_id: null as number | null,
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
        relative_id: null as number | null,
        relative_name: '',
        relation_type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/family-relations', {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Family relation saved successfully!'),
        });
    };

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/family-relations' },
        { title: 'Add Relation', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Family Relation" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Add Family Relation"
                    description="Select a customer and a relative, then choose the relationship."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
                >
                    {/* Customer Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Customer
                        </h3>
                        <div className="mt-2">
                            <CustomerSearchBox
                                onSelect={(customer) => {
                                    setData('customer_id', customer.id);
                                    setData('name', customer.name);
                                }}
                            />
                        </div>
                    </div>

                    {/* Relation Type Dropdowns */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <Label className="text-xs">Relation Type</Label>
                            <select
                                value={data.relation_type}
                                onChange={(e) =>
                                    setData('relation_type', e.target.value)
                                }
                                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select Relation Type</option>
                                {relations.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.relation_type} />
                        </div>
                    </div>

                    {/* Relative Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Relative
                        </h3>

                        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <CustomerSearchInput
                                    onSelect={(relative) => {
                                        setData('relative_id', relative.id);
                                        setData('relative_name', relative.name);
                                    }}
                                />
                                <InputError message={errors.customer_no} />
                            </div>
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

                            <div>
                                <Label className="text-xs">
                                    Identification Type
                                </Label>
                                <select
                                    value={data.identification_type}
                                    onChange={(e) =>
                                        setData(
                                            'identification_type',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option value="">Select</option>
                                    <option value="NID">NID</option>
                                    <option value="BRN">BRN</option>
                                    <option value="PASSPORT">PASSPORT</option>
                                    <option value="DRIVING_LICENSE">
                                        DRIVING LICENSE
                                    </option>
                                </select>
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

                        {/* PHOTO */}
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Save Relation'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
