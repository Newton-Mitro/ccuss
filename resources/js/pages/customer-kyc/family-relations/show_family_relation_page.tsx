import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Clock,
    ShieldCheck,
    User,
    UserIcon,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerFamilyRelation } from '../../../types/customer_kyc_module';

export default function ShowFamilyRelation() {
    const { familyRelation, errors } = usePage<
        SharedData & { familyRelation: CustomerFamilyRelation; flash?: any }
    >().props;

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const [rejection_reason, setReasonForRejection] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: route('family-relations.index') },
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

    const statusClass =
        STATUS_MAP[
            familyRelation.verification_status as keyof typeof STATUS_MAP
        ]?.class ?? 'bg-muted text-muted-foreground';

    const statusLabel =
        STATUS_MAP[
            familyRelation.verification_status as keyof typeof STATUS_MAP
        ]?.label ?? 'Unknown';

    // ✅ Actions for pending verification
    const handleApprove = () => {
        router.post(route('family-relations.approve', familyRelation.id), {});
    };

    const handleReject = () => {
        router.post(
            route('family-relations.reject', familyRelation.id),
            {
                rejection_reason,
            },
            {},
        );
    };
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Family Relation #${familyRelation.id}`} />

            {/* HEADER */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={`Family Relation #${familyRelation.id}`}
                    description="View and verify customer family relation."
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
                        href={route('family-relations.index')}
                        className="flex items-center gap-1 rounded border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-all hover:bg-secondary/50"
                    >
                        Relations
                    </Link>

                    <Link
                        href={route('family-relations.edit', familyRelation.id)}
                        className="flex items-center gap-1 rounded border border-border bg-accent px-3 py-1.5 text-sm text-accent-foreground transition-all hover:bg-accent/50"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* LEFT COLUMN: Customer + Relative Info */}
                <div className="col-span-2 space-y-4">
                    {/* Customer Info */}
                    <Card className="rounded-md border bg-card p-4">
                        <CardContent className="space-y-3">
                            <p className="flex items-center gap-1 text-sm font-medium">
                                <UserIcon className="h-4 w-4" /> Customer Info
                            </p>

                            <div className="flex items-center gap-4">
                                <Avatar
                                    name={familyRelation.customer?.name}
                                    photo={familyRelation.customer?.photo?.url}
                                />
                                <CustomerDetails
                                    customer={familyRelation.customer}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Relative Info */}
                    <Card className="rounded-md border bg-card p-4">
                        <CardContent className="space-y-3">
                            <p className="flex items-center gap-1 text-sm font-medium">
                                <UserIcon className="h-4 w-4" /> Relative Info
                            </p>

                            <div className="flex items-center gap-4">
                                <Avatar
                                    name={familyRelation.relative?.name}
                                    photo={familyRelation.relative?.photo?.url}
                                />
                                <CustomerDetails
                                    customer={familyRelation.relative}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Relation Info */}
                    <Card className="rounded-md border bg-card p-4">
                        <CardContent className="space-y-2">
                            <p className="flex items-center gap-1 text-sm font-medium">
                                <ShieldCheck className="h-4 w-4" /> Relation
                                Info
                            </p>
                            <Info
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

                {/* RIGHT COLUMN: Actions */}
                <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold">Audit Trail</p>
                            <span className="text-xs text-muted-foreground">
                                {familyRelation?.audits?.length || 0} records
                            </span>
                        </div>

                        {/* Content */}
                        {familyRelation?.audits?.length > 0 ? (
                            <div className="space-y-4">
                                {familyRelation.audits.map((audit) => (
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
                    <Card className="rounded-md border bg-card p-4">
                        <CardContent>
                            <p className="text-sm font-medium">
                                Verification Actions
                            </p>
                            <div className="mt-3 flex flex-col gap-2">
                                {familyRelation.verification_status ===
                                    'pending' && (
                                    <>
                                        <div className="">
                                            <Input
                                                type="text"
                                                placeholder="Action Reason"
                                                value={rejection_reason}
                                                onChange={(e) =>
                                                    setReasonForRejection(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors?.rejection_reason
                                                }
                                            />
                                        </div>
                                        <Button
                                            onClick={handleApprove}
                                            className="bg-success text-success-foreground hover:bg-success/90"
                                        >
                                            <CheckCheck className="mr-1 h-4 w-4" />{' '}
                                            Approve
                                        </Button>

                                        <Button
                                            onClick={handleReject}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            <XCircle className="mr-1 h-4 w-4" />{' '}
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {familyRelation.verification_status !==
                                    'pending' && (
                                    <Badge
                                        className={`rounded px-2 py-1 text-xs ${statusClass}`}
                                    >
                                        {statusLabel}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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

function CustomerDetails({ customer }: { customer?: any }) {
    return (
        <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-info underline">
                <Link href={route('customers.show', customer?.id)}>
                    {customer?.name || '—'}{' '}
                </Link>
            </p>
            <p className="text-xs text-muted-foreground capitalize">
                {customer?.type} • {customer?.kyc_status}
            </p>
            <p className="text-xs text-muted-foreground">
                {customer?.customer_no} • {customer?.email} • {customer?.phone}
            </p>
        </div>
    );
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value || '—'}</span>
        </div>
    );
}
