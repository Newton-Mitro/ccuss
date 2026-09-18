import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../../components/heading-small';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../../types';

export default function BankAccountsIndexPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: route('bank-accounts.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Accounts" />
            <div className="space-y-4 rounded-md border bg-card p-6">
                <HeadingSmall
                    title="Bank Accounts"
                    description="Manage bank account records and balances."
                />

                <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                    This module is now attached to the Treasury banking route
                    and is ready for the bank account list workflow.
                </div>
            </div>
        </CustomAuthLayout>
    );
}
