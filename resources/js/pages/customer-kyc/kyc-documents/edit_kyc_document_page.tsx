import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { KycDocument } from '../../../types/customer_kyc_module';
import { documentTypes } from './data/document_types';

interface Props extends SharedData {
    document: KycDocument;
}

export default function EditKycDocument() {
    const { document } = usePage<Props>().props;
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        document.url || null,
    );

    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        customer_id: document.customer_id,
        document_type: document.document_type,
        alt_text: document.alt_text || '',
        file: null as File | null,
    });

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        setData('file', file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (event: React.FormEvent) => {
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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit KYC Document #${document.id}`} />

            <div className="space-y-4 text-foreground">
                <div className="flex items-center justify-between gap-3">
                    <HeadingSmall
                        title="Edit KYC Document"
                        description="Update document details or replace the file."
                    />
                    <Link
                        href={route('customers.kyc-documents.show', [
                            document.customer_id,
                            document.id,
                        ])}
                        className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-2xl space-y-4 rounded-md border bg-card p-4 sm:p-6"
                >
                    <div>
                        <Label>Document Type</Label>
                        <Select
                            value={data.document_type}
                            onChange={(value) =>
                                setData('document_type', value)
                            }
                            options={documentTypes}
                        />
                        <InputError message={errors.document_type} />
                    </div>

                    <div>
                        <Label>Alt Text</Label>
                        <input
                            value={data.alt_text}
                            onChange={(event) =>
                                setData('alt_text', event.target.value)
                            }
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        />
                        <InputError message={errors.alt_text} />
                    </div>

                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt={data.alt_text || 'Document preview'}
                            className="h-40 w-40 rounded-md border object-cover"
                        />
                    )}

                    <div>
                        <Label>Replace File</Label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(event) =>
                                handleFileChange(
                                    event.target.files?.[0] || null,
                                )
                            }
                            className="block w-full text-sm text-muted-foreground"
                        />
                        <InputError message={errors.file} />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCheck />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
