import { Input } from '@/components/ui/input';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    FileImage,
    FileUp,
    IdCard,
    Mail,
    Phone,
    ShieldCheck,
    UserRound,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '../../../types';
import type { Customer } from '../../../types/customer_kyc_module';
import {
    KYC_DOCUMENT_ACCEPT,
    validateKycDocumentFile,
} from './data/document-file';
import { documentTypes } from './data/document_types';

const CreateKycDocument = () => {
    const { customer } = usePage<SharedData & { customer: Customer }>().props;

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        customer_id: customer.id,
        document_type: null as string | null,
        file: null as File | null,
    });

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (file: File | null) => {
        setFileError(null);

        if (!file) {
            setData('file', null);
            setPreviewUrl(null);
            return;
        }

        const validationError = validateKycDocumentFile(file);
        if (validationError) {
            setData('file', null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFileError(validationError);
            return;
        }

        setData('file', file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const isPdf = data.file?.name.toLowerCase().endsWith('.pdf');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.document_type) {
            return;
        }

        if (!data.file) {
            setFileError('Please select a document to upload.');
            return;
        }

        post(route('customers.kyc-documents.store', customer.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer.name,
            href: route('customers.show', customer.id),
        },
        { title: 'Upload Document', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload KYC Document" />

            <div className="w-full max-w-6xl space-y-6 pb-8">
                {/* Page Header */}
                <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
                            <FileUp className="size-5" />
                        </div>

                        <HeadingSmall
                            title="Upload KYC Document"
                            description="Add an identification document to the customer's KYC profile."
                        />
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Customer
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-4">
                            <UserRound className="size-4 text-primary" />

                            <h2 className="text-sm font-semibold">
                                Customer Information
                            </h2>

                            <span className="ml-auto rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                {customer.customer_no}
                            </span>
                        </div>

                        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
                            <div className="relative mx-auto shrink-0 sm:mx-0">
                                <div className="size-24 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                                    {customer?.photo?.url ? (
                                        <img
                                            src={customer.photo.url}
                                            alt={customer.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-2xl font-bold text-muted-foreground">
                                            {customer.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || 'C'}
                                        </div>
                                    )}
                                </div>

                                <div className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                                    <ShieldCheck className="size-4" />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1 space-y-4">
                                <div className="text-center sm:text-left">
                                    <Link
                                        href={route(
                                            'customers.show',
                                            customer.id,
                                        )}
                                        className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                                    >
                                        {customer.name}
                                    </Link>

                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                            {customer.type || 'Customer'}
                                        </span>

                                        <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                            {customer.status ||
                                                'Unknown status'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border/60 bg-background p-3">
                                        <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Primary Phone
                                            </p>
                                            <p className="mt-1 text-sm font-medium wrap-break-word">
                                                {customer.primary_phone ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border/60 bg-background p-3">
                                        <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Primary Email
                                            </p>
                                            <p className="mt-1 text-sm font-medium break-all">
                                                {customer.primary_email ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border/60 bg-background p-3">
                                        <IdCard className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Identification Type
                                            </p>
                                            <p className="mt-1 text-sm font-medium wrap-break-word">
                                                {customer.identification_type ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border/60 bg-background p-3">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Identification Number
                                            </p>
                                            <p className="mt-1 text-sm font-medium wrap-break-word">
                                                {customer.identification_number ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Document Details */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/60 px-5 py-4">
                            <h2 className="text-sm font-semibold">
                                Document Details
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Select the document category and upload a clear
                                image or PDF.
                            </p>
                        </div>

                        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
                            {/* Document Type */}
                            <div className="space-y-2">
                                <Label>
                                    Document Type{' '}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <Select
                                    value={data.document_type}
                                    onChange={(value) =>
                                        setData('document_type', value)
                                    }
                                    options={documentTypes}
                                />

                                <InputError message={errors.document_type} />

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Choose the category that matches your
                                    document.
                                </p>
                            </div>

                            {/* Image Preview */}
                            <div className="space-y-2">
                                <Label>Document Preview</Label>

                                <div className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/20 p-4">
                                    {previewUrl ? (
                                        isPdf ? (
                                            <iframe
                                                src={previewUrl}
                                                title="Selected PDF document preview"
                                                className="h-64 w-full rounded-lg border border-border bg-background"
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Selected document preview"
                                                className="max-h-64 w-full rounded-lg object-contain"
                                            />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                                            <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                                                <FileImage className="size-6" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    No document selected
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Your document preview will
                                                    appear here.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {previewUrl && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('file', null);
                                                setPreviewUrl(null);
                                                setFileError(null);

                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value =
                                                        '';
                                                }
                                            }}
                                            aria-label="Remove selected document"
                                            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2 lg:col-span-2">
                                <Label>
                                    Upload Document File{' '}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="group flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 py-7 text-center transition-colors hover:border-primary/50 hover:bg-primary/3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                                        <FileUp className="size-5" />
                                    </div>

                                    <p className="mt-3 text-sm font-semibold">
                                        {data.file
                                            ? 'Choose a different image'
                                            : 'Click to select an image'}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        JPG, PNG, or PDF · Maximum 10 MB
                                    </p>

                                    {data.file && (
                                        <span className="mt-3 max-w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium break-all">
                                            {data.file.name}
                                        </span>
                                    )}
                                </button>

                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={KYC_DOCUMENT_ACCEPT}
                                    onChange={(e) =>
                                        handleFileChange(
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="sr-only"
                                />

                                <InputError message={errors.file} />
                                {fileError && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {fileError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-border/60 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-muted-foreground">
                                <ShieldCheck className="mr-1 inline size-3.5" />
                                Ensure the document is clear and readable.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Button variant="outline" type="button" asChild>
                                    <Link
                                        href={route(
                                            'customers.show',
                                            customer.id,
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.document_type ||
                                        !data.file
                                    }
                                >
                                    {processing ? (
                                        <>
                                            <span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCheck className="mr-2 size-4" />
                                            Upload Document
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

export default CreateKycDocument;
