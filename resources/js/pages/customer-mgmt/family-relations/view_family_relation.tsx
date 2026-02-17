import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Edit2,
    EyeClosed,
    ListFilter,
    ShieldCheck,
    User2,
    UserIcon,
    X,
    XCircle,
} from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';
import { CustomerFamilyRelation } from '../../../types/customer';

interface ViewFamilyRelationProps {
    familyRelation: CustomerFamilyRelation;
}

export default function View({ familyRelation }: ViewFamilyRelationProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/family-relations' },
        { title: 'View Relation', href: '' },
    ];

    const STATUS_MAP = {
        VERIFIED: {
            label: 'Verified',
            icon: CheckCircle,
            class: 'bg-green-100 text-green-700',
        },
        PENDING: {
            label: 'Pending',
            icon: Clock,
            class: 'bg-yellow-100 text-yellow-700',
        },
        REJECTED: {
            label: 'Rejected',
            icon: XCircle,
            class: 'bg-red-100 text-red-700',
        },
    } as const;

    const statusConfig = STATUS_MAP[
        familyRelation.verification_status as keyof typeof STATUS_MAP
    ] ?? { label: 'Unknown', icon: Clock, class: 'bg-gray-100 text-gray-700' };

    const StatusIcon = statusConfig.icon;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Family Relation" />

            {/* Customer Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <HeadingSmall
                    title="Relation Information"
                    description="Customer family relation information."
                />

                <div className="flex gap-2">
                    <Link
                        href={`/family-relations/${familyRelation.id}/edit`}
                        className="flex items-center gap-1 rounded bg-accent px-3 py-1 text-accent-foreground transition hover:bg-accent/90"
                    >
                        <Edit2 size={16} />
                        <span className="hidden sm:inline">Edit</span>
                    </Link>

                    <button
                        type="button"
                        className="flex items-center gap-1 rounded bg-destructive px-3 py-1 text-destructive-foreground transition hover:bg-destructive/90"
                    >
                        <EyeClosed size={16} />
                        <span className="hidden sm:inline">Suspend</span>
                    </button>

                    <button
                        type="button"
                        className="flex items-center gap-1 rounded bg-destructive px-3 py-1 text-destructive-foreground transition hover:bg-destructive/90"
                    >
                        <X size={16} />
                        <span className="hidden sm:inline">Close Account</span>
                    </button>

                    <Link
                        href={`/family-relations`}
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1 text-secondary-foreground transition hover:bg-secondary/90"
                    >
                        <ListFilter size={16} />
                        <span className="hidden sm:inline">
                            Family Relations
                        </span>
                    </Link>
                </div>
            </div>

            {/* Relation & Relative Info */}
            <Card className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <CardContent className="min-w-[280px] space-y-4 p-4 md:p-6">
                    <div className="">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <UserIcon size={16} />
                            <span>Customer Info</span>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {familyRelation.customer?.photo?.url ? (
                                    <img
                                        src={familyRelation.customer?.photo.url}
                                        alt={familyRelation.customer?.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {familyRelation.customer?.name.charAt(
                                            0,
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {familyRelation.customer ? (
                                            <Link
                                                href={`/customers/${familyRelation.customer.id}`}
                                                className="text-primary underline"
                                            >
                                                {familyRelation.customer.name}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {familyRelation.customer?.type} •{' '}
                                        {familyRelation.customer?.status}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        {familyRelation.customer?.id} •{' '}
                                        {familyRelation.customer?.customer_no} •{' '}
                                        {familyRelation.customer?.email} •{' '}
                                        {familyRelation.customer?.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Relation Info */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" /> Relation
                        </h3>

                        <div className="flex flex-col gap-1">
                            <Info
                                label="Relation Type"
                                value={familyRelation.relation_type.replaceAll(
                                    '_',
                                    ' ',
                                )}
                            />

                            <Badge
                                className={`flex items-center gap-1 text-xs ${statusConfig.class}`}
                            >
                                <StatusIcon className="h-3 w-3" />{' '}
                                {statusConfig.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Relative Info */}
                    <div className="col-span-full mb-2 space-y-1 border-t pt-4">
                        <h3 className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                            <User2 className="h-4 w-4" /> Relative Info
                        </h3>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        {/* Photo */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border bg-muted">
                            {familyRelation.photo?.url ? (
                                <img
                                    src={familyRelation.photo.url}
                                    alt={familyRelation.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                    {familyRelation.name?.charAt(0) ?? '-'}
                                </div>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid w-full grid-cols-1 gap-2 text-xs sm:grid-cols-2 md:grid-cols-4">
                            <Info
                                label="Name"
                                value={familyRelation?.name || '—'}
                            />
                            <Info label="Phone" value={familyRelation.phone} />
                            <Info label="Email" value={familyRelation.email} />
                            <Info
                                label="DOB"
                                value={formatDate(familyRelation.dob)}
                            />
                            <Info
                                label="Gender"
                                value={familyRelation.gender}
                            />
                            <Info
                                label="Religion"
                                value={familyRelation.religion}
                            />
                            <Info
                                label="ID Type"
                                value={familyRelation.identification_type?.replaceAll(
                                    '_',
                                    ' ',
                                )}
                            />
                            <Info
                                label="ID Number"
                                value={familyRelation.identification_number}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </CustomAuthLayout>
    );
}

/* ---------------- Helper Component ---------------- */
function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value || '—'}</span>
        </div>
    );
}
