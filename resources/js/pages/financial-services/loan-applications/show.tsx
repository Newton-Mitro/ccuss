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
    const { application, guarantorCustomers } =
        usePage<LoanApplicationShowPageProps>().props;
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
    const {
        data: guarantorData,
        setData: setGuarantorData,
        post: postGuarantor,
        processing: guarantorProcessing,
    } = useForm({ customer_id: '', notes: '' });
    const {
        data: protectionData,
        setData: setProtectionData,
        post: postProtection,
        processing: protectionProcessing,
    } = useForm({
        required: false,
        coverage_amount: '',
        initial_fee: '0',
        renewal_fee: '0',
        renewal_frequency: 'NONE',
        next_renewal_at: '',
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
                        <div className="mt-3 border-t pt-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground">
                                    Repayment schedule
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    'loan-applications.schedule.generate',
                                                    application.id,
                                                ),
                                                { frequency: 'MONTHLY' },
                                            )
                                        }
                                    >
                                        Generate monthly schedule
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    'loan-applications.arrears.assess',
                                                    application.id,
                                                ),
                                                {
                                                    as_of_date: new Date()
                                                        .toISOString()
                                                        .slice(0, 10),
                                                },
                                            )
                                        }
                                    >
                                        Assess arrears
                                    </Button>
                                </div>
                            </div>
                            {(application.loan_account.schedules ?? []).length >
                                0 && (
                                <div className="mt-2 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2">#</th>
                                                <th>Due</th>
                                                <th>Principal</th>
                                                <th>Interest</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {application.loan_account.schedules?.map(
                                                (schedule) => (
                                                    <tr
                                                        key={schedule.id}
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="py-2">
                                                            {
                                                                schedule.installment_no
                                                            }
                                                        </td>
                                                        <td>
                                                            {schedule.due_date}
                                                        </td>
                                                        <td>
                                                            {
                                                                schedule.scheduled_principal
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                schedule.scheduled_interest
                                                            }
                                                        </td>
                                                        <td>
                                                            {schedule.total_due}
                                                        </td>
                                                        <td>
                                                            {schedule.status}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {(application.loan_account.arrears ?? []).length >
                                0 && (
                                <div className="mt-2 space-y-2 text-xs text-destructive">
                                    {application.loan_account.arrears
                                        ?.filter(
                                            (arrear) =>
                                                arrear.status !== 'CLEARED',
                                        )
                                        .map((arrear) => (
                                            <div
                                                key={arrear.id}
                                                className="flex flex-wrap items-center justify-between gap-2"
                                            >
                                                <span>
                                                    Arrear {arrear.days_overdue}{' '}
                                                    days ·{' '}
                                                    {arrear.total_overdue}
                                                </span>
                                                <div className="flex gap-1">
                                                    {[
                                                        'RESOLVED',
                                                        'WAIVED',
                                                        'RESTRUCTURED',
                                                        'WRITTEN_OFF',
                                                    ].map((resolution) => (
                                                        <Button
                                                            key={resolution}
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.post(
                                                                    route(
                                                                        'loan-applications.arrears.resolve',
                                                                        [
                                                                            application.id,
                                                                            arrear.id,
                                                                        ],
                                                                    ),
                                                                    {
                                                                        resolution,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            {resolution.replace(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-3 border-t pt-3">
                            <p className="text-xs text-muted-foreground">
                                Disbursement history
                            </p>
                            {(application.loan_account.disbursements ?? [])
                                .length === 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    No disbursements recorded.
                                </p>
                            ) : (
                                <div className="mt-2 space-y-2">
                                    {application.loan_account.disbursements?.map(
                                        (disbursement) => (
                                            <div
                                                key={disbursement.id}
                                                className="flex flex-wrap justify-between gap-2 border-b pb-2 last:border-0 last:pb-0"
                                            >
                                                <span>
                                                    {disbursement.disbursed_at}{' '}
                                                    · {disbursement.status}
                                                </span>
                                                <span>
                                                    {disbursement.amount} ·{' '}
                                                    {disbursement
                                                        .financial_transaction
                                                        ?.transaction_no ??
                                                        '-'}{' '}
                                                    ·{' '}
                                                    {disbursement
                                                        .financial_transaction
                                                        ?.status ?? '-'}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-3 border-t pt-3">
                            <p className="text-xs text-muted-foreground">
                                Repayment history
                            </p>
                            {(application.loan_account.repayments ?? [])
                                .length === 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    No repayments recorded.
                                </p>
                            ) : (
                                <div className="mt-2 space-y-2 text-xs">
                                    {application.loan_account.repayments?.map(
                                        (repayment) => (
                                            <div
                                                key={repayment.id}
                                                className="border-b pb-2 last:border-0 last:pb-0"
                                            >
                                                <div className="flex flex-wrap justify-between gap-2">
                                                    <span>
                                                        {
                                                            repayment.repayment_date
                                                        }{' '}
                                                        · {repayment.amount} ·{' '}
                                                        {repayment.status}
                                                    </span>
                                                    <span>
                                                        {repayment
                                                            .financial_transaction
                                                            ?.transaction_no ??
                                                            '-'}{' '}
                                                        ·{' '}
                                                        {repayment.reference ??
                                                            '-'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-muted-foreground">
                                                    {(
                                                        repayment.allocations ??
                                                        []
                                                    )
                                                        .map(
                                                            (allocation) =>
                                                                `${allocation.component?.type ?? 'COMPONENT'}: ${allocation.amount}`,
                                                        )
                                                        .join(' · ') ||
                                                        'No allocation recorded'}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
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
                                {collateral.status === 'VERIFIED' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    'loan-applications.collaterals.release',
                                                    [
                                                        application.id,
                                                        collateral.id,
                                                    ],
                                                ),
                                            )
                                        }
                                    >
                                        Release
                                    </Button>
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
                <section className="space-y-3 rounded-lg border bg-card p-4">
                    <div>
                        <h2 className="text-sm font-semibold">Guarantors</h2>
                        <p className="text-xs text-muted-foreground">
                            Invite an eligible customer and record their
                            decision.
                        </p>
                    </div>
                    <div className="divide-y">
                        {(application.guarantors ?? []).map((guarantor) => (
                            <div
                                key={guarantor.id}
                                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {guarantor.customer?.name ??
                                            guarantor.customer_id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {guarantor.customer?.customer_no ?? '-'}{' '}
                                        · {guarantor.status}
                                    </p>
                                </div>
                                {guarantor.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'loan-applications.guarantors.decide',
                                                        [
                                                            application.id,
                                                            guarantor.id,
                                                        ],
                                                    ),
                                                    { accepted: true },
                                                )
                                            }
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'loan-applications.guarantors.decide',
                                                        [
                                                            application.id,
                                                            guarantor.id,
                                                        ],
                                                    ),
                                                    { accepted: false },
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
                        className="grid gap-3 border-t pt-3 sm:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            postGuarantor(
                                route(
                                    'loan-applications.guarantors.store',
                                    application.id,
                                ),
                            );
                        }}
                    >
                        <div>
                            <Label>Customer</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={guarantorData.customer_id}
                                onChange={(event) =>
                                    setGuarantorData(
                                        'customer_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Select customer</option>
                                {guarantorCustomers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                    >
                                        {customer.name} · {customer.customer_no}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Input
                                value={guarantorData.notes}
                                onChange={(event) =>
                                    setGuarantorData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Button
                                type="submit"
                                disabled={guarantorProcessing}
                            >
                                Invite guarantor
                            </Button>
                        </div>
                    </form>
                </section>
                {application.loan_account && (
                    <section className="space-y-3 rounded-lg border bg-card p-4">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Loan protection
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Configure and activate protection for this loan
                                account.
                            </p>
                        </div>
                        <p className="text-sm">
                            Status:{' '}
                            {application.loan_account.protection_policy
                                ?.status ?? 'NOT CONFIGURED'}
                        </p>
                        <form
                            className="grid gap-3 sm:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                postProtection(
                                    route(
                                        'loan-applications.protection.store',
                                        application.id,
                                    ),
                                );
                            }}
                        >
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={protectionData.required}
                                    onChange={(event) =>
                                        setProtectionData(
                                            'required',
                                            event.target.checked,
                                        )
                                    }
                                />{' '}
                                Required
                            </label>
                            <div>
                                <Label>Coverage amount</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={protectionData.coverage_amount}
                                    onChange={(event) =>
                                        setProtectionData(
                                            'coverage_amount',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Initial fee</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={protectionData.initial_fee}
                                    onChange={(event) =>
                                        setProtectionData(
                                            'initial_fee',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Renewal fee</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={protectionData.renewal_fee}
                                    onChange={(event) =>
                                        setProtectionData(
                                            'renewal_fee',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Renewal frequency</Label>
                                <select
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                    value={protectionData.renewal_frequency}
                                    onChange={(event) =>
                                        setProtectionData(
                                            'renewal_frequency',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {[
                                        'NONE',
                                        'MONTHLY',
                                        'QUARTERLY',
                                        'HALF_YEARLY',
                                        'YEARLY',
                                    ].map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Next renewal</Label>
                                <Input
                                    type="date"
                                    value={protectionData.next_renewal_at}
                                    onChange={(event) =>
                                        setProtectionData(
                                            'next_renewal_at',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-end gap-2 sm:col-span-3">
                                <Button
                                    type="submit"
                                    disabled={protectionProcessing}
                                >
                                    Save protection
                                </Button>
                                {application.loan_account.protection_policy
                                    ?.status === 'PENDING' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    'loan-applications.protection.activate',
                                                    application.id,
                                                ),
                                            )
                                        }
                                    >
                                        Activate
                                    </Button>
                                )}
                                {application.loan_account.protection_policy
                                    ?.status === 'ACTIVE' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    'loan-applications.protection.cancel',
                                                    application.id,
                                                ),
                                            )
                                        }
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </section>
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
