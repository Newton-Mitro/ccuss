import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
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
    useFlashToastHandler();

    const { clearings, cheques } = usePage<Props>().props;
    const { data, setData, post, processing } = useForm({
        cheque_id: '',
        branch_id: '',
        clearing_no: '',
        drawer_bank_name: '',
        drawer_bank_branch: '',
        drawer_account_no: '',
    });

    const confirmAction = (
        title: string,
        text: string,
        action: 'send' | 'present' | 'settle' | 'bounce' | 'cancel',
        clearingId: number,
        requireReason = false,
    ) => {
        appSwal
            .fire({
                title,
                text,
                icon: 'warning',
                input: requireReason ? 'textarea' : undefined,
                inputPlaceholder: requireReason
                    ? 'Reason for this action'
                    : undefined,
                inputValidator: requireReason
                    ? (value) =>
                          value?.trim()
                              ? undefined
                              : 'A reason is required before continuing.'
                    : undefined,
                showCancelButton: true,
                confirmButtonText:
                    action === 'bounce' ? 'Reject clearing' : 'Confirm',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) {
                    return;
                }

                const payload = requireReason
                    ? { reason: result.value ?? '' }
                    : {};

                router.post(
                    route('cheque-clearings.transition', [clearingId, action]),
                    payload,
                );
            });
    };

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
                                {cheques.length > 0 ? (
                                    cheques.map((cheque) => (
                                        <option
                                            key={cheque.id}
                                            value={cheque.id}
                                        >
                                            {cheque.cheque_no} · {cheque.amount}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        No presented cheques available
                                    </option>
                                )}
                            </select>
                            {cheques.length === 0 && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    No presented cheques are currently available
                                    for clearing.
                                </p>
                            )}
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
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    confirmAction(
                                                        'Send this clearing?',
                                                        `Send clearing ${clearing.clearing_no}?`,
                                                        'send',
                                                        clearing.id,
                                                    )
                                                }
                                            >
                                                Send
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    confirmAction(
                                                        'Cancel this clearing?',
                                                        `Cancel clearing ${clearing.clearing_no}?`,
                                                        'cancel',
                                                        clearing.id,
                                                        true,
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                    {clearing.status === 'SENT' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    confirmAction(
                                                        'Present this clearing?',
                                                        `Present clearing ${clearing.clearing_no}?`,
                                                        'present',
                                                        clearing.id,
                                                    )
                                                }
                                            >
                                                Present
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    confirmAction(
                                                        'Cancel this clearing?',
                                                        `Cancel clearing ${clearing.clearing_no}?`,
                                                        'cancel',
                                                        clearing.id,
                                                        true,
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                    {clearing.status === 'PRESENTED' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    confirmAction(
                                                        'Settle this clearing?',
                                                        `Settle clearing ${clearing.clearing_no}?`,
                                                        'settle',
                                                        clearing.id,
                                                    )
                                                }
                                            >
                                                Settle
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    confirmAction(
                                                        'Return this clearing?',
                                                        `Return clearing ${clearing.clearing_no}?`,
                                                        'bounce',
                                                        clearing.id,
                                                        true,
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
