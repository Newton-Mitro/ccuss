import { formatDate } from '@/lib/date_util';
import type { CashAdjustmentFormPageProps } from '@/modules/treasury-cash/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CircleDollarSign,
    FileText,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

export default function TellerCashAdjustment() {
    const { teller_sessions } = usePage<CashAdjustmentFormPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        teller_session_id: '',
        amount: '',
        type: 'SHORTAGE',
        reason: '',
    });
    const selectedSession = teller_sessions.find(
        (session) => String(session.id) === data.teller_session_id,
    );

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Cash Adjustment',
            href: route('cash-adjustments.teller-cash-adjustment'),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('cash-adjustments.teller-cash-adjustment.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Adjustment" />
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <SlidersHorizontal className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    Cash management
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Teller operations
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Record a cash adjustment
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Document a verified cash shortage or excess from
                                an open teller session.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="shrink-0"
                            onClick={() =>
                                router.visit(route('cash-adjustments.index'))
                            }
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Back to adjustments
                        </Button>
                    </div>
                </header>

                {teller_sessions.length === 0 && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
                    >
                        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                No open teller sessions
                            </p>
                            <p className="mt-1 leading-5 opacity-90">
                                Open a teller session before recording a cash
                                adjustment.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Adjustment details
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Select the teller session and describe
                                        the verified difference.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="teller_session_id">
                                        Teller session
                                    </Label>
                                    <Select
                                        id="teller_session_id"
                                        value={data.teller_session_id}
                                        onChange={(value) =>
                                            setData('teller_session_id', value)
                                        }
                                        placeholder="Select open teller session"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select open teller session',
                                            },
                                            ...teller_sessions.map(
                                                (session) => ({
                                                    value: String(session.id),
                                                    label: `${session.teller?.name ?? 'Teller'} (${session.teller?.code ?? '-'}) · ${formatDate(session.branch_day?.business_date)}`,
                                                }),
                                            ),
                                        ]}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Only currently open sessions are
                                        available.
                                    </p>
                                    {errors.teller_session_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.teller_session_id}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">
                                            Adjustment type
                                        </Label>
                                        <Select
                                            id="type"
                                            value={data.type}
                                            onChange={(value) =>
                                                setData('type', value)
                                            }
                                            options={[
                                                {
                                                    value: 'SHORTAGE',
                                                    label: 'Shortage',
                                                },
                                                {
                                                    value: 'EXCESS',
                                                    label: 'Excess',
                                                },
                                            ]}
                                        />
                                        {errors.type && (
                                            <p className="text-sm text-destructive">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.0001"
                                            value={data.amount}
                                            onChange={(event) =>
                                                setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className="h-11"
                                            required
                                        />
                                        {errors.amount && (
                                            <p className="text-sm text-destructive">
                                                {errors.amount}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(event) =>
                                            setData(
                                                'reason',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={2000}
                                        placeholder="Describe the cash count difference and any relevant details."
                                        rows={4}
                                        className="flex min-h-28 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Add enough detail to support
                                            verification and review.
                                        </span>
                                        <span>{data.reason.length}/2000</span>
                                    </div>
                                    {errors.reason && (
                                        <p className="text-sm text-destructive">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <footer className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.visit(
                                        route('cash-adjustments.index'),
                                    )
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing || teller_sessions.length === 0
                                }
                            >
                                <SlidersHorizontal className="mr-2 size-4" />
                                {processing
                                    ? 'Submitting...'
                                    : 'Create pending adjustment'}
                            </Button>
                        </footer>
                    </form>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Adjustment preview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review the details before submitting.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div
                                    className={`flex size-11 items-center justify-center rounded-xl ${
                                        data.type === 'SHORTAGE'
                                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    }`}
                                >
                                    {data.type === 'SHORTAGE' ? (
                                        <SlidersHorizontal className="size-5" />
                                    ) : (
                                        <CircleDollarSign className="size-5" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {data.type === 'SHORTAGE'
                                            ? 'Cash shortage'
                                            : 'Cash excess'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedSession?.teller?.name ??
                                            'No teller selected'}
                                        {selectedSession?.teller?.code
                                            ? ` · ${selectedSession.teller.code}`
                                            : ''}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CircleDollarSign className="size-4" />
                                        Adjustment amount
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {data.amount || '0.00'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                                    <span className="size-1.5 rounded-full bg-amber-500" />
                                    Pending review
                                </div>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <ShieldCheck className="size-4 text-primary" />
                                Review before submitting
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Verify the teller session matches the cash
                                    count.
                                </li>
                                <li>
                                    Confirm the shortage or excess and enter the
                                    exact difference.
                                </li>
                                <li>
                                    The adjustment will remain pending until it
                                    is reviewed.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
