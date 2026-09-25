import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Edit2,
    HomeIcon,
    ListFilter,
    UserIcon,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { BorderInfoBox } from '../../../components/border-info-box';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerAddress } from '../../../types/customer_kyc_module';

interface Props extends SharedData {
    address: CustomerAddress;
}

export default function ViewAddress({ address }: Props) {
    const { errors } = usePage<
        SharedData & { errors?: Record<string, string> }
    >().props;

    useFlashToastHandler();

    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = () => {
        appSwal
            .fire({
                title: 'Approve this address?',
                text: 'This will mark the customer address as approved.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Approve',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        route('customers.addresses.approve', [
                            address.customer_id,
                            address.id,
                        ]),
                        {},
                    );
                }
            });
    };

    const handleReject = () => {
        appSwal
            .fire({
                title: 'Reject this address?',
                text: 'Provide the rejection reason before confirming.',
                input: 'textarea',
                inputPlaceholder: 'Rejection reason',
                inputValue: rejectionReason,
                inputValidator: (value) =>
                    value?.trim()
                        ? undefined
                        : 'A rejection reason is required.',
                showCancelButton: true,
                confirmButtonText: 'Reject',
                confirmButtonColor: '#dc2626',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    setRejectionReason(result.value ?? '');
                    router.post(
                        route('customers.addresses.reject', [
                            address.customer_id,
                            address.id,
                        ]),
                        {
                            rejection_reason: result.value,
                        },
                    );
                }
            });
    };

    const statusClass =
        {
            verified: 'bg-success text-success-foreground',
            pending: 'bg-warning text-warning-foreground',
            rejected: 'bg-destructive text-destructive-foreground',
        }[address.verification_status] ?? 'bg-muted text-muted-foreground';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Customer & KYC',
            href: '',
        },
        {
            title: 'Customers',
            href: route('customers.index'),
        },
        {
            title: address.customer?.name || 'Customer',
            href: route('customers.show', address.customer_id),
        },
        {
            title: `Address #${address.id}`,
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Address #${address.id}`} />

            <div className="space-y-3 p-1.5">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <HeadingSmall
                        title="Customer Address Details"
                        description="View detailed information about this address."
                    />

                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 text-sm text-card-foreground transition hover:bg-muted"
                        >
                            <ArrowLeft size={15} />
                            <span className="hidden sm:inline">Back</span>
                        </button>

                        <Link
                            href={route('customers.addresses.edit', [
                                address.customer_id,
                                address.id,
                            ])}
                            className="flex items-center gap-1 rounded bg-accent px-2.5 py-1.5 text-sm text-accent-foreground transition hover:bg-accent/90"
                        >
                            <Edit2 size={15} />
                            <span className="hidden sm:inline">Edit</span>
                        </Link>

                        <Link
                            href={route('customers.index')}
                            className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1.5 text-sm text-secondary-foreground transition hover:bg-secondary/90"
                        >
                            <ListFilter size={15} />
                            <span className="hidden sm:inline">Customers</span>
                        </Link>
                    </div>
                </div>

                {/* Verification Actions */}
                {address.verification_status === 'PENDING' && (
                    <section className="rounded-md border bg-card p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Verification Actions
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Review this address before approving it.
                                </p>
                            </div>

                            <span
                                className={`shrink-0 rounded px-2 py-0.5 text-xs capitalize ${statusClass}`}
                            >
                                {address.verification_status}
                            </span>
                        </div>

                        <textarea
                            value={rejectionReason}
                            onChange={(event) =>
                                setRejectionReason(event.target.value)
                            }
                            placeholder="Rejection reason"
                            rows={2}
                            className="mb-2 min-h-0 w-full resize-none rounded border border-input bg-background px-2.5 py-2 text-sm transition outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />

                        {errors?.rejection_reason && (
                            <p className="mb-2 text-xs text-destructive">
                                {errors.rejection_reason}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                            <button
                                type="button"
                                onClick={handleApprove}
                                className="flex items-center gap-1 rounded bg-success px-2.5 py-1.5 text-sm text-success-foreground transition hover:bg-success/90"
                            >
                                <CheckCheck size={15} />
                                Approve
                            </button>

                            <button
                                type="button"
                                onClick={handleReject}
                                className="flex items-center gap-1 rounded bg-destructive px-2.5 py-1.5 text-sm text-destructive-foreground transition hover:bg-destructive/90"
                            >
                                <XCircle size={15} />
                                Reject
                            </button>
                        </div>
                    </section>
                )}

                {/* Main Information */}
                <section className="space-y-5 rounded-md border bg-card p-4">
                    {/* Customer Information */}
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <UserIcon size={16} />
                            <span>Customer Info</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Customer Photo */}
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-muted">
                                {address.customer?.photo?.url ? (
                                    <img
                                        src={address.customer.photo.url}
                                        alt={address.customer?.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {address.customer?.name?.charAt(0) ??
                                            '?'}
                                    </div>
                                )}
                            </div>

                            {/* Customer Details */}
                            <div className="min-w-0 flex-1">
                                <BorderInfoBox
                                    label=""
                                    value={
                                        address.customer ? (
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    address.customer.id,
                                                )}
                                                className="text-primary hover:underline"
                                            >
                                                {address.customer.name}
                                            </Link>
                                        ) : (
                                            '—'
                                        )
                                    }
                                />

                                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                    <p>
                                        {address.customer?.type} •{' '}
                                        {address.customer?.status}
                                    </p>

                                    <p className="wrap-break-word">
                                        {address.customer?.id} •{' '}
                                        {address.customer?.customer_no} •{' '}
                                        {address.customer?.primary_email} •{' '}
                                        {address.customer?.primary_phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <HomeIcon size={16} />
                            <span>Address Information</span>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 lg:grid-cols-3">
                            <BorderInfoBox
                                label="Address Line 1"
                                value={address.line1}
                            />

                            <BorderInfoBox
                                label="Address Line 2"
                                value={address.line2}
                            />

                            <BorderInfoBox
                                label="Division"
                                value={address.division}
                            />

                            <BorderInfoBox
                                label="District"
                                value={address.district}
                            />

                            <BorderInfoBox
                                label="Upazila"
                                value={address.upazila}
                            />

                            <BorderInfoBox
                                label="Union/Ward"
                                value={address.union_ward}
                            />

                            <BorderInfoBox
                                label="Postal Code"
                                value={address.postal_code}
                            />

                            <BorderInfoBox
                                label="Country"
                                value={address.country}
                            />

                            <BorderInfoBox label="Type" value={address.type} />

                            <BorderInfoBox
                                label="Verification Status"
                                value={address.verification_status}
                            />

                            {address.verification_status === 'REJECTED' && (
                                <BorderInfoBox
                                    label="Rejection Reason"
                                    value={address.remarks}
                                />
                            )}

                            <BorderInfoBox
                                label="Remarks"
                                value={address.remarks}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
