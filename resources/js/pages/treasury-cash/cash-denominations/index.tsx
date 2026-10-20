import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
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

type Denomination = {
    id: number;
    currency: string;
    type: 'NOTE' | 'COIN';
    value: string | number;
    name?: string | null;
    is_active: boolean;
    count_lines_count: number;
};

type Props = SharedData & {
    denominations: Denomination[];
};

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
            label: 'Total denominations',
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

            <div className="w-full max-w-7xl space-y-6 pb-8 text-foreground">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <ResourcePageHeader
                        title="Cash Denominations"
                        description="Configure banknotes and coins used in branch cash counting and reconciliation."
                    />
                    {canCreate && (
                        <Button
                            asChild
                            className="h-10 w-full shrink-0 gap-2 shadow-sm sm:w-auto"
                        >
                            <Link href={route('cash-denominations.create')}>
                                <Plus className="size-4" />
                                Add denomination
                            </Link>
                        </Button>
                    )}
                </div>

                <section
                    aria-label="Denomination summary"
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                >
                    {stats.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                        >
                            <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
                            >
                                <Icon className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
                                    {value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Wallet className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Configured denominations
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Manage currency values and availability.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            <Layers3 className="size-3.5" />
                            {denominations.length} entries
                        </span>
                    </div>

                    {denominations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-180 text-sm">
                                <thead className="bg-muted/70 text-xs text-muted-foreground">
                                    <tr className="border-b border-border">
                                        <th className="px-5 py-3 text-left font-medium">
                                            Denomination
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Face value
                                        </th>
                                        <th className="px-4 py-3 text-center font-medium">
                                            Count history
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        {canUpdate && (
                                            <th className="px-5 py-3 text-right font-medium">
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
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                                                                denomination.type ===
                                                                'NOTE'
                                                                    ? 'border-sky-500/20 bg-sky-500/8 text-sky-600 dark:text-sky-400'
                                                                    : 'border-amber-500/20 bg-amber-500/8 text-amber-600 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            <TypeIcon className="size-4.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="leading-5 font-medium">
                                                                {denomination.name ||
                                                                    `${denomination.value} ${denomination.currency}`}
                                                            </p>
                                                            <p className="mt-1 text-xs text-muted-foreground">
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
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-1.5 text-xs font-medium">
                                                        <TypeIcon className="size-3.5" />
                                                        {denomination.type ===
                                                        'NOTE'
                                                            ? 'Banknote'
                                                            : 'Coin'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="font-semibold tabular-nums">
                                                        {Number(
                                                            denomination.value,
                                                        ).toLocaleString(
                                                            'en-BD',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 4,
                                                            },
                                                        )}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        {denomination.currency}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {denomination.count_lines_count >
                                                    0 ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-xs font-medium tabular-nums">
                                                            <FileClock className="size-3.5 text-muted-foreground" />
                                                            {
                                                                denomination.count_lines_count
                                                            }{' '}
                                                            <span className="text-muted-foreground">
                                                                records
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            No history
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge
                                                        active={
                                                            denomination.is_active
                                                        }
                                                    />
                                                </td>
                                                {canUpdate && (
                                                    <td className="px-5 py-3.5">
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

                    <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
