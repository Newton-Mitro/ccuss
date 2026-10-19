import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    Check,
    CheckCircle2,
    Coins,
    FileClock,
    Layers3,
    Pencil,
    Plus,
    RefreshCw,
    Settings2,
    ShieldCheck,
    Wallet,
    X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
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

    const form = useForm({
        preset: 'CUSTOM',
        currency: 'BDT',
        type: 'NOTE',
        value: '',
        name: '',
        is_active: true,
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const isPreset = form.data.preset === 'BANGLADESH';

    const editingDenomination = denominations.find(
        (denomination) => denomination.id === editingId,
    );

    const hasCountHistory = Boolean(editingDenomination?.count_lines_count);

    const resetForm = () => {
        form.setData({
            preset: 'CUSTOM',
            currency: 'BDT',
            type: 'NOTE',
            value: '',
            name: '',
            is_active: true,
        });

        form.clearErrors();
        setEditingId(null);
    };

    const openCreate = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEdit = (denomination: Denomination) => {
        form.setData({
            preset: 'CUSTOM',
            currency: denomination.currency,
            type: denomination.type,
            value: String(denomination.value),
            name: denomination.name ?? '',
            is_active: denomination.is_active,
        });

        form.clearErrors();
        setEditingId(denomination.id);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (form.processing) return;

        setDialogOpen(false);
        resetForm();
    };

    const submitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                resetForm();
            },
        };

        if (editingId) {
            form.put(route('cash-denominations.update', editingId), options);
        } else {
            form.post(route('cash-denominations.store'), options);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Treasury & Cash',
            href: route('treasury-cash.dashboard'),
        },
        {
            title: 'Cash Counts',
            href: route('cash-counts.index'),
        },
        {
            title: 'Cash Denominations',
            href: route('cash-denominations.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Denominations" />

            <div className="w-full max-w-7xl space-y-5 pb-8 text-foreground">
                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <ResourcePageHeader
                        title="Cash Denominations"
                        description="Configure banknotes and coins used in branch cash counting and reconciliation."
                    />

                    {canCreate && (
                        <Button
                            onClick={openCreate}
                            className="h-10 w-full shrink-0 gap-2 shadow-sm sm:w-auto"
                        >
                            <Plus className="size-4" />
                            Add denomination
                        </Button>
                    )}
                </div>

                {/* Denominations table */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                                <Wallet className="size-5 text-muted-foreground" />
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

                        <span className="inline-flex w-fit items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
                            <Layers3 className="size-3.5" />
                            {denominations.length} entries
                        </span>
                    </div>

                    {denominations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead className="bg-muted/40 text-xs text-muted-foreground">
                                    <tr className="border-b">
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
                                    {denominations.map((denomination) => (
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
                                                                ? 'bg-muted/40'
                                                                : 'bg-background'
                                                        }`}
                                                    >
                                                        {denomination.type ===
                                                        'NOTE' ? (
                                                            <Banknote className="size-[18px] text-muted-foreground" />
                                                        ) : (
                                                            <Coins className="size-[18px] text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="leading-5 font-medium">
                                                            {denomination.name ||
                                                                `${denomination.value} ${denomination.currency}`}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                denomination.currency
                                                            }
                                                            {' · '}
                                                            {denomination.type ===
                                                            'NOTE'
                                                                ? 'Banknote'
                                                                : 'Coin'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium">
                                                    {denomination.type ===
                                                    'NOTE' ? (
                                                        <Banknote className="size-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <Coins className="size-3.5 text-muted-foreground" />
                                                    )}

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
                                                    ).toLocaleString('en-BD', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 4,
                                                    })}
                                                </div>

                                                <div className="mt-0.5 text-xs text-muted-foreground">
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
                                                        }
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
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5"
                                                            title="Edit denomination"
                                                            aria-label={`Edit ${denomination.name ?? denomination.value}`}
                                                            onClick={() =>
                                                                openEdit(
                                                                    denomination,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="size-3.5" />
                                                            <span className="hidden lg:inline">
                                                                Edit
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
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
                                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        onClick={openCreate}
                                        className="gap-2"
                                    >
                                        <Plus className="size-4" />
                                        Add denomination
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            resetForm();
                                            form.setData(
                                                'preset',
                                                'BANGLADESH',
                                            );
                                            setDialogOpen(true);
                                        }}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="size-4" />
                                        Load Bangladesh preset
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table footer */}
                    <div className="flex flex-col gap-2 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
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

                {/* Create / edit dialog */}
                <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            closeDialog();
                        } else {
                            setDialogOpen(true);
                        }
                    }}
                >
                    <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-lg">
                        <div className="border-b px-5 py-5 sm:px-6">
                            <DialogHeader>
                                <div className="mb-2 flex size-11 items-center justify-center rounded-xl border bg-muted/40">
                                    {editingId ? (
                                        <Settings2 className="size-5 text-muted-foreground" />
                                    ) : (
                                        <Banknote className="size-5 text-muted-foreground" />
                                    )}
                                </div>

                                <DialogTitle className="text-lg font-semibold tracking-tight">
                                    {editingId
                                        ? 'Edit denomination'
                                        : 'Add denomination'}
                                </DialogTitle>

                                <DialogDescription className="leading-5">
                                    {editingId
                                        ? 'Update denomination settings while preserving historical cash counts.'
                                        : 'Configure a custom denomination or load the Bangladesh currency preset.'}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <form
                            className="space-y-5 px-5 py-5 sm:px-6"
                            onSubmit={submitForm}
                        >
                            {/* Configuration preset */}
                            {!editingId && (
                                <div className="space-y-2">
                                    <Label htmlFor="preset">
                                        Configuration preset
                                    </Label>

                                    <Select
                                        id="preset"
                                        className="h-10 w-full"
                                        value={form.data.preset}
                                        onChange={(value) => {
                                            form.setData((current) => ({
                                                ...current,
                                                preset: value,
                                                ...(value === 'BANGLADESH'
                                                    ? { currency: 'BDT' }
                                                    : {}),
                                            }));
                                        }}
                                        options={[
                                            {
                                                value: 'CUSTOM',
                                                label: 'Custom denomination',
                                            },
                                            {
                                                value: 'BANGLADESH',
                                                label: 'Bangladesh currency (BDT)',
                                            },
                                        ]}
                                    />

                                    {isPreset && (
                                        <div className="flex gap-2.5 rounded-lg border bg-muted/30 p-3">
                                            <RefreshCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                            <p className="text-xs leading-5 text-muted-foreground">
                                                The Bangladesh preset will be
                                                submitted to the server to load
                                                the configured denominations.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Denomination details */}
                            <section className="space-y-4 rounded-xl border p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                                        <Settings2 className="size-4 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Denomination details
                                        </h3>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Currency, type and face value
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
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
                                        disabled={isPreset || hasCountHistory}
                                        maxLength={10}
                                        placeholder="BDT"
                                        className="h-10"
                                    />

                                    {form.errors.currency && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.currency}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="type">
                                            Denomination type
                                        </Label>

                                        <Select
                                            id="type"
                                            className="h-10 w-full"
                                            value={form.data.type}
                                            onChange={(value) =>
                                                form.setData('type', value)
                                            }
                                            disabled={
                                                isPreset || hasCountHistory
                                            }
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

                                    <div className="space-y-1.5">
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
                                            disabled={
                                                isPreset || hasCountHistory
                                            }
                                            placeholder="100"
                                            className="h-10 tabular-nums"
                                        />

                                        {form.errors.value && (
                                            <p className="text-xs text-destructive">
                                                {form.errors.value}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="denomination-name">
                                        Display name
                                        <span className="ml-1 font-normal text-muted-foreground">
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
                                        disabled={isPreset || hasCountHistory}
                                        placeholder="e.g. One hundred taka note"
                                        maxLength={255}
                                        className="h-10"
                                    />

                                    {form.errors.name && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* Historical record protection */}
                            {hasCountHistory && (
                                <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />

                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">
                                            Historical record protection
                                        </p>

                                        <p className="text-xs leading-5 text-muted-foreground">
                                            This denomination has been used in{' '}
                                            {
                                                editingDenomination?.count_lines_count
                                            }{' '}
                                            cash count line(s). Currency, type,
                                            value, and display name are locked.
                                            You can still change its active
                                            status.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Active status */}
                            {editingId && (
                                <section className="flex items-center justify-between gap-4 rounded-xl border p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                                            <CheckCircle2 className="size-5 text-muted-foreground" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">
                                                Active status
                                            </p>

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Available for cash counts
                                            </p>
                                        </div>
                                    </div>

                                    <label className="flex shrink-0 cursor-pointer items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={(event) =>
                                                form.setData(
                                                    'is_active',
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 rounded border-input accent-primary"
                                        />

                                        <span className="text-sm font-medium">
                                            {form.data.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </label>

                                    {form.errors.is_active && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.is_active}
                                        </p>
                                    )}
                                </section>
                            )}

                            {/* Form actions */}
                            <DialogFooter className="gap-2 border-t pt-4 sm:gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeDialog}
                                    disabled={form.processing}
                                >
                                    <X className="mr-1.5 size-4" />
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="gap-2"
                                >
                                    {form.processing ? (
                                        <RefreshCw className="size-4 animate-spin" />
                                    ) : isPreset && !editingId ? (
                                        <Layers3 className="size-4" />
                                    ) : editingId ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Plus className="size-4" />
                                    )}

                                    {form.processing
                                        ? 'Saving...'
                                        : isPreset && !editingId
                                          ? 'Load Bangladesh preset'
                                          : editingId
                                            ? 'Save changes'
                                            : 'Add denomination'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </CustomAuthLayout>
    );
}

/* Denomination status badge */
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
