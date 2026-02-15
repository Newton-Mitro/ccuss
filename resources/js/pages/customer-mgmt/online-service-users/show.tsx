import { Head } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { OnlineServiceUser } from '../../../types/customer';

interface ShowOnlineUserProps {
    onlineClient: OnlineServiceUser;
}

export default function ShowOnlineUser({ onlineClient }: ShowOnlineUserProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Online Clients', href: '/online-users' },
        { title: 'View User', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Online Client" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Online Client Details"
                    description={`Viewing details for user "${onlineClient.username}"`}
                />

                <div className="space-y-6 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm">
                    {/* Customer */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Customer
                            </h3>
                            <p className="mt-1">
                                {onlineClient.customer?.name || 'N/A'} ( ID:{' '}
                                {onlineClient.customer_id})
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Username
                            </h3>
                            <p className="mt-1">{onlineClient.username}</p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Email
                            </h3>
                            <p className="mt-1">
                                {onlineClient.email || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Phone
                            </h3>
                            <p className="mt-1">
                                {onlineClient.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Status & Last Login */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Status
                            </h3>
                            <p className="mt-1">{onlineClient.status}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Last Login
                            </h3>
                            <p className="mt-1">
                                {onlineClient.last_login_at
                                    ? new Date(
                                          onlineClient.last_login_at,
                                      ).toLocaleString()
                                    : 'Never'}
                            </p>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Created At
                            </h3>
                            <p className="mt-1">
                                {new Date(
                                    onlineClient.created_at,
                                ).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Updated At
                            </h3>
                            <p className="mt-1">
                                {new Date(
                                    onlineClient.updated_at,
                                ).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
