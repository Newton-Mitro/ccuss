import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { MediaSelector } from '../../../components/media-selector';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer';
import { Media } from '../../../types/media';
import MediaBrowserModal from '../../media/media_browser_modal';

interface EditProps {
    customer: Customer;
}
interface CustomerFormData {
    customer_no: string;
    type: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    kyc_level: string;
    status: string;
    dob?: string | null;
    gender?: string;
    religion?: string;
    identification_type: string;
    identification_number: string;
    photo_id?: number | null;
    registration_no?: string | null;
}

const Edit: React.FC<EditProps> = ({ customer }) => {
    console.log(customer);
    const { data, setData, put, processing, errors } =
        useForm<CustomerFormData>({
            customer_no: customer.customer_no ?? '',
            type: customer.type ?? 'Individual',
            name: customer.name ?? '',
            phone: customer.phone ?? null,
            email: customer.email ?? null,
            kyc_level: customer.kyc_level ?? 'MIN',
            status: customer.status ?? 'ACTIVE',
            dob: customer.dob ?? null,
            gender: customer.gender ?? null,
            religion: customer.religion ?? null,
            identification_type: customer.identification_type ?? 'NID',
            identification_number: customer.identification_number ?? '',
            photo_id: customer.photo?.id ?? null,
            registration_no: customer.registration_no ?? null,
        });

    const [selectedMedia, setSelectedMedia] = useState<Media | null>(
        customer.photo || null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMediaSelect = (media: Media) => {
        setSelectedMedia(media);
        setData('photo_id', media.id);
        setIsModalOpen(false);
    };

    const handleMediaRemove = () => {
        setSelectedMedia(null);
        setData('photo_id', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/auth/customers/${customer.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Customer updated successfully!'),
            onError: () => toast.error('Please fix the errors in the form.'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: `Edit ${customer.name}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer: ${customer.name}`} />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title={`Edit Customer: ${customer.name}`}
                    description="Update the customer's details below."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-2 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Customer No</Label>
                            <Input
                                value={data.customer_no}
                                onChange={(e) =>
                                    setData('customer_no', e.target.value)
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
                                    setData('type', e.target.value)
                                }
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option>Individual</option>
                                <option>Organization</option>
                            </select>
                            <InputError message={errors.type} />
                        </div>

                        {data.type === 'Organization' && (
                            <div>
                                <Label>Registration No</Label>
                                <Input
                                    value={data.registration_no}
                                    onChange={(e) =>
                                        setData(
                                            'registration_no',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="ORG-12345"
                                />
                                <InputError message={errors.registration_no} />
                            </div>
                        )}
                    </div>

                    {/* Name, Phone, Email */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
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
                                    setData('email', e.target.value)
                                }
                                placeholder="example@email.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    {/* DOB, Gender, Religion */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={data.dob}
                                onChange={(e) => setData('dob', e.target.value)}
                            />
                            <InputError message={errors.dob} />
                        </div>

                        <div>
                            <Label>Gender</Label>
                            <select
                                value={data.gender}
                                onChange={(e) =>
                                    setData('gender', e.target.value)
                                }
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option>MALE</option>
                                <option>FEMALE</option>
                                <option>OTHER</option>
                            </select>
                            <InputError message={errors.gender} />
                        </div>

                        <div>
                            <Label>Religion</Label>
                            <select
                                value={data.religion}
                                onChange={(e) =>
                                    setData('religion', e.target.value)
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
                            <InputError message={errors.religion} />
                        </div>
                    </div>

                    {/* Identification */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Identification Type</Label>
                            <select
                                value={data.identification_type}
                                onChange={(e) =>
                                    setData(
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
                            <InputError message={errors.identification_type} />
                        </div>

                        <div>
                            <Label>Identification Number</Label>
                            <Input
                                value={data.identification_number}
                                onChange={(e) =>
                                    setData(
                                        'identification_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter ID number"
                            />
                            <InputError
                                message={errors.identification_number}
                            />
                        </div>
                    </div>

                    {/* KYC & Status */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>KYC Level</Label>
                            <select
                                value={data.kyc_level}
                                onChange={(e) =>
                                    setData('kyc_level', e.target.value)
                                }
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option>MIN</option>
                                <option>STD</option>
                                <option>ENH</option>
                            </select>
                            <InputError message={errors.kyc_level} />
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select
                                value={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.value)
                                }
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option>ACTIVE</option>
                                <option>PENDING</option>
                                <option>SUSPENDED</option>
                                <option>CLOSED</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    {/* Media Selector */}
                    <div className="mt-4">
                        <MediaSelector
                            label="Photo"
                            media={selectedMedia}
                            onSelect={() => setIsModalOpen(true)}
                            onRemove={handleMediaRemove}
                            error={errors.photo_id}
                        />
                    </div>

                    {/* Submit */}
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Updating...' : 'Update Customer'}
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
