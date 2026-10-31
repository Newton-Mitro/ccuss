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
    Coins,
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
            <div className="w-full max-w-3xl space-y-5 pb-24 text-foreground">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <HeadingSmall
                            title={title}
                            description={
                                editing
                                    ? 'Update denomination settings while preserving historical cash counts.'
                                    : 'Add a custom denomination or load the Bangladesh currency preset.'
                            }
                        />
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={route('cash-denominations.index')}>
                            <ArrowLeft className="size-4" />
                            Back to denominations
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                {form.data.type === 'NOTE' ? (
                                    <Banknote className="size-5" />
                                ) : (
                                    <Coins className="size-5" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Denomination details
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Define the currency, physical form, and face
                                    value used for cash counts.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5 p-4 sm:p-5">
                            {!editing && (
                                <div className="space-y-2">
                                    <Label htmlFor="preset">
                                        Configuration
                                    </Label>
                                    <Select
                                        id="preset"
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
                                        <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-5 text-muted-foreground">
                                            This loads the configured active
                                            Bangladesh banknotes and coins.
                                            Unsupported historical note values
                                            are retained but deactivated.
                                        </p>
                                    )}
                                </div>
                            )}

                            {!isPreset && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">
                                            Currency code
                                        </Label>
                                        <Input
                                            id="currency"
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

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">
                                                Denomination type
                                            </Label>
                                            <Select
                                                id="type"
                                                value={form.data.type}
                                                onChange={(value) =>
                                                    form.setData('type', value)
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
                                        <div className="space-y-2">
                                            <Label htmlFor="value">
                                                Face value
                                            </Label>
                                            <Input
                                                id="value"
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

                                    <div className="space-y-2">
                                        <Label htmlFor="denomination-name">
                                            Display name{' '}
                                            <span className="font-normal text-muted-foreground">
                                                (Optional)
                                            </span>
                                        </Label>
                                        <Input
                                            id="denomination-name"
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
                                        <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
                                            <span>
                                                <span className="block text-sm font-medium">
                                                    Active denomination
                                                </span>
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Active denominations are
                                                    available when recording
                                                    cash counts.
                                                </span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={form.data.is_active}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'is_active',
                                                        event.target.checked,
                                                    )
                                                }
                                                className="size-4 shrink-0 accent-primary"
                                            />
                                        </label>
                                    )}

                                    {hasCountHistory && (
                                        <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-5 text-muted-foreground">
                                            This denomination has count history.
                                            Its currency, type, face value, and
                                            display name cannot be changed.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    <div
                        data-slot="page-sticky-action-bar"
                        className="sticky bottom-0 flex flex-col-reverse gap-2 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end"
                    >
                        <Button
                            asChild
                            variant="outline"
                            disabled={form.processing}
                        >
                            <Link href={route('cash-denominations.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="gap-2"
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
                </form>
            </div>
        </CustomAuthLayout>
    );
}
