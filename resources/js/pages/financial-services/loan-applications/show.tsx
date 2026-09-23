import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import type { LoanApplicationShowPageProps } from '@/types/financial-services';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function LoanApplicationShow() {
    const { application } = usePage<LoanApplicationShowPageProps>().props;
    const { data, setData, post, processing } = useForm({
        approved_amount: String(
            application.approved_amount ?? application.requested_amount,
        ),
        decision_note: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Applications', href: route('loan-applications.index') },
        { title: application.application_no, href: '' },
    ];
    const action = (name: 'submit' | 'review' | 'reject' | 'approve') =>
        router.post(
            route(`loan-applications.${name}`, application.id),
            name === 'approve' || name === 'reject' ? data : undefined,
        );

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={application.application_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={application.application_no}
                    description={`${application.customer?.name ?? ''} · ${application.product?.name ?? ''}`}
                />
                <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <StatusBadge
                            tone={
                                application.status === 'APPROVED'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {application.status}
                        </StatusBadge>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">
                            Requested
                        </p>
                        <p className="font-semibold">
                            {application.requested_amount}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Term</p>
                        <p className="font-semibold">
                            {application.requested_term_months ?? '-'} months
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Purpose</p>
                        <p className="font-semibold">
                            {application.purpose ?? '-'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {application.status === 'APPROVED' &&
                        !application.loan_account && (
                            <Button
                                onClick={() =>
                                    router.post(
                                        route(
                                            'loan-applications.create-account',
                                            application.id,
                                        ),
                                    )
                                }
                            >
                                Create loan account
                            </Button>
                        )}
                    {application.status === 'DRAFT' && (
                        <Button onClick={() => action('submit')}>
                            Submit for review
                        </Button>
                    )}
                    {application.status === 'SUBMITTED' && (
                        <Button onClick={() => action('review')}>
                            Start review
                        </Button>
                    )}
                    {['SUBMITTED', 'UNDER_REVIEW'].includes(
                        application.status,
                    ) && (
                        <>
                            <div>
                                <Label>Approved amount</Label>
                                <Input
                                    value={data.approved_amount}
                                    onChange={(event) =>
                                        setData(
                                            'approved_amount',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Decision note</Label>
                                <Input
                                    value={data.decision_note}
                                    onChange={(event) =>
                                        setData(
                                            'decision_note',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <Button
                                disabled={processing}
                                onClick={() => action('approve')}
                            >
                                Approve
                            </Button>
                            <Button
                                disabled={processing}
                                variant="outline"
                                onClick={() => action('reject')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </div>
                {application.loan_account && (
                    <div className="rounded-lg border bg-card p-4 text-sm">
                        <p className="text-xs text-muted-foreground">
                            Loan account
                        </p>
                        <p className="font-semibold">
                            {application.loan_account.loan_no} ·{' '}
                            {application.loan_account.status}
                        </p>
                    </div>
                )}
                <Button asChild variant="outline">
                    <Link href={route('loan-applications.index')}>
                        Back to applications
                    </Link>
                </Button>
            </div>
        </CustomAuthLayout>
    );
}
