import { Head, useForm } from '@inertiajs/react';
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
import { PaginatedData } from '../../../types/paginated_data';
import MediaBrowserModal from '../../media/media_browser_modal';

interface EditProps {
    customer: any; // Replace with your actual Customer type
    media: PaginatedData<Media>;
}

const Edit: React.FC<EditProps> = ({ customer, media }) => {
    const { data, setData, put, processing, errors } = useForm({
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
        registration_no: customer.registration_no || '',
        media: customer.media?.id || null,
    });

    const [selectedMedia, setSelectedMedia] = useState<Media | null>(
        customer.media || null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (key: string, value: any) => {
        setData(key, value);
    };

    const handleMediaSelect = (media: Media) => {
        setSelectedMedia(media);
        setData('media', media.id);
    };

    const handleMediaRemove = () => {
        setSelectedMedia(null);
        setData('media', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/auth/customers/${customer.id}`, {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: 'Edit Customer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="w-6xl animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Customer"
                    description="Update the customer’s information and related media."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-2 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Customer No</Label>
                            <Input
                                value={data.customer_no}
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
                                value={data.type}
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

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    handleChange('name', e.target.value)
                                }
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {data.type === 'Organization' && (
                            <div>
                                <Label>Registration No</Label>
                                <Input
                                    value={data.registration_no}
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
                                value={data.phone}
                                onChange={(e) =>
                                    handleChange('phone', e.target.value)
                                }
                                placeholder="+8801XXXXXXXXX"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                value={data.email}
                                onChange={(e) =>
                                    handleChange('email', e.target.value)
                                }
                                placeholder="example@email.com"
                            />
                        </div>

                        <div>
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={data.dob}
                                onChange={(e) =>
                                    handleChange('dob', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Gender</Label>
                            <select
                                value={data.gender}
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
                                value={data.religion}
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

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Identification Type</Label>
                            <select
                                value={data.identification_type}
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
                                value={data.identification_number}
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

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>KYC Level</Label>
                            <select
                                value={data.kyc_level}
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
                                value={data.status}
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

                    <div className="mt-5">
                        <MediaSelector
                            label="Media"
                            media={selectedMedia}
                            onSelect={() => setIsModalOpen(true)}
                            onRemove={handleMediaRemove}
                            error={errors.media}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Update Customer'}
                        </Button>
                    </div>
                </form>
            </div>

            <MediaBrowserModal
                actionType="edit"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                media={media}
                onSelect={handleMediaSelect}
            />
        </CustomAuthLayout>
    );
};

export default Edit;
