import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function LoanAccountCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Accounts', href: route('loan-accounts.index') },
        { title: 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create loan account" />
            <div className="max-w-2xl space-y-4">
                <ResourcePageHeader
                    title="Create loan account"
                    description="Loan accounts are created from approved loan applications so the contract and repayment terms remain traceable."
                />
                <div className="rounded-lg border bg-card p-5">
                    <Button asChild>
                        <Link href={route('loan-applications.index')}>
                            Open loan applications
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
