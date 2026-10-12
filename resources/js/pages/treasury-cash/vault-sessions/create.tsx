import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
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

type BranchDay = {
    id: number;
    business_date: string;
    branch_name?: string;
};

type VaultOption = {
    id: number;
    code: string;
    name: string;
};

type PageProps = {
    branch_day?: BranchDay;
    branch_days?: BranchDay[];
    vaults?: VaultOption[];
    user_branch_id?: number | null;
};

export default function CreateVaultSessionPage() {
    const {
        branch_day,
        branch_days = [],
        vaults = [],
        user_branch_id,
    } = usePage<PageProps>().props;

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

            <div className="max-w-6xl space-y-5 pb-6">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
                            <Vault className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    Open Vault Session
                                </h1>

                                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                                    <span className="size-1.5 rounded-full bg-primary" />
                                    NEW SESSION
                                </span>
                            </div>

                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Select a vault and record its opening cash
                                balance before starting branch operations.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('vault-sessions.index')}
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
                    <div className="grid items-start gap-5 lg:grid-cols-12">
                        {/* Left column: Session configuration */}
                        <div className="space-y-4 lg:col-span-7">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Vault className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Session configuration
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Select the business day and vault
                                            for this session.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5 p-4 sm:p-5">
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
                                                className="h-10 w-full pl-9"
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

                                        {selectedVault && (
                                            <div className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                                                <Vault className="size-4 shrink-0 text-muted-foreground" />

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium">
                                                        {selectedVault.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Vault code:{' '}
                                                        {selectedVault.code}
                                                    </p>
                                                </div>

                                                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                            </div>
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

                            {/* Opening remarks */}
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FileText className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening remarks
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Add an optional note to the session
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

                                    <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
                                        {data.opening_note.length}/2000
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Right column: Opening cash and readiness */}
                        <div className="space-y-4 lg:col-span-5">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CircleDollarSign className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Opening cash balance
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Initial physical cash in the vault
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
                                            Enter the actual physical cash
                                            counted and available at the start
                                            of the business day.
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
                                                    Count and verify the
                                                    physical cash before opening
                                                    the vault session. The
                                                    opening amount should match
                                                    the actual cash on hand.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Session readiness */}
                            <section className="rounded-xl border bg-muted/20 p-4 shadow-sm sm:p-5">
                                <h3 className="text-sm font-semibold">
                                    Session readiness
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review the required details before
                                    proceeding.
                                </p>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2.5 text-xs">
                                        {userHasBranch ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
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
                                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
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
                                        {selectedVault ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                        ) : (
                                            <span className="size-4 shrink-0 rounded-full border" />
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

                                    <div className="flex items-center gap-2.5 text-xs">
                                        {hasOpeningCash ? (
                                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                        ) : (
                                            <span className="size-4 shrink-0 rounded-full border" />
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

                                <div className="mt-4 border-t pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        Opening balance
                                    </p>

                                    <p className="mt-1 text-xl font-bold tracking-tight tabular-nums">
                                        ৳
                                        {hasOpeningCash
                                            ? Number(
                                                  data.opening_cash,
                                              ).toLocaleString('en-BD', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 4,
                                              })
                                            : '0.00'}
                                    </p>
                                </div>
                            </section>

                            {/* Form actions */}
                            <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !canOpenSession ||
                                        !selectedVault ||
                                        !hasOpeningCash
                                    }
                                    className="h-11 w-full font-semibold"
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
                                    className="h-10 w-full"
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
