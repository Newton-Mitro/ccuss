import { Head } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { OnlineServiceUser } from '../../../types/customer';

interface ShowOnlineUserProps {
    onlineServiceUser: OnlineServiceUser;
}

export default function ShowOnlineUser({
    onlineServiceUser,
}: ShowOnlineUserProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Online Service Users', href: '/online-service-users' },
        { title: 'View User', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Online Client" />

            <div className="animate-in space-y-8 fade-in">
                <HeadingSmall
                    title="Online Client Profile"
                    description={`User snapshot for "${onlineServiceUser.username}"`}
                />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left: Profile */}
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow backdrop-blur">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                                {onlineServiceUser.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">
                                    {onlineServiceUser.username}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Customer ID: {onlineServiceUser.customer_id}
                                </p>
                            </div>

                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                    onlineServiceUser.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {onlineServiceUser.status}
                            </span>

                            <div className="border-t pt-4 text-sm text-muted-foreground">
                                {onlineServiceUser.customer?.name || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-6 lg:col-span-2">
                        <InfoCard title="Contact Information">
                            <InfoRow
                                label="Email"
                                value={onlineServiceUser.email || '—'}
                            />
                            <InfoRow
                                label="Phone"
                                value={onlineServiceUser.phone || '—'}
                            />
                        </InfoCard>

                        <InfoCard title="Access & Activity">
                            <InfoRow
                                label="Last Login"
                                value={
                                    onlineServiceUser.last_login_at
                                        ? new Date(
                                              onlineServiceUser.last_login_at,
                                          ).toLocaleString()
                                        : 'Never'
                                }
                            />
                            <InfoRow
                                label="Account Status"
                                value={onlineServiceUser.status}
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
