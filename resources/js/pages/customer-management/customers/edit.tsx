import { Head, router, useForm } from '@inertiajs/react';
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
    backUrl: string;
}

const Edit: React.FC<EditProps> = ({ customer, backUrl }) => {
    const handleBack = () => {
        router.visit(backUrl, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const { data, setData, put, processing, errors } = useForm({
        customer_no: customer.customer_no ?? '',
        type: customer.type ?? 'Individual',
        name: customer.name ?? '',
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        kyc_level: customer.kyc_level ?? 'MIN',
        status: customer.status ?? 'ACTIVE',
        dob: customer.dob ? customer.dob.split('T')[0] : '',
        gender: customer.gender ?? '',
        religion: customer.religion ?? '',
        identification_type: customer.identification_type ?? 'NID',
        identification_number: customer.identification_number ?? '',
        photo_id: customer.photo?.id ?? null,
        registration_no: customer.registration_no ?? '',
    });

    const [selectedMedia, setSelectedMedia] = useState<Media | null>(
        customer.photo || null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/auth/customers/${customer.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Customer updated successfully'),
            onError: () => toast.error('Please fix the errors in the form'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: `Edit ${customer.name}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="space-y-10">
                {/* ================= Profile Context ================= */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        {customer.photo ? (
                            <img
                                src={customer.photo.url}
                                alt={customer.name}
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                                {customer.name.charAt(0)}
                            </div>
                        )}

                        <div>
                            <h1 className="text-xl font-semibold">
                                Edit {customer.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Customer No · {customer.customer_no}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleBack}>Back</Button>
                    </div>
                </div>

                {/* ================= Form ================= */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 rounded-xl border border-border bg-card p-8 shadow-sm"
                >
                    {/* -------- Basic Info -------- */}
                    <section>
                        <HeadingSmall
                            title="Basic Information"
                            description="Customer identity and contact details"
                        />

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <Field
                                label="Customer No"
                                error={errors.customer_no}
                            >
                                <Input
                                    value={data.customer_no}
                                    onChange={(e) =>
                                        setData('customer_no', e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Customer Type" error={errors.type}>
                                <select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData('type', e.target.value)
                                    }
                                    className="form-select"
                                >
                                    <option>Individual</option>
                                    <option>Organization</option>
                                </select>
                            </Field>

                            <Field label="Name" error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Phone" error={errors.phone}>
                                <Input
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Email" error={errors.email}>
                                <Input
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                            </Field>
                        </div>
                    </section>

                    {/* -------- Identification -------- */}
                    <section>
                        <HeadingSmall
                            title="Identification"
                            description="Verification and compliance"
                        />

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <Field
                                label="Identification Type"
                                error={errors.identification_type}
                            >
                                <select
                                    value={data.identification_type}
                                    onChange={(e) =>
                                        setData(
                                            'identification_type',
                                            e.target.value,
                                        )
                                    }
                                    className="form-select"
                                >
                                    <option>NID</option>
                                    <option>PASSPORT</option>
                                    <option>DRIVING_LICENSE</option>
                                </select>
                            </Field>

                            <Field
                                label="Identification Number"
                                error={errors.identification_number}
                            >
                                <Input
                                    value={data.identification_number}
                                    onChange={(e) =>
                                        setData(
                                            'identification_number',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    </section>

                    {/* -------- Photo -------- */}
                    <section>
                        <HeadingSmall
                            title="Profile Photo"
                            description="Customer photograph"
                        />

                        <MediaSelector
                            label="Photo"
                            media={selectedMedia}
                            onSelect={() => setIsModalOpen(true)}
                            onRemove={() => {
                                setSelectedMedia(null);
                                setData('photo_id', null);
                            }}
                            error={errors.photo_id}
                        />
                    </section>

                    {/* -------- Metadata -------- */}
                    <section className="text-xs text-muted-foreground">
                        <p>
                            Created:{' '}
                            <span className="text-foreground">
                                {formatDateTime(customer.created_at)}
                            </span>
                        </p>
                        <p>
                            Updated:{' '}
                            <span className="text-foreground">
                                {formatDateTime(customer.updated_at)}
                            </span>
                        </p>
                    </section>

                    {/* -------- Submit -------- */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-44"
                        >
                            {processing ? 'Updating…' : 'Update Customer'}
                        </Button>
                    </div>
                </form>
            </div>

            <MediaBrowserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={(media) => {
                    setSelectedMedia(media);
                    setData('photo_id', media.id);
                    setIsModalOpen(false);
                }}
            />
        </CustomAuthLayout>
    );
};

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <div className="mt-1">{children}</div>
            <InputError message={error} />
        </div>
    );
}

export default Edit;

function formatDateTime(value?: string | null) {
    if (!value) return '—';

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}
