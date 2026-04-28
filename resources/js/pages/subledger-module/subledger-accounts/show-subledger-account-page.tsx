import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { BorderInfoBox } from '../../../components/border-info-box';
import { formatDateTime } from '../../../lib/date_util';

export default function Show({ account }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subledger Management', href: '' },
        {
            title: 'Subledger Accounts',
            href: route('subledger-accounts.index'),
        },
        { title: 'View Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Details" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Account Details"
                    description="Detailed view of subledger account information"
                />

                <div className="mt-4 space-y-6 rounded-xl border bg-card p-8">
                    {/* 🔹 Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <BorderInfoBox
                                label="Account Number"
                                value={account.account_number}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Name"
                                value={account.name || '-'}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Status"
                                value={account.status}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* 🔹 Relationships */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Relationships
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <BorderInfoBox
                                label="Subledger"
                                value={account.subledger?.name || '-'}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Accountable Type"
                                value={account.accountable_type || '-'}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Branch"
                                value={account.branch?.name || '-'}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Organization"
                                value={account.Organization || '-'}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Created At"
                                value={formatDateTime(account.created_at)}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Created At"
                                value={formatDateTime(account.updated_at)}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* 🔹 Actions */}
                    <div className="flex justify-end gap-2">
                        <Link href={route('subledger-accounts.index')}>
                            <Button variant="outline">Back</Button>
                        </Link>

                        <Link
                            href={route('subledger-accounts.edit', account.id)}
                        >
                            <Button>Edit Account</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
