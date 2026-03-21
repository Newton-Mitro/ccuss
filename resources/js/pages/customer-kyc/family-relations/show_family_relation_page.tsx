import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    ShieldCheck,
    UserIcon,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

import HeadingSmall from '../../../components/heading-small';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerFamilyRelation } from '../../../types/customer_kyc_module';

export default function ShowFamilyRelation() {
    const { props } = usePage<
        SharedData & { familyRelation: CustomerFamilyRelation; flash?: any }
    >();

    const { familyRelation, flash } = props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/family-relations' },
        { title: `Relation #${familyRelation.id}`, href: '' },
    ];

    // 🎯 Status badge mapping
    const STATUS_MAP = {
        VERIFIED: {
            label: 'Verified',
            class: 'bg-success text-success-foreground',
        },
        PENDING: {
            label: 'Pending',
            class: 'bg-warning text-warning-foreground',
        },
        REJECTED: {
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
        router.post(
            `/family-relations/${familyRelation.id}/approve`,
            {},
            {
                onSuccess: () => toast.success('Relation approved'),
            },
        );
    };

    const handleReject = () => {
        router.post(
            `/family-relations/${familyRelation.id}/reject`,
            {},
            {
                onSuccess: () => toast.success('Relation rejected'),
            },
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
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href="/family-relations"
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/90"
                    >
                        Relations
                    </Link>

                    <Link
                        href={`/family-relations/${familyRelation.id}/edit`}
                        className="flex items-center gap-1 rounded bg-accent px-3 py-1.5 text-sm text-accent-foreground hover:bg-accent/90"
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
                    <Card className="rounded-md border bg-card p-4">
                        <CardContent>
                            <p className="text-sm font-medium">
                                Verification Actions
                            </p>
                            <div className="mt-3 flex flex-col gap-2">
                                {familyRelation.verification_status ===
                                    'PENDING' && (
                                    <>
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
                                    'PENDING' && (
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
            <p className="text-sm font-medium">{customer?.name || '—'}</p>
            <p className="text-xs text-muted-foreground">
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
