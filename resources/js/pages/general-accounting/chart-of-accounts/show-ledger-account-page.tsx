import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { BorderInfoBox } from '../../../components/border-info-box';

export default function Show({ ledger }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: 'View Ledger Account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Ledger Account Details" />

            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Ledger Account Details"
                    description="View complete configuration and hierarchy of this account."
                />

                <div className="space-y-6 rounded-xl border bg-card p-8">
                    {/* 🔹 Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Basic Information
                        </h3>

                        <div className="mt-2 grid gap-4 md:grid-cols-4">
                            <BorderInfoBox
                                className="bg-muted/30"
                                label="Code"
                                value={ledger.code}
                            />
                            <BorderInfoBox
                                className="bg-muted/30"
                                label="Name"
                                value={ledger.name}
                            />
                            <BorderInfoBox
                                className="bg-muted/30"
                                label="Type"
                                value={ledger.type}
                            />
                            <BorderInfoBox
                                className="bg-muted/30"
                                label="Status"
                                value={ledger.is_active ? 'Active' : 'Inactive'}
                            />
                        </div>
                    </div>

                    {/* 🔹 Hierarchy */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Hierarchy
                        </h3>

                        <div className="mt-2 grid gap-4 md:grid-cols-3">
                            <BorderInfoBox
                                label="Parent Account"
                                className="bg-muted/30"
                                value={
                                    ledger.parent
                                        ? `${ledger.parent.code} - ${ledger.parent.name}`
                                        : 'None'
                                }
                            />

                            <BorderInfoBox
                                label="Account Nature"
                                className="bg-muted/30"
                                value={
                                    ledger.is_group
                                        ? 'Group Account'
                                        : 'Leaf Account'
                                }
                            />

                            <BorderInfoBox
                                label="Children Count"
                                className="bg-muted/30"
                                value={ledger.children?.length || '0'}
                            />
                        </div>
                    </div>

                    {/* 🔹 Control & Subledger */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Control & Subledger
                        </h3>

                        <div className="mt-2 grid gap-4 md:grid-cols-3">
                            <BorderInfoBox
                                label="Control Account"
                                className="bg-muted/30"
                                value={ledger.is_control_account ? 'Yes' : 'No'}
                            />

                            <BorderInfoBox
                                label="Subledger Type"
                                className="bg-muted/30"
                                value={ledger.subledger_type || 'None'}
                            />

                            <BorderInfoBox
                                label="Subledger Sub Type"
                                className="bg-muted/30"
                                value={ledger.subledger_sub_type || 'None'}
                            />
                        </div>
                    </div>

                    {/* 🔹 Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Description
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {ledger.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* 🔹 Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                (window.location.href = route(
                                    'ledger-accounts.edit',
                                    ledger.id,
                                ))
                            }
                        >
                            Edit
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() =>
                                (window.location.href = route(
                                    'ledger-accounts.index',
                                ))
                            }
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
