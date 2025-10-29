import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { MediaSelector } from '../../../components/media-selector';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Media } from '../../../types/media';
import MediaBrowserModal from '../../media/media_browser_modal';

interface Customer {
    id: number;
    customer_no: string;
    type: 'Individual' | 'Organization';
    name: string;
    phone: string;
    email: string;
    kyc_level: 'MIN' | 'STD' | 'ENH';
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'CLOSED';
    dob: string;
    gender: string;
    religion: string;
    identification_type: string;
    identification_number: string;
    photo?: Partial<Media>;
    registration_no?: string;
}

interface EditProps {
    customer: Customer;
    errors?: Record<string, any>;
}

const Edit: React.FC<EditProps> = ({ customer, errors = {} }) => {
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
        photo: customer.photo?.id || null,
        registration_no: customer.registration_no || '',
    });

    // Initialize selectedMedia safely for TypeScript
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(
        customer.photo
            ? {
                  id: customer.photo.id!,
                  url: customer.photo.url!,
                  file_name: customer.photo.file_name || '',
                  file_path: customer.photo.file_path || '',
                  file_type: customer.photo.file_type || 'image/jpeg',
                  alt_text: customer.photo.alt_text || '',
                  uploaded_by: customer.photo.uploaded_by || 0,
                  created_at: customer.photo.created_at || '',
                  updated_at: customer.photo.updated_at || '',
              }
            : null,
    );

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleMediaSelect = (media: Media) => {
        setSelectedMedia(media);
        handleChange('photo', media.id);
    };

    const handleMediaRemove = () => {
        setSelectedMedia(null);
        handleChange('photo', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating customer:', formData);
        // TODO: Replace console.log with actual API call
        // Example:
        // fetch(`/api/customers/${customer.id}`, {
        //   method: 'PUT',
        //   body: JSON.stringify(formData),
        //   headers: { 'Content-Type': 'application/json' },
        // });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: `Edit ${customer.name}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer: ${customer.name}`} />

            <div className="w-6xl animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title={`Edit Customer: ${customer.name}`}
                    description="Update the customer's details below."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-2 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer No & Type */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Customer No</Label>
                            <Input
                                value={formData.customer_no}
                                onChange={(e) =>
                                    handleChange('customer_no', e.target.value)
                                }
                                placeholder="CUST-0001"
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
                    </div>

                    {/* Name, Registration No (if org), Phone, Email */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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

                        {formData.type === 'Organization' && (
                            <div>
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

                    {/* DOB, Gender, Religion */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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

                    {/* Identification */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                    </div>

                    {/* KYC Level & Status */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>KYC Level</Label>
                            <select
                                value={formData.kyc_level}
                                onChange={(e) =>
                                    handleChange('kyc_level', e.target.value)
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
                    </div>

                    {/* Media Selector */}
                    <div className="mt-">
                        <MediaSelector
                            label="Photo"
                            media={selectedMedia}
                            onSelect={() => setIsModalOpen(true)}
                            onRemove={handleMediaRemove}
                            error={errors.photo}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            Update Customer
                        </Button>
                    </div>
                </form>
            </div>

            {/* Media Browser Modal */}
            <MediaBrowserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleMediaSelect}
            />
        </CustomAuthLayout>
    );
};

export default Edit;
