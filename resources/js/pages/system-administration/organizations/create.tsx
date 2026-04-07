import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

function CreateOrganization() {
    useFlashToastHandler();

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
        logo_url: '',
        report_header_line1: '',
        report_header_line2: '',
        report_footer: '',
        logo: null as File | null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
            setData('logo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/organizations', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organizations', href: '/organizations' },
        { title: 'Add Organization', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Organization" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Create Organization"
                    description="Fill in the organization details below to register a new organization."
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 flex flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm backdrop-blur-sm transition-all duration-300"
                >
                    <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="w-full space-y-4 lg:w-11/12">
                            {/* Basic Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-info">
                                    Basic Details
                                </h3>
                                <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-3">
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
                                                setData(
                                                    'short_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                            placeholder="Acme"
                                        />
                                        <InputError
                                            message={errors.short_name}
                                        />
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
                                        <InputError
                                            message={errors.registration_no}
                                        />
                                    </div>

                                    <div>
                                        <Label>Tax ID</Label>
                                        <Input
                                            value={data.tax_id}
                                            onChange={(e) =>
                                                setData(
                                                    'tax_id',
                                                    e.target.value,
                                                )
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
                                <h3 className="text-lg font-semibold text-info">
                                    Contact & Address
                                </h3>
                                <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
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
                                                setData(
                                                    'website',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                            placeholder="www.acme.com"
                                        />
                                        <InputError message={errors.website} />
                                    </div>

                                    <div className="">
                                        <Label>Address Line 1</Label>
                                        <Input
                                            value={data.address_line1}
                                            onChange={(e) =>
                                                setData(
                                                    'address_line1',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                            placeholder="123 Main Street"
                                        />
                                        <InputError
                                            message={errors.address_line1}
                                        />
                                    </div>

                                    <div className="">
                                        <Label>Address Line 2</Label>
                                        <Input
                                            value={data.address_line2}
                                            onChange={(e) =>
                                                setData(
                                                    'address_line2',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                            placeholder="Floor, Suite, etc."
                                        />
                                        <InputError
                                            message={errors.address_line2}
                                        />
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
                                                setData(
                                                    'postal_code',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                            placeholder="1207"
                                        />
                                        <InputError
                                            message={errors.postal_code}
                                        />
                                    </div>

                                    <div>
                                        <Label>Country</Label>
                                        <Input
                                            value={data.country}
                                            onChange={(e) =>
                                                setData(
                                                    'country',
                                                    e.target.value,
                                                )
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
                                <h3 className="text-lg font-semibold text-info">
                                    Report Header/Footer
                                </h3>
                                <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-4">
                                    <div className="md:col-span-2">
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

                                    <div className="md:col-span-2">
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
                                                setData(
                                                    'report_footer',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                            placeholder="© 2026 Acme Corp"
                                        />
                                        <InputError
                                            message={errors.report_footer}
                                        />
                                    </div>
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
            </div>
        </CustomAuthLayout>
    );
}

export default CreateOrganization;
