import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import { CustomerSearchInput } from '@/modules/customers-kyc/customers/components/customer-search-input';
import { FinancialAccountSearchInput } from '@/modules/financial-services/components/financial-account-search-input';
import type {
    LoanApplicationShowPageProps,
    LoanCollateral,
    LoanSchedule,
} from '@/modules/financial-services/types/financial-services';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowLeft,
    ArrowUpRight,
    Banknote,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    ChevronRight,
    CircleAlert,
    ClipboardCheck,
    FileText,
    GraduationCap,
    HandCoins,
    Landmark,
    Pencil,
    Plus,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

function getLocalDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function LoanApplicationShow() {
    const {
        application,
        can_manage_schedule: canManageSchedule,
        can_view_supporting_documents: canViewSupportingDocuments,
        can_submit_protection_claim: canSubmitProtectionClaim,
        can_manage_protection_claims: canManageProtectionClaims,
        can_create_disbursement: canCreateDisbursement,
        payout_accounts,
        errors: pageErrors,
    } = usePage<LoanApplicationShowPageProps>().props;

    const [arrearNote, setArrearNote] = useState('');
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<LoanSchedule | null>(
        null,
    );

    const {
        data: scheduleData,
        setData: setScheduleData,
        post: postSchedule,
        put: putSchedule,
        processing: scheduleProcessing,
        errors: scheduleErrors,
        reset: resetScheduleForm,
    } = useForm({
        due_date: getLocalDate(),
        scheduled_principal: '',
        scheduled_interest: '',
        scheduled_fee: '',
        scheduled_protection_fee: '',
    });

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
        data: claimData,
        setData: setClaimData,
        post: postProtectionClaim,
        processing: claimProcessing,
        errors: claimErrors,
    } = useForm({
        death_date: '',
        death_certificate: null as File | null,
        notes: '',
    });

    const {
        data: claimDecisionData,
        setData: setClaimDecisionData,
        post: postClaimDecision,
        processing: claimDecisionProcessing,
        errors: claimDecisionErrors,
    } = useForm({
        payout_account_id: '',
        decision_note: '',
    });

    const {
        data: disbursementData,
        setData: setDisbursementData,
        post: postDisbursement,
        processing: disbursementProcessing,
        errors: disbursementErrors,
    } = useForm({
        idempotency_key: crypto.randomUUID(),
        loan_account_id: String(application.loan_account?.id ?? ''),
        payout_account_id: '',
        amount: '',
        disbursed_at: getLocalDate(),
        reference: '',
        note: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
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

    const saveScheduleInstallment = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                setScheduleDialogOpen(false);
                setEditingSchedule(null);
                resetScheduleForm();
            },
        };

        if (editingSchedule) {
            putSchedule(
                route('loan-applications.schedule.installments.update', {
                    loan_application: application.id,
                    schedule: editingSchedule.id,
                }),
                options,
            );
            return;
        }

        postSchedule(
            route(
                'loan-applications.schedule.installments.store',
                application.id,
            ),
            options,
        );
    };

    const openAddScheduleDialog = () => {
        setEditingSchedule(null);
        resetScheduleForm();
        setScheduleDialogOpen(true);
    };

    const openEditScheduleDialog = (schedule: LoanSchedule) => {
        setEditingSchedule(schedule);
        setScheduleData('due_date', schedule.due_date.slice(0, 10));
        setScheduleData(
            'scheduled_principal',
            String(schedule.scheduled_principal),
        );
        setScheduleData(
            'scheduled_interest',
            String(schedule.scheduled_interest),
        );
        setScheduleData('scheduled_fee', String(schedule.scheduled_fee));
        setScheduleData(
            'scheduled_protection_fee',
            String(schedule.scheduled_protection_fee),
        );
        setScheduleDialogOpen(true);
    };

    const cancelScheduleInstallment = (scheduleId: number) => {
        appSwal
            .fire({
                title: 'Cancel this installment?',
                text: 'The installment will be marked as waived. Installments with repayments cannot be cancelled.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Cancel installment',
                cancelButtonText: 'Keep installment',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('loan-applications.schedule.installments.cancel', {
                        loan_application: application.id,
                        schedule: scheduleId,
                    }),
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

    const submitProtectionClaim = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        postProtectionClaim(
            route('loan-applications.protection-claims.store', application.id),
            { forceFormData: true, preserveScroll: true },
        );
    };

    const approveProtectionClaim = (
        event: React.FormEvent<HTMLFormElement>,
        claimId: number,
    ) => {
        event.preventDefault();
        postClaimDecision(
            route('loan-applications.protection-claims.approve', [
                application.id,
                claimId,
            ]),
            { preserveScroll: true },
        );
    };

    const rejectProtectionClaim = (claimId: number) => {
        appSwal
            .fire({
                title: 'Reject credit-life claim?',
                text: `Reject claim ${application.loan_account?.protection_claims?.find((claim) => claim.id === claimId)?.claim_no ?? ''}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Reject claim',
                cancelButtonText: 'Cancel',
                input: 'textarea',
                inputLabel: 'Reason for rejection',
                inputValidator: (value) =>
                    value ? undefined : 'A rejection reason is required.',
            })
            .then((result) => {
                if (!result.isConfirmed) return;
                router.post(
                    route('loan-applications.protection-claims.reject', [
                        application.id,
                        claimId,
                    ]),
                    { decision_note: result.value },
                    { preserveScroll: true },
                );
            });
    };

    const statusTone =
        application.status === 'APPROVED'
            ? 'success'
            : application.status === 'REJECTED'
              ? 'danger'
              : application.status === 'UNDER_REVIEW'
                ? 'warning'
                : application.status === 'SUBMITTED'
                  ? 'info'
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
    const protectionPolicy = application.loan_account?.protection_policy;
    const protectionClaims = application.loan_account?.protection_claims ?? [];
    const hasOpenProtectionClaim = protectionClaims.some((claim) =>
        ['SUBMITTED', 'APPROVED'].includes(claim.status),
    );
    const remainingDisbursementAmount = Math.max(
        0,
        Number(application.loan_account?.principal_amount ?? 0) -
            Number(application.loan_account?.disbursed_amount ?? 0),
    );
    const canDisburse =
        canCreateDisbursement &&
        application.status === 'APPROVED' &&
        application.loan_account !== null &&
        application.loan_account !== undefined &&
        ['APPROVED', 'PARTIALLY_DISBURSED'].includes(
            application.loan_account.status,
        ) &&
        remainingDisbursementAmount > 0;

    const submitDisbursement = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        postDisbursement(
            route('financial-transactions.loan-disbursement.store'),
            { preserveScroll: true },
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={application.application_no} />

            <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-6">
                <section className="grid overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="relative flex min-h-0 flex-col justify-between gap-4 overflow-hidden bg-muted p-4 text-foreground sm:p-5">
                        <div
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-1 bg-accent"
                        />
                        <div className="relative">
                            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                Loan application
                            </p>
                            <h1 className="mt-1.5 text-xl font-semibold break-words sm:text-2xl">
                                {application.application_no}
                            </h1>
                            <p className="mt-1 text-sm text-foreground">
                                {application.customer?.name ??
                                    'Unknown customer'}
                                <span className="mx-2 text-muted-foreground">
                                    /
                                </span>
                                {application.product?.name ?? 'Loan product'}
                            </p>
                        </div>
                        <div className="relative flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Requested amount
                                </p>
                                <p className="mt-0.5 text-2xl font-semibold tabular-nums sm:text-3xl">
                                    <span className="mr-1 text-base text-muted-foreground">
                                        ৳
                                    </span>
                                    {formatBDTCurrency(
                                        application.requested_amount,
                                        false,
                                    )}
                                </p>
                            </div>
                            {application.status === 'DRAFT' && (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="border-border bg-background/80 text-foreground hover:bg-background hover:text-foreground"
                                >
                                    <Link
                                        href={route(
                                            'loan-applications.edit',
                                            application.id,
                                        )}
                                    >
                                        <Pencil className="mr-1.5 size-4" />
                                        Edit draft
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Current status
                                </p>
                                <div className="mt-1">
                                    <StatusBadge tone={statusTone}>
                                        {application.status.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </StatusBadge>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {application.applied_at
                                    ? `Applied ${formatDate(application.applied_at)}`
                                    : 'Not yet submitted'}
                            </span>
                        </div>
                        <div className="grid flex-1 sm:grid-cols-2">
                            <OverviewFact
                                icon={UserCheck}
                                label="Applicant"
                                value={
                                    application.customer?.name ??
                                    application.customer?.customer_no ??
                                    '—'
                                }
                                detail={application.customer?.customer_no}
                            />
                            <OverviewFact
                                icon={Landmark}
                                label="Loan product"
                                value={
                                    application.product?.name ??
                                    application.product?.code ??
                                    '—'
                                }
                                detail={application.product?.code}
                            />
                            <OverviewFact
                                icon={CalendarDays}
                                label="Requested term"
                                value={
                                    application.requested_term_months
                                        ? `${application.requested_term_months} months`
                                        : '—'
                                }
                            />
                            <OverviewFact
                                icon={FileText}
                                label="Purpose"
                                value={application.purpose || 'Not specified'}
                            />
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b px-4 py-2.5 sm:px-5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
                            <Users className="size-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                Applicant profile
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Financial, employment, and document details
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-px bg-border/70 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        <ApplicantDetailGroup
                            icon={Banknote}
                            title="Income"
                            empty="No income details provided."
                            items={(application.income_details ?? []).map(
                                (income) =>
                                    `${income.source}: ${formatBDTCurrency(income.monthly_amount, false)} / month${income.notes ? ` · ${income.notes}` : ''}`,
                            )}
                        />
                        <ApplicantDetailGroup
                            icon={ReceiptText}
                            title="Expenses"
                            empty="No expense details provided."
                            items={(application.expense_details ?? []).map(
                                (expense) =>
                                    `${expense.category}: ${formatBDTCurrency(expense.monthly_amount, false)} / month${expense.notes ? ` · ${expense.notes}` : ''}`,
                            )}
                        />
                        <ApplicantDetailGroup
                            icon={BriefcaseBusiness}
                            title="Employment history"
                            empty="No job history provided."
                            items={(application.job_histories ?? []).map(
                                (job) =>
                                    `${job.employer_name}${job.job_title ? ` · ${job.job_title}` : ''}${job.is_current ? ' · Current' : ''}`,
                            )}
                        />
                        <ApplicantDetailGroup
                            icon={Landmark}
                            title="Assets"
                            empty="No assets provided."
                            items={(application.asset_details ?? []).map(
                                (asset) =>
                                    `${asset.asset_type}: ${asset.description}${asset.estimated_value ? ` · ${asset.estimated_value}` : ''}`,
                            )}
                        />
                        <ApplicantDetailGroup
                            icon={GraduationCap}
                            title="Education"
                            empty="No education details provided."
                            items={(application.educations ?? []).map(
                                (education) =>
                                    `${education.institution_name}${education.qualification ? ` · ${education.qualification}` : ''}${education.field_of_study ? ` · ${education.field_of_study}` : ''}`,
                            )}
                        />
                        <div className="min-w-0 bg-background p-3 sm:p-3.5">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-primary" />
                                <h3 className="text-xs font-semibold tracking-wide uppercase">
                                    Supporting documents
                                </h3>
                            </div>
                            <div className="mt-3 space-y-2">
                                {!canViewSupportingDocuments ? (
                                    <p className="text-sm text-muted-foreground">
                                        You do not have permission to view these
                                        documents.
                                    </p>
                                ) : (application.supporting_documents ?? [])
                                      .length ? (
                                    application.supporting_documents?.map(
                                        (document) => (
                                            <a
                                                key={document.id}
                                                className="flex min-w-0 items-center gap-2 text-sm text-primary hover:underline"
                                                href={route(
                                                    'loan-applications.documents.download',
                                                    [
                                                        application.id,
                                                        document.id,
                                                    ],
                                                )}
                                            >
                                                <FileText className="size-4 shrink-0" />
                                                <span className="truncate">
                                                    {document.file_name}
                                                </span>
                                            </a>
                                        ),
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No supporting documents uploaded.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow */}
                <section className="rounded-xl border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
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

                    <div className="flex flex-wrap items-center gap-1.5 border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
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
                    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
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
                                    ['CLOSED', 'WRITTEN_OFF'].includes(
                                        application.loan_account.status,
                                    ) || !canManageSchedule ? undefined : (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    openAddScheduleDialog()
                                                }
                                            >
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Add installment
                                            </Button>

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
                                    )
                                }
                            />

                            <div className="px-3.5 pb-3.5 sm:px-4">
                                {activeArrears.length > 0 && (
                                    <div className="mb-2 max-w-md">
                                        <Label htmlFor="arrear-resolution-note">
                                            Resolution note
                                        </Label>
                                        <Input
                                            id="arrear-resolution-note"
                                            className="mt-1 h-8"
                                            value={arrearNote}
                                            onChange={(event) =>
                                                setArrearNote(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Optional note for arrear resolution"
                                        />
                                    </div>
                                )}

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
                                                    Insurance
                                                </TableHead>
                                                <TableHead align="right">
                                                    Total
                                                </TableHead>
                                                <TableHead>Version</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>
                                                    Financial transaction
                                                </TableHead>
                                                {canManageSchedule && (
                                                    <TableHead>
                                                        Action
                                                    </TableHead>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {schedules.map((schedule) => {
                                                const scheduleTransactions = [
                                                    ...new Map(
                                                        repayments
                                                            .filter(
                                                                (repayment) =>
                                                                    repayment.allocations?.some(
                                                                        (
                                                                            allocation,
                                                                        ) =>
                                                                            allocation.loan_schedule_id ===
                                                                            schedule.id,
                                                                    ),
                                                            )
                                                            .map(
                                                                (repayment) =>
                                                                    repayment.financial_transaction,
                                                            )
                                                            .filter(
                                                                (
                                                                    transaction,
                                                                ): transaction is NonNullable<
                                                                    typeof transaction
                                                                > =>
                                                                    Boolean(
                                                                        transaction,
                                                                    ),
                                                            )
                                                            .map(
                                                                (
                                                                    transaction,
                                                                ) => [
                                                                    transaction.id,
                                                                    transaction,
                                                                ],
                                                            ),
                                                    ).values(),
                                                ];
                                                const hasNoPayments =
                                                    Number(
                                                        schedule.total_paid,
                                                    ) === 0;
                                                const canEditSchedule =
                                                    schedule.status ===
                                                        'PENDING' &&
                                                    hasNoPayments;
                                                const canCancelSchedule =
                                                    [
                                                        'PENDING',
                                                        'OVERDUE',
                                                    ].includes(
                                                        schedule.status,
                                                    ) && hasNoPayments;

                                                return (
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
                                                            {formatBDTCurrency(
                                                                schedule.scheduled_principal,
                                                                false,
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatBDTCurrency(
                                                                schedule.scheduled_interest,
                                                                false,
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatBDTCurrency(
                                                                schedule.scheduled_protection_fee,
                                                                false,
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            align="right"
                                                            className="font-semibold"
                                                        >
                                                            {formatBDTCurrency(
                                                                schedule.total_due,
                                                                false,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {schedule.schedule_version ??
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge tone="neutral">
                                                                {
                                                                    schedule.status
                                                                }
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {scheduleTransactions.map(
                                                                    (
                                                                        transaction,
                                                                    ) => (
                                                                        <Link
                                                                            key={
                                                                                transaction.id
                                                                            }
                                                                            href={route(
                                                                                'financial-transactions.show',
                                                                                transaction.id,
                                                                            )}
                                                                            className="font-mono text-xs font-medium text-primary underline-offset-2 hover:underline"
                                                                            aria-label={`View financial transaction ${transaction.transaction_no}`}
                                                                        >
                                                                            {
                                                                                transaction.transaction_no
                                                                            }
                                                                        </Link>
                                                                    ),
                                                                )}
                                                                {scheduleTransactions.length ===
                                                                    0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        {canManageSchedule && (
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    {canEditSchedule && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 px-2"
                                                                            onClick={() =>
                                                                                openEditScheduleDialog(
                                                                                    schedule,
                                                                                )
                                                                            }
                                                                            aria-label={`Edit installment ${schedule.installment_no}`}
                                                                        >
                                                                            <Pencil className="mr-1 h-3.5 w-3.5" />
                                                                            Edit
                                                                        </Button>
                                                                    )}
                                                                    {canCancelSchedule && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 px-2 text-destructive hover:text-destructive"
                                                                            onClick={() =>
                                                                                cancelScheduleInstallment(
                                                                                    schedule.id,
                                                                                )
                                                                            }
                                                                            aria-label={`Cancel installment ${schedule.installment_no}`}
                                                                        >
                                                                            <X className="mr-1 h-3.5 w-3.5" />
                                                                            Cancel
                                                                        </Button>
                                                                    )}
                                                                    {!canEditSchedule &&
                                                                        !canCancelSchedule && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                —
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </DataTable>
                                ) : (
                                    <EmptyState
                                        icon={CalendarDays}
                                        text="No repayment schedule generated yet."
                                    />
                                )}
                            </div>

                            <Dialog
                                open={scheduleDialogOpen}
                                onOpenChange={setScheduleDialogOpen}
                            >
                                <DialogContent className="max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingSchedule
                                                ? 'Edit repayment installment'
                                                : 'Add repayment installment'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Set a due date and enter at least
                                            one amount. The total is calculated
                                            automatically.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form
                                        onSubmit={saveScheduleInstallment}
                                        className="space-y-4"
                                    >
                                        <InputError
                                            message={pageErrors?.schedule}
                                        />
                                        <div>
                                            <Label htmlFor="schedule-due-date">
                                                Due date
                                            </Label>
                                            <AppDatePicker
                                                id="schedule-due-date"
                                                value={scheduleData.due_date}
                                                required
                                                onChange={(value) =>
                                                    setScheduleData(
                                                        'due_date',
                                                        value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    scheduleErrors.due_date
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {(
                                                [
                                                    [
                                                        'scheduled_principal',
                                                        'Principal',
                                                    ],
                                                    [
                                                        'scheduled_interest',
                                                        'Interest',
                                                    ],
                                                    ['scheduled_fee', 'Fee'],
                                                    [
                                                        'scheduled_protection_fee',
                                                        'Insurance',
                                                    ],
                                                ] as const
                                            ).map(([field, label]) => (
                                                <div key={field}>
                                                    <Label htmlFor={field}>
                                                        {label}
                                                    </Label>
                                                    <Input
                                                        id={field}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="mt-1 h-9"
                                                        value={
                                                            scheduleData[field]
                                                        }
                                                        onChange={(event) =>
                                                            setScheduleData(
                                                                field,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            scheduleErrors[
                                                                field
                                                            ]
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setScheduleDialogOpen(
                                                        false,
                                                    );
                                                    setEditingSchedule(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={scheduleProcessing}
                                            >
                                                {scheduleProcessing
                                                    ? editingSchedule
                                                        ? 'Saving…'
                                                        : 'Adding…'
                                                    : editingSchedule
                                                      ? 'Save changes'
                                                      : 'Add installment'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
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
                                            className="flex flex-col gap-2.5 px-3.5 py-2.5 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="text-sm font-medium">
                                                        {formatBDTCurrency(
                                                            arrear.total_overdue,
                                                            false,
                                                        )}
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
                                            className="flex flex-col gap-2 px-3.5 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {formatBDTCurrency(
                                                        disbursement.amount,
                                                        false,
                                                    )}
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

                            {canDisburse && (
                                <div className="border-t bg-muted/10 p-3.5 sm:p-4">
                                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Record a disbursement
                                            </h3>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Create a draft disbursement for
                                                this loan account.
                                            </p>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Remaining:{' '}
                                            <span className="text-foreground tabular-nums">
                                                {formatBDTCurrency(
                                                    remainingDisbursementAmount,
                                                    false,
                                                )}
                                            </span>
                                        </p>
                                    </div>

                                    {payout_accounts.length > 0 ? (
                                        <form
                                            onSubmit={submitDisbursement}
                                            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-3"
                                        >
                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="disbursement-amount">
                                                    Amount
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="disbursement-amount"
                                                    type="number"
                                                    min="0.0001"
                                                    max={
                                                        remainingDisbursementAmount
                                                    }
                                                    step="0.0001"
                                                    required
                                                    className="tabular-nums"
                                                    value={
                                                        disbursementData.amount
                                                    }
                                                    onChange={(event) =>
                                                        setDisbursementData(
                                                            'amount',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        disbursementErrors.amount
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="disbursement-payout-account">
                                                    Payout account
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Select
                                                    value={
                                                        disbursementData.payout_account_id
                                                    }
                                                    onChange={(value) =>
                                                        setDisbursementData(
                                                            'payout_account_id',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        {
                                                            value: '',
                                                            label: 'Select cash or bank account',
                                                        },
                                                        ...payout_accounts.map(
                                                            (account) => ({
                                                                value: String(
                                                                    account.id,
                                                                ),
                                                                label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                                            }),
                                                        ),
                                                    ]}
                                                />
                                                <InputError
                                                    message={
                                                        disbursementErrors.payout_account_id
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="disbursement-date">
                                                    Disbursement date
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <AppDatePicker
                                                    id="disbursement-date"
                                                    value={
                                                        disbursementData.disbursed_at
                                                    }
                                                    required
                                                    onChange={(value) =>
                                                        setDisbursementData(
                                                            'disbursed_at',
                                                            value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        disbursementErrors.disbursed_at
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="disbursement-reference">
                                                    Reference
                                                </Label>
                                                <Input
                                                    id="disbursement-reference"
                                                    value={
                                                        disbursementData.reference
                                                    }
                                                    maxLength={100}
                                                    placeholder="Optional reference"
                                                    onChange={(event) =>
                                                        setDisbursementData(
                                                            'reference',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        disbursementErrors.reference
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="disbursement-note">
                                                    Note
                                                </Label>
                                                <Input
                                                    id="disbursement-note"
                                                    value={
                                                        disbursementData.note
                                                    }
                                                    maxLength={1000}
                                                    placeholder="Optional note"
                                                    onChange={(event) =>
                                                        setDisbursementData(
                                                            'note',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        disbursementErrors.note
                                                    }
                                                />
                                            </div>

                                            <div className="flex justify-end sm:col-span-2 lg:col-span-1">
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        disbursementProcessing
                                                    }
                                                >
                                                    <ArrowDownToLine className="mr-1.5 size-4" />
                                                    {disbursementProcessing
                                                        ? 'Creating...'
                                                        : 'Create disbursement'}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-muted-foreground">
                                            No active cash or bank payout
                                            account is available for
                                            disbursement.
                                        </p>
                                    )}
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
                                                        {formatBDTCurrency(
                                                            repayment.amount,
                                                            false,
                                                        )}
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
                                                            `${allocation.component?.type ?? 'COMPONENT'}: ${formatBDTCurrency(allocation.amount, false)}`,
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

                <div className="grid items-start gap-3 xl:grid-cols-2">
                    {/* Collateral */}
                    <section className="h-full overflow-hidden rounded-xl border bg-card shadow-sm">
                        <SectionHeader
                            icon={ShieldCheck}
                            title="Collateral"
                            badge={String(
                                depositLiens.length + otherCollaterals.length,
                            )}
                        />

                        <div className="grid divide-y divide-border/70 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div>
                                <div className="border-b bg-muted/30 px-3 py-2">
                                    <p className="text-xs font-semibold">
                                        Deposit liens
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Bank deposits pledged as security
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
                            </div>

                            <div>
                                <div className="border-b bg-muted/30 px-3 py-2">
                                    <p className="text-xs font-semibold">
                                        Other collateral
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Property, vehicle, and other security
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
                        </div>

                        <div className="divide-y border-t bg-muted/30">
                            <form
                                onSubmit={submitDepositLien}
                                className="p-3.5 sm:p-4"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-medium">
                                        Add deposit lien
                                    </p>
                                </div>
                                <div className="grid items-end gap-2 sm:grid-cols-2">
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
                                            value={
                                                depositLienData.assessed_value
                                            }
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
                                            value={
                                                depositLienData.secured_value
                                            }
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
                                    <div className="flex justify-end sm:col-span-2">
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
                                className="p-3.5 sm:p-4"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-medium">
                                        Add other collateral
                                    </p>
                                </div>
                                <div className="grid items-end gap-2 sm:grid-cols-2">
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
                                            value={
                                                otherCollateralData.description
                                            }
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
                                    <div className="sm:col-span-2">
                                        <FormField label="Notes">
                                            <Input
                                                className="h-9"
                                                value={
                                                    otherCollateralData.notes
                                                }
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
                                    <div className="flex justify-end sm:col-span-2">
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
                    <section className="h-full overflow-hidden rounded-xl border bg-card shadow-sm">
                        <SectionHeader
                            icon={Users}
                            title="Guarantors"
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
                                            className="flex flex-col gap-2.5 px-3.5 py-2.5 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border/50">
                                                    <UserCheck className="size-4 text-muted-foreground" />
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
                                                            ?.customer_no ??
                                                            '-'}
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
                            className="border-t bg-muted/30 p-3"
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
                            <div className="mb-2 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">
                                    Invite guarantor
                                </p>
                            </div>

                            <div className="grid items-end gap-2 sm:grid-cols-2">
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
                </div>

                {/* Credit-life insurance */}
                {application.loan_account && (
                    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <SectionHeader
                            icon={ShieldCheck}
                            title="Credit-life insurance"
                            badge={protectionPolicy?.status ?? 'NOT ENROLLED'}
                        />
                        {protectionPolicy?.product ? (
                            <div className="grid gap-2 border-b p-3.5 sm:grid-cols-3 sm:p-4">
                                <MetricItem
                                    label="Insurance product"
                                    value={protectionPolicy.product.name}
                                />
                                <MetricItem
                                    label="Monthly rate"
                                    value={`${protectionPolicy.monthly_rate_percent ?? protectionPolicy.product.monthly_rate_percent}% of closing principal`}
                                />
                                <MetricItem
                                    label="Covered principal"
                                    value={formatBDTCurrency(
                                        protectionPolicy.coverage_amount ??
                                            application.loan_account
                                                .principal_amount ??
                                            0,
                                        false,
                                    )}
                                />
                            </div>
                        ) : (
                            <p className="border-b px-3.5 py-2.5 text-sm text-muted-foreground">
                                No credit-life insurance was selected for this
                                loan.
                            </p>
                        )}

                        {protectionPolicy?.status === 'ACTIVE' &&
                            canSubmitProtectionClaim &&
                            !hasOpenProtectionClaim && (
                                <form
                                    onSubmit={submitProtectionClaim}
                                    className="grid items-end gap-2 border-b bg-muted/20 p-3.5 sm:grid-cols-2 sm:p-4 xl:grid-cols-4"
                                >
                                    <div>
                                        <Label htmlFor="claim-death-date">
                                            Date of death
                                        </Label>
                                        <Input
                                            id="claim-death-date"
                                            type="date"
                                            value={claimData.death_date}
                                            onChange={(event) =>
                                                setClaimData(
                                                    'death_date',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={claimErrors.death_date}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="claim-death-certificate">
                                            Death certificate
                                        </Label>
                                        <Input
                                            id="claim-death-certificate"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(event) =>
                                                setClaimData(
                                                    'death_certificate',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                claimErrors.death_certificate
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="claim-notes">
                                            Claim notes
                                        </Label>
                                        <Input
                                            id="claim-notes"
                                            value={claimData.notes}
                                            onChange={(event) =>
                                                setClaimData(
                                                    'notes',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={claimProcessing}
                                        >
                                            <FileText className="size-4" />{' '}
                                            Submit death claim
                                        </Button>
                                    </div>
                                </form>
                            )}

                        {protectionClaims.length > 0 && (
                            <div className="divide-y divide-border/70">
                                {protectionClaims.map((claim) => (
                                    <div
                                        key={claim.id}
                                        className="space-y-2 p-3 sm:p-3.5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {claim.claim_no}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    Date of death:{' '}
                                                    {formatDate(
                                                        claim.death_date,
                                                    )}
                                                </p>
                                            </div>
                                            <StatusBadge
                                                tone={
                                                    claim.status === 'REJECTED'
                                                        ? 'danger'
                                                        : claim.status ===
                                                            'SETTLED'
                                                          ? 'success'
                                                          : 'warning'
                                                }
                                            >
                                                {claim.status}
                                            </StatusBadge>
                                        </div>
                                        {canViewSupportingDocuments ? (
                                            <a
                                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                                href={route(
                                                    'loan-applications.protection-claims.certificate',
                                                    [application.id, claim.id],
                                                )}
                                            >
                                                <FileText className="size-4" />{' '}
                                                {claim.death_certificate_name}
                                            </a>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                Death certificate access is
                                                restricted.
                                            </p>
                                        )}
                                        {claim.decision_note && (
                                            <p className="text-sm text-muted-foreground">
                                                {claim.decision_note}
                                            </p>
                                        )}
                                        {claim.status === 'APPROVED' && (
                                            <p className="text-sm text-muted-foreground">
                                                Payout{' '}
                                                {formatBDTCurrency(
                                                    claim.payout_amount,
                                                    false,
                                                )}{' '}
                                                is awaiting transaction posting.
                                                {claim.financial_transaction_id && (
                                                    <>
                                                        {' '}
                                                        <Link
                                                            className="text-primary underline"
                                                            href={route(
                                                                'financial-transactions.show',
                                                                claim.financial_transaction_id,
                                                            )}
                                                        >
                                                            View transaction
                                                        </Link>
                                                    </>
                                                )}
                                            </p>
                                        )}
                                        {claim.status === 'SETTLED' && (
                                            <p className="text-sm font-medium text-success">
                                                Loan principal settled by
                                                insurance.
                                            </p>
                                        )}
                                        {canManageProtectionClaims &&
                                            claim.status === 'SUBMITTED' && (
                                                <form
                                                    onSubmit={(event) =>
                                                        approveProtectionClaim(
                                                            event,
                                                            claim.id,
                                                        )
                                                    }
                                                    className="grid items-end gap-3 border-t pt-3 sm:grid-cols-[1fr_1fr_auto_auto]"
                                                >
                                                    <div>
                                                        <Label>
                                                            Payout account
                                                        </Label>
                                                        <Select
                                                            value={
                                                                claimDecisionData.payout_account_id
                                                            }
                                                            onChange={(value) =>
                                                                setClaimDecisionData(
                                                                    'payout_account_id',
                                                                    value,
                                                                )
                                                            }
                                                            options={[
                                                                {
                                                                    value: '',
                                                                    label: 'Select insurer settlement account',
                                                                },
                                                                ...payout_accounts.map(
                                                                    (
                                                                        account,
                                                                    ) => ({
                                                                        value: String(
                                                                            account.id,
                                                                        ),
                                                                        label: `${account.account_no} - ${account.name}`,
                                                                    }),
                                                                ),
                                                            ]}
                                                        />
                                                        <InputError
                                                            message={
                                                                claimDecisionErrors.payout_account_id
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Decision note
                                                        </Label>
                                                        <Input
                                                            value={
                                                                claimDecisionData.decision_note
                                                            }
                                                            onChange={(event) =>
                                                                setClaimDecisionData(
                                                                    'decision_note',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            claimDecisionProcessing ||
                                                            payout_accounts.length ===
                                                                0
                                                        }
                                                    >
                                                        <Check className="size-4" />{' '}
                                                        Approve claim
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            rejectProtectionClaim(
                                                                claim.id,
                                                            )
                                                        }
                                                    >
                                                        <X className="size-4" />{' '}
                                                        Reject
                                                    </Button>
                                                </form>
                                            )}
                                    </div>
                                ))}
                            </div>
                        )}
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

function OverviewFact({
    icon: Icon,
    label,
    value,
    detail,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    detail?: string | null;
}) {
    return (
        <div className="flex min-w-0 gap-2.5 border-b border-border/70 p-3 odd:border-r sm:p-3.5 sm:[&:nth-child(n+3)]:border-b-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-sm leading-snug font-semibold break-words">
                    {value}
                </p>
                {detail && detail !== value && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {detail}
                    </p>
                )}
            </div>
        </div>
    );
}

function ApplicantDetailGroup({
    icon: Icon,
    title,
    items,
    empty,
}: {
    icon: React.ElementType;
    title: string;
    items: string[];
    empty: string;
}) {
    return (
        <div className="min-w-0 bg-background p-3 even:bg-muted/15 sm:p-3.5">
            <div className="flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                <h3 className="text-xs font-semibold tracking-wide uppercase">
                    {title}
                </h3>
            </div>
            {items.length ? (
                <ul className="mt-2 space-y-1.5">
                    {items.map((item, index) => (
                        <li
                            key={`${title}-${index}`}
                            className="border-l-2 border-accent/60 pl-2 text-[13px] leading-snug break-words"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2 text-[13px] text-muted-foreground">
                    {empty}
                </p>
            )}
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
        <div className="flex flex-wrap items-start justify-between gap-2.5 border-b px-3.5 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
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
        <div className="flex flex-col gap-2 border-b bg-muted/20 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
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
        <div className="flex flex-col gap-2.5 px-3.5 py-2.5 lg:flex-row lg:items-center lg:justify-between">
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
        <div className="border-b px-3 py-2.5 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </p>

            <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
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
            <div className="mt-1">{children}</div>
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
        <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-muted-foreground">
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
            className={`bg-muted/50 px-3 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase ${
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
            className={`px-3 py-2 align-middle whitespace-nowrap ${
                align === 'right' ? 'text-right' : 'text-left'
            } ${className}`}
        >
            {children}
        </td>
    );
}
