import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    CheckCheck,
    Clock,
    ExternalLink,
    FlipHorizontal2,
    FileCheck2,
    FileImage,
    FileText,
    History,
    Maximize2,
    Minus,
    Plus,
    RotateCcw,
    ShieldCheck,
    User,
    UserRound,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { PanViewer } from 'react-image-pan-zoom-rotate';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDateTime } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { KycDocument } from '@/modules/customers-kyc/types/customer_kyc_module';
import ApprovalActions from '@/modules/customers-kyc/components/approval-actions';

const Show = () => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [viewerKey, setViewerKey] = useState(0);

    const { props } = usePage<
        SharedData & {
            document: KycDocument;
        }
    >();

    const { document } = props;

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: document.customer?.name || `Document #${document.id}`,
            href: route('customers.show', document.customer_id),
        },
        { title: `Document #${document.id}`, href: '' },
    ];

    const status = document.verification_status?.toUpperCase() ?? 'PENDING';

    const statusConfig = {
        VERIFIED: {
            label: 'Verified',
            icon: CheckCheck,
            className: 'border-success/25 bg-success/10 text-success',
        },
        REJECTED: {
            label: 'Rejected',
            icon: XCircle,
            className:
                'border-destructive/25 bg-destructive/10 text-destructive',
        },
        PENDING: {
            label: 'Pending review',
            icon: Clock,
            className: 'border-warning/30 bg-warning/10 text-warning',
        },
    } as const;

    const currentStatus =
        statusConfig[status as keyof typeof statusConfig] ??
        statusConfig.PENDING;

    const StatusIcon = currentStatus.icon;
    const customer = document.customer;
    const audits = document.audits ?? [];

    const isImage = document.mime?.startsWith('image/');
    const isPdf = document.mime === 'application/pdf';

    const resetImage = () => {
        setZoom(1);
        setRotation(0);
        setFlipped(false);
        setViewerKey((key) => key + 1);
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`KYC Document #${document.id}`} />

            <div className="mx-auto w-full max-w-420 space-y-6 pb-8">
                {/* Page heading */}
                <div className="flex flex-col gap-5 rounded-2xl border border-border bg-linear-to-br from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Document review
                                </h1>
                                <span className="rounded-md border border-border/80 bg-background/70 px-2 py-1 font-mono text-xs text-muted-foreground">
                                    #{document.id}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Review the submitted document and verify the
                                customer's identity.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${currentStatus.className}`}
                                >
                                    <StatusIcon className="size-3.5" />
                                    {currentStatus.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Uploaded{' '}
                                    {formatDateTime(document.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="shrink-0 bg-background/70"
                        asChild
                    >
                        <Link
                            href={route('customers.show', document.customer_id)}
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Back to customer
                        </Link>
                    </Button>
                </div>

                {/* Review workspace */}
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.8fr)]">
                    {/* Document preview */}
                    <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    {isImage ? (
                                        <FileImage className="size-4" />
                                    ) : (
                                        <FileText className="size-4" />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Document preview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {document.document_type}
                                        {document.mime
                                            ? ` · ${document.mime}`
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            {document.url && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 size-3.5" />
                                        Open original
                                    </a>
                                </Button>
                            )}
                        </div>

                        <div className="min-h-105 bg-neutral-950 p-3 sm:min-h-150 sm:p-5">
                            {isImage && document.url ? (
                                <div className="flex h-[60vh] max-h-212.5 min-h-100 gap-3 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 p-3">
                                    <div className="min-w-0 flex-1 overflow-hidden rounded-lg bg-white">
                                        <PanViewer
                                            key={viewerKey}
                                            width="100%"
                                            height="100%"
                                            zoom={zoom}
                                            setZoom={setZoom}
                                            className="h-full w-full"
                                        >
                                            <img
                                                src={document.url}
                                                alt={document.document_type}
                                                className="size-full object-contain"
                                                style={{
                                                    transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`,
                                                }}
                                            />
                                        </PanViewer>
                                    </div>

                                    <div
                                        className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-neutral-800 p-1"
                                        aria-label="Image controls"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 text-white hover:bg-white/10 hover:text-white"
                                            aria-label="Zoom in"
                                            title="Zoom in"
                                            onClick={() =>
                                                setZoom((value) =>
                                                    Math.min(value + 0.2, 4),
                                                )
                                            }
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 text-white hover:bg-white/10 hover:text-white"
                                            aria-label="Zoom out"
                                            title="Zoom out"
                                            onClick={() =>
                                                setZoom((value) =>
                                                    Math.max(value - 0.2, 1),
                                                )
                                            }
                                        >
                                            <Minus className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 text-white hover:bg-white/10 hover:text-white"
                                            aria-label="Rotate image"
                                            title="Rotate image"
                                            onClick={() =>
                                                setRotation(
                                                    (value) => (value + 90) % 360,
                                                )
                                            }
                                        >
                                            <RotateCcw className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 text-white hover:bg-white/10 hover:text-white"
                                            aria-label="Flip image"
                                            title="Flip image"
                                            onClick={() =>
                                                setFlipped((value) => !value)
                                            }
                                        >
                                            <FlipHorizontal2 className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 text-white hover:bg-white/10 hover:text-white"
                                            aria-label="Reset image"
                                            title="Reset image"
                                            onClick={resetImage}
                                        >
                                            <Maximize2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : isPdf && document.url ? (
                                <iframe
                                    src={document.url}
                                    title={`KYC document ${document.id}`}
                                    className="h-[60vh] min-h-125 w-full rounded-xl border border-white/10 bg-white"
                                />
                            ) : (
                                <div className="flex min-h-100 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/20 bg-neutral-900 px-6 py-12 text-center text-white">
                                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                        <FileText className="size-8" />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold">
                                            Preview unavailable
                                        </h3>
                                        <p className="max-w-sm text-sm text-neutral-300">
                                            This file type cannot be previewed
                                            here. Open the original file to
                                            review it.
                                        </p>
                                    </div>

                                    {(document.url || document.file_path) && (
                                        <Button variant="outline" asChild>
                                            <a
                                                href={
                                                    document.url ||
                                                    document.file_path
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="mr-2 size-4" />
                                                Open document
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground sm:px-5">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5" />
                                Customer verification document
                            </span>
                            <span>Document ID: #{document.id}</span>
                        </div>
                    </section>

                    {/* Details sidebar */}
                    <aside className="min-w-0 space-y-4 xl:sticky xl:top-4">
                        {/* Customer profile */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <div className="border-b border-border px-4 py-3">
                                <h2 className="text-sm font-semibold">
                                    Customer information
                                </h2>
                            </div>

                            <div className="space-y-4 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                        {customer?.photo?.url ? (
                                            <img
                                                src={customer.photo.url}
                                                alt={
                                                    customer.name ?? 'Customer'
                                                }
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <UserRound className="size-6" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        {customer ? (
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    customer.id,
                                                )}
                                                className="inline-flex max-w-full items-center gap-1 text-sm font-semibold text-foreground hover:text-primary"
                                            >
                                                <span className="truncate">
                                                    {customer.name}
                                                </span>
                                                <ArrowUpRight className="size-3.5 shrink-0" />
                                            </Link>
                                        ) : (
                                            <p className="text-sm font-medium">
                                                Customer unavailable
                                            </p>
                                        )}

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {customer?.customer_no ||
                                                'No customer number'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {[customer?.type, customer?.status]
                                                .filter(Boolean)
                                                .join(' · ') || '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-lg bg-muted/40 p-3">
                                    <DetailRow
                                        label="Email"
                                        value={customer?.primary_email}
                                    />
                                    <DetailRow
                                        label="Phone"
                                        value={customer?.primary_phone}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Document details */}
                        <section className="rounded-xl border border-border bg-card">
                            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                                <FileCheck2 className="size-4 text-primary" />
                                <h2 className="text-sm font-semibold">
                                    Document details
                                </h2>
                            </div>

                            <div className="space-y-4 p-4">
                                <DetailRow
                                    label="Document type"
                                    value={document.document_type}
                                />
                                <DetailRow
                                    label="Verification status"
                                    value={currentStatus.label}
                                />
                                <DetailRow
                                    label="Uploaded on"
                                    value={formatDateTime(document.created_at)}
                                />
                                {document.updated_at && (
                                    <DetailRow
                                        label="Last updated"
                                        value={formatDateTime(
                                            document.updated_at,
                                        )}
                                    />
                                )}
                            </div>
                        </section>

                        {/* Verification actions */}
                        {status === 'PENDING' && (
                            <section className="overflow-hidden rounded-xl border border-border bg-card">
                                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                                    <ShieldCheck className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Verification decision
                                    </h2>
                                </div>

                                <div className="space-y-4 p-4">
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Review the document carefully before
                                        approving it. If it does not meet
                                        requirements, provide a rejection
                                        reason.
                                    </p>

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                        <ApprovalActions
                                            approveUrl={route(
                                                'customers.kyc-documents.approve',
                                                [
                                                    document.customer_id,
                                                    document.id,
                                                ],
                                            )}
                                            rejectUrl={route(
                                                'customers.kyc-documents.reject',
                                                [
                                                    document.customer_id,
                                                    document.id,
                                                ],
                                            )}
                                            pending
                                            maxRejectionLength={500}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}
                    </aside>
                </div>

                {/* Audit trail */}
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <History className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Activity history
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Recorded actions for this document
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {audits.length} records
                        </span>
                    </div>

                    {audits.length > 0 ? (
                        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                            {audits.map((audit) => (
                                <article
                                    key={audit.id}
                                    className="flex min-w-0 gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                        <History className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <p className="text-sm font-medium text-foreground capitalize">
                                            {audit.event}
                                        </p>
                                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <User className="size-3.5 shrink-0" />
                                            <span className="truncate">
                                                {audit.user?.name ?? 'System'}
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="size-3.5 shrink-0" />
                                            <span>
                                                {formatDateTime(
                                                    audit.created_at,
                                                )}
                                            </span>
                                        </p>
                                        {audit.batch_id && (
                                            <a
                                                href={route(
                                                    'audits.batch',
                                                    audit.batch_id,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary hover:underline"
                                            >
                                                View audit details
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <History className="size-5" />
                            </div>
                            <p className="text-sm font-medium">
                                No audit records
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Document activity will appear here.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
};

const DetailRow = ({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium wrap-break-word text-foreground">
            {value || '—'}
        </span>
    </div>
);

export default Show;
