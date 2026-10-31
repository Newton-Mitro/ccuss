import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import {
    KYC_DOCUMENT_ACCEPT,
    validateKycDocumentFile,
} from '@/modules/customers-kyc/kyc-documents/data/document-file';
import { documentTypes } from '@/modules/customers-kyc/kyc-documents/data/document_types';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    CheckCircle2,
    FileImage,
    FileText,
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

const CreateKycDocument = () => {
    const { customer } = usePage<SharedData & { customer: Customer }>().props;

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(1);
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

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setFileError(validationError);
            return;
        }

        setData('file', file);
        setPreviewUrl(URL.createObjectURL(file));
        setActiveStep(3);
    };

    const removeSelectedFile = () => {
        setData('file', null);
        setPreviewUrl(null);
        setFileError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isPdf = data.file?.name.toLowerCase().endsWith('.pdf');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.document_type) {
            setActiveStep(2);
            return;
        }

        if (!data.file) {
            setFileError('Please select a document to upload.');
            setActiveStep(3);
            return;
        }

        post(route('customers.kyc-documents.store', customer.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '/customer-kyc' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer.name,
            href: route('customers.show', customer.id),
        },
        { title: 'Upload Document', href: '' },
    ];

    const steps = [
        { number: 1, title: 'Confirm Customer', description: 'Verify details' },
        { number: 2, title: 'Document Type', description: 'Choose category' },
        {
            number: 3,
            title: 'Upload & Preview',
            description: 'Attach document',
        },
    ];

    const stepComplete = (step: number) => {
        if (step === 1) return true;
        if (step === 2) return Boolean(data.document_type);
        return Boolean(data.document_type && data.file);
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload KYC Document" />

            <div className="w-full space-y-5 pb-24">
                {/* Page Header */}
                <div
                    data-slot="customer-page-header"
                    className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <HeadingSmall
                        title="Upload KYC Document"
                        description="Follow the steps below to add a document to the customer's KYC profile."
                    />

                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Customer
                        </Link>
                    </Button>
                </div>

                {/* Step Progress */}
                <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
                    <div className="grid grid-cols-3 gap-2">
                        {steps.map((step) => {
                            const completed = stepComplete(step.number);
                            const active = activeStep === step.number;

                            return (
                                <button
                                    key={step.number}
                                    type="button"
                                    onClick={() => setActiveStep(step.number)}
                                    className="min-w-0 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                                                completed
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : active
                                                      ? 'border-primary bg-primary/10 text-primary'
                                                      : 'border-border bg-muted/40 text-muted-foreground'
                                            }`}
                                        >
                                            {completed && step.number < 3 ? (
                                                <CheckCheck className="size-4" />
                                            ) : (
                                                step.number
                                            )}
                                        </span>

                                        <span
                                            className={`hidden truncate text-sm font-semibold sm:block ${
                                                active
                                                    ? 'text-primary'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>

                                    <div
                                        className={`mt-3 h-1 rounded-full ${
                                            active || completed
                                                ? 'bg-primary'
                                                : 'bg-muted'
                                        }`}
                                    />

                                    <p className="mt-2 truncate text-[11px] text-muted-foreground sm:text-xs">
                                        {step.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Step 1: Confirm Customer */}
                    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveStep(activeStep === 1 ? 0 : 1)
                            }
                            className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 text-left sm:px-5"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
                                    <UserRound className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Step 1. Confirm Customer
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Check the customer details before
                                        uploading.
                                    </p>
                                </div>
                            </div>

                            {stepComplete(1) && (
                                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                            )}
                        </button>

                        {activeStep === 1 && (
                            <div className="space-y-4 p-4 sm:p-5">
                                {/* Compact Customer Banner */}
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
                                >
                                    <div className="relative size-14 shrink-0">
                                        <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-lg font-semibold text-muted-foreground">
                                            {customer.photo?.url ? (
                                                <img
                                                    src={customer.photo.url}
                                                    alt={customer.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                customer.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'C'
                                            )}
                                        </div>
                                        <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                                            <ShieldCheck className="size-3.5" />
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold break-words transition-colors group-hover:text-primary">
                                            {customer.name}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Customer No:{' '}
                                            {customer.customer_no || 'N/A'}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                                {customer.type || 'Customer'}
                                            </span>
                                            <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                                {customer.status ||
                                                    'Unknown status'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <CustomerDetail
                                        icon={Phone}
                                        label="Primary Phone"
                                        value={customer.primary_phone}
                                    />
                                    <CustomerDetail
                                        icon={Mail}
                                        label="Primary Email"
                                        value={customer.primary_email}
                                    />
                                    <CustomerDetail
                                        icon={IdCard}
                                        label="Identification Type"
                                        value={customer.identification_type}
                                    />
                                    <CustomerDetail
                                        icon={ShieldCheck}
                                        label="Identification Number"
                                        value={customer.identification_number}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Make sure this is the correct customer.
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setActiveStep(2)}
                                    >
                                        Confirm & Continue
                                        <ArrowLeft className="ml-2 size-4 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Step 2: Document Type */}
                    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveStep(activeStep === 2 ? 0 : 2)
                            }
                            className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 text-left sm:px-5"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
                                    <FileText className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Step 2. Document Type
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Select the category of identification
                                        document.
                                    </p>
                                </div>
                            </div>

                            {stepComplete(2) && (
                                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                            )}
                        </button>

                        {activeStep === 2 && (
                            <div className="space-y-4 p-4 sm:p-5">
                                <div className="space-y-2">
                                    <Label>
                                        Document Type{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.document_type}
                                        onChange={(value) =>
                                            setData('document_type', value)
                                        }
                                        options={documentTypes}
                                    />
                                    <InputError
                                        message={errors.document_type}
                                    />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Choose the category that best matches
                                        the document you are uploading.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveStep(1)}
                                    >
                                        <ArrowLeft className="mr-2 size-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={!data.document_type}
                                        onClick={() => setActiveStep(3)}
                                    >
                                        Continue to Upload
                                        <ArrowLeft className="ml-2 size-4 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Step 3: Upload and Preview */}
                    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveStep(activeStep === 3 ? 0 : 3)
                            }
                            className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 text-left sm:px-5"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
                                    <FileUp className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Step 3. Upload & Preview
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Attach your file and check the preview.
                                    </p>
                                </div>
                            </div>

                            {stepComplete(3) && (
                                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                            )}
                        </button>

                        {activeStep === 3 && (
                            <div className="space-y-5 p-4 sm:p-5">
                                {/* File Upload */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label>
                                            Document File{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        {data.file && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeSelectedFile}
                                                className="h-8 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="mr-1.5 size-3.5" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        aria-label="Choose a KYC document file"
                                        className="group flex min-h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                                            <FileUp className="size-5" />
                                        </span>
                                        <span className="mt-3 text-sm font-semibold">
                                            {data.file
                                                ? 'Choose a different file'
                                                : 'Click to select a document'}
                                        </span>
                                        <span className="mt-1 text-xs text-muted-foreground">
                                            JPG, PNG, or PDF · Maximum 10 MB
                                        </span>

                                        {data.file && (
                                            <span className="mt-3 flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium">
                                                {isPdf ? (
                                                    <FileText className="size-4 shrink-0 text-primary" />
                                                ) : (
                                                    <FileImage className="size-4 shrink-0 text-primary" />
                                                )}
                                                <span className="min-w-0 break-all">
                                                    {data.file.name}
                                                </span>
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

                                {/* Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label>Document Preview</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {previewUrl
                                                ? isPdf
                                                    ? 'PDF document'
                                                    : 'Image document'
                                                : 'No file selected'}
                                        </span>
                                    </div>

                                    <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
                                        {previewUrl ? (
                                            isPdf ? (
                                                <iframe
                                                    src={previewUrl}
                                                    title="Selected PDF document preview"
                                                    className="h-80 w-full rounded-lg border border-border bg-background"
                                                />
                                            ) : (
                                                <img
                                                    src={previewUrl}
                                                    alt="Selected document preview"
                                                    className="max-h-96 w-full rounded-lg object-contain"
                                                />
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                                <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                                                    <FileImage className="size-5" />
                                                </div>
                                                <p className="text-sm font-medium">
                                                    Preview will appear here
                                                </p>
                                                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                                                    Select a document to review
                                                    it before uploading.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveStep(2)}
                                    >
                                        <ArrowLeft className="mr-2 size-4" />
                                        Previous
                                    </Button>

                                    <p className="text-xs leading-5 text-muted-foreground sm:mx-3 sm:flex-1 sm:text-right">
                                        <ShieldCheck className="mr-1 inline size-3.5" />
                                        Ensure the document is clear and
                                        readable.
                                    </p>

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
                        )}
                    </section>
                </form>

                {/* Bottom Cancel Action */}
                <div className="flex justify-end">
                    <Button variant="ghost" type="button" asChild>
                        <Link href={route('customers.show', customer.id)}>
                            Cancel and Return to Customer
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

const CustomerDetail = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
}) => (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border/60 bg-background p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
            <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium break-words text-foreground">
                {value || 'Not provided'}
            </p>
        </div>
    </div>
);

export default CreateKycDocument;
