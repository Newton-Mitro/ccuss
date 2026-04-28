import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { BorderInfoBox } from '../../../components/border-info-box';
import { formatDateTime } from '../../../lib/date_util';
import formatUndersoreString from '../../../lib/formatUnderscoreString';

export default function Show({ subledger }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subledger Management', href: '' },
        { title: 'Subledgers', href: route('subledgers.index') },
        { title: 'View Subledger', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Subledger Details" />

            <div className="text-foreground">
                <HeadingSmall
                    title="Subledger Details"
                    description="Detailed view of the selected subledger account."
                />

                <div className="mt-4 space-y-4 rounded-xl border bg-card p-8">
                    {/* 🔹 Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Basic Details
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-4">
                            <BorderInfoBox
                                label="Code"
                                value={subledger.code}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Name"
                                value={subledger.name}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Short Name"
                                value={subledger.short_name || '-'}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* 🔹 Classification */}
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            Classification
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-4">
                            <BorderInfoBox
                                label="Type"
                                value={formatUndersoreString(
                                    subledger.subledger_type,
                                )}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Sub Type"
                                value={formatUndersoreString(
                                    subledger.subledger_sub_type,
                                )}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="GL Account"
                                value={formatUndersoreString(
                                    subledger.gl_account?.name || '-',
                                )}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Status"
                                value={formatUndersoreString(
                                    subledger.is_active ? 'Active' : 'Inactive',
                                )}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Created At"
                                value={formatDateTime(subledger.created_at)}
                                className="bg-muted/30"
                            />

                            <BorderInfoBox
                                label="Created At"
                                value={formatDateTime(subledger.updated_at)}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* 🔹 Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                (window.location.href =
                                    route('subledgers.index'))
                            }
                        >
                            Back
                        </Button>

                        <Button
                            onClick={() =>
                                (window.location.href = route(
                                    'subledgers.edit',
                                    subledger.id,
                                ))
                            }
                        >
                            Edit
                        </Button>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
