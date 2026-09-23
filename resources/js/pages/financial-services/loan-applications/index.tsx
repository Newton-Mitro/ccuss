import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import type { LoanApplicationIndexPageProps } from '@/types/financial-services';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { route } from 'ziggy-js';

export default function LoanApplicationsIndex() {
    const { applications } = usePage<LoanApplicationIndexPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Applications', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Applications" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Loan applications"
                    description="Originate, review, and decide customer loan requests."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('loan-applications.create')}>
                                <Plus className="mr-1 h-4 w-4" /> New
                                application
                            </Link>
                        </Button>
                    }
                />
                <div className="overflow-x-auto rounded-lg border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">Application</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {applications.data.map((application) => (
                                <tr key={application.id}>
                                    <td className="px-3 py-2">
                                        <Link
                                            className="font-medium text-primary hover:underline"
                                            href={route(
                                                'loan-applications.show',
                                                application.id,
                                            )}
                                        >
                                            {application.application_no}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2">
                                        {application.customer?.name ??
                                            application.customer?.customer_no}
                                    </td>
                                    <td className="px-3 py-2">
                                        {application.product?.code ??
                                            application.product?.name}
                                    </td>
                                    <td className="px-3 py-2 tabular-nums">
                                        {application.requested_amount}
                                    </td>
                                    <td className="px-3 py-2">
                                        {application.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
