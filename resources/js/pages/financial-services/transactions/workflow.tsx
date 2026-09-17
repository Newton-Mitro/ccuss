import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CircleDollarSign, Construction } from 'lucide-react';
import { route } from 'ziggy-js';

const details: Record<
    string,
    { title: string; description: string; icon: typeof ArrowRightLeft }
> = {
    transfer: {
        title: 'Account transfer',
        description:
            'Move value between two financial accounts with a balanced operational entry.',
        icon: ArrowRightLeft,
    },
    'loan-disbursement': {
        title: 'Loan disbursement',
        description:
            'Prepare a controlled disbursement against an approved loan account.',
        icon: CircleDollarSign,
    },
    'loan-repayment': {
        title: 'Loan repayment',
        description:
            'Allocate a repayment between principal, interest, and the receiving cash or bank account.',
        icon: Construction,
    },
};
export default function TransactionWorkflow() {
    const { workflow } = usePage<{ workflow: string }>().props;
    const detail = details[workflow] ?? details.transfer;
    const Icon = detail.icon;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transactions', href: route('financial-transactions.index') },
        { title: detail.title, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={detail.title} />
            <div className="mx-auto max-w-2xl space-y-5">
                <ResourcePageHeader
                    title={detail.title}
                    description={detail.description}
                />
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center shadow-sm">
                    <Icon className="mx-auto h-10 w-10 text-primary" />
                    <h2 className="mt-4 text-lg font-semibold">
                        Workflow ready for configuration
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        This screen is reserved for the policy-aware workflow.
                        It will validate accounts, product rules, and accounting
                        mappings before posting.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href={route('financial-transactions.index')}>
                            Back to transactions
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
