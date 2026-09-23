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
    const {
        data: collateralData,
        setData: setCollateralData,
        post: postCollateral,
        processing: collateralProcessing,
    } = useForm({
        type: 'PROPERTY',
        description: '',
        assessed_value: '',
        secured_value: '',
        notes: '',
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
    const submitCollateral = (event: React.FormEvent) => {
        event.preventDefault();
        postCollateral(
            route('loan-applications.collaterals.store', application.id),
        );
    };

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
                <section className="space-y-3 rounded-lg border bg-card p-4">
                    <div>
                        <h2 className="text-sm font-semibold">Collateral</h2>
                        <p className="text-xs text-muted-foreground">
                            Register and verify security before disbursement.
                        </p>
                    </div>
                    <div className="divide-y">
                        {(application.collaterals ?? []).map((collateral) => (
                            <div
                                key={collateral.id}
                                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {collateral.type} ·{' '}
                                        {collateral.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Assessed{' '}
                                        {collateral.assessed_value ?? '-'} ·
                                        Secured{' '}
                                        {collateral.secured_value ?? '-'} ·{' '}
                                        {collateral.status}
                                    </p>
                                </div>
                                {collateral.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'loan-applications.collaterals.verify',
                                                        [
                                                            application.id,
                                                            collateral.id,
                                                        ],
                                                    ),
                                                    { approved: true },
                                                )
                                            }
                                        >
                                            Verify
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'loan-applications.collaterals.verify',
                                                        [
                                                            application.id,
                                                            collateral.id,
                                                        ],
                                                    ),
                                                    { approved: false },
                                                )
                                            }
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <form
                        onSubmit={submitCollateral}
                        className="grid gap-3 border-t pt-3 sm:grid-cols-2"
                    >
                        <div>
                            <Label>Type</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={collateralData.type}
                                onChange={(event) =>
                                    setCollateralData(
                                        'type',
                                        event.target.value,
                                    )
                                }
                            >
                                {[
                                    'DEPOSIT_LIEN',
                                    'PROPERTY',
                                    'VEHICLE',
                                    'GUARANTEE',
                                    'OTHER',
                                ].map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={collateralData.description}
                                onChange={(event) =>
                                    setCollateralData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Assessed value</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={collateralData.assessed_value}
                                onChange={(event) =>
                                    setCollateralData(
                                        'assessed_value',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Secured value</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={collateralData.secured_value}
                                onChange={(event) =>
                                    setCollateralData(
                                        'secured_value',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Notes</Label>
                            <Input
                                value={collateralData.notes}
                                onChange={(event) =>
                                    setCollateralData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="flex justify-end sm:col-span-2">
                            <Button
                                type="submit"
                                disabled={collateralProcessing}
                            >
                                Add collateral
                            </Button>
                        </div>
                    </form>
                </section>
                <Button asChild variant="outline">
                    <Link href={route('loan-applications.index')}>
                        Back to applications
                    </Link>
                </Button>
            </div>
        </CustomAuthLayout>
    );
}
