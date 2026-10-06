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
import { Check, CircleAlert, FileCheck2, ShieldCheck } from 'lucide-react';
import { route } from 'ziggy-js';

type Actor = { id: number; name: string } | null;
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
    signature: { url: string; verification_status: string } | null;
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
    teller_session?: { teller?: { name: string } | null } | null;
    signatory?: { name: string } | null;
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
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
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
                        { reason: result.value },
                        { preserveScroll: true },
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
                if (result.isConfirmed)
                    router.post(
                        route('cheque-payments.approve', payment.id),
                        {},
                        { preserveScroll: true },
                    );
            });
    };

    const pay = () => {
        appSwal
            .fire({
                title: 'Post and pay this cheque?',
                text: `Post ${Number(payment.amount).toLocaleString()} to the teller and debit account ${payment.financial_account.account_no}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Post payment',
            })
            .then((result) => {
                if (result.isConfirmed)
                    router.post(
                        route('cheque-payments.pay', payment.id),
                        {},
                        { preserveScroll: true },
                    );
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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cheque ${payment.cheque.cheque_no}`} />
            <div className="max-w-5xl space-y-4 text-foreground">
                <ResourcePageHeader
                    title={`Cheque ${payment.cheque.cheque_no}`}
                    description={`${payment.financial_account.account_no} · Received ${new Date(payment.created_at).toLocaleString()}`}
                    action={
                        <StatusBadge tone={tone}>
                            {payment.status.replaceAll('_', ' ')}
                        </StatusBadge>
                    }
                />

                {actionError && (
                    <div
                        role="alert"
                        className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                        {actionError}
                    </div>
                )}

                <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {Number(payment.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Account</p>
                        <p className="mt-1 font-medium">
                            {payment.financial_account.account_no}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {payment.financial_account.name ??
                                payment.financial_account.status}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Cheque date / payee
                        </p>
                        <p className="mt-1 font-medium">
                            {payment.cheque.cheque_date ?? 'Date not recorded'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {payment.cheque.payee ?? 'Payee not recorded'}
                        </p>
                    </div>
                </section>

                <section className="rounded-md border bg-card">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-semibold">
                            Verification checklist
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Account and stop-payment checks are validated by the
                            server at verification and again at posting.
                        </p>
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                        {Object.entries(checkLabels).map(([key, label]) => {
                            const passed =
                                payment.checks?.[key] ??
                                (key === 'account_active'
                                    ? account_check.status === 'ACTIVE'
                                    : key === 'balance_sufficient'
                                      ? account_check.balance_sufficient
                                      : key === 'stop_payment_clear'
                                        ? payment.cheque.status !== 'STOPPED'
                                        : false);
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    {passed ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <CircleAlert className="h-4 w-4 text-amber-600" />
                                    )}
                                    <span>{label}</span>
                                    <StatusBadge
                                        tone={passed ? 'success' : 'warning'}
                                    >
                                        {passed
                                            ? 'Passed'
                                            : payment.status === 'RECEIVED'
                                              ? 'Pending review'
                                              : 'Failed'}
                                    </StatusBadge>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {payment.status === 'RECEIVED' && canVerify && (
                    <form
                        className="space-y-4 rounded-md border bg-card p-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('cheque-payments.verify', payment.id), {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <div>
                            <h2 className="text-sm font-semibold">
                                Complete verification
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Compare the presented signature with a verified
                                specimen and confirm the physical cheque
                                details.
                            </p>
                        </div>
                        <div className="max-w-xl space-y-2">
                            <label
                                htmlFor="signatory"
                                className="text-sm font-medium"
                            >
                                Authorized signatory
                            </label>
                            <Select
                                id="signatory"
                                value={data.signatory_customer_id}
                                onChange={(value) =>
                                    setData('signatory_customer_id', value)
                                }
                                options={[
                                    {
                                        value: '',
                                        label: 'Select a verified signatory',
                                    },
                                    ...eligibleSignatories.map((person) => ({
                                        value: String(person.id),
                                        label: `${person.name} · ${person.detail}${person.transaction_limit === null ? '' : ` · limit ${person.transaction_limit.toLocaleString()}`}`,
                                    })),
                                ]}
                            />
                            {data.signatory_customer_id &&
                                (() => {
                                    const person = signatories.find(
                                        (item) =>
                                            String(item.id) ===
                                            data.signatory_customer_id,
                                    );
                                    return person?.signature?.url ? (
                                        <img
                                            src={person.signature.url}
                                            alt={`${person.name} specimen signature`}
                                            className="max-h-28 rounded border bg-white p-2"
                                        />
                                    ) : null;
                                })()}
                            {errors.signatory_customer_id && (
                                <p className="text-sm text-destructive">
                                    {errors.signatory_customer_id}
                                </p>
                            )}
                        </div>
                        <label className="flex items-start gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.details_verified}
                                onChange={(event) =>
                                    setData(
                                        'details_verified',
                                        event.target.checked,
                                    )
                                }
                                className="mt-0.5"
                            />
                            I verified the cheque number, date, amount, payee,
                            and physical details.
                        </label>
                        <label className="flex items-start gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.signature_match}
                                onChange={(event) =>
                                    setData(
                                        'signature_match',
                                        event.target.checked,
                                    )
                                }
                                className="mt-0.5"
                            />
                            The presented signature matches the selected
                            verified specimen.
                        </label>
                        {(errors.details_verified ||
                            errors.signature_match) && (
                            <p className="text-sm text-destructive">
                                {errors.details_verified ||
                                    errors.signature_match}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.signatory_customer_id ||
                                    !data.details_verified ||
                                    !data.signature_match
                                }
                            >
                                <FileCheck2 className="h-4 w-4" />
                                Submit for approval
                            </Button>
                            {canApprove && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={returnCheque}
                                >
                                    Return cheque
                                </Button>
                            )}
                        </div>
                    </form>
                )}

                {payment.status === 'PENDING_APPROVAL' && canApprove && (
                    <section className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-4">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <p className="mr-auto text-sm">
                            Verified by {payment.verified_by?.name ?? 'staff'} ·
                            Available balance{' '}
                            {account_check.available_balance.toLocaleString()}
                        </p>
                        <Button variant="outline" onClick={returnCheque}>
                            Return
                        </Button>
                        <Button onClick={approve}>Approve payment</Button>
                    </section>
                )}

                {payment.status === 'APPROVED' && canPost && (
                    <section className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-4">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <p className="mr-auto text-sm">
                            Approved by {payment.approved_by?.name ?? 'staff'}.
                            Posting rechecks the account balance and cheque
                            status.
                        </p>
                        <Button onClick={pay}>
                            <Check className="h-4 w-4" />
                            Post payment
                        </Button>
                    </section>
                )}

                {payment.status === 'RETURNED' && payment.return_reason && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                        Returned: {payment.return_reason}
                    </p>
                )}

                <section className="rounded-md border bg-card">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-semibold">
                            Workflow history
                        </h2>
                    </div>
                    <ol className="divide-y">
                        {payment.events.map((event) => (
                            <li
                                key={event.id}
                                className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm"
                            >
                                <div>
                                    <span className="font-medium">
                                        {event.action.replaceAll('_', ' ')}
                                    </span>
                                    <span className="ml-2 text-muted-foreground">
                                        {event.performed_by?.name ?? 'System'}
                                    </span>
                                    {event.reason && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {event.reason}
                                        </p>
                                    )}
                                </div>
                                <time className="text-xs text-muted-foreground">
                                    {new Date(
                                        event.created_at,
                                    ).toLocaleString()}
                                </time>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
