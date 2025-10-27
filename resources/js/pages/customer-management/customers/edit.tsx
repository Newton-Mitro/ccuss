import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface EditProps {
    customer: {
        id: number;
        customer_no: string;
        type: string;
        name: string;
        phone: string;
        email: string;
        kyc_level: string;
        status: string;
        dob: string;
        gender: string;
        religion: string;
        identification_type: string;
        identification_number: string;
        photo: string;
        registration_no: string;
    };
}

function Edit({ customer }: EditProps) {
    const [formData, setFormData] = useState({
        customer_no: customer.customer_no || '',
        type: customer.type || 'Individual',
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        kyc_level: customer.kyc_level || 'MIN',
        status: customer.status || 'ACTIVE',
        dob: customer.dob || '',
        gender: customer.gender || '',
        religion: customer.religion || '',
        identification_type: customer.identification_type || '',
        identification_number: customer.identification_number || '',
        photo: customer.photo || '',
        registration_no: customer.registration_no || '',
    });

    const [errors] = useState<any>({});

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating:', formData);
        // TODO: Replace console.log with actual PUT/PATCH request, e.g.:
        // router.put(`/auth/customers/${customer.id}`, formData);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: `Edit Customer - ${customer.customer_no}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="space-y-8 p-4 text-foreground">
                <HeadingSmall
                    title={`Edit Customer (${customer.customer_no})`}
                    description="Update customer details below"
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label>Customer No</Label>
                            <Input
                                value={formData.customer_no}
                                onChange={(e) =>
                                    handleChange('customer_no', e.target.value)
                                }
                                placeholder="CUST-0001"
                                readOnly
                                className="cursor-not-allowed bg-muted"
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
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
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
                            />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                onChange={(e) =>
                                    handleChange('email', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>KYC Level</Label>
                            <select
                                value={formData.kyc_level}
                                onChange={(e) =>
                                    handleChange('kyc_level', e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
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
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                            >
                                <option>ACTIVE</option>
                                <option>PENDING</option>
                                <option>SUSPENDED</option>
                                <option>CLOSED</option>
                            </select>
                        </div>

                        {/* Person Info */}
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
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
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
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                            >
                                <option value="">Select</option>
                                <option>CHRISTIANITY</option>
                                <option>ISLAM</option>
                                <option>HINDUISM</option>
                                <option>BUDDHISM</option>
                                <option>OTHER</option>
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
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
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
                            />
                        </div>

                        <div>
                            <Label>Photo URL</Label>
                            <Input
                                value={formData.photo}
                                onChange={(e) =>
                                    handleChange('photo', e.target.value)
                                }
                            />
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

                    <Button
                        type="submit"
                        className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Update Customer
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default Edit;
