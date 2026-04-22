import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Clock, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
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

    const { document, errors } = props as any;
    const [rejection_reason, setReasonForRejection] = useState('');

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'KYC Documents', href: route('kyc-documents.index') },
        { title: `Document #${document.id}`, href: '' },
    ];

    // 🎯 Status Color
    const statusClass = {
        verified: 'bg-success text-success-foreground',
        rejected: 'bg-destructive text-destructive-foreground',
        pending: 'bg-warning text-warning-foreground',
    }[document.verification_status];

    // 🚀 Actions (optional endpoints)
    const handleApprove = () => {
        router.post(route('kyc-documents.approve', document.id), {});
    };

    const handleReject = () => {
        router.post(route('kyc-documents.reject', document.id), {});
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
                    <div className="">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>

                    <Link
                        href={route('kyc-documents.index')}
                        className="flex items-center gap-1 rounded border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-all hover:bg-secondary/50"
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
                        <div className="relative h-[calc(100vh-16rem)] w-full overflow-hidden rounded-md">
                            <ReactPanZoom
                                image={document.url}
                                alt={document.document_type}
                            />
                        </div>
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

                    {/* basic INFO */}
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
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold">Audit Trail</p>
                            <span className="text-xs text-muted-foreground">
                                {document?.audits?.length || 0} records
                            </span>
                        </div>

                        {/* Content */}
                        {document?.audits?.length > 0 ? (
                            <div className="space-y-4">
                                {document.audits.map((audit) => (
                                    <a
                                        key={audit.id}
                                        href={route(
                                            'audits.batch',
                                            audit.batch_id,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-between rounded-md border bg-card px-3 py-2 text-xs transition hover:border-primary/40 hover:shadow-sm"
                                    >
                                        {/* Left: Event + User */}
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="truncate capitalize">
                                                {`${audit.event} by`}
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                <span className="max-w-[80px] truncate">
                                                    {audit.user?.name ?? 'SYS'}
                                                </span>
                                            </span>
                                        </div>

                                        {/* Right: Time */}
                                        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                                            <Clock size={10} />
                                            <span>
                                                {formatDateTime(
                                                    audit.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                                No audit records found.
                            </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    {document.verification_status === 'pending' && (
                        <div className="flex gap-2 rounded-md border bg-card p-4">
                            <div className="">
                                <Input
                                    type="text"
                                    placeholder="Action Reason"
                                    value={rejection_reason}
                                    onChange={(e) =>
                                        setReasonForRejection(e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors?.rejection_reason}
                                />
                            </div>
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
