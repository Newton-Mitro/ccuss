import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatDate } from '@/lib/date_util';
import { FinancialAccountSearchInput } from '@/pages/treasury-cash/teller-deposits/components/financial-account-search-input';
import type { BreadcrumbItem } from '@/types';
import type {
    LoanApplicationShowPageProps,
    LoanCollateral,
} from '@/types/financial-services';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    Banknote,
    CalendarDays,
    Check,
    ChevronRight,
    CircleAlert,
    ClipboardCheck,
    FileCheck2,
    FileText,
    HandCoins,
    Landmark,
    LockKeyhole,
    Plus,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { CustomerSearchInput } from '../../customer-kyc/customers/components/customer-search-input';

export default function LoanApplicationShow() {
    const { application } = usePage<LoanApplicationShowPageProps>().props;

    const [arrearNote, setArrearNote] = useState('');

    const { data, setData, processing } = useForm({
        approved_amount: String(
            application.approved_amount ?? application.requested_amount,
        ),
        decision_note: '',
    });

    const {
        data: depositLienData,
        setData: setDepositLienData,
        post: postDepositLien,
        processing: depositLienProcessing,
    } = useForm({
        type: 'DEPOSIT_LIEN',
        financial_account_id: '',
        description: '',
        assessed_value: '',
        secured_value: '',
        notes: '',
    });

    const {
        data: otherCollateralData,
        setData: setOtherCollateralData,
        post: postOtherCollateral,
        processing: otherCollateralProcessing,
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
    } = useForm({
        customer_id: '',
        notes: '',
    });

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
        {
            title: 'Loan Applications',
            href: route('loan-applications.index'),
        },
        {
            title: application.application_no,
            href: '',
        },
    ];

    const action = (name: 'submit' | 'review' | 'reject' | 'approve') => {
        const titleMap = {
            submit: 'Submit for review?',
            review: 'Start review?',
            approve: 'Approve this loan application?',
            reject: 'Reject this loan application?',
        };

        const textMap = {
            submit: `Submit ${application.application_no} for review?`,
            review: `Begin review of ${application.application_no}?`,
            approve: `Approve ${application.application_no} with the entered amount and note?`,
            reject: `Reject ${application.application_no}? This action cannot be undone.`,
        };

        const confirmMap = {
            submit: 'Submit application',
            review: 'Start review',
            approve: 'Approve application',
            reject: 'Reject application',
        };

        appSwal
            .fire({
                title: titleMap[name],
                text: textMap[name],
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: confirmMap[name],
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route(`loan-applications.${name}`, application.id),
                    name === 'approve' || name === 'reject' ? data : {},
                );
            });
    };

    const submitDepositLien = (event: React.FormEvent) => {
        event.preventDefault();
        postDepositLien(
            route('loan-applications.collaterals.store', application.id),
        );
    };

    const submitOtherCollateral = (event: React.FormEvent) => {
        event.preventDefault();
        postOtherCollateral(
            route('loan-applications.collaterals.store', application.id),
        );
    };

    const createLoanAccount = () => {
        appSwal
            .fire({
                title: 'Create loan account?',
                text: `Create the loan account for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Create account',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.create-account', application.id),
                );
            });
    };

    const generateSchedule = () => {
        appSwal
            .fire({
                title: 'Generate monthly schedule?',
                text: `Generate the repayment schedule for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Generate schedule',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route(
                        'loan-applications.schedule.generate',
                        application.id,
                    ),
                    {
                        frequency: 'MONTHLY',
                    },
                );
            });
    };

    const assessArrears = () => {
        appSwal
            .fire({
                title: 'Assess arrears?',
                text: `Assess arrears for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Assess arrears',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.arrears.assess', application.id),
                    {
                        as_of_date: new Date().toISOString().slice(0, 10),
                    },
                );
            });
    };

    const verifyCollateral = (
        collateralId: number,
        approved: boolean,
        type: string,
    ) => {
        appSwal
            .fire({
                title: approved
                    ? 'Verify this collateral?'
                    : 'Reject this collateral?',
                text: `${
                    approved ? 'Verify' : 'Reject'
                } ${type} collateral for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: approved
                    ? 'Verify collateral'
                    : 'Reject collateral',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.collaterals.verify', [
                        application.id,
                        collateralId,
                    ]),
                    {
                        approved,
                    },
                );
            });
    };

    const releaseCollateral = (collateralId: number, type: string) => {
        appSwal
            .fire({
                title: 'Release this collateral?',
                text: `Release ${type} collateral for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Release collateral',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.collaterals.release', [
                        application.id,
                        collateralId,
                    ]),
                );
            });
    };

    const decideGuarantor = (
        guarantorId: number,
        accepted: boolean,
        name: string,
    ) => {
        appSwal
            .fire({
                title: accepted ? 'Accept guarantor?' : 'Reject guarantor?',
                text: `${
                    accepted ? 'Accept' : 'Reject'
                } ${name} for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: accepted
                    ? 'Accept guarantor'
                    : 'Reject guarantor',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.guarantors.decide', [
                        application.id,
                        guarantorId,
                    ]),
                    {
                        accepted,
                    },
                );
            });
    };

    const resolveArrear = (arrearId: number, resolution: string) => {
        appSwal
            .fire({
                title: 'Resolve arrear?',
                text: `Apply the ${resolution
                    .replace('_', ' ')
                    .toLowerCase()} resolution to this arrear?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Resolve arrear',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.arrears.resolve', [
                        application.id,
                        arrearId,
                    ]),
                    {
                        resolution,
                        note: arrearNote,
                    },
                );
            });
    };

    const activateProtection = () => {
        appSwal
            .fire({
                title: 'Activate protection?',
                text: `Activate the loan protection for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Activate protection',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route(
                        'loan-applications.protection.activate',
                        application.id,
                    ),
                );
            });
    };

    const cancelProtection = () => {
        appSwal
            .fire({
                title: 'Cancel protection?',
                text: `Cancel the loan protection for ${application.application_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Cancel protection',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route(
                        'loan-applications.protection.cancel',
                        application.id,
                    ),
                );
            });
    };

    const statusTone =
        application.status === 'APPROVED'
            ? 'success'
            : application.status === 'REJECTED'
              ? 'danger'
              : 'neutral';

    const schedules = application.loan_account?.schedules ?? [];
    const arrears = application.loan_account?.arrears ?? [];
    const activeArrears = arrears.filter(
        (arrear) => arrear.status !== 'CLEARED',
    );
    const disbursements = application.loan_account?.disbursements ?? [];
    const repayments = application.loan_account?.repayments ?? [];
    const depositLiens = (application.collaterals ?? []).filter(
        (collateral: LoanCollateral) => collateral.type === 'DEPOSIT_LIEN',
    );
    const otherCollaterals = (application.collaterals ?? []).filter(
        (collateral: LoanCollateral) => collateral.type !== 'DEPOSIT_LIEN',
    );
    const guarantors = application.guarantors ?? [];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={application.application_no} />

            <div className="space-y-5 pb-6">
                {/* Header */}
                <ResourcePageHeader
                    title={application.application_no}
                    description={`${application.customer?.name ?? 'Unknown customer'} · ${application.product?.name ?? 'Loan'}`}
                    action={
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <StatusBadge tone={statusTone}>
                                {application.status}
                            </StatusBadge>

                            {application.status === 'DRAFT' && (
                                <Button asChild size="sm" variant="outline">
                                    <Link
                                        href={route(
                                            'loan-applications.edit',
                                            application.id,
                                        )}
                                    >
                                        Edit draft
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Application summary */}
                <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <div className="grid divide-y bg-muted/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                        <SummaryItem
                            icon={Banknote}
                            label="Requested amount"
                            value={application.requested_amount}
                            emphasis
                        />

                        <SummaryItem
                            icon={CalendarDays}
                            label="Requested term"
                            value={
                                application.requested_term_months
                                    ? `${application.requested_term_months} months`
                                    : '-'
                            }
                        />

                        <SummaryItem
                            icon={FileText}
                            label="Purpose"
                            value={application.purpose ?? '-'}
                        />

                        <SummaryItem
                            icon={UserCheck}
                            label="Applicant"
                            value={
                                application.customer?.customer_no ??
                                application.customer?.name ??
                                '-'
                            }
                        />
                    </div>
                </div>

                {/* Workflow */}
                <section className="rounded-xl border bg-background">
                    <div className="flex flex-col gap-3 border-b px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-semibold">
                                    Application workflow
                                </h2>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Review and move this application through its
                                approval lifecycle.
                            </p>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                            {application.status === 'APPROVED' &&
                                !application.loan_account && (
                                    <Button
                                        size="sm"
                                        onClick={createLoanAccount}
                                    >
                                        <Landmark className="mr-1.5 h-4 w-4" />
                                        Create loan account
                                    </Button>
                                )}

                            {application.status === 'DRAFT' && (
                                <Button
                                    size="sm"
                                    onClick={() => action('submit')}
                                >
                                    <ArrowUpRight className="mr-1.5 h-4 w-4" />
                                    Submit for review
                                </Button>
                            )}

                            {application.status === 'SUBMITTED' && (
                                <Button
                                    size="sm"
                                    onClick={() => action('review')}
                                >
                                    <ClipboardCheck className="mr-1.5 h-4 w-4" />
                                    Start review
                                </Button>
                            )}

                            {['SUBMITTED', 'UNDER_REVIEW'].includes(
                                application.status,
                            ) && (
                                <>
                                    <div className="w-full sm:w-40">
                                        <Label className="sr-only">
                                            Approved amount
                                        </Label>
                                        <Input
                                            className="h-9"
                                            value={data.approved_amount}
                                            onChange={(event) =>
                                                setData(
                                                    'approved_amount',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Approved amount"
                                        />
                                    </div>

                                    <div className="w-full sm:w-56">
                                        <Label className="sr-only">
                                            Decision note
                                        </Label>
                                        <Input
                                            className="h-9"
                                            value={data.decision_note}
                                            onChange={(event) =>
                                                setData(
                                                    'decision_note',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Decision note"
                                        />
                                    </div>

                                    <Button
                                        size="sm"
                                        disabled={processing}
                                        onClick={() => action('approve')}
                                    >
                                        <Check className="mr-1.5 h-4 w-4" />
                                        Approve
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={processing}
                                        onClick={() => action('reject')}
                                    >
                                        <X className="mr-1.5 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                        <WorkflowStep
                            label="Draft"
                            active={application.status === 'DRAFT'}
                            complete={[
                                'SUBMITTED',
                                'UNDER_REVIEW',
                                'APPROVED',
                            ].includes(application.status)}
                        />
                        <ChevronRight className="h-3.5 w-3.5" />
                        <WorkflowStep
                            label="Submitted"
                            active={application.status === 'SUBMITTED'}
                            complete={['UNDER_REVIEW', 'APPROVED'].includes(
                                application.status,
                            )}
                        />
                        <ChevronRight className="h-3.5 w-3.5" />
                        <WorkflowStep
                            label="Under review"
                            active={application.status === 'UNDER_REVIEW'}
                            complete={application.status === 'APPROVED'}
                        />
                        <ChevronRight className="h-3.5 w-3.5" />
                        <WorkflowStep
                            label="Approved"
                            active={application.status === 'APPROVED'}
                            complete={application.status === 'APPROVED'}
                        />
                    </div>
                </section>

                {/* Loan account */}
                {application.loan_account && (
                    <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                        <SectionHeader
                            icon={Landmark}
                            title="Loan account"
                            description={`${application.loan_account.loan_no} · ${application.loan_account.status}`}
                        />

                        {/* Account summary */}
                        <div className="grid border-b bg-muted/10 sm:grid-cols-3">
                            <MetricItem
                                label="Loan number"
                                value={application.loan_account.loan_no}
                            />
                            <MetricItem
                                label="Account status"
                                value={application.loan_account.status}
                            />
                            <MetricItem
                                label="Schedules"
                                value={String(schedules.length)}
                            />
                        </div>

                        {/* Repayment schedule */}
                        <div className="border-b">
                            <SubsectionHeader
                                icon={RefreshCw}
                                title="Repayment schedule"
                                actions={
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={generateSchedule}
                                        >
                                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                            Generate schedule
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={assessArrears}
                                        >
                                            <CircleAlert className="mr-1.5 h-3.5 w-3.5" />
                                            Assess arrears
                                        </Button>
                                    </>
                                }
                            />

                            <div className="px-4 pb-4">
                                <div className="mb-3 max-w-md">
                                    <Label htmlFor="arrear-resolution-note">
                                        Resolution note
                                    </Label>
                                    <Input
                                        id="arrear-resolution-note"
                                        className="mt-1.5 h-9"
                                        value={arrearNote}
                                        onChange={(event) =>
                                            setArrearNote(event.target.value)
                                        }
                                        placeholder="Optional note for arrear resolution"
                                    />
                                </div>

                                {schedules.length > 0 ? (
                                    <DataTable>
                                        <thead>
                                            <tr>
                                                <TableHead>#</TableHead>
                                                <TableHead>Due</TableHead>
                                                <TableHead align="right">
                                                    Principal
                                                </TableHead>
                                                <TableHead align="right">
                                                    Interest
                                                </TableHead>
                                                <TableHead align="right">
                                                    Total
                                                </TableHead>
                                                <TableHead>Version</TableHead>
                                                <TableHead>Status</TableHead>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {schedules.map((schedule) => (
                                                <tr
                                                    key={schedule.id}
                                                    className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                                                >
                                                    <TableCell>
                                                        {
                                                            schedule.installment_no
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            schedule.due_date,
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {
                                                            schedule.scheduled_principal
                                                        }
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {
                                                            schedule.scheduled_interest
                                                        }
                                                    </TableCell>
                                                    <TableCell
                                                        align="right"
                                                        className="font-semibold"
                                                    >
                                                        {schedule.total_due}
                                                    </TableCell>
                                                    <TableCell>
                                                        {schedule.schedule_version ??
                                                            '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge tone="neutral">
                                                            {schedule.status}
                                                        </StatusBadge>
                                                    </TableCell>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </DataTable>
                                ) : (
                                    <EmptyState
                                        icon={CalendarDays}
                                        text="No repayment schedule generated yet."
                                    />
                                )}
                            </div>
                        </div>

                        {/* Arrears */}
                        {activeArrears.length > 0 && (
                            <div className="border-b">
                                <SubsectionHeader
                                    icon={CircleAlert}
                                    title="Outstanding arrears"
                                    badge={String(activeArrears.length)}
                                />

                                <div className="divide-y divide-border/70">
                                    {activeArrears.map((arrear) => (
                                        <div
                                            key={arrear.id}
                                            className="flex flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="text-sm font-medium">
                                                        {arrear.total_overdue}
                                                    </span>

                                                    <StatusBadge tone="danger">
                                                        {arrear.days_overdue}{' '}
                                                        days overdue
                                                    </StatusBadge>
                                                </div>

                                                {arrear.resolution_type && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Resolution:{' '}
                                                        {arrear.resolution_type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                        {arrear.resolution_note
                                                            ? ` · ${arrear.resolution_note}`
                                                            : ''}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
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
                                                            resolveArrear(
                                                                arrear.id,
                                                                resolution,
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
                            </div>
                        )}

                        {/* Disbursements */}
                        <div className="border-b">
                            <SubsectionHeader
                                icon={ArrowDownToLine}
                                title="Disbursement history"
                                badge={String(disbursements.length)}
                            />

                            {disbursements.length === 0 ? (
                                <EmptyState
                                    icon={ArrowDownToLine}
                                    text="No disbursements recorded."
                                />
                            ) : (
                                <div className="divide-y divide-border/70">
                                    {disbursements.map((disbursement) => (
                                        <div
                                            key={disbursement.id}
                                            className="flex flex-col gap-2.5 px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {disbursement.amount}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        disbursement.disbursed_at,
                                                    )}{' '}
                                                    · {disbursement.status}
                                                </p>
                                            </div>

                                            <div className="text-xs text-muted-foreground sm:text-right">
                                                <p>
                                                    {disbursement
                                                        .financial_transaction
                                                        ?.transaction_no ?? '-'}
                                                </p>
                                                <p>
                                                    {disbursement
                                                        .financial_transaction
                                                        ?.status ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Repayments */}
                        <div>
                            <SubsectionHeader
                                icon={HandCoins}
                                title="Repayment history"
                                badge={String(repayments.length)}
                            />

                            {repayments.length === 0 ? (
                                <EmptyState
                                    icon={HandCoins}
                                    text="No repayments recorded."
                                />
                            ) : (
                                <div className="divide-y divide-border/70">
                                    {repayments.map((repayment) => (
                                        <div
                                            key={repayment.id}
                                            className="px-4 py-3.5"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {repayment.amount}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            repayment.repayment_date,
                                                        )}{' '}
                                                        · {repayment.status}
                                                    </p>
                                                </div>

                                                <div className="text-xs text-muted-foreground sm:text-right">
                                                    <p>
                                                        {repayment
                                                            .financial_transaction
                                                            ?.transaction_no ??
                                                            '-'}
                                                    </p>
                                                    <p>
                                                        {repayment.reference ??
                                                            '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {(repayment.allocations ?? [])
                                                    .map(
                                                        (allocation) =>
                                                            `${allocation.component?.type ?? 'COMPONENT'}: ${allocation.amount}`,
                                                    )
                                                    .join(' · ') ||
                                                    'No allocation recorded'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Collateral */}
                <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <SectionHeader
                        icon={ShieldCheck}
                        title="Collateral"
                        description="Register and verify security before disbursement."
                        badge={String(
                            depositLiens.length + otherCollaterals.length,
                        )}
                    />

                    <div className="divide-y divide-border/70">
                        <div className="border-b bg-muted/30 px-4 py-3">
                            <p className="text-sm font-medium">Deposit Liens</p>
                            <p className="text-xs text-muted-foreground">
                                Bank deposits pledged as collateral.
                            </p>
                        </div>

                        {depositLiens.length > 0 ? (
                            depositLiens.map((collateral) => (
                                <CollateralRecord
                                    key={collateral.id}
                                    collateral={collateral}
                                    onVerify={verifyCollateral}
                                    onRelease={releaseCollateral}
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={ShieldCheck}
                                text="No deposit liens recorded."
                            />
                        )}

                        <div className="border-b bg-muted/30 px-4 py-3">
                            <p className="text-sm font-medium">
                                Other Collateral
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Property, vehicle, guarantor, and other
                                security.
                            </p>
                        </div>

                        {otherCollaterals.length > 0 ? (
                            otherCollaterals.map((collateral) => (
                                <CollateralRecord
                                    key={collateral.id}
                                    collateral={collateral}
                                    onVerify={verifyCollateral}
                                    onRelease={releaseCollateral}
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={ShieldCheck}
                                text="No other collateral recorded."
                            />
                        )}
                    </div>

                    <div className="divide-y border-t bg-muted/30">
                        <form
                            onSubmit={submitDepositLien}
                            className="p-4 sm:p-5"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">
                                    Add deposit lien
                                </p>
                            </div>
                            <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="sm:col-span-2">
                                    <FormField label="Deposit account">
                                        <FinancialAccountSearchInput
                                            scope="deposit"
                                            placeholder="Search deposit account"
                                            onSelect={(account) =>
                                                setDepositLienData(
                                                    'financial_account_id',
                                                    String(account.id),
                                                )
                                            }
                                        />
                                    </FormField>
                                </div>
                                <FormField label="Description">
                                    <Input
                                        className="h-9"
                                        value={depositLienData.description}
                                        onChange={(event) =>
                                            setDepositLienData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <FormField label="Assessed value">
                                    <Input
                                        className="h-9"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={depositLienData.assessed_value}
                                        onChange={(event) =>
                                            setDepositLienData(
                                                'assessed_value',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <FormField label="Secured value">
                                    <Input
                                        className="h-9"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={depositLienData.secured_value}
                                        onChange={(event) =>
                                            setDepositLienData(
                                                'secured_value',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <FormField label="Notes">
                                    <Input
                                        className="h-9"
                                        value={depositLienData.notes}
                                        onChange={(event) =>
                                            setDepositLienData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Optional deposit lien notes"
                                    />
                                </FormField>
                                <div className="flex justify-end sm:col-span-2 lg:col-span-4">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={depositLienProcessing}
                                    >
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Add deposit lien
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <form
                            onSubmit={submitOtherCollateral}
                            className="p-4 sm:p-5"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">
                                    Add other collateral
                                </p>
                            </div>
                            <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <FormField label="Type">
                                    <Select
                                        className="h-9"
                                        value={otherCollateralData.type}
                                        onChange={(value) =>
                                            setOtherCollateralData(
                                                'type',
                                                value,
                                            )
                                        }
                                        options={[
                                            'PROPERTY',
                                            'VEHICLE',
                                            'GUARANTEE',
                                            'OTHER',
                                        ].map((value) => ({
                                            value,
                                            label: value,
                                        }))}
                                    />
                                </FormField>
                                <FormField label="Description">
                                    <Input
                                        className="h-9"
                                        value={otherCollateralData.description}
                                        onChange={(event) =>
                                            setOtherCollateralData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <FormField label="Assessed value">
                                    <Input
                                        className="h-9"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={
                                            otherCollateralData.assessed_value
                                        }
                                        onChange={(event) =>
                                            setOtherCollateralData(
                                                'assessed_value',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <FormField label="Secured value">
                                    <Input
                                        className="h-9"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={
                                            otherCollateralData.secured_value
                                        }
                                        onChange={(event) =>
                                            setOtherCollateralData(
                                                'secured_value',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <FormField label="Notes">
                                        <Input
                                            className="h-9"
                                            value={otherCollateralData.notes}
                                            onChange={(event) =>
                                                setOtherCollateralData(
                                                    'notes',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Optional collateral notes"
                                        />
                                    </FormField>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={otherCollateralProcessing}
                                    >
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Add other collateral
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Guarantors */}
                <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <SectionHeader
                        icon={Users}
                        title="Guarantors"
                        description="Invite eligible customers and record their decisions."
                        badge={String(guarantors.length)}
                    />

                    {guarantors.length > 0 && (
                        <div className="divide-y divide-border/70">
                            {guarantors.map((guarantor) => {
                                const name =
                                    guarantor.customer?.name ??
                                    guarantor.customer_id;

                                return (
                                    <div
                                        key={guarantor.id}
                                        className="flex flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border/50">
                                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <p className="truncate text-sm font-semibold">
                                                        {name}
                                                    </p>

                                                    <StatusBadge tone="neutral">
                                                        {guarantor.status}
                                                    </StatusBadge>
                                                </div>

                                                <p className="text-xs text-muted-foreground">
                                                    {guarantor.customer
                                                        ?.customer_no ?? '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {guarantor.status === 'PENDING' && (
                                            <div className="flex gap-1.5">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        decideGuarantor(
                                                            guarantor.id,
                                                            true,
                                                            String(name),
                                                        )
                                                    }
                                                >
                                                    <Check className="mr-1.5 h-3.5 w-3.5" />
                                                    Accept
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        decideGuarantor(
                                                            guarantor.id,
                                                            false,
                                                            String(name),
                                                        )
                                                    }
                                                >
                                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <form
                        className="border-t bg-muted/30 p-4"
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
                        <div className="mb-3 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">
                                Invite guarantor
                            </p>
                        </div>

                        <div className="grid items-end gap-3 sm:grid-cols-2">
                            <CustomerSearchInput
                                label="Customer"
                                placeholder="Search customer"
                                onSelect={(customer) =>
                                    setGuarantorData(
                                        'customer_id',
                                        String(customer.id),
                                    )
                                }
                            />

                            <FormField label="Notes">
                                <Input
                                    className="h-9"
                                    value={guarantorData.notes}
                                    onChange={(event) =>
                                        setGuarantorData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional notes"
                                />
                            </FormField>

                            <div className="flex justify-end sm:col-span-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={guarantorProcessing}
                                >
                                    <UserCheck className="mr-1.5 h-4 w-4" />
                                    Invite guarantor
                                </Button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Loan protection */}
                {application.loan_account && (
                    <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                        <SectionHeader
                            icon={LockKeyhole}
                            title="Loan protection"
                            description="Configure and activate protection for this loan account."
                        />

                        <div className="border-b px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-xs text-muted-foreground">
                                    Current status
                                </span>

                                <StatusBadge tone="neutral">
                                    {application.loan_account.protection_policy
                                        ?.status ?? 'NOT CONFIGURED'}
                                </StatusBadge>
                            </div>
                        </div>

                        <form
                            className="p-4 sm:p-5"
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
                            <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-primary"
                                        checked={protectionData.required}
                                        onChange={(event) =>
                                            setProtectionData(
                                                'required',
                                                event.target.checked,
                                            )
                                        }
                                    />

                                    <span>Protection required</span>
                                </label>

                                <FormField label="Coverage amount">
                                    <Input
                                        className="h-9"
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
                                </FormField>

                                <FormField label="Initial fee">
                                    <Input
                                        className="h-9"
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
                                </FormField>

                                <FormField label="Renewal fee">
                                    <Input
                                        className="h-9"
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
                                </FormField>

                                <FormField label="Renewal frequency">
                                    <Select
                                        className="h-9"
                                        value={protectionData.renewal_frequency}
                                        onChange={(value) =>
                                            setProtectionData(
                                                'renewal_frequency',
                                                value,
                                            )
                                        }
                                        options={[
                                            'NONE',
                                            'MONTHLY',
                                            'QUARTERLY',
                                            'HALF_YEARLY',
                                            'YEARLY',
                                        ].map((value) => ({
                                            value,
                                            label: value,
                                        }))}
                                    />
                                </FormField>

                                <FormField label="Next renewal">
                                    <AppDatePicker
                                        value={protectionData.next_renewal_at}
                                        onChange={(value) =>
                                            setProtectionData(
                                                'next_renewal_at',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>
                            </div>

                            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={protectionProcessing}
                                >
                                    <FileCheck2 className="mr-1.5 h-4 w-4" />
                                    Save protection
                                </Button>

                                {application.loan_account.protection_policy
                                    ?.status === 'PENDING' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={activateProtection}
                                    >
                                        <BadgeCheck className="mr-1.5 h-4 w-4" />
                                        Activate
                                    </Button>
                                )}

                                {application.loan_account.protection_policy
                                    ?.status === 'ACTIVE' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelProtection}
                                    >
                                        Cancel protection
                                    </Button>
                                )}
                            </div>
                        </form>
                    </section>
                )}

                {/* Footer navigation */}
                <div className="flex justify-start border-t pt-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={route('loan-applications.index')}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to applications
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

/* -------------------------------------------------------------------------- */
/* UI helpers                                                                  */
/* -------------------------------------------------------------------------- */

function SummaryItem({
    icon: Icon,
    label,
    value,
    emphasis = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 ring-1 ring-border/50">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {label}
                </p>

                <p
                    className={`truncate text-sm ${
                        emphasis ? 'font-semibold' : 'font-medium'
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
    badge,
}: {
    icon: React.ElementType;
    title: string;
    description?: string;
    badge?: string;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
            <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{title}</h2>

                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {badge !== undefined && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {badge}
                </span>
            )}
        </div>
    );
}

function SubsectionHeader({
    icon: Icon,
    title,
    badge,
    actions,
}: {
    icon: React.ElementType;
    title: string;
    badge?: string;
    actions?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2.5 border-b bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />

                <h3 className="text-sm font-semibold">{title}</h3>

                {badge !== undefined && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {badge}
                    </span>
                )}
            </div>

            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

function CollateralRecord({
    collateral,
    onVerify,
    onRelease,
}: {
    collateral: LoanCollateral;
    onVerify: (collateralId: number, approved: boolean, type: string) => void;
    onRelease: (collateralId: number, type: string) => void;
}) {
    return (
        <div className="flex flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-sm font-medium">{collateral.type}</p>
                    <StatusBadge tone="neutral">
                        {collateral.status}
                    </StatusBadge>
                </div>

                <p className="mt-0.5 text-sm text-muted-foreground">
                    {collateral.description}
                </p>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Assessed: {collateral.assessed_value ?? '-'}</span>
                    <span>Secured: {collateral.secured_value ?? '-'}</span>
                </div>
            </div>

            {collateral.status === 'PENDING' && (
                <div className="flex shrink-0 gap-1.5">
                    <Button
                        size="sm"
                        onClick={() =>
                            onVerify(collateral.id, true, collateral.type)
                        }
                    >
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Verify
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            onVerify(collateral.id, false, collateral.type)
                        }
                    >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Reject
                    </Button>
                </div>
            )}

            {collateral.status === 'VERIFIED' && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRelease(collateral.id, collateral.type)}
                >
                    Release
                </Button>
            )}
        </div>
    );
}

function MetricItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b px-4 py-3.5 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </p>

            <p className="mt-0.5 text-sm font-semibold">{value}</p>
        </div>
    );
}

function WorkflowStep({
    label,
    active,
    complete,
}: {
    label: string;
    active: boolean;
    complete: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-1.5 ${
                active
                    ? 'font-medium text-foreground'
                    : complete
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60'
            }`}
        >
            <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                    active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : complete
                          ? 'border-border bg-muted'
                          : 'border-border'
                }`}
            >
                {complete && !active ? <Check className="h-3 w-3" /> : ''}
            </span>

            <span>{label}</span>
        </div>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <Label>{label}</Label>
            <div className="mt-1.5">{children}</div>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    text,
}: {
    icon: React.ElementType;
    text: string;
}) {
    return (
        <div className="flex items-center gap-2 px-4 pt-1 pb-4 text-xs text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{text}</span>
        </div>
    );
}

function DataTable({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-x-auto rounded-lg border shadow-xs">
            <table className="w-full min-w-[760px] text-left text-xs tabular-nums">
                {children}
            </table>
        </div>
    );
}

function TableHead({
    children,
    align,
}: {
    children: React.ReactNode;
    align?: 'left' | 'right';
}) {
    return (
        <th
            className={`bg-muted/50 px-3 py-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase ${
                align === 'right' ? 'text-right' : 'text-left'
            }`}
        >
            {children}
        </th>
    );
}

function TableCell({
    children,
    align,
    className = '',
}: {
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}) {
    return (
        <td
            className={`px-3 py-2.5 align-middle whitespace-nowrap ${
                align === 'right' ? 'text-right' : 'text-left'
            } ${className}`}
        >
            {children}
        </td>
    );
}
