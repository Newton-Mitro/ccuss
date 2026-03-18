import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

function CreateOrganization() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        short_name: '',
        registration_no: '',
        tax_id: '',
        phone: '',
        email: '',
        website: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        logo_path: '',
        report_header_line1: '',
        report_header_line2: '',
        report_footer: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/organizations', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () =>
                toast.success('Organization created successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organizations', href: '/organizations' },
        { title: 'Add Organization', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Organization" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Create Organization"
                    description="Fill in the organization details below to register a new organization."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
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
                                    placeholder="ORG-001"
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
                                    placeholder="Acme Corp"
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
                                    placeholder="Acme"
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
                                    placeholder="123456789"
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
                                    placeholder="VAT-987654321"
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
                                    placeholder="+880123456789"
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
                                    placeholder="info@acme.com"
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
                                    placeholder="www.acme.com"
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
                                    placeholder="123 Main Street"
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
                                    placeholder="Floor, Suite, etc."
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
                                    placeholder="Dhaka"
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
                                    placeholder="Dhaka Division"
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
                                    placeholder="1207"
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
                                    placeholder="Bangladesh"
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
                                    placeholder="Acme Corp - Financial Report"
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
                                    placeholder="Confidential"
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
                                    placeholder="© 2026 Acme Corp"
                                />
                                <InputError message={errors.report_footer} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Create Organization'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default CreateOrganization;
