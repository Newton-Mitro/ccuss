import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { PageProps } from '@/modules/treasury-cash/types/vault-sessions/create.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    ShieldCheck,
    Vault,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CreateVaultSessionPage() {
    const {
        branch_day,
        branch_days = [],
        vaults = [],
        user_branch_id,
        auth,
    } = usePage<PageProps>().props;

    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canViewSessions = permissions.has('vault_sessions.view');

    const userHasBranch = !!user_branch_id;
    const hasBranchDay = !!branch_day;
    const canOpenSession = userHasBranch && hasBranchDay;

    const { data, setData, post, processing, errors } = useForm({
        branch_day_id: branch_day?.id ? String(branch_day.id) : '',
        vault_id: '',
        opening_cash: '',
        opening_note: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Vault Sessions', href: route('vault-sessions.index') },
        { title: 'Open vault session', href: '' },
    ];

    const selectedVault = vaults.find(
        (item) => String(item.id) === data.vault_id,
    );

    const hasOpeningCash =
        data.opening_cash.trim() !== '' &&
        Number.isFinite(Number(data.opening_cash)) &&
        Number(data.opening_cash) >= 0;

    const labelClass = 'mb-1.5 block text-xs font-semibold text-foreground';
    const errorClass = 'mt-1.5 text-xs text-destructive';

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canOpenSession) {
            router.visit(route('branch-days.index'));
            return;
        }

        post(route('vault-sessions.open'), {
            preserveScroll: true,
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Vault Session" />

            <div className="max-w-6xl space-y-4 pb-6">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08]">
                            <Vault className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    Open Vault Session
                                </h1>
                            </div>

                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Select a vault and record its opening cash
                                balance before starting branch operations.
                            </p>
                        </div>
                    </div>

                    {canViewSessions && (
                        <Button
                            asChild
                            variant="outline"
                            className="self-start sm:self-center"
                        >
                            <Link href={route('vault-sessions.index')}>
                                <ArrowLeft className="size-4" />
                                All sessions
                            </Link>
                        </Button>
                    )}
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
                                opening a vault session.
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
                                vault session.
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
                            <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b bg-gradient-to-r from-muted/40 to-transparent px-4 py-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Vault className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Session configuration
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Select the business day and vault
                                            for this session.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 p-4 sm:grid-cols-2">
                                    {/* Branch business day */}
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
                                                    !userHasBranch ||
                                                    !hasBranchDay
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

                                    {/* Vault selection */}
                                    <div>
                                        <label
                                            htmlFor="vault_id"
                                            className={labelClass}
                                        >
                                            Vault
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <Vault className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Select
                                                id="vault_id"
                                                className="h-9 w-full pl-9"
                                                value={data.vault_id}
                                                onChange={(value) =>
                                                    setData('vault_id', value)
                                                }
                                                disabled={
                                                    !canOpenSession ||
                                                    !vaults.length
                                                }
                                                placeholder="Select a vault"
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select a vault',
                                                    },
                                                    ...vaults.map((vault) => ({
                                                        value: String(vault.id),
                                                        label: `${vault.name} (${vault.code})`,
                                                    })),
                                                ]}
                                            />
                                        </div>

                                        {errors.vault_id && (
                                            <p className={errorClass}>
                                                {errors.vault_id}
                                            </p>
                                        )}

                                        {!vaults.length && canOpenSession && (
                                            <p className="mt-1.5 text-xs text-muted-foreground">
                                                No vaults are available for this
                                                session.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Opening cash */}
                            <section className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm shadow-primary/[0.03]">
                                <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/[0.07] to-transparent px-4 py-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CircleDollarSign className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening cash balance
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Physical cash counted for this
                                            session
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
                                                className="h-11 border-primary/20 bg-background pl-9 text-xl font-bold tracking-tight tabular-nums"
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

                                    {selectedVault && (
                                        <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-medium">
                                                    Current ledger balance
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Reference only
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-xs font-semibold tabular-nums">
                                                {selectedVault.current_balance ==
                                                null
                                                    ? '—'
                                                    : formatBDTCurrency(
                                                          selectedVault.current_balance,
                                                      )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Opening remarks */}
                            <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b bg-gradient-to-r from-muted/40 to-transparent px-4 py-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FileText className="size-3.5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening remarks
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Add an optional note to the session
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

                                    <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
                                        {data.opening_note.length}/2000
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Right column: Session overview */}
                        <div className="space-y-3 lg:col-span-5">
                            <section className="overflow-hidden rounded-xl border border-primary/20 bg-card shadow-md shadow-primary/[0.04]">
                                <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-3">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Vault className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-sm font-semibold">
                                                Session overview
                                            </h2>
                                            <p className="text-[10px] text-muted-foreground">
                                                Review before opening
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
                                            {hasOpeningCash
                                                ? formatBDTCurrency(
                                                      data.opening_cash,
                                                  )
                                                : formatBDTCurrency(0)}
                                        </p>
                                    </div>

                                    {[
                                        {
                                            label: 'Business day',
                                            value: branch_day
                                                ? branch_day.business_date
                                                : 'Not selected',
                                            icon: CalendarDays,
                                        },
                                        {
                                            label: 'Vault',
                                            value: selectedVault
                                                ? `${selectedVault.name} (${selectedVault.code})`
                                                : 'Not selected',
                                            icon: Vault,
                                        },
                                        {
                                            label: 'Ledger balance',
                                            value:
                                                selectedVault?.current_balance ==
                                                null
                                                    ? '—'
                                                    : formatBDTCurrency(
                                                          selectedVault.current_balance,
                                                      ),
                                            icon: CircleDollarSign,
                                        },
                                    ].map((item) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div
                                                key={item.label}
                                                className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-2"
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

                                    {data.opening_note && (
                                        <div className="rounded-lg border border-border/70 px-2.5 py-2">
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

                            {/* Session readiness */}
                            <section className="rounded-xl border bg-muted/20 p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <h3 className="text-xs font-semibold">
                                        Session readiness
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground">
                                        Required checks
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
                                        {selectedVault ? (
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-3.5 shrink-0 rounded-full border" />
                                        )}

                                        <span
                                            className={
                                                selectedVault
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Vault selected
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        {hasOpeningCash ? (
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                                        ) : (
                                            <span className="size-3.5 shrink-0 rounded-full border" />
                                        )}

                                        <span
                                            className={
                                                hasOpeningCash
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Opening amount entered
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Form actions */}
                            <div className="space-y-2 rounded-xl border border-primary/15 bg-card p-3 shadow-sm">
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !canOpenSession ||
                                        !selectedVault ||
                                        !hasOpeningCash
                                    }
                                    className="h-10 w-full font-semibold"
                                >
                                    <Vault className="mr-2 size-4" />

                                    {processing
                                        ? 'Opening vault session...'
                                        : 'Open vault session'}

                                    {!processing && (
                                        <ArrowRight className="ml-auto size-4" />
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 w-full"
                                    disabled={processing}
                                    onClick={() =>
                                        router.visit(
                                            route('vault-sessions.index'),
                                        )
                                    }
                                >
                                    Cancel
                                </Button>

                                <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                                    Verify the vault selection and physical cash
                                    balance before submitting.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
