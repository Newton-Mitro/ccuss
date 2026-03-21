import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, XCircle } from 'lucide-react';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { KycDocument } from '../../../types/customer_kyc_module';

const Show = () => {
    const { props } = usePage<
        SharedData & {
            document: KycDocument;
        }
    >();

    const { document, flash } = props as any;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'KYC Documents', href: route('kyc-documents.index') },
        { title: `Document #${document.id}`, href: '' },
    ];

    // 🎯 Status Color
    const statusClass = {
        VERIFIED: 'bg-success text-success-foreground',
        REJECTED: 'bg-destructive text-destructive-foreground',
        PENDING: 'bg-warning text-warning-foreground',
    }[document.verification_status];

    // 🚀 Actions (optional endpoints)
    const handleApprove = () => {
        router.post(
            route('kyc-documents.approve', document.id),
            {},
            {
                onSuccess: () => toast.success('Document approved'),
            },
        );
    };

    const handleReject = () => {
        router.post(
            route('kyc-documents.reject', document.id),
            {},
            {
                onSuccess: () => toast.success('Document rejected'),
            },
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`KYC Document #${document.id}`} />

            {/* HEADER */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={`KYC Document #${document.id}`}
                    description="Review and verify customer document."
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href={route('kyc-documents.index')}
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/90"
                    >
                        Documents
                    </Link>
                </div>
            </div>

            {/* CONTENT */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* LEFT: DOCUMENT PREVIEW */}
                <div className="col-span-2 space-y-4 rounded-md border bg-card p-4">
                    <p className="text-sm font-medium">Document Preview</p>

                    {document.mime?.startsWith('image') && (
                        <img
                            src={document.url}
                            alt={document.alt_text || 'Document'}
                            className="max-h-[500px] w-full rounded-md border object-contain"
                        />
                    )}

                    {document.mime === 'application/pdf' && (
                        <iframe
                            src={document.url}
                            className="h-[500px] w-full rounded-md border"
                        />
                    )}

                    {!document.mime && (
                        <a
                            href={document.file_path}
                            target="_blank"
                            className="text-primary underline"
                        >
                            Open File
                        </a>
                    )}
                </div>

                {/* RIGHT: DETAILS */}
                <div className="space-y-4">
                    {/* STATUS CARD */}
                    <div className="space-y-2 rounded-md border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <span
                            className={`rounded px-2 py-1 text-xs ${statusClass}`}
                        >
                            {document.verification_status}
                        </span>
                    </div>

                    {/* BASIC INFO */}
                    <div className="space-y-2 rounded-md border bg-card p-4">
                        <p className="text-sm font-medium">Details</p>

                        <div className="mt-3 flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {document.customer?.photo?.url ? (
                                    <img
                                        src={document.customer?.photo.url}
                                        alt={document.customer?.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {document.customer?.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {document.customer ? (
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    document.customer.id,
                                                )}
                                                className="text-info underline"
                                            >
                                                {document.customer.name}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {document.customer?.type} •{' '}
                                        {document.customer?.kyc_status}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        {document.customer?.customer_no} •{' '}
                                        {document.customer?.email} •{' '}
                                        {document.customer?.phone}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Document Type
                            </p>
                            <p className="text-sm">{document.document_type}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Uploaded At
                            </p>
                            <p className="text-sm">
                                {formatDateTime(document.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* VERIFICATION */}
                    <div className="space-y-2 rounded-md border bg-card p-4">
                        <p className="text-sm font-medium">Verification</p>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Verified By
                            </p>
                            <p className="text-sm">
                                {document.verifier?.name ?? '—'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Verified At
                            </p>
                            <p className="text-sm">
                                {formatDateTime(document.verified_at) ?? '—'}
                            </p>
                        </div>

                        {document.remarks && (
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="text-sm">{document.remarks}</p>
                            </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    {document.verification_status === 'PENDING' && (
                        <div className="flex gap-2 rounded-md border bg-card p-4">
                            <Button
                                onClick={handleApprove}
                                className="bg-success text-success-foreground hover:bg-success/90"
                            >
                                <CheckCheck className="mr-1 h-4 w-4" />
                                Approve
                            </Button>

                            <Button
                                onClick={handleReject}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default Show;
