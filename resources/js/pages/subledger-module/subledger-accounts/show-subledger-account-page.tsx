import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

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
                        <h3 className="text-lg font-semibold text-info">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label>Account Number</Label>
                                <p className="text-sm font-medium">
                                    {account.account_number}
                                </p>
                            </div>

                            <div>
                                <Label>Name</Label>
                                <p className="text-sm">{account.name || '-'}</p>
                            </div>

                            <div>
                                <Label>Type</Label>
                                <p className="text-sm capitalize">
                                    {account.type}
                                </p>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <p className="text-sm">
                                    {account.status === 'active' ? (
                                        <span className="font-medium text-green-600">
                                            Active
                                        </span>
                                    ) : account.status === 'frozen' ? (
                                        <span className="font-medium text-red-600">
                                            Frozen
                                        </span>
                                    ) : (
                                        <span className="font-medium text-yellow-600 capitalize">
                                            {account.status}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Relationships */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Relationships
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label>Subledger</Label>
                                <p className="text-sm">
                                    {account.subledger?.name || '-'}
                                </p>
                            </div>

                            <div>
                                <Label>Accountable Type</Label>
                                <p className="text-sm capitalize">
                                    {account.accountable_type}
                                </p>
                            </div>

                            <div>
                                <Label>Branch</Label>
                                <p className="text-sm">
                                    {account.branch?.name || '-'}
                                </p>
                            </div>

                            <div>
                                <Label>Organization</Label>
                                <p className="text-sm">
                                    {account.organization_id || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Metadata */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Metadata
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label>Created At</Label>
                                <p className="text-sm">{account.created_at}</p>
                            </div>

                            <div>
                                <Label>Updated At</Label>
                                <p className="text-sm">{account.updated_at}</p>
                            </div>
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
