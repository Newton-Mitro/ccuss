import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
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
import type { BreadcrumbItem } from '@/types';

import {
    KYC_DOCUMENT_ACCEPT,
    validateKycDocumentFile,
} from '@/modules/customers-kyc/kyc-documents/data/document-file';
import { documentTypes } from '@/modules/customers-kyc/kyc-documents/data/document_types';
import type { Props } from '@/modules/customers-kyc/types/kyc-documents/edit_kyc_document_page.interfaces';

export default function EditKycDocument() {
    const { document } = usePage<Props>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replacementPreviewUrlRef = useRef<string | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        document.url || null,
    );
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        customer_id: document.customer_id,
        document_type: document.document_type,
        alt_text: document.alt_text || '',
        file: null as File | null,
    });

    const fileName = data.file?.name ?? null;
    const customer = document.customer;

    useEffect(() => {
        return () => {
            if (replacementPreviewUrlRef.current) {
                URL.revokeObjectURL(replacementPreviewUrlRef.current);
            }
        };
    }, []);

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

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

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
        { title: 'Customer & KYC', href: '/customer-kyc' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer?.name || 'Customer',
            href: route('customers.show', document.customer_id),
        },
        { title: 'Edit KYC Document', href: '' },
    ];

    const currentUrlIsPdf = document.url
        ?.toLowerCase()
        .split('?')[0]
        .endsWith('.pdf');

    const isPdf = data.file
        ? data.file.name.toLowerCase().endsWith('.pdf')
        : currentUrlIsPdf;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit KYC Document #${document.id}`} />

            <div className="w-full space-y-4 pb-28 text-foreground sm:pb-6">
                {/* Page heading */}
                <div
                    data-slot="customer-page-header"
                    className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            data-slot="customer-page-header-icon"
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
                        >
                            <FileCheck2 className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    Edit KYC Document
                                </h1>
                                <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
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

                {/* Customer information */}
                {customer && (
                    <section className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                            <UserRound className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">
                                Customer Information
                            </h2>
                        </div>

                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                            <CustomerAvatar
                                name={customer.name}
                                photoUrl={customer.photo?.url}
                            />

                            <div className="min-w-0 flex-1">
                                <Link
                                    href={route('customers.show', customer.id)}
                                    className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
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

                            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary">
                                <ShieldCheck className="size-3.5" />
                                KYC Document
                            </div>
                        </div>
                    </section>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="min-w-0 space-y-5 xl:col-start-1">
                        {/* Document information */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <SectionHeading
                                icon={<FileText className="size-4" />}
                                title="Document Information"
                                description="Maintain the document category and descriptive text."
                                step="01"
                            />

                            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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

                                    <InputError
                                        message={errors.document_type}
                                    />
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
                                            setData(
                                                'alt_text',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Describe this document"
                                        className="h-9"
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        A short description to help identify the
                                        document.
                                    </p>

                                    <InputError message={errors.alt_text} />
                                </div>
                            </div>
                        </section>

                        {/* Document attachment */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <SectionHeading
                                icon={<ImageIcon className="size-4" />}
                                title="Document Attachment"
                                description="Preview the current file or upload a replacement."
                                step="02"
                            />

                            <div className="p-4">
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
                                        className={`flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors sm:min-h-72 ${
                                            isDragging
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border bg-background hover:border-primary/40'
                                        }`}
                                    >
                                        <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-primary">
                                            <Upload className="size-6" />
                                        </div>

                                        <h3 className="mt-4 text-sm font-semibold">
                                            Upload a replacement
                                        </h3>

                                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                                            Drag and drop a file here, or browse
                                            your device to choose a new
                                            document.
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
                                                    event.target.files?.[0] ||
                                                        null,
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
                                        No replacement is required if you want
                                        to keep the existing attachment.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="min-w-0 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1 xl:self-start">
                        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                            KYC document
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Document preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-primary">
                                        {previewUrl && !isPdf ? (
                                            <img
                                                src={previewUrl}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <FileText className="size-5" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold break-words">
                                            {data.alt_text || 'KYC document'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {data.document_type}
                                            {isPdf
                                                ? ' · PDF document'
                                                : ' · Image document'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-3">
                                    {previewUrl && !isPdf ? (
                                        <img
                                            src={previewUrl}
                                            alt={
                                                data.alt_text ||
                                                'KYC document preview'
                                            }
                                            className="max-h-96 w-full rounded-lg object-contain"
                                        />
                                    ) : previewUrl && isPdf ? (
                                        <iframe
                                            src={previewUrl}
                                            title={`${data.alt_text || 'KYC document'} PDF preview`}
                                            className="h-96 w-full rounded-lg border border-border bg-background"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <FileImage className="size-8 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    No preview available
                                                </p>
                                                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                                                    Select a replacement file to
                                                    preview it here.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {fileName && (
                                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
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
                        </section>
                    </aside>

                    {/* Action bar */}
                    <div
                        data-slot="mobile-page-action-bar"
                        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:rounded-xl sm:border sm:bg-card sm:px-4 sm:py-3 sm:backdrop-blur-none xl:col-span-2"
                    >
                        <div className="mx-auto flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                                <ShieldCheck className="size-4" />
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

function CustomerAvatar({
    name,
    photoUrl,
}: {
    name?: string | null;
    photoUrl?: string | null;
}) {
    return (
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name || 'Customer'}
                    className="size-full object-cover"
                />
            ) : (
                <span className="text-lg font-semibold text-primary">
                    {name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
            )}
        </div>
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
        <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3">
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
