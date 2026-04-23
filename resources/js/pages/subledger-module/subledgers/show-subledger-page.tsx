import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

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
                        <h3 className="text-lg font-semibold text-info">
                            Basic Details
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-4">
                            <div>
                                <Label>Code</Label>
                                <p className="text-sm">{subledger.code}</p>
                            </div>

                            <div>
                                <Label>Name</Label>
                                <p className="text-sm">{subledger.name}</p>
                            </div>

                            <div>
                                <Label>Short Name</Label>
                                <p className="text-sm">
                                    {subledger.short_name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Classification */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Classification
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-4">
                            <div>
                                <Label>Type</Label>
                                <p className="text-sm">{subledger.type}</p>
                            </div>

                            <div>
                                <Label>Sub Type</Label>
                                <p className="text-sm">{subledger.sub_type}</p>
                            </div>

                            <div>
                                <Label>GL Account</Label>
                                <p className="text-sm">
                                    {subledger.gl_account?.name || '-'}
                                </p>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <p className="text-sm">
                                    {subledger.is_active ? (
                                        <span className="font-medium text-green-600">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="font-medium text-red-600">
                                            Inactive
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Meta Info (Optional but Pro) */}
                    <div>
                        <h3 className="text-lg font-semibold text-info">
                            Metadata
                        </h3>

                        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-4">
                            <div>
                                <Label>Created At</Label>
                                <p className="text-sm">
                                    {subledger.created_at}
                                </p>
                            </div>

                            <div>
                                <Label>Last Updated</Label>
                                <p className="text-sm">
                                    {subledger.updated_at}
                                </p>
                            </div>
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
