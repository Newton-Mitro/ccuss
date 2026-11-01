import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Banknote,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Eye,
    FileText,
    Info,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type {
    BranchDay,
    Teller,
} from '@/modules/treasury-cash/types/teller-sessions/create.types';

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
    const selectedBranchDay =
        branch_days.find((item) => String(item.id) === data.branch_day_id) ??
        (String(branch_day?.id) === data.branch_day_id
            ? branch_day
            : undefined);

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

            <div className="max-w-6xl space-y-4 pb-6">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent shadow-sm">
                            <Wallet className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    Open Teller Session
                                </h1>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.06] px-2 py-1 text-[10px] font-semibold text-primary">
                                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
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
                    <div className="grid items-start gap-4 lg:grid-cols-12">
                        {/* Left column: Session configuration */}
                        <div className="space-y-3 lg:col-span-7">
                            <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-foreground/[0.02]">
                                <div className="flex items-center gap-3 border-b bg-gradient-to-r from-muted/40 to-transparent px-4 py-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                                        <UserRound className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Session configuration
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Select the business day and
                                            responsible teller.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4">
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
                                                className="h-9 w-full pl-9"
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
                                                className="h-9 w-full pl-9"
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

                                        {selectedTeller && (
                                            <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
                                                <div>
                                                    <p className="text-xs font-semibold">
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

                            {/* Opening cash */}
                            <section className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm shadow-primary/[0.04]">
                                <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/[0.08] to-transparent px-4 py-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                                        <CircleDollarSign className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening cash balance
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Initial physical cash float
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)] sm:items-end">
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
                                                className="h-11 border-primary/20 bg-background pl-9 text-xl font-bold tracking-tight tabular-nums shadow-inner shadow-primary/[0.02]"
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
                                    </div>

                                    <div className="flex items-start gap-2 rounded-lg border border-primary/10 bg-gradient-to-r from-primary/[0.05] to-transparent p-2.5">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                            Count and verify the physical cash
                                            before opening the session.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Opening note */}
                            <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-foreground/[0.02]">
                                <div className="flex items-center gap-3 border-b bg-gradient-to-r from-muted/40 to-transparent px-4 py-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border/60">
                                        <FileText className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening remarks
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Add an optional note for the session
                                            record.
                                        </p>
                                    </div>

                                    <span className="ml-auto rounded-md border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                        OPTIONAL
                                    </span>
                                </div>

                                <div className="p-4">
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
                                            className="h-9 pl-9"
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

                        {/* Right column: Live session review */}
                        <div className="space-y-3 lg:sticky lg:top-4 lg:col-span-5 lg:self-start">
                            {/* Live session preview */}
                            <section className="overflow-hidden rounded-xl border border-primary/20 bg-card shadow-sm shadow-primary/[0.04]">
                                <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-3">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Eye className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-sm font-semibold">
                                                Session preview
                                            </h2>
                                            <p className="text-[10px] text-muted-foreground">
                                                Updates as you enter details
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[9px] font-semibold tracking-wide text-primary">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 p-3">
                                    <div className="rounded-lg bg-gradient-to-br from-primary/[0.09] to-muted/30 p-3 ring-1 ring-primary/10">
                                        <p className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                            Opening cash
                                        </p>
                                        <p className="mt-0.5 text-xl font-bold tracking-tight text-primary tabular-nums">
                                            {data.opening_cash
                                                ? formatBDTCurrency(
                                                      data.opening_cash,
                                                  )
                                                : formatBDTCurrency(0)}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        {[
                                            {
                                                label: 'Business day',
                                                value: selectedBranchDay
                                                    ? `${selectedBranchDay.branch_name ?? 'Branch'} · ${selectedBranchDay.business_date}`
                                                    : 'Not selected',
                                                icon: CalendarDays,
                                            },
                                            {
                                                label: 'Teller',
                                                value: selectedTeller
                                                    ? `${selectedTeller.name} (${selectedTeller.code})`
                                                    : 'Not selected',
                                                icon: UserRound,
                                            },
                                            {
                                                label: 'Ledger balance',
                                                value:
                                                    selectedTeller?.current_balance ==
                                                    null
                                                        ? '—'
                                                        : formatBDTCurrency(
                                                              selectedTeller?.current_balance,
                                                          ),
                                                icon: Wallet,
                                            },
                                        ].map((item) => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <div
                                                    key={item.label}
                                                    className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2"
                                                >
                                                    <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <ItemIcon className="size-3" />
                                                        {item.label}
                                                    </span>
                                                    <span className="min-w-0 text-right text-[11px] font-medium break-words">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {data.opening_note && (
                                        <div className="rounded-lg border border-border/60 px-2.5 py-2">
                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Session note
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-[11px] break-words">
                                                {data.opening_note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Readiness checklist */}
                            <section className="rounded-xl border bg-muted/20 p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <h3 className="text-xs font-semibold">
                                        Session readiness
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground">
                                        Complete all required details
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        {userHasBranch ? (
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-3.5 shrink-0 rounded-full border border-amber-500" />
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

                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        {hasBranchDay ? (
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-3.5 shrink-0 rounded-full border border-amber-500" />
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

                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        {data.teller_id ? (
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-3.5 shrink-0 rounded-full border" />
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

                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        {data.opening_cash !== '' &&
                                        Number(data.opening_cash) >= 0 ? (
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-3.5 shrink-0 rounded-full border" />
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
                            <div className="space-y-3 rounded-xl border border-primary/15 bg-card p-3 shadow-sm shadow-primary/[0.03]">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        type="submit"
                                        disabled={processing || !canOpenSession}
                                        className="h-10 w-full gap-2 rounded-lg font-semibold shadow-sm transition-all sm:flex-1"
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
                                        className="h-10 w-full gap-2 rounded-lg sm:w-auto sm:min-w-28"
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

                                <div className="flex items-center gap-2 border-t pt-2.5">
                                    <Info className="size-3.5 shrink-0 text-muted-foreground" />

                                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                                        Verify the teller and physical cash
                                        count before opening.
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
