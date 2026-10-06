import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate, formatDateTime } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
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
                denomination?: { value: string | number };
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
    const { data, setData, post, processing } = useForm({
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
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Cash Counts', href: route('cash-counts.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Counts" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Cash Counts"
                    description="Count vault or teller cash by denomination and review count history."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="grid gap-3 sm:grid-cols-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('cash-counts.store'));
                        }}
                    >
                        <div>
                            <Label>Branch day</Label>
                            <Select
                                className="h-9"
                                value={data.branch_day_id}
                                onChange={(value) =>
                                    setData('branch_day_id', value)
                                }
                                placeholder="Select branch day"
                                options={branchDays.map((day) => ({
                                    value: String(day.id),
                                    label: formatDate(day.business_date),
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Cash location</Label>
                            <Select
                                className="h-9"
                                value={data.cash_location_id}
                                onChange={(value) =>
                                    setData('cash_location_id', value)
                                }
                                placeholder="Select location"
                                options={[
                                    { value: '', label: 'Select location' },
                                    ...locations.map((location) => ({
                                        value: String(location.id),
                                        label: `${location.name} · ${location.type}`,
                                    })),
                                ]}
                            />
                        </div>
                        <div>
                            <Label>Count type</Label>
                            <Select
                                className="h-9"
                                value={data.type}
                                onChange={(value) => setData('type', value)}
                                options={[
                                    'OPENING',
                                    'CLOSING',
                                    'VERIFICATION',
                                    'ADJUSTMENT',
                                ].map((value) => ({ value, label: value }))}
                            />
                        </div>
                        <div className="grid gap-2 sm:col-span-3 sm:grid-cols-2">
                            {denominations.map((denomination, index) => (
                                <div
                                    key={denomination.id}
                                    className="flex items-end gap-2"
                                >
                                    <div className="flex-1">
                                        <Label>
                                            {denomination.name ??
                                                denomination.value}{' '}
                                            {denomination.currency}
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={
                                                data.denominations[index]
                                                    ?.quantity ?? 0
                                            }
                                            onChange={(event) => {
                                                const next = [
                                                    ...data.denominations,
                                                ];
                                                next[index] = {
                                                    ...next[index],
                                                    quantity: Number(
                                                        event.target.value,
                                                    ),
                                                };
                                                setData('denominations', next);
                                            }}
                                        />
                                    </div>
                                    <span className="pb-2 text-xs text-muted-foreground">
                                        × {denomination.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="sm:col-span-3">
                            <Label>Note</Label>
                            <Input
                                value={data.note}
                                onChange={(event) =>
                                    setData('note', event.target.value)
                                }
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.cash_location_id ||
                                !data.branch_day_id
                            }
                        >
                            Record cash count
                        </Button>
                    </form>
                </section>
                <section className="rounded-lg border bg-card p-4">
                    <h2 className="text-sm font-semibold">Add denomination</h2>
                    <form
                        className="mt-3 flex flex-wrap items-end gap-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            denominationForm.post(
                                route('cash-denominations.store'),
                            );
                        }}
                    >
                        <div>
                            <Label>Preset</Label>
                            <Select
                                className="h-9"
                                value={denominationForm.data.preset}
                                onChange={(value) =>
                                    denominationForm.setData('preset', value)
                                }
                                options={[
                                    { value: 'CUSTOM', label: 'Custom' },
                                    {
                                        value: 'BANGLADESH',
                                        label: 'Bangladesh (BDT)',
                                    },
                                ]}
                            />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select
                                className="h-9"
                                value={denominationForm.data.type}
                                onChange={(value) =>
                                    denominationForm.setData('type', value)
                                }
                                disabled={
                                    denominationForm.data.preset ===
                                    'BANGLADESH'
                                }
                                options={[
                                    { value: 'NOTE', label: 'NOTE' },
                                    { value: 'COIN', label: 'COIN' },
                                ]}
                            />
                        </div>
                        <div>
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
                            />
                        </div>
                        <div>
                            <Label>Name</Label>
                            <Input
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
                            />
                        </div>
                        <Button type="submit">
                            {denominationForm.data.preset === 'BANGLADESH'
                                ? 'Load Bangladesh denominations'
                                : 'Add denomination'}
                        </Button>
                    </form>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {counts.data.map((count) => (
                            <div
                                key={count.id}
                                className="flex flex-wrap justify-between gap-2 p-4 text-sm"
                            >
                                <span>
                                    {count.type} ·{' '}
                                    {count.cash_location?.name ?? '-'} ·{' '}
                                    {formatDateTime(count.counted_at)}
                                </span>
                                <strong>{count.total_amount}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
