import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    FileCheck2,
    FileImage,
    FileText,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Save,
    ShieldCheck,
    Upload,
    UserRound,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { KycDocument } from '@/modules/customers-kyc/types/customer_kyc_module';
import {
    KYC_DOCUMENT_ACCEPT,
    validateKycDocumentFile,
} from '@/modules/customers-kyc/kyc-documents/data/document-file';
import { documentTypes } from '@/modules/customers-kyc/kyc-documents/data/document_types';

interface Props extends SharedData {
    document: KycDocument;
}

export default function EditKycDocument() {
    const { document } = usePage<Props>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        document.url || null,
    );
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const replacementPreviewUrlRef = useRef<string | null>(null);

    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        customer_id: document.customer_id,
        document_type: document.document_type,
        alt_text: document.alt_text || '',
        file: null as File | null,
    });

    const fileName = data.file?.name ?? null;

    useEffect(() => {
        return () => {
            if (replacementPreviewUrlRef.current) {
                URL.revokeObjectURL(replacementPreviewUrlRef.current);
            }
        };
    }, []);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        const validationError = validateKycDocumentFile(file);
        if (validationError) {
            setData('file', null);
            setFileError(validationError);
            if (replacementPreviewUrlRef.current) {
                URL.revokeObjectURL(replacementPreviewUrlRef.current);
                replacementPreviewUrlRef.current = null;
            }
            setPreviewUrl(document.url || null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFileError(null);
        if (replacementPreviewUrlRef.current) {
            URL.revokeObjectURL(replacementPreviewUrlRef.current);
        }
        const replacementUrl = URL.createObjectURL(file);
        replacementPreviewUrlRef.current = replacementUrl;
        setPreviewUrl(replacementUrl);
        setData('file', file);
    };

    const clearReplacement = () => {
        setData('file', null);
        setFileError(null);
        if (replacementPreviewUrlRef.current) {
            URL.revokeObjectURL(replacementPreviewUrlRef.current);
            replacementPreviewUrlRef.current = null;
        }
        setPreviewUrl(document.url || null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(
            route('customers.kyc-documents.update', [
                document.customer_id,
                document.id,
            ]),
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: document.customer?.name || 'Customer',
            href: route('customers.show', document.customer_id),
        },
        { title: 'Edit KYC Document', href: '' },
    ];

    const isPdf =
        data.file?.name.toLowerCase().endsWith('.pdf') ||
        (!data.file &&
            document.url?.toLowerCase().split('?')[0].endsWith('.pdf'));

    const customer = document.customer;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit KYC Document #${document.id}`} />

            <div className="w-full max-w-6xl space-y-5 pb-24 text-foreground">
                {/* Page heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                            <FileCheck2 className="size-5" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    Edit KYC Document
                                </h1>
                                <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                                    #{document.id}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update document information or replace the
                                existing attachment.
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <Link
                            href={route('customers.kyc-documents.show', [
                                document.customer_id,
                                document.id,
                            ])}
                        >
                            <ArrowLeft className="size-4" />
                            Back to Document
                        </Link>
                    </Button>
                </div>

                {/* Customer context */}
                {customer && (
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                            <UserRound className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">
                                Customer Information
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 p-4">
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                                {customer.photo?.url ? (
                                    <img
                                        src={customer.photo.url}
                                        alt={customer.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-lg font-semibold text-primary">
                                        {customer.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || 'C'}
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="text-sm font-semibold hover:text-primary"
                                >
                                    {customer.name}
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {customer.customer_no || 'Customer'}
                                    {customer.type ? ` · ${customer.type}` : ''}
                                    {customer.status
                                        ? ` · ${customer.status}`
                                        : ''}
                                </p>
                            </div>

                            <div className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs text-primary sm:flex">
                                <ShieldCheck className="size-3.5" />
                                KYC Document
                            </div>
                        </div>
                    </section>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Document information */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <SectionHeading
                            icon={<FileText className="size-4" />}
                            title="Document Information"
                            description="Maintain the document category and descriptive text."
                            step="01"
                        />

                        <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="document_type">
                                    Document Type
                                    <span className="ml-1 text-destructive">
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

                                <InputError message={errors.document_type} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="alt_text">
                                    Alternative Text
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                        (Optional)
                                    </span>
                                </Label>

                                <Input
                                    id="alt_text"
                                    value={data.alt_text}
                                    onChange={(event) =>
                                        setData('alt_text', event.target.value)
                                    }
                                    placeholder="Describe this document"
                                    className="h-10"
                                />

                                <p className="text-xs text-muted-foreground">
                                    A short description to identify the
                                    document.
                                </p>
                                <InputError message={errors.alt_text} />
                            </div>
                        </div>
                    </section>

                    {/* File preview and replacement */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <SectionHeading
                            icon={<ImageIcon className="size-4" />}
                            title="Document Attachment"
                            description="Preview the current file or upload a replacement."
                            step="02"
                        />

                        <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            {/* Preview */}
                            <div className="min-w-0 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Label>Current Preview</Label>
                                    {fileName && (
                                        <span className="max-w-40 truncate rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                                            Replacement selected
                                        </span>
                                    )}
                                </div>

                                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
                                    {previewUrl && !isPdf ? (
                                        <img
                                            src={previewUrl}
                                            alt={
                                                data.alt_text ||
                                                'KYC document preview'
                                            }
                                            className="max-h-80 max-w-full rounded-lg object-contain"
                                        />
                                    ) : previewUrl && isPdf ? (
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                                                <FileText className="size-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    PDF Document
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {fileName ||
                                                        'Existing PDF attachment'}
                                                </p>
                                            </div>
                                            <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                Open PDF in new tab
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
                                                <FileImage className="size-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    No preview available
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Select a replacement file to
                                                    preview it here.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {fileName && (
                                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
                                        <FileText className="size-4 shrink-0 text-primary" />
                                        <span className="min-w-0 flex-1 truncate text-xs">
                                            {fileName}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={clearReplacement}
                                            className="size-8 shrink-0"
                                            aria-label="Remove replacement file"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Upload area */}
                            <div className="min-w-0 space-y-2">
                                <Label>Replace File</Label>

                                <div
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        setIsDragging(false);
                                    }}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        setIsDragging(false);
                                        handleFileChange(
                                            event.dataTransfer.files?.[0] ||
                                                null,
                                        );
                                    }}
                                    className={`flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                                        isDragging
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border bg-background/50 hover:border-primary/40'
                                    }`}
                                >
                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                                        <Upload className="size-6" />
                                    </div>

                                    <h3 className="mt-4 text-sm font-semibold">
                                        Upload a replacement
                                    </h3>
                                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                                        Drag and drop a file here, or browse
                                        your device to choose a new document.
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <FolderOpen className="size-4" />
                                        Choose File
                                    </Button>

                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={KYC_DOCUMENT_ACCEPT}
                                        onChange={(event) =>
                                            handleFileChange(
                                                event.target.files?.[0] || null,
                                            )
                                        }
                                        className="sr-only"
                                    />

                                    <p className="mt-4 text-[11px] text-muted-foreground">
                                        JPG, PNG, or PDF · Maximum 10 MB
                                    </p>
                                </div>

                                <InputError message={errors.file} />
                                {fileError && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {fileError}
                                    </p>
                                )}

                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Leave the replacement empty to keep the
                                    existing attachment.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Action bar */}
                    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:rounded-xl sm:border sm:bg-card sm:px-5 sm:py-4 sm:backdrop-blur-none">
                        <div className="mx-auto flex w-full max-w-6xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Review the document details before saving.
                            </p>

                            <div className="flex w-full gap-2 sm:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    className="flex-1 sm:flex-none"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'customers.kyc-documents.show',
                                            [document.customer_id, document.id],
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 sm:min-w-40 sm:flex-none"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

function SectionHeading({
    icon,
    title,
    description,
    step,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    step: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3.5">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">
                        {title}
                    </h2>
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {step}
                    </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}
