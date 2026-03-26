import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { documentTypes } from './data/document_types';

const CreateKycDocument = () => {
    const { customer, flash } = usePage().props as any;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const { data, setData, post, processing, errors } = useForm({
        customer_id: customer.id,
        document_type: null as string | null,
        file: null as File | null,
    });

    const handleFileChange = (file: File | null) => {
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
        setData('file', file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('customer_id', data.customer_id);
        formData.append('document_type', data.document_type);
        if (data.file) formData.append('file', data.file);

        post(route('kyc-documents.store'), {
            preserveScroll: true,
            onError: () => toast.error('Please fix the errors and try again.'),
            onSuccess: () => toast.success('Document uploaded successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'KYC Documents', href: route('kyc-documents.index') },
        { title: 'Upload Document', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload KYC Document" />

            {/* HEADER */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Upload KYC Document"
                    description="Attach a document for this customer."
                />

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href={route('kyc-documents.index')}
                        className="btn-secondary"
                    >
                        <ListFilter className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6 lg:w-5xl"
            >
                {/* CUSTOMER INFO */}
                <div>
                    <Label>Customer</Label>
                    <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                        <div className="flex items-center justify-center">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {customer?.photo?.url ? (
                                    <img
                                        src={customer.photo.url}
                                        alt={customer.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {customer.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <Link
                                href={route('customers.show', customer.id)}
                                className="text-sm font-semibold text-info underline"
                            >
                                {customer.name} • {customer.customer_no}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {customer.kyc_status} • {customer.type}
                            </p>
                            <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-4">
                                <Info label="Phone" value={customer.phone} />
                                <Info label="Email" value={customer.email} />
                                <Info
                                    label="ID Type"
                                    value={customer.identification_type}
                                />
                                <Info
                                    label="ID Number"
                                    value={customer.identification_number}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOCUMENT TYPE */}
                <div>
                    <Label className="text-xs">Document Type</Label>
                    <Select
                        value={data.document_type}
                        onChange={(value) => setData('document_type', value)}
                        options={documentTypes}
                    />

                    <InputError message={errors.document_type} />
                </div>

                {/* FILE PREVIEW */}
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-32 w-32 rounded-md border object-cover sm:h-40 sm:w-40"
                    />
                ) : (
                    <div className="h-32 w-32 rounded-md border bg-muted sm:h-40 sm:w-40">
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                            No Photo
                        </div>
                    </div>
                )}

                {/* FILE UPLOAD */}
                <div>
                    <Label className="text-xs">Upload File</Label>
                    <input
                        type="file"
                        onChange={(e) =>
                            handleFileChange(e.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-muted-foreground"
                    />
                    <InputError message={errors.file} />
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <CheckCheck />
                                Upload Document
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default CreateKycDocument;

/* INFO COMPONENT */
function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value}</p>
        </div>
    );
}
