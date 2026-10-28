import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Clock,
    GitBranch,
    ShieldCheck,
    User,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { route } from 'ziggy-js';

import { BorderInfoBox } from '@/components/border-info-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDateTime } from '@/lib/date_util';
import ApprovalActions from '@/modules/customers-kyc/components/approval-actions';
import type {
    Customer,
    CustomerFamilyRelation,
} from '@/modules/customers-kyc/types/customer_kyc_module';
import type { BreadcrumbItem, SharedData } from '@/types';

const STATUS_MAP = {
    verified: {
        label: 'Verified',
        className: 'border-success/30 bg-success/10 text-success',
    },
    pending: {
        label: 'Pending',
        className: 'border-warning/30 bg-warning/10 text-warning',
    },
    rejected: {
        label: 'Rejected',
        className: 'border-destructive/30 bg-destructive/10 text-destructive',
    },
} as const;

type StatusKey = keyof typeof STATUS_MAP;

function SectionHeader({
    icon: Icon,
    title,
    trailing,
}: {
    icon: React.ElementType;
    title: string;
    trailing?: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-3 py-2.5 sm:px-4">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>
            <h2 className="min-w-0 flex-1 text-sm font-semibold">{title}</h2>
            {trailing}
        </div>
    );
}

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

    const verificationStatus =
        familyRelation.verification_status?.toLowerCase() ?? 'unknown';

    const status = STATUS_MAP[verificationStatus as StatusKey] ?? {
        label: 'Unknown',
        className: 'border-border bg-muted text-muted-foreground',
    };

    const audits = familyRelation.audits ?? [];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Family Relation #${familyRelation.id}`} />

            <div className="w-full space-y-4 pb-6">
                {/* Page header */}
                <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-semibold tracking-tight">
                                    Family Relation Review
                                </h1>
                                <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                                    #{familyRelation.id}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Review customer details and manage verification.
                            </p>
                            <div className="mt-1.5">
                                <Badge
                                    variant="outline"
                                    className={`rounded-md px-2 py-0.5 text-[11px] ${status.className}`}
                                >
                                    {status.label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full sm:w-auto"
                        >
                            <Link
                                href={route(
                                    'customers.show',
                                    familyRelation.customer_id,
                                )}
                            >
                                <ArrowLeft className="mr-1.5 size-4" />
                                Customer Profile
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full sm:w-auto"
                        >
                            <Link
                                href={route('customers.family-relations.edit', [
                                    familyRelation.customer_id,
                                    familyRelation.id,
                                ])}
                            >
                                <CheckCheck className="mr-1.5 size-4" />
                                Edit Relation
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main content */}
                <div className="grid min-w-0 gap-3.5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                    <div className="min-w-0 space-y-3.5">
                        {/* Customer information */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={UserRound}
                                title="Customer Information"
                            />
                            <div className="p-3 sm:p-3.5">
                                <CustomerDetails
                                    customer={familyRelation.customer}
                                />
                            </div>
                        </section>

                        {/* Relative information */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={UsersRound}
                                title="Relative Information"
                            />
                            <div className="p-3 sm:p-3.5">
                                <CustomerDetails
                                    customer={familyRelation.relative}
                                />
                            </div>
                        </section>

                        {/* Relationship details */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={GitBranch}
                                title="Relationship Details"
                                trailing={
                                    <Badge
                                        variant="outline"
                                        className={`rounded-md px-2 py-0.5 text-[11px] ${status.className}`}
                                    >
                                        {status.label}
                                    </Badge>
                                }
                            />

                            <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-3.5">
                                <BorderInfoBox
                                    label="Relation Type"
                                    value={familyRelation.relation_type.replaceAll(
                                        '_',
                                        ' ',
                                    )}
                                />
                                <BorderInfoBox
                                    label="Verification Status"
                                    value={status.label}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Audit and verification sidebar */}
                    <div className="min-w-0 space-y-3.5">
                        {/* Audit trail */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={Clock}
                                title="Audit Trail"
                                trailing={
                                    <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                        {audits.length}{' '}
                                        {audits.length === 1
                                            ? 'record'
                                            : 'records'}
                                    </span>
                                }
                            />

                            {audits.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {audits.map((audit) => (
                                        <a
                                            key={audit.id}
                                            href={route(
                                                'audits.batch',
                                                audit.batch_id,
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/30 sm:px-3.5"
                                        >
                                            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary">
                                                <Clock className="size-3.5" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium capitalize">
                                                    {audit.event}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                                                    <User className="size-3 shrink-0" />
                                                    <span className="truncate">
                                                        {audit.user?.name ??
                                                            'SYS'}
                                                    </span>
                                                </p>
                                            </div>

                                            <time className="shrink-0 text-right text-[10px] leading-5 text-muted-foreground">
                                                {formatDateTime(
                                                    audit.created_at,
                                                )}
                                            </time>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-7 text-center">
                                    <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Clock className="size-4" />
                                    </div>
                                    <p className="text-xs font-medium">
                                        No audit records
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Changes to this relation will appear
                                        here.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Verification decision */}
                        <section className="overflow-hidden rounded-lg border border-border bg-card">
                            <SectionHeader
                                icon={ShieldCheck}
                                title="Verification Decision"
                            />

                            <div className="space-y-3 p-3 sm:p-3.5">
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Approve this family relation or reject it
                                    with a reason.
                                </p>

                                {verificationStatus === 'pending' ? (
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
                                        pending
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
                                        <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium">
                                                Verification completed
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                Current status: {status.label}
                                            </p>
                                        </div>
                                    </div>
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
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted sm:size-14">
            {photo ? (
                <img
                    src={photo}
                    alt={name ?? 'Customer'}
                    className="size-full object-cover"
                />
            ) : (
                <span className="text-base font-semibold text-muted-foreground">
                    {name?.charAt(0)?.toUpperCase() ?? '—'}
                </span>
            )}
        </div>
    );
}

function CustomerDetails({ customer }: { customer?: Customer | null }) {
    const details = [
        {
            label: 'Customer No.',
            value: customer?.customer_no,
        },
        {
            label: 'Phone',
            value: customer?.primary_phone,
        },
        {
            label: 'Email',
            value: customer?.primary_email,
        },
    ].filter((item) => item.value);

    if (!customer) {
        return (
            <div className="flex items-center gap-3 rounded-md border border-dashed border-border px-3 py-4">
                <UserRound className="size-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                    No customer information available.
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-w-0 items-start gap-3">
            <Avatar name={customer.name} photo={customer.photo?.url} />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {customer.id ? (
                        <Link
                            href={route('customers.show', customer.id)}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            {customer.name}
                        </Link>
                    ) : (
                        <p className="text-sm font-semibold">
                            {customer.name || '—'}
                        </p>
                    )}

                    {customer.status && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">
                            {customer.status.toLowerCase()}
                        </span>
                    )}
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    {customer.type || '—'}
                </p>

                <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {details.map((item) => (
                        <div key={item.label} className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">
                                {item.label}
                            </p>
                            <p
                                className="truncate text-xs font-medium"
                                title={String(item.value)}
                            >
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
