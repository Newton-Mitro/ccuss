import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

function Create() {
    const [formData, setFormData] = useState({
        customer_no: '',
        type: 'Individual',
        name: '',
        phone: '',
        email: '',
        kyc_level: 'MIN',
        status: 'ACTIVE',
        dob: '',
        gender: '',
        religion: '',
        identification_type: '',
        identification_number: '',
        photo: '',
        registration_no: '',
    });

    const [errors] = useState<any>({});

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting:', formData);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: 'Add Customer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Create Customer"
                    description="Fill in the customer's details below to onboard a new user."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* 🧱 Section: Basic Info */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-primary">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Customer No</Label>
                                <Input
                                    value={formData.customer_no}
                                    onChange={(e) =>
                                        handleChange(
                                            'customer_no',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="CUST-0001"
                                    className="focus-visible:ring-2 focus-visible:ring-primary/50"
                                />
                                <InputError message={errors.customer_no} />
                            </div>

                            <div>
                                <Label>Customer Type</Label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        handleChange('type', e.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option>Individual</option>
                                    <option>Organization</option>
                                </select>
                            </div>

                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleChange('name', e.target.value)
                                    }
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleChange('phone', e.target.value)
                                    }
                                    placeholder="+8801XXXXXXXXX"
                                />
                            </div>

                            <div>
                                <Label>Email</Label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleChange('email', e.target.value)
                                    }
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 🧱 Section: Personal Details */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-primary">
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div>
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) =>
                                        handleChange('dob', e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label>Gender</Label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) =>
                                        handleChange('gender', e.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option value="">Select</option>
                                    <option>MALE</option>
                                    <option>FEMALE</option>
                                    <option>OTHER</option>
                                </select>
                            </div>

                            <div>
                                <Label>Religion</Label>
                                <select
                                    value={formData.religion}
                                    onChange={(e) =>
                                        handleChange('religion', e.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option value="">Select</option>
                                    <option>CHRISTIANITY</option>
                                    <option>ISLAM</option>
                                    <option>HINDUISM</option>
                                    <option>BUDDHISM</option>
                                    <option>OTHER</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 🧱 Section: KYC & Verification */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-primary">
                            Verification & KYC
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>KYC Level</Label>
                                <select
                                    value={formData.kyc_level}
                                    onChange={(e) =>
                                        handleChange(
                                            'kyc_level',
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option>MIN</option>
                                    <option>STD</option>
                                    <option>ENH</option>
                                </select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        handleChange('status', e.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option>ACTIVE</option>
                                    <option>PENDING</option>
                                    <option>SUSPENDED</option>
                                    <option>CLOSED</option>
                                </select>
                            </div>

                            <div>
                                <Label>Identification Type</Label>
                                <select
                                    value={formData.identification_type}
                                    onChange={(e) =>
                                        handleChange(
                                            'identification_type',
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option value="">Select</option>
                                    <option>NID</option>
                                    <option>NBR</option>
                                    <option>PASSPORT</option>
                                    <option>DRIVING_LICENSE</option>
                                </select>
                            </div>

                            <div>
                                <Label>Identification Number</Label>
                                <Input
                                    value={formData.identification_number}
                                    onChange={(e) =>
                                        handleChange(
                                            'identification_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter ID number"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Photo URL</Label>
                                <Input
                                    value={formData.photo}
                                    onChange={(e) =>
                                        handleChange('photo', e.target.value)
                                    }
                                    placeholder="https://example.com/photo.jpg"
                                />
                                {formData.photo && (
                                    <div className="mt-3 flex justify-start">
                                        <img
                                            src={formData.photo}
                                            alt="Customer preview"
                                            className="h-20 w-20 rounded-lg border object-cover shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            {formData.type === 'Organization' && (
                                <div className="md:col-span-2">
                                    <Label>Registration No</Label>
                                    <Input
                                        value={formData.registration_no}
                                        onChange={(e) =>
                                            handleChange(
                                                'registration_no',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="ORG-12345"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            Create Customer
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default Create;
