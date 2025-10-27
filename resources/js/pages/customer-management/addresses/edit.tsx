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
    address: {
        id: number;
        customer_id: string;
        line1: string;
        line2?: string;
        division: string;
        district: string;
        upazila?: string;
        union_ward?: string;
        village_locality?: string;
        postal_code?: string;
        country_code: string;
        type:
            | 'CURRENT'
            | 'PERMANENT'
            | 'MAILING'
            | 'WORK'
            | 'REGISTERED'
            | 'OTHER';
    };
    errors?: Record<string, string>;
}

export default function Edit({
    address,
    errors: serverErrors = {},
}: EditProps) {
    const [formData, setFormData] = useState({ ...address });
    const [errors] = useState<any>(serverErrors);

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting Edited Address:', formData);
        // TODO: Send PUT request via Inertia to `/auth/addresses/${address.id}`
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/auth/addresses' },
        { title: `Edit Address`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Address" />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Address"
                    description={`Update details for ${address.customer_id}`}
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer ID */}
                    <div>
                        <Label>Customer ID</Label>
                        <Input
                            value={formData.customer_id}
                            onChange={(e) =>
                                handleChange('customer_id', e.target.value)
                            }
                            placeholder="Enter Customer ID"
                        />
                        <InputError message={errors.customer_id} />
                    </div>

                    {/* Address Lines */}
                    <div>
                        <Label>Address Line 1</Label>
                        <Input
                            value={formData.line1}
                            onChange={(e) =>
                                handleChange('line1', e.target.value)
                            }
                            placeholder="Street, Road, House No"
                        />
                        <InputError message={errors.line1} />
                    </div>

                    <div>
                        <Label>Address Line 2</Label>
                        <Input
                            value={formData.line2 ?? ''}
                            onChange={(e) =>
                                handleChange('line2', e.target.value)
                            }
                            placeholder="Apartment, Building, etc."
                        />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <Label>Division</Label>
                            <Input
                                value={formData.division}
                                onChange={(e) =>
                                    handleChange('division', e.target.value)
                                }
                                placeholder="Division"
                            />
                            <InputError message={errors.division} />
                        </div>

                        <div>
                            <Label>District</Label>
                            <Input
                                value={formData.district}
                                onChange={(e) =>
                                    handleChange('district', e.target.value)
                                }
                                placeholder="District"
                            />
                            <InputError message={errors.district} />
                        </div>

                        <div>
                            <Label>Upazila</Label>
                            <Input
                                value={formData.upazila ?? ''}
                                onChange={(e) =>
                                    handleChange('upazila', e.target.value)
                                }
                                placeholder="Upazila"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <Label>Union/Ward</Label>
                            <Input
                                value={formData.union_ward ?? ''}
                                onChange={(e) =>
                                    handleChange('union_ward', e.target.value)
                                }
                                placeholder="Union or Ward"
                            />
                        </div>

                        <div>
                            <Label>Village/Locality</Label>
                            <Input
                                value={formData.village_locality ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'village_locality',
                                        e.target.value,
                                    )
                                }
                                placeholder="Village / Locality"
                            />
                        </div>

                        <div>
                            <Label>Postal Code</Label>
                            <Input
                                value={formData.postal_code ?? ''}
                                onChange={(e) =>
                                    handleChange('postal_code', e.target.value)
                                }
                                placeholder="Postal Code"
                            />
                        </div>
                    </div>

                    {/* Country & Type */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Country Code</Label>
                            <Input
                                value={formData.country_code}
                                onChange={(e) =>
                                    handleChange('country_code', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Address Type</Label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    handleChange('type', e.target.value)
                                }
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option>CURRENT</option>
                                <option>PERMANENT</option>
                                <option>MAILING</option>
                                <option>WORK</option>
                                <option>REGISTERED</option>
                                <option>OTHER</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            Update Address
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
