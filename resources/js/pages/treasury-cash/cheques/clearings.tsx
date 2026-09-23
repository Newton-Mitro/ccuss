import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Clearing = {
    id: number;
    clearing_no: string;
    amount: string | number;
    clearing_date: string;
    status: string;
    cheque?: { cheque_no?: string; payee?: string | null };
};
type Props = {
    clearings: { data: Clearing[] };
    cheques: { id: number; cheque_no: string; amount: string | number }[];
};

export default function ChequeClearings() {
    const { clearings, cheques } = usePage<Props>().props;
    const { data, setData, post, processing } = useForm({
        cheque_id: '',
        branch_id: '',
        clearing_no: '',
        drawer_bank_name: '',
        drawer_bank_branch: '',
        drawer_account_no: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Cheque Clearings', href: route('cheque-clearings.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Clearings" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Cheque Clearings"
                    description="Present, settle, return, and review cheque clearing records."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="grid gap-3 sm:grid-cols-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('cheque-clearings.store'));
                        }}
                    >
                        <div>
                            <Label>Presented cheque</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.cheque_id}
                                onChange={(event) =>
                                    setData('cheque_id', event.target.value)
                                }
                            >
                                <option value="">Select cheque</option>
                                {cheques.map((cheque) => (
                                    <option key={cheque.id} value={cheque.id}>
                                        {cheque.cheque_no} · {cheque.amount}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Branch ID</Label>
                            <Input
                                value={data.branch_id}
                                onChange={(event) =>
                                    setData('branch_id', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Clearing number</Label>
                            <Input
                                value={data.clearing_no}
                                onChange={(event) =>
                                    setData('clearing_no', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Drawer bank</Label>
                            <Input
                                value={data.drawer_bank_name}
                                onChange={(event) =>
                                    setData(
                                        'drawer_bank_name',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Drawer account</Label>
                            <Input
                                value={data.drawer_account_no}
                                onChange={(event) =>
                                    setData(
                                        'drawer_account_no',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            Create clearing
                        </Button>
                    </form>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {clearings.data.map((clearing) => (
                            <div
                                key={clearing.id}
                                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {clearing.clearing_no} · Cheque{' '}
                                        {clearing.cheque?.cheque_no ?? '-'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {clearing.clearing_date} · Amount{' '}
                                        {clearing.amount}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge
                                        tone={
                                            clearing.status === 'CLEARED'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {clearing.status}
                                    </StatusBadge>
                                    {clearing.status === 'RECEIVED' && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'cheque-clearings.transition',
                                                        [clearing.id, 'send'],
                                                    ),
                                                )
                                            }
                                        >
                                            Send
                                        </Button>
                                    )}
                                    {clearing.status === 'SENT' && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'cheque-clearings.transition',
                                                        [
                                                            clearing.id,
                                                            'present',
                                                        ],
                                                    ),
                                                )
                                            }
                                        >
                                            Present
                                        </Button>
                                    )}
                                    {clearing.status === 'PRESENTED' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            'cheque-clearings.transition',
                                                            [
                                                                clearing.id,
                                                                'settle',
                                                            ],
                                                        ),
                                                    )
                                                }
                                            >
                                                Settle
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            'cheque-clearings.transition',
                                                            [
                                                                clearing.id,
                                                                'bounce',
                                                            ],
                                                        ),
                                                        {
                                                            reason: 'Returned by bank',
                                                        },
                                                    )
                                                }
                                            >
                                                Return
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
