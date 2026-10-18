import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Banknote,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    Info,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';

type BranchDay = {
    id: number;
    business_date: string;
    branch_name?: string;
};

type Teller = {
    id: number;
    name: string;
    code: string;
    current_balance?: string | number | null;
};

export default function CreateTellerSessionPage() {
    const {
        branch_day,
        branch_days = [],
        tellers = [],
        user_branch_id,
    } = usePage<{
        branch_day?: BranchDay;
        branch_days?: BranchDay[];
        tellers?: Teller[];
        user_branch_id?: number | null;
    }>().props;

    const userHasBranch = !!user_branch_id;
    const hasBranchDay = !!branch_day;
    const canOpenSession = userHasBranch && hasBranchDay;

    const { data, setData, post, processing, errors } = useForm({
        branch_day_id: branch_day?.id ? String(branch_day.id) : '',
        teller_id: '',
        opening_cash: '',
        opening_note: '',
    });
    const selectedTeller = tellers.find(
        (teller) => String(teller.id) === data.teller_id,
    );

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Open teller session', href: '' },
    ];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!branch_day) {
            router.visit(route('branch-days.index'));
            return;
        }

        post(route('teller-sessions.open'), {
            preserveScroll: true,
        });
    };

    const labelClass = 'mb-1.5 block text-xs font-semibold text-foreground';

    const errorClass = 'mt-1.5 text-xs text-destructive';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Teller Session" />

            <div className="max-w-6xl space-y-5 pb-6">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
                            <Wallet className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    Open Teller Session
                                </h1>

                                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                                    <span className="size-1.5 rounded-full bg-primary" />
                                    NEW SESSION
                                </span>
                            </div>

                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Assign a teller and record the opening cash
                                balance before starting daily transactions.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('teller-sessions.index')}
                        className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted sm:self-center"
                    >
                        <ArrowLeft className="size-4" />
                        All sessions
                    </Link>
                </div>

                {/* Prerequisite alerts */}
                {!userHasBranch && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5"
                    >
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />

                        <div>
                            <p className="text-sm font-semibold">
                                Branch assignment required
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Assign a branch to your user account before
                                opening a teller session.
                            </p>
                        </div>
                    </div>
                )}

                {!hasBranchDay && userHasBranch && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5"
                    >
                        <CalendarDays className="mt-0.5 size-5 shrink-0 text-amber-600" />

                        <div className="flex-1">
                            <p className="text-sm font-semibold">
                                No active branch day
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Open a branch business day before creating a
                                teller session.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(route('branch-days.index'))
                            }
                        >
                            Branch days
                            <ArrowRight className="ml-1.5 size-3.5" />
                        </Button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid items-start gap-5 lg:grid-cols-12">
                        {/* Left column: Session configuration */}
                        <div className="space-y-4 lg:col-span-7">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <UserRound className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Session configuration
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Select the business day and
                                            responsible teller.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5 p-4 sm:p-5">
                                    {/* Branch day */}
                                    <div>
                                        <label
                                            htmlFor="branch_day_id"
                                            className={labelClass}
                                        >
                                            Branch business day
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Select
                                                id="branch_day_id"
                                                className="h-10 w-full pl-9"
                                                value={data.branch_day_id}
                                                onChange={(value) =>
                                                    setData(
                                                        'branch_day_id',
                                                        value,
                                                    )
                                                }
                                                disabled={
                                                    !branch_days.length ||
                                                    !userHasBranch
                                                }
                                                placeholder="Select business day"
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select business day',
                                                    },
                                                    ...branch_days.map(
                                                        (item) => ({
                                                            value: String(
                                                                item.id,
                                                            ),
                                                            label: `${item.branch_name ?? 'Branch'} — ${item.business_date}`,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        </div>

                                        {errors.branch_day_id && (
                                            <p className={errorClass}>
                                                {errors.branch_day_id}
                                            </p>
                                        )}

                                        {branch_day && (
                                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CheckCircle2 className="size-3.5 text-primary" />
                                                Active business day:{' '}
                                                {branch_day.business_date}
                                            </p>
                                        )}
                                    </div>

                                    {/* Teller */}
                                    <div>
                                        <label
                                            htmlFor="teller_id"
                                            className={labelClass}
                                        >
                                            Assigned teller
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <UserRound className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Select
                                                id="teller_id"
                                                className="h-10 w-full pl-9"
                                                value={data.teller_id}
                                                onChange={(value) =>
                                                    setData('teller_id', value)
                                                }
                                                disabled={
                                                    !hasBranchDay ||
                                                    !userHasBranch
                                                }
                                                placeholder="Select assigned teller"
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select assigned teller',
                                                    },
                                                    ...tellers.map(
                                                        (teller) => ({
                                                            value: String(
                                                                teller.id,
                                                            ),
                                                            label: `${teller.name} (${teller.code})`,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        </div>

                                        {errors.teller_id && (
                                            <p className={errorClass}>
                                                {errors.teller_id}
                                            </p>
                                        )}

                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            Choose the teller who will be
                                            responsible for this session.
                                        </p>

                                        {selectedTeller && (
                                            <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2.5">
                                                <div>
                                                    <p className="text-xs font-medium">
                                                        Current ledger balance
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Reference only; count
                                                        the physical cash below.
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-sm font-semibold tabular-nums">
                                                    {selectedTeller.current_balance ==
                                                    null
                                                        ? '-'
                                                        : formatBDTCurrency(
                                                              selectedTeller.current_balance,
                                                          )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Opening note */}
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FileText className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening remarks
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Add an optional note for the session
                                            record.
                                        </p>
                                    </div>

                                    <span className="ml-auto rounded-md border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                        OPTIONAL
                                    </span>
                                </div>

                                <div className="p-4 sm:p-5">
                                    <label
                                        htmlFor="opening_note"
                                        className={labelClass}
                                    >
                                        Session note
                                    </label>

                                    <div className="relative">
                                        <FileText className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />

                                        <Input
                                            id="opening_note"
                                            value={data.opening_note}
                                            onChange={(event) =>
                                                setData(
                                                    'opening_note',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Enter opening remarks or cash verification details..."
                                            className="h-10 pl-9"
                                            disabled={!canOpenSession}
                                            maxLength={2000}
                                        />
                                    </div>

                                    {errors.opening_note && (
                                        <p className={errorClass}>
                                            {errors.opening_note}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right column: Opening cash */}
                        <div className="space-y-4 lg:col-span-5">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CircleDollarSign className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening cash balance
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Initial cash float
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 sm:p-5">
                                    <div>
                                        <label
                                            htmlFor="opening_cash"
                                            className={labelClass}
                                        >
                                            Opening amount
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                                                ৳
                                            </span>

                                            <Input
                                                id="opening_cash"
                                                type="number"
                                                min="0"
                                                step="0.0001"
                                                inputMode="decimal"
                                                placeholder="0.00"
                                                className="h-14 pl-9 text-2xl font-bold tracking-tight tabular-nums"
                                                value={data.opening_cash}
                                                onChange={(event) =>
                                                    setData(
                                                        'opening_cash',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={!canOpenSession}
                                                required
                                            />
                                        </div>

                                        {errors.opening_cash && (
                                            <p className={errorClass}>
                                                {errors.opening_cash}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                            Enter the physical cash available
                                            when the teller begins operations.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/30 p-3">
                                        <div className="flex items-start gap-2.5">
                                            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                            <div>
                                                <p className="text-xs font-semibold">
                                                    Cash verification
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Count the physical cash and
                                                    verify the amount before
                                                    opening the session.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Readiness checklist */}
                            <section className="rounded-xl border bg-muted/20 p-4 sm:p-5">
                                <h3 className="text-sm font-semibold">
                                    Session readiness
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review these details before proceeding.
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                                    <div className="flex items-center gap-2.5 text-xs">
                                        {userHasBranch ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-4 shrink-0 rounded-full border border-amber-500" />
                                        )}
                                        <span
                                            className={
                                                userHasBranch
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Branch assignment
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-xs">
                                        {hasBranchDay ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-4 shrink-0 rounded-full border border-amber-500" />
                                        )}
                                        <span
                                            className={
                                                hasBranchDay
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Active branch day
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-xs">
                                        {data.teller_id ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-4 shrink-0 rounded-full border" />
                                        )}
                                        <span
                                            className={
                                                data.teller_id
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Teller selected
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-xs">
                                        {data.opening_cash !== '' &&
                                        Number(data.opening_cash) >= 0 ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-4 shrink-0 rounded-full border" />
                                        )}
                                        <span
                                            className={
                                                data.opening_cash !== '' &&
                                                Number(data.opening_cash) >= 0
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Opening amount entered
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Actions */}
                            <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        type="submit"
                                        disabled={processing || !canOpenSession}
                                        className="h-11 w-full gap-2 rounded-lg font-semibold shadow-sm transition-all sm:flex-1"
                                    >
                                        <Banknote className="size-4 shrink-0" />

                                        <span>
                                            {processing
                                                ? 'Opening session...'
                                                : 'Open teller session'}
                                        </span>

                                        {!processing && (
                                            <ArrowRight className="ml-auto size-4 shrink-0" />
                                        )}

                                        {processing && (
                                            <span className="ml-auto size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-11 w-full gap-2 rounded-lg sm:w-auto sm:min-w-28"
                                        disabled={processing}
                                        onClick={() =>
                                            router.visit(
                                                route('teller-sessions.index'),
                                            )
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                <div className="flex items-start gap-2.5 border-t pt-3">
                                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Review the teller assignment and opening
                                        cash amount before opening the session.
                                        Make sure the details are accurate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
