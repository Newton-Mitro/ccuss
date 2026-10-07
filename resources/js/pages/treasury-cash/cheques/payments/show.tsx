import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    CircleAlert,
    Clock3,
    FileCheck2,
    FileText,
    History,
    Landmark,
    ShieldCheck,
    UserCheck,
    WalletCards,
    XCircle,
} from 'lucide-react';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { route } from 'ziggy-js';

type Actor = {
    id: number;
    name: string;
} | null;

type Event = {
    id: number;
    action: string;
    reason?: string | null;
    created_at: string;
    performed_by?: Actor;
};

type Signatory = {
    id: number;
    name: string;
    detail: string;
    eligible: boolean;
    transaction_limit: number | null;
    signature: {
        url: string;
        verification_status: string;
    } | null;
};

type Payment = {
    id: number;
    status: string;
    amount: string | number;
    note?: string | null;
    return_reason?: string | null;
    checks?: Record<string, boolean> | null;
    created_at: string;

    cheque: {
        cheque_no: string;
        cheque_date?: string | null;
        payee?: string | null;
        status: string;
    };

    financial_account: {
        account_no: string;
        name?: string | null;
        status: string;
    };

    teller_session?: {
        teller?: {
            name: string;
        } | null;
    } | null;

    signatory?: {
        name: string;
    } | null;

    received_by?: Actor;
    verified_by?: Actor;
    approved_by?: Actor;
    paid_by?: Actor;

    financial_transaction?: {
        transaction_no?: string;
        reference?: string;
    } | null;

    events: Event[];
};

type Props = SharedData & {
    payment: Payment;

    account_check: {
        status: string;
        available_balance: number;
        balance_sufficient: boolean;
    };

    signatories: Signatory[];
};

const checkLabels: Record<string, string> = {
    details_verified: 'Cheque details verified',
    account_active: 'Account is active',
    balance_sufficient: 'Available balance is sufficient',
    signature_match: 'Presented signature matches specimen',
    signature_specimen_verified: 'Specimen signature is verified',
    authorized_signatory: 'Signatory is authorized for this amount',
    stop_payment_clear: 'No stop-payment instruction found',
    cheque_valid: 'Cheque is valid for payment',
};

const checkIcons: Record<string, React.ElementType> = {
    details_verified: FileText,
    account_active: Landmark,
    balance_sufficient: WalletCards,
    signature_match: UserCheck,
    signature_specimen_verified: ShieldCheck,
    authorized_signatory: UserCheck,
    stop_payment_clear: CheckCircle2,
    cheque_valid: FileCheck2,
};

export default function ChequePaymentReview() {
    useFlashToastHandler();

    const {
        payment,
        account_check,
        signatories,
        auth,
        errors: sharedErrors,
    } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        signatory_customer_id: '',
        details_verified: false,
        signature_match: false,
    });

    const pageErrors = sharedErrors as
        | Record<string, string | undefined>
        | undefined;

    const actionError =
        pageErrors?.workflow || pageErrors?.account || pageErrors?.cheque;

    const permissionSlugs = new Set(
        (auth.user.permissions ?? []).map((permission) => permission.slug),
    );

    const canVerify = permissionSlugs.has('cheque_payments.verify');

    const canApprove = permissionSlugs.has('cheque_payments.approve');

    const canPost = permissionSlugs.has('cheque_payments.post');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Treasury & Cash',
            href: route('treasury-cash.dashboard'),
        },
        {
            title: 'Cheque Payment Review',
            href: route('cheque-payments.index'),
        },
        {
            title: payment.cheque.cheque_no,
            href: route('cheque-payments.show', payment.id),
        },
    ];

    const returnCheque = () => {
        appSwal
            .fire({
                title: 'Return this cheque?',
                input: 'textarea',
                inputPlaceholder: 'Reason for return',
                inputValidator: (value) =>
                    value?.trim() ? undefined : 'A reason is required.',
                showCancelButton: true,
                confirmButtonText: 'Return cheque',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        route('cheque-payments.return', payment.id),
                        {
                            reason: result.value,
                        },
                        {
                            preserveScroll: true,
                        },
                    );
                }
            });
    };

    const approve = () => {
        appSwal
            .fire({
                title: 'Approve cheque payment?',
                text: 'Payment will remain unposted until a separate teller posts it.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Approve',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        route('cheque-payments.approve', payment.id),
                        {},
                        {
                            preserveScroll: true,
                        },
                    );
                }
            });
    };

    const pay = () => {
        appSwal
            .fire({
                title: 'Post and pay this cheque?',
                text: `Post ${Number(
                    payment.amount,
                ).toLocaleString()} to the teller and debit account ${
                    payment.financial_account.account_no
                }.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Post payment',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        route('cheque-payments.pay', payment.id),
                        {},
                        {
                            preserveScroll: true,
                        },
                    );
                }
            });
    };

    const tone =
        payment.status === 'PAID'
            ? 'success'
            : payment.status === 'RETURNED'
              ? 'danger'
              : payment.status === 'APPROVED' ||
                  payment.status === 'PENDING_APPROVAL'
                ? 'warning'
                : 'neutral';

    const eligibleSignatories = signatories.filter(
        (person) =>
            person.eligible &&
            person.signature?.verification_status === 'VERIFIED',
    );

    const selectedSignatory = signatories.find(
        (person) => String(person.id) === data.signatory_customer_id,
    );

    const formattedAmount = Number(payment.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const getCheckResult = (key: string): boolean => {
        return (
            payment.checks?.[key] ??
            (key === 'account_active'
                ? account_check.status === 'ACTIVE'
                : key === 'balance_sufficient'
                  ? account_check.balance_sufficient
                  : key === 'stop_payment_clear'
                    ? payment.cheque.status !== 'STOPPED'
                    : false)
        );
    };

    const getEventIcon = (action: string) => {
        const normalized = action.toLowerCase();

        if (normalized.includes('return')) {
            return XCircle;
        }

        if (normalized.includes('approve')) {
            return ShieldCheck;
        }

        if (normalized.includes('verify')) {
            return CheckCircle2;
        }

        if (normalized.includes('pay') || normalized.includes('post')) {
            return WalletCards;
        }

        return Clock3;
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cheque ${payment.cheque.cheque_no}`} />

            <div className="w-full max-w-6xl space-y-4 pb-8 text-foreground">
                {/* ─────────────────────────────────────────────
                    Header
                ───────────────────────────────────────────── */}

                <ResourcePageHeader
                    title={`Cheque ${payment.cheque.cheque_no}`}
                    description={`${payment.financial_account.account_no} · Received ${new Date(
                        payment.created_at,
                    ).toLocaleString()}`}
                    action={
                        <StatusBadge tone={tone}>
                            {payment.status.replaceAll('_', ' ')}
                        </StatusBadge>
                    }
                />

                {/* ─────────────────────────────────────────────
                    Error
                ───────────────────────────────────────────── */}

                {actionError && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                            <p className="font-medium">Unable to continue</p>

                            <p className="mt-0.5 opacity-90">{actionError}</p>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────────────────
                    Payment Summary
                ───────────────────────────────────────────── */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {/* Amount */}

                        <div className="relative p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <WalletCards className="h-4 w-4 text-primary" />
                                </div>

                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Payment amount
                                </span>
                            </div>

                            <p className="text-2xl font-bold tracking-tight tabular-nums">
                                ৳ {formattedAmount}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Cheque payment
                            </p>
                        </div>

                        {/* Account */}

                        <div className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Landmark className="h-4 w-4 text-blue-600" />
                                </div>

                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Debit account
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="font-semibold">
                                    {payment.financial_account.account_no}
                                </p>

                                <StatusBadge
                                    tone={
                                        payment.financial_account.status ===
                                        'ACTIVE'
                                            ? 'success'
                                            : 'warning'
                                    }
                                >
                                    {payment.financial_account.status.replaceAll(
                                        '_',
                                        ' ',
                                    )}
                                </StatusBadge>
                            </div>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                {payment.financial_account.name ??
                                    'Account holder'}
                            </p>
                        </div>

                        {/* Cheque */}

                        <div className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <FileText className="h-4 w-4 text-amber-600" />
                                </div>

                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Cheque
                                </span>
                            </div>

                            <p className="font-semibold">
                                #{payment.cheque.cheque_no}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                <span>
                                    {payment.cheque.cheque_date ??
                                        'Date not recorded'}
                                </span>

                                <span className="text-border">•</span>

                                <span>
                                    {payment.cheque.payee ??
                                        'Payee not recorded'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────────────────────────
                    Verification Checklist
                ───────────────────────────────────────────── */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Verification checklist
                                </h2>

                                <p className="truncate text-xs text-muted-foreground">
                                    Server-side checks are repeated during
                                    posting.
                                </p>
                            </div>
                        </div>

                        <div className="hidden shrink-0 sm:block">
                            <span className="text-xs text-muted-foreground">
                                {
                                    Object.keys(checkLabels).filter(
                                        getCheckResult,
                                    ).length
                                }{' '}
                                / {Object.keys(checkLabels).length} passed
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(checkLabels).map(([key, label]) => {
                            const passed = getCheckResult(key);

                            const Icon = checkIcons[key] ?? CheckCircle2;

                            return (
                                <div key={key} className="bg-card p-3">
                                    <div className="flex items-start gap-2.5">
                                        <div
                                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                                passed
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-amber-500/10 text-amber-600'
                                            }`}
                                        >
                                            {passed ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <CircleAlert className="h-3.5 w-3.5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs leading-5 font-medium">
                                                    {label}
                                                </p>

                                                <Icon
                                                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                                                        passed
                                                            ? 'text-emerald-600'
                                                            : 'text-amber-600'
                                                    }`}
                                                />
                                            </div>

                                            <p
                                                className={`mt-0.5 text-[11px] font-medium ${
                                                    passed
                                                        ? 'text-emerald-600'
                                                        : 'text-amber-600'
                                                }`}
                                            >
                                                {passed
                                                    ? 'Passed'
                                                    : payment.status ===
                                                        'RECEIVED'
                                                      ? 'Pending review'
                                                      : 'Failed'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ─────────────────────────────────────────────
                    Verification Form
                ───────────────────────────────────────────── */}

                {payment.status === 'RECEIVED' && canVerify && (
                    <form
                        className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        onSubmit={(event) => {
                            event.preventDefault();

                            post(route('cheque-payments.verify', payment.id), {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <div className="border-b px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <FileCheck2 className="h-4 w-4 text-primary" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Complete verification
                                    </h2>

                                    <p className="text-xs text-muted-foreground">
                                        Confirm cheque details and compare the
                                        presented signature with the verified
                                        specimen.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                                {/* Left */}

                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="signatory"
                                            className="mb-1.5 block text-sm font-medium"
                                        >
                                            Authorized signatory
                                        </label>

                                        <Select
                                            id="signatory"
                                            value={data.signatory_customer_id}
                                            onChange={(value) =>
                                                setData(
                                                    'signatory_customer_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select a verified signatory',
                                                },
                                                ...eligibleSignatories.map(
                                                    (person) => ({
                                                        value: String(
                                                            person.id,
                                                        ),
                                                        label: `${person.name} · ${person.detail}${
                                                            person.transaction_limit ===
                                                            null
                                                                ? ''
                                                                : ` · limit ${person.transaction_limit.toLocaleString()}`
                                                        }`,
                                                    }),
                                                ),
                                            ]}
                                        />

                                        {errors.signatory_customer_id && (
                                            <p className="mt-1.5 text-xs text-destructive">
                                                {errors.signatory_customer_id}
                                            </p>
                                        )}
                                    </div>

                                    {selectedSignatory && (
                                        <div className="rounded-lg border bg-muted/30 p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <UserCheck className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">
                                                        {selectedSignatory.name}
                                                    </p>

                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {
                                                            selectedSignatory.detail
                                                        }
                                                    </p>
                                                </div>

                                                <StatusBadge tone="success">
                                                    Verified
                                                </StatusBadge>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                                                <div>
                                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        Eligibility
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-medium text-emerald-600">
                                                        Authorized
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        Transaction limit
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-medium tabular-nums">
                                                        {selectedSignatory.transaction_limit ===
                                                        null
                                                            ? 'No limit'
                                                            : `৳ ${selectedSignatory.transaction_limit.toLocaleString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirmation checks */}

                                    <div className="space-y-2">
                                        <label
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                                data.details_verified
                                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                                    : 'hover:bg-muted/40'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.details_verified}
                                                onChange={(event) =>
                                                    setData(
                                                        'details_verified',
                                                        event.target.checked,
                                                    )
                                                }
                                                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                                            />

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    Cheque details verified
                                                </p>

                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    Cheque number, date, amount,
                                                    payee and physical details
                                                    have been checked.
                                                </p>
                                            </div>

                                            {data.details_verified && (
                                                <CheckCircle2 className="mt-0.5 ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                                            )}
                                        </label>

                                        <label
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                                data.signature_match
                                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                                    : 'hover:bg-muted/40'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.signature_match}
                                                onChange={(event) =>
                                                    setData(
                                                        'signature_match',
                                                        event.target.checked,
                                                    )
                                                }
                                                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                                            />

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    Signature matches
                                                </p>

                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    The presented signature
                                                    matches the selected
                                                    verified specimen.
                                                </p>
                                            </div>

                                            {data.signature_match && (
                                                <CheckCircle2 className="mt-0.5 ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                                            )}
                                        </label>
                                    </div>

                                    {(errors.details_verified ||
                                        errors.signature_match) && (
                                        <div className="flex items-start gap-2 text-xs text-destructive">
                                            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                                            <span>
                                                {errors.details_verified ||
                                                    errors.signature_match}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Signature */}

                                <div className="min-w-0">
                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Signature specimen
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Verified specimen for comparison
                                            </p>
                                        </div>

                                        {selectedSignatory?.signature
                                            ?.verification_status ===
                                            'VERIFIED' && (
                                            <StatusBadge tone="success">
                                                Verified
                                            </StatusBadge>
                                        )}
                                    </div>

                                    <div className="relative h-64 overflow-hidden rounded-lg border bg-background shadow-inner sm:h-72">
                                        {selectedSignatory?.signature?.url ? (
                                            <ReactPanZoom
                                                image={
                                                    selectedSignatory.signature
                                                        .url
                                                }
                                                alt={`${selectedSignatory.name} specimen signature`}
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                </div>

                                                <p className="text-sm font-medium text-muted-foreground">
                                                    No specimen selected
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Select an authorized
                                                    signatory to view the
                                                    verified signature.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}

                            <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={returnCheque}
                                    disabled={processing}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Return cheque
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.signatory_customer_id ||
                                        !data.details_verified ||
                                        !data.signature_match
                                    }
                                    className="min-w-44"
                                >
                                    <FileCheck2 className="h-4 w-4" />

                                    {processing
                                        ? 'Submitting...'
                                        : 'Submit for approval'}

                                    {!processing && (
                                        <ArrowRight className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ─────────────────────────────────────────────
                    Pending Approval
                ───────────────────────────────────────────── */}

                {payment.status === 'PENDING_APPROVAL' && canApprove && (
                    <section className="overflow-hidden rounded-xl border border-amber-500/20 bg-card shadow-sm">
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                <ShieldCheck className="h-5 w-5 text-amber-600" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">
                                    Payment awaiting approval
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Verified by{' '}
                                    <span className="font-medium text-foreground">
                                        {payment.verified_by?.name ?? 'staff'}
                                    </span>{' '}
                                    · Available balance{' '}
                                    <span className="font-medium text-foreground">
                                        ৳{' '}
                                        {account_check.available_balance.toLocaleString()}
                                    </span>
                                </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={returnCheque}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Return
                                </Button>

                                <Button onClick={approve}>
                                    <ShieldCheck className="h-4 w-4" />
                                    Approve payment
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ─────────────────────────────────────────────
                    Approved
                ───────────────────────────────────────────── */}

                {payment.status === 'APPROVED' && canPost && (
                    <section className="overflow-hidden rounded-xl border border-emerald-500/20 bg-card shadow-sm">
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">
                                    Payment approved
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Approved by{' '}
                                    <span className="font-medium text-foreground">
                                        {payment.approved_by?.name ?? 'staff'}
                                    </span>
                                    . Posting will recheck the account balance
                                    and cheque status.
                                </p>
                            </div>

                            <Button onClick={pay} className="shrink-0">
                                <WalletCards className="h-4 w-4" />
                                Post payment
                            </Button>
                        </div>
                    </section>
                )}

                {/* ─────────────────────────────────────────────
                    Returned
                ───────────────────────────────────────────── */}

                {payment.status === 'RETURNED' && payment.return_reason && (
                    <section className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <XCircle className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-destructive">
                                Cheque returned
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {payment.return_reason}
                            </p>
                        </div>
                    </section>
                )}

                {/* ─────────────────────────────────────────────
                    Workflow History
                ───────────────────────────────────────────── */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <History className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Workflow history
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Audit trail for this cheque payment
                            </p>
                        </div>
                    </div>

                    {payment.events.length > 0 ? (
                        <div className="divide-y">
                            {payment.events.map((event, index) => {
                                const EventIcon = getEventIcon(event.action);

                                const isLast =
                                    index === payment.events.length - 1;

                                return (
                                    <div
                                        key={event.id}
                                        className="relative flex gap-3 px-4 py-3.5"
                                    >
                                        <div className="relative flex shrink-0 flex-col items-center">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                                                <EventIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>

                                            {!isLast && (
                                                <div className="absolute top-8 h-[calc(100%+1px)] w-px bg-border" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <p className="text-sm font-semibold capitalize">
                                                        {event.action.replaceAll(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </p>

                                                    <span className="text-xs text-muted-foreground">
                                                        by{' '}
                                                        <span className="font-medium text-foreground">
                                                            {event.performed_by
                                                                ?.name ??
                                                                'System'}
                                                        </span>
                                                    </span>
                                                </div>

                                                <time className="shrink-0 text-[11px] text-muted-foreground">
                                                    {new Date(
                                                        event.created_at,
                                                    ).toLocaleString()}
                                                </time>
                                            </div>

                                            {event.reason && (
                                                <div className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                                    {event.reason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <History className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <p className="text-sm font-medium">
                                No workflow events
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Activity will appear here as the payment moves
                                through the workflow.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
}
