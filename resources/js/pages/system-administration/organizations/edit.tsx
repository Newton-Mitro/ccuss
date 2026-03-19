import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Organization } from '../../../types/organization';

function EditOrganization() {
    const { organization } = usePage<{ organization: Organization }>().props;

    const { data, setData, put, processing, errors } = useForm({
        code: organization.code || '',
        name: organization.name || '',
        short_name: organization.short_name || '',
        registration_no: organization.registration_no || '',
        tax_id: organization.tax_id || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        address_line1: organization.address_line1 || '',
        address_line2: organization.address_line2 || '',
        city: organization.city || '',
        state: organization.state || '',
        postal_code: organization.postal_code || '',
        country: organization.country || '',
        logo_path: organization.logo_path || '',
        report_header_line1: organization.report_header_line1 || '',
        report_header_line2: organization.report_header_line2 || '',
        report_footer: organization.report_footer || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/organizations/${organization.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () =>
                toast.success('Organization updated successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organizations', href: '/organizations' },
        { title: 'Edit Organization', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Organization" />

            <div className="animate-in fade-in space-y-8 text-foreground">
                <HeadingSmall
                    title="Edit Organization"
                    description="Update organization details and keep your system aligned."
                />

                <form
                    onSubmit={handleSubmit}
                    className="bg-card/80 space-y-5 rounded-xl border p-8 shadow-sm backdrop-blur-sm transition-all duration-300"
                >
                    {/* Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Basic Details
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                            <div>
                                <Label>Organization Code</Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div>
                                <Label>Organization Name</Label>
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
                                <Label>Short Name</Label>
                                <Input
                                    value={data.short_name}
                                    onChange={(e) =>
                                        setData('short_name', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.short_name} />
                            </div>

                            <div>
                                <Label>Registration Number</Label>
                                <Input
                                    value={data.registration_no}
                                    onChange={(e) =>
                                        setData(
                                            'registration_no',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.registration_no} />
                            </div>

                            <div>
                                <Label>Tax ID</Label>
                                <Input
                                    value={data.tax_id}
                                    onChange={(e) =>
                                        setData('tax_id', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.tax_id} />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Contact & Address
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                            <div>
                                <Label>Phone</Label>
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
                                <Label>Email</Label>
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
                                <Label>Website</Label>
                                <Input
                                    value={data.website}
                                    onChange={(e) =>
                                        setData('website', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.website} />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Address Line 1</Label>
                                <Input
                                    value={data.address_line1}
                                    onChange={(e) =>
                                        setData('address_line1', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.address_line1} />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Address Line 2</Label>
                                <Input
                                    value={data.address_line2}
                                    onChange={(e) =>
                                        setData('address_line2', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.address_line2} />
                            </div>

                            <div>
                                <Label>City</Label>
                                <Input
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.city} />
                            </div>

                            <div>
                                <Label>State</Label>
                                <Input
                                    value={data.state}
                                    onChange={(e) =>
                                        setData('state', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.state} />
                            </div>

                            <div>
                                <Label>Postal Code</Label>
                                <Input
                                    value={data.postal_code}
                                    onChange={(e) =>
                                        setData('postal_code', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.postal_code} />
                            </div>

                            <div>
                                <Label>Country</Label>
                                <Input
                                    value={data.country}
                                    onChange={(e) =>
                                        setData('country', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.country} />
                            </div>
                        </div>
                    </div>

                    {/* Report Header/Footer */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Report Header/Footer
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                            <div>
                                <Label>Report Header Line 1</Label>
                                <Input
                                    value={data.report_header_line1}
                                    onChange={(e) =>
                                        setData(
                                            'report_header_line1',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError
                                    message={errors.report_header_line1}
                                />
                            </div>

                            <div>
                                <Label>Report Header Line 2</Label>
                                <Input
                                    value={data.report_header_line2}
                                    onChange={(e) =>
                                        setData(
                                            'report_header_line2',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError
                                    message={errors.report_header_line2}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Report Footer</Label>
                                <Input
                                    value={data.report_footer}
                                    onChange={(e) =>
                                        setData('report_footer', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.report_footer} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="hover:bg-primary/90 w-40 bg-primary text-primary-foreground"
                        >
                            {processing ? 'Updating...' : 'Update Organization'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default EditOrganization;
