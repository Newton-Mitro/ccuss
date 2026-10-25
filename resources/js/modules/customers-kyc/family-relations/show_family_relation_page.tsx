import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Clock,
    ShieldCheck,
    User,
    UserIcon,
} from 'lucide-react';

import { route } from 'ziggy-js';
import { BorderInfoBox } from '@/components/border-info-box';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDateTime } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import type {
    Customer,
    CustomerFamilyRelation,
} from '@/modules/customers-kyc/types/customer_kyc_module';
import ApprovalActions from '@/modules/customers-kyc/components/approval-actions';

export default function ShowFamilyRelation() {
    const { familyRelation } = usePage<
        SharedData & { familyRelation: CustomerFamilyRelation }
    >().props;

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title:
                familyRelation.customer?.name ||
                `Relation #${familyRelation.id}`,
            href: route('customers.show', familyRelation.customer_id),
        },
        { title: `Relation #${familyRelation.id}`, href: '' },
    ];

    // 🎯 Status badge mapping
    const STATUS_MAP = {
        verified: {
            label: 'Verified',
            class: 'bg-success text-success-foreground',
        },
        pending: {
            label: 'Pending',
            class: 'bg-warning text-warning-foreground',
        },
        rejected: {
            label: 'Rejected',
            class: 'bg-destructive text-destructive-foreground',
        },
    } as const;

    const verificationStatus =
        familyRelation.verification_status?.toLowerCase() ?? 'unknown';
    const statusClass =
        STATUS_MAP[verificationStatus as keyof typeof STATUS_MAP]?.class ??
        'bg-muted text-muted-foreground';

    const statusLabel =
        STATUS_MAP[verificationStatus as keyof typeof STATUS_MAP]?.label ??
        'Unknown';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Family Relation #${familyRelation.id}`} />

            <div className="w-full max-w-7xl space-y-5 pb-6">
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <HeadingSmall
                                    title="Family Relation Review"
                                    description="Review customer and relative details, and manage verification."
                                />
                                <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                                    #{familyRelation.id}
                                </span>
                            </div>
                            <Badge
                                className={`mt-2 rounded px-2 py-1 text-xs ${statusClass}`}
                            >
                                {statusLabel}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={route(
                                    'customers.show',
                                    familyRelation.customer_id,
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                Customer Profile
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link
                                href={route('customers.family-relations.edit', [
                                    familyRelation.customer_id,
                                    familyRelation.id,
                                ])}
                            >
                                <CheckCheck className="size-4" />
                                Edit Relation
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
                    <div className="space-y-4">
                        {/* Customer Info */}
                        <Card className="rounded-xl border border-border bg-card shadow-sm">
                            <CardContent className="space-y-3">
                                <p className="flex items-center gap-2 text-sm font-semibold">
                                    <UserIcon className="size-4 text-primary" />{' '}
                                    Customer Information
                                </p>

                                <div className="flex items-center gap-4">
                                    <Avatar
                                        name={familyRelation.customer?.name}
                                        photo={
                                            familyRelation.customer?.photo?.url
                                        }
                                    />
                                    <CustomerDetails
                                        customer={familyRelation.customer}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relative Info */}
                        <Card className="rounded-xl border border-border bg-card shadow-sm">
                            <CardContent className="space-y-3">
                                <p className="flex items-center gap-2 text-sm font-semibold">
                                    <UserIcon className="size-4 text-primary" />{' '}
                                    Relative Information
                                </p>

                                <div className="flex items-center gap-4">
                                    <Avatar
                                        name={familyRelation.relative?.name}
                                        photo={
                                            familyRelation.relative?.photo?.url
                                        }
                                    />
                                    <CustomerDetails
                                        customer={familyRelation.relative}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relation Info */}
                        <Card className="rounded-xl border border-border bg-card shadow-sm">
                            <CardContent className="space-y-2">
                                <p className="flex items-center gap-1 text-sm font-medium">
                                    <ShieldCheck className="h-4 w-4" /> Relation
                                    Info
                                </p>
                                <BorderInfoBox
                                    label="Relation Type"
                                    value={familyRelation.relation_type.replaceAll(
                                        '_',
                                        ' ',
                                    )}
                                />
                                <Badge
                                    className={`rounded px-2 py-1 text-xs ${statusClass}`}
                                >
                                    {statusLabel}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <p className="text-sm font-semibold">
                                    Audit Trail
                                </p>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    {familyRelation?.audits?.length || 0}{' '}
                                    records
                                </span>
                            </div>

                            {/* Content */}
                            {familyRelation?.audits?.length > 0 ? (
                                <div className="space-y-2 p-4">
                                    {familyRelation.audits.map((audit) => (
                                        <a
                                            key={audit.id}
                                            href={route(
                                                'audits.batch',
                                                audit.batch_id,
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs transition hover:border-primary/40"
                                        >
                                            {/* Left: Event + User */}
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="truncate capitalize">
                                                    {`${audit.event} by`}
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <User size={12} />
                                                    <span className="max-w-20 truncate">
                                                        {audit.user?.name ??
                                                            'SYS'}
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
                                <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                                    No audit records found.
                                </div>
                            )}
                        </div>
                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border px-4 py-3">
                                <h2 className="text-sm font-semibold">
                                    Verification Decision
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Approve the relation or reject it with a
                                    reason.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 p-4">
                                <ApprovalActions
                                    approveUrl={route(
                                        'customers.family-relations.approve',
                                        [
                                            familyRelation.customer_id,
                                            familyRelation.id,
                                        ],
                                    )}
                                    rejectUrl={route(
                                        'customers.family-relations.reject',
                                        [
                                            familyRelation.customer_id,
                                            familyRelation.id,
                                        ],
                                    )}
                                    pending={verificationStatus === 'pending'}
                                />
                                {verificationStatus !== 'pending' && (
                                    <Badge
                                        className={`rounded px-2 py-1 text-xs ${statusClass}`}
                                    >
                                        {statusLabel}
                                    </Badge>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

/* ---------------- Helper Components ---------------- */
function Avatar({ name, photo }: { name?: string; photo?: string }) {
    return (
        <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
            {photo ? (
                <img
                    src={photo}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                    {name?.charAt(0)}
                </div>
            )}
        </div>
    );
}

function CustomerDetails({ customer }: { customer?: Customer | null }) {
    return (
        <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-info underline">
                {customer?.id ? (
                    <Link href={route('customers.show', customer.id)}>
                        {customer.name}{' '}
                    </Link>
                ) : (
                    customer?.name || '—'
                )}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
                {customer?.type} • {customer?.status}
            </p>
            <p className="text-xs text-muted-foreground">
                {[
                    customer?.customer_no,
                    customer?.primary_email,
                    customer?.primary_phone,
                ]
                    .filter(Boolean)
                    .join(' • ') || '—'}
            </p>
        </div>
    );
}
