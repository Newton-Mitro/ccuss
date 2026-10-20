import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Clock3,
    Edit2,
    FileCheck2,
    Globe2,
    Home,
    ListFilter,
    Mail,
    MapPin,
    Navigation,
    Phone,
    ShieldCheck,
    UserRound,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '../../../components/ui/button';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '../../../types';
import type { CustomerAddress } from '../../../types/customer_kyc_module';
import ApprovalActions from '../components/approval-actions';

interface Props extends SharedData {
    address: CustomerAddress;
}

export default function ViewAddress({ address }: Props) {
    useFlashToastHandler();

    const isPending = address.verification_status === 'PENDING';
    const isVerified = address.verification_status === 'VERIFIED';
    const isRejected = address.verification_status === 'REJECTED';

    const statusConfig = isVerified
        ? {
              label: 'Verified',
              dot: 'bg-emerald-500',
              badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
              icon: ShieldCheck,
          }
        : isRejected
          ? {
                label: 'Rejected',
                dot: 'bg-destructive',
                badge: 'border-destructive/20 bg-destructive/10 text-destructive',
                icon: XCircle,
            }
          : {
                label: 'Pending Review',
                dot: 'bg-amber-500',
                badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                icon: Clock3,
            };

    const StatusIcon = statusConfig.icon;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: address.customer?.name || 'Customer',
            href: route('customers.show', address.customer_id),
        },
        { title: `Address #${address.id}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Address #${address.id} | Customer KYC`} />

            <div className="mx-auto w-full max-w-400 space-y-5 pb-6">
                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <MapPin className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    Address Verification
                                </h1>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.badge}`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${statusConfig.dot}`}
                                    />
                                    {statusConfig.label}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Review the address information and manage its
                                verification status.
                            </p>

                            <p className="mt-2 text-xs text-muted-foreground">
                                Address reference:{' '}
                                <span className="font-mono font-medium text-foreground">
                                    #{address.id}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={route(
                                    'customers.show',
                                    address.customer_id,
                                )}
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Customer Profile
                            </Link>
                        </Button>

                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={route('customers.addresses.edit', [
                                    address.customer_id,
                                    address.id,
                                ])}
                            >
                                <Edit2 className="mr-2 size-4" />
                                Edit Address
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main split layout */}
                <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                    {/* Left sidebar */}
                    <aside className="space-y-5 xl:col-span-4">
                        {/* Customer profile */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <div className="border-b border-border px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                    <UserRound className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Customer Profile
                                    </h2>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-lg font-semibold text-muted-foreground">
                                        {address.customer?.photo?.url ? (
                                            <img
                                                src={address.customer.photo.url}
                                                alt={address.customer.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            address.customer?.name
                                                ?.charAt(0)
                                                .toUpperCase() || '?'
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1 pt-1">
                                        {address.customer ? (
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    address.customer.id,
                                                )}
                                                className="font-semibold text-foreground transition hover:text-primary"
                                            >
                                                {address.customer.name}
                                            </Link>
                                        ) : (
                                            <p className="font-semibold">
                                                Customer unavailable
                                            </p>
                                        )}

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Customer No:{' '}
                                            {address.customer?.customer_no ||
                                                '—'}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                                                {address.customer?.type || '—'}
                                            </span>
                                            <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                                                {address.customer?.status ||
                                                    '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-4 border-t border-border" />

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Primary Phone
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium wrap-break-word">
                                                {address.customer
                                                    ?.primary_phone || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Primary Email
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium break-all">
                                                {address.customer
                                                    ?.primary_email || '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'customers.show',
                                            address.customer_id,
                                        )}
                                    >
                                        View Customer Profile
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </section>

                        {/* Verification panel */}
                        <section className="overflow-hidden rounded-xl border border-border bg-card">
                            <div className="border-b border-border px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                    <FileCheck2 className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Verification Review
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-4 p-4">
                                <div
                                    className={`rounded-lg border p-3 ${statusConfig.badge}`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <StatusIcon className="mt-0.5 size-5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {statusConfig.label}
                                            </p>
                                            <p className="mt-1 text-xs opacity-80">
                                                {isVerified
                                                    ? 'This address has been verified.'
                                                    : isRejected
                                                      ? 'This address was rejected. Review the remarks for details.'
                                                      : 'This address is waiting for a verification decision.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isPending ? (
                                    <ApprovalActions
                                        approveUrl={route(
                                            'customers.addresses.approve',
                                            [address.customer_id, address.id],
                                        )}
                                        rejectUrl={route(
                                            'customers.addresses.reject',
                                            [address.customer_id, address.id],
                                        )}
                                        pending
                                        maxRejectionLength={500}
                                    />
                                ) : (
                                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            This address has already been
                                            reviewed. Any further changes should
                                            follow your organization's
                                            verification workflow.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>

                    {/* Right main panel */}
                    <main className="min-w-0 space-y-5 xl:col-span-8">
                        {/* Address overview */}
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-card to-sky-500/10 px-5 py-6 sm:px-7">
                                <MapPin className="absolute -right-3 -bottom-8 size-36 text-primary/5" />
                                <div className="relative flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                                            <Home className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                                Customer address
                                            </p>
                                            <h2 className="mt-1 text-lg font-semibold tracking-tight">
                                                {address.type || 'Address'}
                                            </h2>
                                        </div>
                                    </div>
                                    <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium">
                                        Reference #{address.id}
                                    </span>
                                </div>

                                <div className="relative mt-6 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <MapPin className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                                Complete address
                                            </p>
                                            <p className="mt-1 text-base leading-6 font-semibold wrap-break-word text-foreground">
                                                {[
                                                    address.line1,
                                                    address.line2,
                                                    address.upazila,
                                                    address.district,
                                                    address.division,
                                                    address.postal_code,
                                                    address.country,
                                                ]
                                                    .filter((value) =>
                                                        String(
                                                            value ?? '',
                                                        ).trim(),
                                                    )
                                                    .join(', ') ||
                                                    'No address provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-7">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Location breakdown
                                        </h3>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Follow the address from region to
                                            neighborhood
                                        </p>
                                    </div>
                                    <div className="flex size-9 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
                                        <Navigation className="size-4" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-muted/15 p-4 sm:p-5">
                                    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {[
                                            {
                                                label: 'Division',
                                                value: address.division,
                                            },
                                            {
                                                label: 'District',
                                                value: address.district,
                                            },
                                            {
                                                label: 'Upazila',
                                                value: address.upazila,
                                            },
                                            {
                                                label: 'Union / Ward',
                                                value: address.union_ward,
                                            },
                                        ].map((location, index) => (
                                            <li
                                                key={location.label}
                                                className="relative flex min-w-0 items-start gap-3 rounded-xl border bg-card p-3.5 shadow-sm"
                                            >
                                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 pt-0.5">
                                                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                        {location.label}
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium wrap-break-word">
                                                        {location.value ||
                                                            'Not provided'}
                                                    </p>
                                                </div>
                                                {index < 3 && (
                                                    <ArrowRight className="absolute top-1/2 -right-2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-card text-muted-foreground xl:block" />
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                    <LocationMeta
                                        label="Additional address"
                                        value={address.line2}
                                        icon={<Home className="size-4" />}
                                    />
                                    <LocationMeta
                                        label="Postal code"
                                        value={address.postal_code}
                                        icon={<Mail className="size-4" />}
                                    />
                                    <LocationMeta
                                        label="Country"
                                        value={address.country}
                                        icon={<Globe2 className="size-4" />}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Review outcome */}
                        <section className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                            <div
                                className={`flex flex-col justify-between rounded-2xl border p-5 ${statusConfig.badge}`}
                            >
                                <div>
                                    <div className="flex size-10 items-center justify-center rounded-xl border border-current/15 bg-background/50">
                                        <StatusIcon className="size-5" />
                                    </div>
                                    <p className="mt-4 text-[10px] font-semibold tracking-[0.14em] uppercase opacity-70">
                                        Review status
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                        {statusConfig.label}
                                    </p>
                                </div>
                                <p className="mt-5 text-xs leading-5 opacity-80">
                                    Address reference #{address.id}
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-card p-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Verification record
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {isRejected
                                        ? 'Review the reason recorded for this decision.'
                                        : 'Remarks attached to the address verification.'}
                                </p>
                                <div className="mt-4 min-h-20 rounded-xl border border-dashed bg-muted/20 p-4">
                                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        {isRejected
                                            ? 'Rejection reason'
                                            : 'Remarks'}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 wrap-break-word">
                                        {address.remarks ||
                                            'No remarks have been recorded.'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Footer navigation */}
                        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-muted-foreground">
                                Confirm that the address details are accurate
                                before making a verification decision.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('customers.index')}>
                                        <ListFilter className="mr-2 size-4" />
                                        Customers
                                    </Link>
                                </Button>

                                <Button size="sm" asChild>
                                    <Link
                                        href={route(
                                            'customers.addresses.edit',
                                            [address.customer_id, address.id],
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-4" />
                                        Edit Address
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

function LocationMeta({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:bg-muted/30">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-1 text-sm font-medium wrap-break-word">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}
