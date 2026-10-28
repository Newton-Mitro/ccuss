import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Clock3,
    FileCheck2,
    GitBranch,
    History,
    ShieldCheck,
    UserRound,
    UsersRound,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

import { BorderInfoBox } from '@/components/border-info-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDateTime } from '@/lib/date_util';
import ApprovalActions from '@/modules/customers-kyc/components/approval-actions';
import type { CustomerIntroducer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { BreadcrumbItem, SharedData } from '@/types';

export default function ShowIntroducer() {
    const { props } = usePage<
        SharedData & {
            introducer_request: CustomerIntroducer;
        }
    >();

    const { introducer_request: record } = props;

    useFlashToastHandler();

    const introducedCustomer = record.introduced_customer;
    const introducerCustomer = record.introducer_customer;

    const status = record.verification_status?.toUpperCase() ?? 'UNKNOWN';

    const statusConfig: Record<
        string,
        { label: string; className: string; icon: typeof ShieldCheck }
    > = {
        VERIFIED: {
            label: 'Verified',
            className:
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
            icon: ShieldCheck,
        },
        PENDING: {
            label: 'Pending Review',
            className:
                'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
            icon: Clock3,
        },
        REJECTED: {
            label: 'Rejected',
            className:
                'border-destructive/30 bg-destructive/10 text-destructive',
            icon: XCircle,
        },
    };

    const currentStatus = statusConfig[status] ?? {
        label: status.replaceAll('_', ' '),
        className: 'border-border bg-muted text-muted-foreground',
        icon: FileCheck2,
    };

    const StatusIcon = currentStatus.icon;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: introducedCustomer?.name || `Introducer #${record.id}`,
            href: route('customers.show', record.introduced_customer_id),
        },
        { title: `Introducer #${record.id}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Introducer #${record.id}`} />

            <div className="w-full space-y-4 pb-6">
                {/* Page heading */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                            <GitBranch className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Introducer Verification
                                </h1>
                                <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                                    #{record.id}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Review the customer relationship and manage its
                                verification status.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={route(
                                    'customers.show',
                                    record.introduced_customer_id,
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                Customer Profile
                            </Link>
                        </Button>

                        <Button size="sm" asChild>
                            <Link
                                href={route('customers.introducers.edit', [
                                    record.introduced_customer_id,
                                    record.id,
                                ])}
                            >
                                <FileCheck2 className="size-4" />
                                Edit Record
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryTile
                        icon={<FileCheck2 className="size-4" />}
                        label="Record Reference"
                        value={`#${record.id}`}
                    />

                    <SummaryTile
                        icon={<UsersRound className="size-4" />}
                        label="Relationship"
                        value={record.relationship_type || 'Not specified'}
                    />

                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <StatusIcon className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                                Verification Status
                            </p>
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className={currentStatus.className}
                                >
                                    {currentStatus.label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
                    <div className="min-w-0 space-y-4 xl:col-span-2">
                        {/* Relationship visualization */}
                        <Card className="overflow-hidden rounded-xl border-border shadow-none">
                            <SectionHeading
                                icon={<UsersRound className="size-4" />}
                                title="Customer Relationship"
                                description="Review the introducer and the customer they introduced."
                            />

                            <CardContent className="space-y-3 p-3 sm:p-4">
                                <CustomerProfile
                                    title="Introducer"
                                    subtitle="Existing customer"
                                    customer={introducerCustomer}
                                />

                                <div className="flex items-center gap-3 px-3 py-1 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                                        <ArrowRight className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Relationship type
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold break-words text-foreground">
                                            {record.relationship_type ||
                                                'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                <CustomerProfile
                                    title="Introduced Customer"
                                    subtitle="Customer being introduced"
                                    customer={introducedCustomer}
                                />
                            </CardContent>
                        </Card>

                        {/* Verification details */}
                        <Card className="overflow-hidden rounded-xl border-border shadow-none">
                            <SectionHeading
                                icon={<ShieldCheck className="size-4" />}
                                title="Verification Details"
                                description="Reference information for this relationship."
                            />

                            <CardContent className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4">
                                <BorderInfoBox
                                    label="Relationship Type"
                                    value={record.relationship_type}
                                />
                                <BorderInfoBox
                                    label="Verification Status"
                                    value={currentStatus.label}
                                />
                                <BorderInfoBox
                                    label="Introducer Customer No."
                                    value={
                                        introducerCustomer?.customer_no || '—'
                                    }
                                />
                                <BorderInfoBox
                                    label="Introduced Customer No."
                                    value={
                                        introducedCustomer?.customer_no || '—'
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Review and audit sidebar */}
                    <div className="min-w-0 space-y-4">
                        {status === 'PENDING' && (
                            <Card className="overflow-hidden rounded-xl border-amber-500/30 shadow-none">
                                <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
                                    <Clock3 className="size-4 text-amber-600 dark:text-amber-400" />
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Verification Review
                                    </h2>
                                </div>

                                <CardContent className="space-y-3 p-4">
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Review the customer information and
                                        relationship before approving or
                                        rejecting this record.
                                    </p>

                                    <ApprovalActions
                                        approveUrl={route(
                                            'customers.introducers.approve',
                                            [
                                                record.introduced_customer_id,
                                                record.id,
                                            ],
                                        )}
                                        rejectUrl={route(
                                            'customers.introducers.reject',
                                            [
                                                record.introduced_customer_id,
                                                record.id,
                                            ],
                                        )}
                                        pending
                                        maxRejectionLength={500}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {status === 'VERIFIED' && (
                            <StatusNotice
                                icon={<ShieldCheck className="size-5" />}
                                title="Verification Complete"
                                description="This introducer relationship has been verified."
                                variant="success"
                            />
                        )}

                        {status === 'REJECTED' && (
                            <StatusNotice
                                icon={<XCircle className="size-5" />}
                                title="Record Rejected"
                                description="This introducer relationship was rejected. Review the audit trail for related activity."
                                variant="danger"
                            />
                        )}

                        {/* Audit trail */}
                        <Card className="overflow-hidden rounded-xl border-border shadow-none">
                            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <History className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Audit Trail
                                    </h2>
                                </div>

                                <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                                    {record.audits?.length || 0} records
                                </span>
                            </div>

                            <CardContent className="p-4">
                                {record.audits?.length > 0 ? (
                                    <div className="space-y-4">
                                        {record.audits.map((audit, index) => (
                                            <div
                                                key={audit.id}
                                                className="flex gap-3"
                                            >
                                                <div className="relative flex shrink-0 flex-col items-center">
                                                    <div className="z-10 flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                                                        <Clock3 className="size-3.5" />
                                                    </div>

                                                    {index <
                                                        record.audits.length -
                                                            1 && (
                                                        <div className="absolute top-8 bottom-[-1rem] w-px bg-border" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1 pb-1">
                                                    <p className="text-sm font-medium break-words text-foreground capitalize">
                                                        {audit.event}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <UserRound className="size-3.5 shrink-0" />
                                                        <span className="truncate">
                                                            {audit.user?.name ??
                                                                'System'}
                                                        </span>
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatDateTime(
                                                            audit.created_at,
                                                        )}
                                                    </p>

                                                    {audit.batch_id && (
                                                        <a
                                                            href={route(
                                                                'audits.batch',
                                                                audit.batch_id,
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                        >
                                                            View audit details
                                                            <ArrowRight className="size-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-7 text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <History className="size-5" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-foreground">
                                            No audit records
                                        </p>
                                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                                            Activity for this record will appear
                                            here when available.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

function SectionHeading({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                {icon}
            </div>

            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">
                    {title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function SummaryTile({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold break-words text-foreground">
                    {value}
                </p>
            </div>
        </div>
    );
}

function CustomerProfile({
    title,
    subtitle,
    customer,
}: {
    title: string;
    subtitle: string;
    customer?: any;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-3 sm:p-4">
            <div className="flex items-start gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-14">
                    {customer?.photo?.url ? (
                        <img
                            src={customer.photo.url}
                            alt={customer.name || title}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-primary/5 text-lg font-semibold text-primary">
                            {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                        {title} · {subtitle}
                    </p>

                    {customer?.id ? (
                        <Link
                            href={route('customers.show', customer.id)}
                            className="mt-1 inline-block text-sm font-semibold break-words text-foreground hover:text-primary"
                        >
                            {customer.name}
                        </Link>
                    ) : (
                        <p className="mt-1 text-sm font-semibold break-words text-foreground">
                            {customer?.name ||
                                'Customer information unavailable'}
                        </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                        {customer?.customer_no || 'No customer number'}
                        {customer?.type ? ` · ${customer.type}` : ''}
                    </p>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
                <BorderInfoBox
                    label="Phone"
                    value={customer?.primary_phone || customer?.phone || '—'}
                />
                <BorderInfoBox
                    label="Email"
                    value={customer?.primary_email || customer?.email || '—'}
                />
            </div>
        </div>
    );
}

function StatusNotice({
    icon,
    title,
    description,
    variant,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    variant: 'success' | 'danger';
}) {
    const styles =
        variant === 'success'
            ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
            : 'border-destructive/25 bg-destructive/5 text-destructive';

    return (
        <div className={`flex gap-3 rounded-xl border p-4 ${styles}`}>
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}
