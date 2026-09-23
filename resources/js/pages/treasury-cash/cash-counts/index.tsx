import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
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
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.branch_day_id}
                                onChange={(event) =>
                                    setData('branch_day_id', event.target.value)
                                }
                            >
                                {branchDays.map((day) => (
                                    <option key={day.id} value={day.id}>
                                        {day.business_date}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Cash location</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.cash_location_id}
                                onChange={(event) =>
                                    setData(
                                        'cash_location_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Select location</option>
                                {locations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name} · {location.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Count type</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.type}
                                onChange={(event) =>
                                    setData('type', event.target.value)
                                }
                            >
                                {[
                                    'OPENING',
                                    'CLOSING',
                                    'VERIFICATION',
                                    'ADJUSTMENT',
                                ].map((value) => (
                                    <option key={value}>{value}</option>
                                ))}
                            </select>
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
                            <Label>Type</Label>
                            <select
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={denominationForm.data.type}
                                onChange={(event) =>
                                    denominationForm.setData(
                                        'type',
                                        event.target.value,
                                    )
                                }
                            >
                                <option>NOTE</option>
                                <option>COIN</option>
                            </select>
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
                            />
                        </div>
                        <Button type="submit">Add denomination</Button>
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
                                    {count.counted_at}
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
