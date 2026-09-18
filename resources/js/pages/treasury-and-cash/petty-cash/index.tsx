import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function PettyCashIndexPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: route('petty-cash.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash" />
            <div className="space-y-4 rounded-md border bg-card p-6">
                <HeadingSmall
                    title="Petty Cash"
                    description="Operational petty cash funds and advance accounts."
                />

                <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                    This module is now wired into the Treasury navigation and is
                    ready for the petty cash fund index and advance-account
                    workflows.
                </div>
            </div>
        </CustomAuthLayout>
    );
}
