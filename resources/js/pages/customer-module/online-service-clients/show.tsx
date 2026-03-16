import { Head, Link } from '@inertiajs/react';
import { Edit2, EyeClosed, ListFilter, X } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { OnlineServiceClient } from '../../../types/customer';

interface ShowOnlineUserProps {
    onlineServiceClient: OnlineServiceClient;
}

export default function ShowOnlineUser({
    onlineServiceClient,
}: ShowOnlineUserProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Online Service Clients', href: '/online-service-clients' },
        { title: 'View User', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Online Client" />

            <div className="animate-in space-y-8 fade-in">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <HeadingSmall
                        title="Online Client Profile"
                        description={`User snapshot for "${onlineServiceClient.username}"`}
                    />
                    <div className="flex gap-2">
                        <Link
                            href={`/online-service-clients/${onlineServiceClient.id}/edit`}
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
                            <span className="hidden sm:inline">
                                Close Account
                            </span>
                        </button>

                        <Link
                            href={`/online-service-clients`}
                            className="flex items-center gap-1 rounded bg-secondary px-3 py-1 text-secondary-foreground transition hover:bg-secondary/90"
                        >
                            <ListFilter size={16} />
                            <span className="hidden sm:inline">
                                Online Service Clients
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left: Profile */}
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow backdrop-blur">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                                {onlineServiceClient.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">
                                    {onlineServiceClient.username}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Customer ID:{' '}
                                    {onlineServiceClient.customer_id}
                                </p>
                            </div>

                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                    onlineServiceClient.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {onlineServiceClient.status}
                            </span>

                            <div className="border-t pt-4 text-sm text-muted-foreground">
                                {onlineServiceClient.customer?.name || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-6 lg:col-span-2">
                        <InfoCard title="Contact Information">
                            <InfoRow
                                label="Email"
                                value={onlineServiceClient.email || '—'}
                            />
                            <InfoRow
                                label="Phone"
                                value={onlineServiceClient.phone || '—'}
                            />
                        </InfoCard>

                        <InfoCard title="Access & Activity">
                            <InfoRow
                                label="Last Login"
                                value={
                                    onlineServiceClient.last_login_at
                                        ? new Date(
                                              onlineServiceClient.last_login_at,
                                          ).toLocaleString()
                                        : 'Never'
                                }
                            />
                            <InfoRow
                                label="Account Status"
                                value={onlineServiceClient.status}
                            />
                        </InfoCard>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

/* ---------- helpers ---------- */

function InfoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card/90 p-6 shadow backdrop-blur">
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {title}
            </h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    );
}
