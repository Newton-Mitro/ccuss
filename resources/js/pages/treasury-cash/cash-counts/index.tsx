import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate, formatDateTime } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    Check,
    ClipboardList,
    Coins,
    Plus,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

type Denomination = {
    id: number;
    currency: string;
    type: string;
    value: string | number;
    name?: string | null;
};
type Props = {
    counts: {
        data: {
            id: number;
            type: string;
            total_amount: string | number;
            counted_at: string;
            cash_location?: { name?: string };
            denominations?: {
                quantity: number;
                amount: string | number;
                denomination?: {
                    value: string | number;
                    name?: string | null;
                };
            }[];
        }[];
    };
    branchDays: { id: number; business_date: string }[];
    locations: { id: number; name: string; type: string }[];
    denominations: Denomination[];
};

export default function CashCountsIndex() {
    const { counts, branchDays, locations, denominations } =
        usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        branch_day_id: branchDays[0]?.id ? String(branchDays[0].id) : '',
        cash_location_id: '',
        type: 'VERIFICATION',
        note: '',
        denominations: denominations.map((denomination) => ({
            cash_denomination_id: denomination.id,
            quantity: 0,
        })),
    });
    const denominationForm = useForm({
        preset: 'CUSTOM',
        currency: 'BDT',
        type: 'NOTE',
        value: '',
        name: '',
    });
    const countedUnits = data.denominations.reduce(
        (total, denomination) => total + Number(denomination.quantity || 0),
        0,
    );
    const countTotal = denominations.reduce(
        (total, denomination, index) =>
            total +
            Number(denomination.value) *
                Number(data.denominations[index]?.quantity || 0),
        0,
    );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Cash Counts', href: route('cash-counts.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Counts" />
            <div className="w-full max-w-7xl space-y-6 text-foreground">
                <ResourcePageHeader
                    title="Cash Counts"
                    description="Record physical cash by denomination, reconcile balances, and review previous counts."
                />
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        {
                            label: 'Open branch days',
                            value: branchDays.length,
                            icon: CalendarDays,
                            tone: 'bg-primary/10 text-primary',
                        },
                        {
                            label: 'Cash locations',
                            value: locations.length,
                            icon: Wallet,
                            tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                        },
                        {
                            label: 'Active denominations',
                            value: denominations.length,
                            icon: Coins,
                            tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        },
                    ].map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 rounded-xl border bg-card p-4"
                        >
                            <div
                                className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
                            >
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {label}
                                </p>
                                <p className="text-xl font-semibold tabular-nums">
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Banknote className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Record a cash count
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Choose the session and enter quantities
                                        for each denomination.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-background px-3 py-2 sm:min-w-36 sm:text-right">
                                <p className="text-[11px] text-muted-foreground">
                                    Calculated total
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatBDTCurrency(countTotal)}
                                </p>
                            </div>
                        </div>
                        <form
                            className="space-y-5 p-4 sm:p-5"
                            onSubmit={(event) => {
                                event.preventDefault();
                                post(route('cash-counts.store'));
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label>Branch day</Label>
                                    <Select
                                        className="h-10"
                                        value={data.branch_day_id}
                                        onChange={(value) =>
                                            setData('branch_day_id', value)
                                        }
                                        placeholder="Select branch day"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select branch day',
                                            },
                                            ...branchDays.map((day) => ({
                                                value: String(day.id),
                                                label: formatDate(
                                                    day.business_date,
                                                ),
                                            })),
                                        ]}
                                    />
                                    {errors.branch_day_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.branch_day_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Cash location</Label>
                                    <Select
                                        className="h-10"
                                        value={data.cash_location_id}
                                        onChange={(value) =>
                                            setData('cash_location_id', value)
                                        }
                                        placeholder="Select location"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select location',
                                            },
                                            ...locations.map((location) => ({
                                                value: String(location.id),
                                                label: `${location.name} · ${location.type}`,
                                            })),
                                        ]}
                                    />
                                    {errors.cash_location_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.cash_location_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Count type</Label>
                                    <Select
                                        className="h-10"
                                        value={data.type}
                                        onChange={(value) =>
                                            setData('type', value)
                                        }
                                        options={[
                                            'OPENING',
                                            'CLOSING',
                                            'VERIFICATION',
                                            'ADJUSTMENT',
                                        ].map((value) => ({
                                            value,
                                            label: value.replaceAll('_', ' '),
                                        }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-end justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Denomination breakdown
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Enter the number of notes or coins
                                            counted.
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                        {countedUnits} items
                                    </span>
                                </div>
                                {denominations.length > 0 ? (
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {denominations.map(
                                            (denomination, index) => (
                                                <div
                                                    key={denomination.id}
                                                    className="rounded-lg border bg-muted/20 p-3"
                                                >
                                                    <div className="mb-2 flex items-start justify-between gap-2">
                                                        <Label
                                                            htmlFor={`denomination-${denomination.id}`}
                                                            className="text-xs font-semibold"
                                                        >
                                                            {denomination.name ??
                                                                denomination.value}{' '}
                                                            {
                                                                denomination.currency
                                                            }
                                                        </Label>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {denomination.type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id={`denomination-${denomination.id}`}
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={
                                                                data
                                                                    .denominations[
                                                                    index
                                                                ]?.quantity ?? 0
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                const next = [
                                                                    ...data.denominations,
                                                                ];
                                                                next[index] = {
                                                                    ...next[
                                                                        index
                                                                    ],
                                                                    quantity:
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                };
                                                                setData(
                                                                    'denominations',
                                                                    next,
                                                                );
                                                            }}
                                                            className="h-9 bg-background tabular-nums"
                                                        />
                                                        <span className="min-w-20 text-right text-xs text-muted-foreground tabular-nums">
                                                            {formatBDTCurrency(
                                                                Number(
                                                                    denomination.value,
                                                                ) *
                                                                    Number(
                                                                        data
                                                                            .denominations[
                                                                            index
                                                                        ]
                                                                            ?.quantity ??
                                                                            0,
                                                                    ),
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed p-6 text-center">
                                        <Coins className="mx-auto size-6 text-muted-foreground" />
                                        <p className="mt-2 text-sm font-medium">
                                            No active denominations
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Load the BDT preset or add a custom
                                            denomination to start a count.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="count-note">Note</Label>
                                <Input
                                    id="count-note"
                                    value={data.note}
                                    onChange={(event) =>
                                        setData('note', event.target.value)
                                    }
                                    placeholder="Add an optional note about this count"
                                    className="h-10"
                                />
                                {errors.note && (
                                    <p className="text-xs text-destructive">
                                        {errors.note}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-4 shrink-0" />
                                    Count is calculated from denomination
                                    quantities.
                                </div>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.cash_location_id ||
                                        !data.branch_day_id ||
                                        denominations.length === 0
                                    }
                                    className="w-full gap-2 sm:w-auto"
                                >
                                    <Check className="size-4" />
                                    {processing
                                        ? 'Recording count...'
                                        : 'Record cash count'}
                                </Button>
                            </div>
                        </form>
                    </section>

                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-start gap-3 border-b p-4 sm:p-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Plus className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Denomination setup
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Load a standard preset or create a
                                        custom cash value.
                                    </p>
                                </div>
                            </div>
                            <form
                                className="space-y-4 p-4 sm:p-5"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    denominationForm.post(
                                        route('cash-denominations.store'),
                                    );
                                }}
                            >
                                <div className="space-y-1.5">
                                    <Label>Preset</Label>
                                    <Select
                                        className="h-10"
                                        value={denominationForm.data.preset}
                                        onChange={(value) =>
                                            denominationForm.setData(
                                                'preset',
                                                value,
                                            )
                                        }
                                        options={[
                                            {
                                                value: 'CUSTOM',
                                                label: 'Custom',
                                            },
                                            {
                                                value: 'BANGLADESH',
                                                label: 'Bangladesh (BDT)',
                                            },
                                        ]}
                                    />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label>Type</Label>
                                        <Select
                                            className="h-10"
                                            value={denominationForm.data.type}
                                            onChange={(value) =>
                                                denominationForm.setData(
                                                    'type',
                                                    value,
                                                )
                                            }
                                            disabled={
                                                denominationForm.data.preset ===
                                                'BANGLADESH'
                                            }
                                            options={[
                                                {
                                                    value: 'NOTE',
                                                    label: 'NOTE',
                                                },
                                                {
                                                    value: 'COIN',
                                                    label: 'COIN',
                                                },
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Value</Label>
                                        <Input
                                            type="number"
                                            min="0.0001"
                                            step="0.0001"
                                            value={denominationForm.data.value}
                                            onChange={(event) =>
                                                denominationForm.setData(
                                                    'value',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={
                                                denominationForm.data.preset ===
                                                'BANGLADESH'
                                            }
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="denomination-name">
                                        Display name
                                    </Label>
                                    <Input
                                        id="denomination-name"
                                        value={denominationForm.data.name}
                                        onChange={(event) =>
                                            denominationForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            denominationForm.data.preset ===
                                            'BANGLADESH'
                                        }
                                        placeholder="Optional denomination name"
                                        className="h-10"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={denominationForm.processing}
                                    className="w-full gap-2"
                                >
                                    {denominationForm.data.preset ===
                                    'BANGLADESH' ? (
                                        <ClipboardList className="size-4" />
                                    ) : (
                                        <Plus className="size-4" />
                                    )}
                                    {denominationForm.processing
                                        ? 'Saving...'
                                        : denominationForm.data.preset ===
                                            'BANGLADESH'
                                          ? 'Load Bangladesh denominations'
                                          : 'Add denomination'}
                                </Button>
                            </form>
                        </section>
                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-center justify-between gap-3 border-b p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <ClipboardList className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Recent cash counts
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Latest recorded counts
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
                                    {counts.data.length}
                                </span>
                            </div>
                            {counts.data.length > 0 ? (
                                <div className="divide-y">
                                    {counts.data.map((count) => (
                                        <div
                                            key={count.id}
                                            className="space-y-2 p-4 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {count.cash_location
                                                            ?.name ??
                                                            'Unknown location'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatDateTime(
                                                            count.counted_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-sm font-semibold tabular-nums">
                                                    {formatBDTCurrency(
                                                        count.total_amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge tone="neutral">
                                                    {count.type.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </StatusBadge>
                                                {count.denominations?.length ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {
                                                            count.denominations
                                                                .length
                                                        }{' '}
                                                        denominations
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-5 py-10 text-center">
                                    <ClipboardList className="mx-auto size-7 text-muted-foreground/70" />
                                    <p className="mt-3 text-sm font-medium">
                                        No cash counts yet
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Recorded counts will appear here.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
