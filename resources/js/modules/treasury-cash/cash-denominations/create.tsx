import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/treasury-cash/types/cash-denominations/create.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Check,
    CheckCircle2,
    Coins,
    Eye,
    Layers3,
    Plus,
    RefreshCw,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CashDenominationForm({ denomination }: Props) {
    const editing = Boolean(denomination);
    const hasCountHistory = Boolean(denomination?.count_lines_count);
    const form = useForm({
        preset: 'CUSTOM',
        currency: denomination?.currency ?? 'BDT',
        type: denomination?.type ?? 'NOTE',
        value: denomination ? String(denomination.value) : '',
        name: denomination?.name ?? '',
        is_active: denomination?.is_active ?? true,
    });
    const isPreset = !editing && form.data.preset === 'BANGLADESH';

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Cash Counts', href: route('cash-counts.index') },
        {
            title: 'Cash Denominations',
            href: route('cash-denominations.index'),
        },
        { title: editing ? 'Edit Denomination' : 'Add Denomination', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (denomination) {
            form.put(route('cash-denominations.update', denomination.id));
        } else {
            form.post(route('cash-denominations.store'));
        }
    };

    const title = editing ? 'Edit denomination' : 'Add denomination';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing ? 'Edit Cash Denomination' : 'Add Cash Denomination'
                }
            />
            <div className="w-full max-w-6xl space-y-4 pb-6 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary">
                            {form.data.type === 'NOTE' ? (
                                <Banknote className="size-5" />
                            ) : (
                                <Coins className="size-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <HeadingSmall
                                title={title}
                                description={
                                    editing
                                        ? 'Update denomination settings while preserving historical cash counts.'
                                        : 'Add a custom denomination or load the Bangladesh currency preset.'
                                }
                            />
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="h-9 shrink-0 gap-2"
                    >
                        <Link href={route('cash-denominations.index')}>
                            <ArrowLeft className="size-4" />
                            Back to denominations
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="min-w-0 space-y-3">
                        <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                            <div className="flex items-center gap-2.5 border-b border-border/80 bg-gradient-to-r from-muted/40 to-transparent px-3.5 py-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {form.data.type === 'NOTE' ? (
                                        <Banknote className="size-4" />
                                    ) : (
                                        <Coins className="size-4" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Denomination details
                                    </h2>
                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Define the currency, physical form, and
                                        face value used for cash counts.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-3 gap-y-3 p-3.5 sm:grid-cols-2">
                                {!editing && (
                                    <div
                                        className={`space-y-1 ${isPreset ? 'sm:col-span-2' : ''}`}
                                    >
                                        <Label htmlFor="preset">
                                            Configuration
                                        </Label>
                                        <Select
                                            id="preset"
                                            className="h-9"
                                            value={form.data.preset}
                                            onChange={(value) =>
                                                form.setData('preset', value)
                                            }
                                            options={[
                                                {
                                                    value: 'CUSTOM',
                                                    label: 'Custom denomination',
                                                },
                                                {
                                                    value: 'BANGLADESH',
                                                    label: 'Bangladesh currency preset (BDT)',
                                                },
                                            ]}
                                        />
                                        {form.errors.preset && (
                                            <p className="text-xs text-destructive">
                                                {form.errors.preset}
                                            </p>
                                        )}
                                        {isPreset && (
                                            <p className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs leading-5 text-muted-foreground">
                                                This loads the configured active
                                                Bangladesh banknotes and coins.
                                                Unsupported historical note
                                                values are retained but
                                                deactivated.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!isPreset && (
                                    <>
                                        <div
                                            className={`space-y-1 ${editing ? 'sm:col-span-2' : ''}`}
                                        >
                                            <Label htmlFor="currency">
                                                Currency code
                                            </Label>
                                            <Input
                                                id="currency"
                                                className="h-9"
                                                value={form.data.currency}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'currency',
                                                        event.target.value.toUpperCase(),
                                                    )
                                                }
                                                disabled={hasCountHistory}
                                                maxLength={10}
                                                placeholder="BDT"
                                            />
                                            {form.errors.currency && (
                                                <p className="text-xs text-destructive">
                                                    {form.errors.currency}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="type">
                                                    Denomination type
                                                </Label>
                                                <Select
                                                    id="type"
                                                    className="h-9"
                                                    value={form.data.type}
                                                    onChange={(value) =>
                                                        form.setData(
                                                            'type',
                                                            value,
                                                        )
                                                    }
                                                    disabled={hasCountHistory}
                                                    options={[
                                                        {
                                                            value: 'NOTE',
                                                            label: 'Banknote',
                                                        },
                                                        {
                                                            value: 'COIN',
                                                            label: 'Coin',
                                                        },
                                                    ]}
                                                />
                                                {form.errors.type && (
                                                    <p className="text-xs text-destructive">
                                                        {form.errors.type}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="value">
                                                    Face value
                                                </Label>
                                                <Input
                                                    id="value"
                                                    className="h-9"
                                                    type="number"
                                                    min="0.0001"
                                                    step="0.0001"
                                                    value={form.data.value}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'value',
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={hasCountHistory}
                                                    placeholder="100"
                                                />
                                                {form.errors.value && (
                                                    <p className="text-xs text-destructive">
                                                        {form.errors.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1 sm:col-span-2">
                                            <Label htmlFor="denomination-name">
                                                Display name{' '}
                                                <span className="font-normal text-muted-foreground">
                                                    (Optional)
                                                </span>
                                            </Label>
                                            <Input
                                                id="denomination-name"
                                                className="h-9"
                                                value={form.data.name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={hasCountHistory}
                                                maxLength={50}
                                                placeholder="e.g. One hundred taka note"
                                            />
                                            {form.errors.name && (
                                                <p className="text-xs text-destructive">
                                                    {form.errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {editing && (
                                            <label className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-2.5 sm:col-span-2">
                                                <span>
                                                    <span className="block text-xs font-medium">
                                                        Active denomination
                                                    </span>
                                                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                                        Active denominations are
                                                        available when recording
                                                        cash counts.
                                                    </span>
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        form.data.is_active
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'is_active',
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                    className="size-4 shrink-0 accent-primary"
                                                />
                                            </label>
                                        )}

                                        {hasCountHistory && (
                                            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs leading-4 text-muted-foreground sm:col-span-2">
                                                This denomination has count
                                                history. Its currency, type,
                                                face value, and display name
                                                cannot be changed.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                asChild
                                variant="outline"
                                className="h-9"
                                disabled={form.processing}
                            >
                                <Link href={route('cash-denominations.index')}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-9 gap-2"
                            >
                                {form.processing ? (
                                    <RefreshCw className="size-4 animate-spin" />
                                ) : isPreset && !editing ? (
                                    <Layers3 className="size-4" />
                                ) : editing ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                                {form.processing
                                    ? 'Saving...'
                                    : isPreset && !editing
                                      ? 'Load Bangladesh preset'
                                      : editing
                                        ? 'Save changes'
                                        : 'Add denomination'}
                            </Button>
                        </div>
                    </div>

                    <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                        <section className="overflow-hidden rounded-xl border border-primary/20 bg-card shadow-md shadow-primary/[0.04]">
                            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-3">
                                <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm font-semibold">
                                            Denomination preview
                                        </h2>
                                        <p className="text-[10px] text-muted-foreground">
                                            Live configuration summary
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[9px] font-semibold tracking-wide text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2.5 p-3">
                                <div className="rounded-lg bg-gradient-to-br from-primary/[0.09] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                                {isPreset
                                                    ? 'Preset'
                                                    : form.data.type === 'NOTE'
                                                      ? 'Banknote'
                                                      : 'Coin'}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold break-words">
                                                {isPreset
                                                    ? 'Bangladesh currency'
                                                    : form.data.name.trim() ||
                                                      (form.data.value
                                                          ? `${form.data.value} ${form.data.currency || 'currency'} ${form.data.type === 'NOTE' ? 'note' : 'coin'}`
                                                          : 'New denomination')}
                                            </p>
                                        </div>
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {form.data.type === 'NOTE' ? (
                                                <Banknote className="size-4.5" />
                                            ) : (
                                                <Coins className="size-4.5" />
                                            )}
                                        </span>
                                    </div>
                                    {!isPreset && (
                                        <div className="mt-3 border-t border-border/60 pt-2.5">
                                            <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                Face value
                                            </p>
                                            <p className="mt-0.5 text-xl font-bold tracking-tight text-primary tabular-nums">
                                                {form.data.currency || '—'}{' '}
                                                {form.data.value
                                                    ? Number(
                                                          form.data.value,
                                                      ).toLocaleString(
                                                          'en-BD',
                                                          {
                                                              minimumFractionDigits: 2,
                                                              maximumFractionDigits: 4,
                                                          },
                                                      )
                                                    : '0.00'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {isPreset ? (
                                    <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
                                        <Layers3 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            Loads the configured Bangladesh
                                            banknotes and coins as a preset.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {[
                                            {
                                                label: 'Currency',
                                                value:
                                                    form.data.currency ||
                                                    'Not set',
                                            },
                                            {
                                                label: 'Type',
                                                value:
                                                    form.data.type === 'NOTE'
                                                        ? 'Banknote'
                                                        : 'Coin',
                                            },
                                            {
                                                label: 'Status',
                                                value: form.data.is_active
                                                    ? 'Active'
                                                    : 'Inactive',
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-2"
                                            >
                                                <span className="text-[11px] text-muted-foreground">
                                                    {item.label}
                                                </span>
                                                <span className="text-[11px] font-medium">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {hasCountHistory && (
                                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] px-2.5 py-2 text-[10px] leading-4 text-muted-foreground">
                                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                                        Existing count history is preserved.
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
