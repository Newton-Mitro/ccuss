import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/treasury-cash/types/cash-denominations/index.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Coins,
    FileCheck2,
    FileClock,
    Layers3,
    Pencil,
    Plus,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

export default function CashDenominationsIndex() {
    const { denominations, auth } = usePage<Props>().props;
    useFlashToastHandler();

    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canCreate = permissions.has('cash_transactions.create');
    const canUpdate = permissions.has('cash_transactions.update');

    const stats = [
        {
            label: 'Denominations',
            value: denominations.length,
            icon: Layers3,
            tone: 'bg-primary/10 text-primary',
        },
        {
            label: 'Active',
            value: denominations.filter((item) => item.is_active).length,
            icon: CheckCircle2,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Banknotes',
            value: denominations.filter((item) => item.type === 'NOTE').length,
            icon: Banknote,
            tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        },
        {
            label: 'Coins',
            value: denominations.filter((item) => item.type === 'COIN').length,
            icon: Coins,
            tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Count records',
            value: denominations.reduce(
                (total, item) => total + item.count_lines_count,
                0,
            ),
            icon: FileCheck2,
            tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Cash Counts', href: route('cash-counts.index') },
        {
            title: 'Cash Denominations',
            href: route('cash-denominations.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Denominations" />

            <div className="w-full max-w-7xl space-y-4 pb-6 text-foreground">
                <header className="relative isolate overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.09] via-card to-card px-4 py-3.5 sm:px-5">
                    <div className="pointer-events-none absolute -top-16 right-20 size-36 rounded-full bg-primary/[0.08] blur-3xl" />
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-background/80 text-primary shadow-sm">
                                <Banknote className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-semibold tracking-[0.16em] text-primary uppercase">
                                    Cash count setup
                                </p>
                                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                                    Cash Denominations
                                </h1>
                                <p className="text-[11px] leading-4 text-muted-foreground">
                                    Configure banknotes and coins for branch
                                    cash counting.
                                </p>
                            </div>
                        </div>
                        {canCreate && (
                            <Button
                                asChild
                                className="h-9 w-full shrink-0 gap-2 shadow-sm sm:w-auto"
                            >
                                <Link href={route('cash-denominations.create')}>
                                    <Plus className="size-4" />
                                    Add denomination
                                </Link>
                            </Button>
                        )}
                    </div>
                </header>

                <section
                    aria-label="Denomination summary"
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
                >
                    {stats.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="group relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-border/80 bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-primary/25"
                        >
                            <div className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div
                                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-foreground/[0.04] ${tone}`}
                            >
                                <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[10px] leading-4 text-muted-foreground">
                                    {label}
                                </p>
                                <p className="text-lg leading-5 font-semibold tracking-tight tabular-nums">
                                    {value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                    <div className="flex flex-col gap-2.5 border-b border-border/80 bg-gradient-to-r from-muted/40 to-transparent px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                                <Wallet className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Configured denominations
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Manage currency values and availability.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Layers3 className="size-3" />
                            {denominations.length} entries
                        </span>
                    </div>

                    {denominations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-180 text-[13px]">
                                <thead className="bg-muted/40 text-[10px] tracking-wide text-muted-foreground uppercase">
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-2.5 text-left font-medium">
                                            Denomination
                                        </th>
                                        <th className="px-3 py-2.5 text-left font-medium">
                                            Type
                                        </th>
                                        <th className="px-3 py-2.5 text-right font-medium">
                                            Face value
                                        </th>
                                        <th className="px-3 py-2.5 text-center font-medium">
                                            Count history
                                        </th>
                                        <th className="px-3 py-2.5 text-left font-medium">
                                            Status
                                        </th>
                                        {canUpdate && (
                                            <th className="px-4 py-2.5 text-right font-medium">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/70">
                                    {denominations.map((denomination) => {
                                        const TypeIcon =
                                            denomination.type === 'NOTE'
                                                ? Banknote
                                                : Coins;
                                        return (
                                            <tr
                                                key={denomination.id}
                                                className="transition-colors odd:bg-muted/[0.025] hover:bg-primary/[0.04]"
                                            >
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-sm ${
                                                                denomination.type ===
                                                                'NOTE'
                                                                    ? 'border-sky-500/20 bg-sky-500/8 text-sky-600 dark:text-sky-400'
                                                                    : 'border-amber-500/20 bg-amber-500/8 text-amber-600 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            <TypeIcon className="size-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="leading-4 font-medium">
                                                                {denomination.name ||
                                                                    `${denomination.value} ${denomination.currency}`}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {
                                                                    denomination.currency
                                                                }{' '}
                                                                ·{' '}
                                                                {denomination.type ===
                                                                'NOTE'
                                                                    ? 'Banknote'
                                                                    : 'Coin'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/30 px-2 py-1 text-[11px] font-medium">
                                                        <TypeIcon className="size-3" />
                                                        {denomination.type ===
                                                        'NOTE'
                                                            ? 'Banknote'
                                                            : 'Coin'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    <div className="font-semibold tabular-nums">
                                                        {Number(
                                                            denomination.value,
                                                        ).toLocaleString(
                                                            'en-BD',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        {denomination.currency}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    {denomination.count_lines_count >
                                                    0 ? (
                                                        <span className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 px-2 py-1 text-[11px] font-medium tabular-nums">
                                                            <FileClock className="size-3 text-muted-foreground" />
                                                            {
                                                                denomination.count_lines_count
                                                            }{' '}
                                                            <span className="text-muted-foreground">
                                                                records
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            No history
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <StatusBadge
                                                        active={
                                                            denomination.is_active
                                                        }
                                                    />
                                                </td>
                                                {canUpdate && (
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex justify-end">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5"
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'cash-denominations.edit',
                                                                        denomination.id,
                                                                    )}
                                                                    aria-label={`Edit ${denomination.name ?? denomination.value}`}
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                    <span className="hidden lg:inline">
                                                                        Edit
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-5 py-14 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
                                <Banknote className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold">
                                No denominations configured
                            </h3>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                                Configure banknotes and coins to start recording
                                accurate branch cash counts.
                            </p>
                            {canCreate && (
                                <Button asChild className="mt-5 gap-2">
                                    <Link
                                        href={route(
                                            'cash-denominations.create',
                                        )}
                                    >
                                        <Plus className="size-4" />
                                        Add denomination
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 border-t border-border/80 bg-muted/20 px-3.5 py-2.5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <span>
                            Showing {denominations.length} denomination
                            {denominations.length === 1 ? '' : 's'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="size-3.5 shrink-0" />
                            Historical cash count restrictions are enforced.
                        </span>
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={
                active
                    ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground'
            }
        >
            <span
                className={
                    active
                        ? 'size-1.5 rounded-full bg-emerald-500'
                        : 'size-1.5 rounded-full bg-muted-foreground/50'
                }
            />
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}
