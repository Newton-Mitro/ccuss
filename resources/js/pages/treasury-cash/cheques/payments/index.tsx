import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { route } from 'ziggy-js';

type PaymentRow = {
    id: number;
    status: string;
    amount: string | number;
    created_at: string;
    cheque: { cheque_no: string };
    financial_account: { account_no: string };
    received_by?: { name: string } | null;
};

type Props = SharedData & {
    payments: {
        data: PaymentRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    available_cheques: {
        id: number;
        cheque_no: string;
        amount: number;
        account_no: string | null;
    }[];
    teller_sessions: { id: number; label: string }[];
};

function statusTone(
    status: string,
): 'success' | 'neutral' | 'warning' | 'danger' {
    if (status === 'PAID') return 'success';
    if (status === 'RETURNED') return 'danger';
    if (status === 'APPROVED' || status === 'PENDING_APPROVAL')
        return 'warning';
    return 'neutral';
}

export default function ChequePaymentQueue() {
    useFlashToastHandler();
    const { payments, auth, available_cheques, teller_sessions } =
        usePage<Props>().props;
    const permissionSlugs = new Set(
        (auth.user.permissions ?? []).map((permission) => permission.slug),
    );
    const canReceive = permissionSlugs.has('cheque_payments.receive');
    const { data, setData, post, processing } = useForm({
        cheque_id: '',
        teller_session_id: '',
        note: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        {
            title: 'Cheque Payment Review',
            href: route('cheque-payments.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Payment Review" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Cheque Payment Review"
                    description="Review received cheques before approval and teller posting."
                />

                {canReceive && (
                    <form
                        className="grid gap-3 rounded-md border bg-card p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('cheque-payments.receive'), {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <div className="space-y-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="payment-cheque"
                            >
                                Issued cheque
                            </label>
                            <Select
                                id="payment-cheque"
                                value={data.cheque_id}
                                onChange={(value) =>
                                    setData('cheque_id', value)
                                }
                                placeholder="Select cheque"
                                disabled={available_cheques.length === 0}
                                options={[
                                    { value: '', label: 'Select cheque' },
                                    ...available_cheques.map((cheque) => ({
                                        value: String(cheque.id),
                                        label: `${cheque.cheque_no} · ${cheque.account_no ?? 'Unknown account'} · ${Number(cheque.amount).toLocaleString()}`,
                                    })),
                                ]}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="payment-teller-session"
                            >
                                Open teller session
                            </label>
                            <Select
                                id="payment-teller-session"
                                value={data.teller_session_id}
                                onChange={(value) =>
                                    setData('teller_session_id', value)
                                }
                                placeholder="Select teller session"
                                options={[
                                    {
                                        value: '',
                                        label: 'Select teller session',
                                    },
                                    ...teller_sessions.map((session) => ({
                                        value: String(session.id),
                                        label: session.label,
                                    })),
                                ]}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="payment-note"
                            >
                                Note{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </label>
                            <Input
                                id="payment-note"
                                value={data.note}
                                onChange={(event) =>
                                    setData('note', event.target.value)
                                }
                                placeholder="Receipt note"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.cheque_id ||
                                !data.teller_session_id ||
                                available_cheques.length === 0 ||
                                teller_sessions.length === 0
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Receive
                        </Button>
                    </form>
                )}

                {payments.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No cheque payments"
                        description="Received cheques will appear here for verification and approval."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-md border bg-card">
                            <table className="w-full min-w-190 border-collapse text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        {[
                                            'Cheque',
                                            'Account',
                                            'Amount',
                                            'Stage',
                                            'Received by',
                                            'Received',
                                            '',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className="border-b p-3 text-left font-medium"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-3 py-3 font-medium">
                                                {payment.cheque?.cheque_no ??
                                                    '-'}
                                            </td>
                                            <td className="px-3 py-3">
                                                {payment.financial_account
                                                    ?.account_no ?? '-'}
                                            </td>
                                            <td className="px-3 py-3 tabular-nums">
                                                {Number(
                                                    payment.amount,
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-3 py-3">
                                                <StatusBadge
                                                    tone={statusTone(
                                                        payment.status,
                                                    )}
                                                >
                                                    {payment.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-3 py-3">
                                                {payment.received_by?.name ??
                                                    '-'}
                                            </td>
                                            <td className="px-3 py-3">
                                                {new Date(
                                                    payment.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <Link
                                                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                                    href={route(
                                                        'cheque-payments.show',
                                                        payment.id,
                                                    )}
                                                >
                                                    Review
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <nav
                            className="flex justify-end gap-1"
                            aria-label="Pagination"
                        >
                            {payments.links.map((link, index) => (
                                <Link
                                    key={`${index}-${link.label}`}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    aria-current={
                                        link.active ? 'page' : undefined
                                    }
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </nav>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
