import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    FileCheck2,
    Plus,
    RefreshCcw,
    RotateCcw,
    Send,
    X,
} from 'lucide-react';
import { route } from 'ziggy-js';

type Clearing = {
    id: number;
    clearing_no: string;
    amount: string | number;
    clearing_date: string;
    status: string;
    cheque?: {
        cheque_no?: string;
        payee?: string | null;
    };
};

type Props = {
    clearings: {
        data: Clearing[];
    };
    cheques: {
        id: number;
        cheque_no: string;
        amount: string | number;
    }[];
};

const statusConfig: Record<
    string,
    {
        label: string;
        tone: 'success' | 'neutral' | 'warning' | 'danger';
        className: string;
    }
> = {
    RECEIVED: {
        label: 'Received',
        tone: 'neutral',
        className:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
    },
    SENT: {
        label: 'Sent',
        tone: 'neutral',
        className:
            'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300',
    },
    PRESENTED: {
        label: 'Presented',
        tone: 'warning',
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    },
    CLEARED: {
        label: 'Cleared',
        tone: 'success',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
    },
    BOUNCED: {
        label: 'Returned',
        tone: 'danger',
        className:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300',
    },
    CANCELLED: {
        label: 'Cancelled',
        tone: 'neutral',
        className:
            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400',
    },
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
                    action === 'bounce' ? 'Return clearing' : 'Confirm',
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
        {
            title: 'Treasury & Cash',
            href: route('treasury-cash.dashboard'),
        },
        {
            title: 'Cheque Clearings',
            href: route('cheque-clearings.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Clearings" />

            <div className="w-full max-w-5xl space-y-5">
                <ResourcePageHeader
                    title="Cheque Clearings"
                    description="Manage cheque presentation, settlement, returns, and clearing status."
                />

                {/* Create Clearing */}
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Plus className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    New Clearing
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Create a clearing record for a presented
                                    cheque.
                                </p>
                            </div>
                        </div>

                        <span className="hidden rounded-full border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                            Treasury
                        </span>
                    </div>

                    <form
                        className="p-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('cheque-clearings.store'));
                        }}
                    >
                        <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
                            {/* Cheque */}
                            <div className="space-y-1.5 lg:col-span-2">
                                <Label htmlFor="cheque_id">
                                    Presented cheque
                                </Label>

                                <Select
                                    id="cheque_id"
                                    className="h-9"
                                    value={data.cheque_id}
                                    onChange={(value) =>
                                        setData('cheque_id', value)
                                    }
                                    placeholder={
                                        cheques.length > 0
                                            ? 'Select presented cheque'
                                            : 'No presented cheques available'
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label:
                                                cheques.length > 0
                                                    ? 'Select presented cheque'
                                                    : 'No presented cheques available',
                                            disabled: cheques.length === 0,
                                        },
                                        ...cheques.map((cheque) => ({
                                            value: String(cheque.id),
                                            label: `${cheque.cheque_no} · ${cheque.amount}`,
                                        })),
                                    ]}
                                />

                                {cheques.length === 0 && (
                                    <p className="text-[11px] text-muted-foreground">
                                        No presented cheques are currently
                                        available for clearing.
                                    </p>
                                )}
                            </div>

                            {/* Branch */}
                            <div className="space-y-1.5">
                                <Label htmlFor="branch_id">Branch ID</Label>

                                <Input
                                    id="branch_id"
                                    value={data.branch_id}
                                    onChange={(event) =>
                                        setData('branch_id', event.target.value)
                                    }
                                    placeholder="Branch"
                                />
                            </div>

                            {/* Clearing number */}
                            <div className="space-y-1.5">
                                <Label htmlFor="clearing_no">
                                    Clearing number
                                </Label>

                                <Input
                                    id="clearing_no"
                                    value={data.clearing_no}
                                    onChange={(event) =>
                                        setData(
                                            'clearing_no',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="e.g. CLR-00001"
                                />
                            </div>

                            {/* Bank */}
                            <div className="space-y-1.5">
                                <Label htmlFor="drawer_bank_name">
                                    Drawer bank
                                </Label>

                                <Input
                                    id="drawer_bank_name"
                                    value={data.drawer_bank_name}
                                    onChange={(event) =>
                                        setData(
                                            'drawer_bank_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Bank name"
                                />
                            </div>

                            {/* Bank branch */}
                            <div className="space-y-1.5">
                                <Label htmlFor="drawer_bank_branch">
                                    Bank branch
                                </Label>

                                <Input
                                    id="drawer_bank_branch"
                                    value={data.drawer_bank_branch}
                                    onChange={(event) =>
                                        setData(
                                            'drawer_bank_branch',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Branch name"
                                />
                            </div>

                            {/* Account */}
                            <div className="space-y-1.5">
                                <Label htmlFor="drawer_account_no">
                                    Drawer account
                                </Label>

                                <Input
                                    id="drawer_account_no"
                                    value={data.drawer_account_no}
                                    onChange={(event) =>
                                        setData(
                                            'drawer_account_no',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Account number"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end border-t pt-3">
                            <Button
                                type="submit"
                                disabled={processing || !data.cheque_id}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Clearing'}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Clearing List */}
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Clearing Records
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Track the current lifecycle of each
                                    clearing.
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            {clearings.data.length}{' '}
                            {clearings.data.length === 1 ? 'record' : 'records'}
                        </span>
                    </div>

                    {clearings.data.length > 0 ? (
                        <div className="divide-y">
                            {clearings.data.map((clearing) => {
                                const status =
                                    statusConfig[clearing.status] ??
                                    statusConfig.RECEIVED;

                                return (
                                    <div
                                        key={clearing.id}
                                        className="group px-4 py-3 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            {/* Main information */}
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                                                    <FileCheck2 className="h-4 w-4 text-primary" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-sm font-semibold">
                                                            {
                                                                clearing.clearing_no
                                                            }
                                                        </span>

                                                        <span className="text-muted-foreground">
                                                            ·
                                                        </span>

                                                        <span className="text-sm">
                                                            Cheque{' '}
                                                            <span className="font-medium">
                                                                {clearing.cheque
                                                                    ?.cheque_no ??
                                                                    '-'}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                        <span className="inline-flex items-center gap-1">
                                                            <CircleDollarSign className="h-3.5 w-3.5" />
                                                            Amount{' '}
                                                            <span className="font-medium text-foreground">
                                                                {
                                                                    clearing.amount
                                                                }
                                                            </span>
                                                        </span>

                                                        <span className="hidden text-border sm:inline">
                                                            •
                                                        </span>

                                                        <span>
                                                            {formatDate(
                                                                clearing.clearing_date,
                                                            )}
                                                        </span>

                                                        {clearing.cheque
                                                            ?.payee && (
                                                            <>
                                                                <span className="hidden text-border sm:inline">
                                                                    •
                                                                </span>

                                                                <span className="truncate">
                                                                    {
                                                                        clearing
                                                                            .cheque
                                                                            .payee
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status + actions */}
                                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                                <span
                                                    className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[11px] font-semibold ${status.className}`}
                                                >
                                                    {status.label}
                                                </span>

                                                {clearing.status ===
                                                    'RECEIVED' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 gap-1.5"
                                                            onClick={() =>
                                                                confirmAction(
                                                                    'Send this clearing?',
                                                                    `Send clearing ${clearing.clearing_no}?`,
                                                                    'send',
                                                                    clearing.id,
                                                                )
                                                            }
                                                        >
                                                            <Send className="h-3.5 w-3.5" />
                                                            Send
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 gap-1.5"
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
                                                            <X className="h-3.5 w-3.5" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}

                                                {clearing.status === 'SENT' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 gap-1.5"
                                                            onClick={() =>
                                                                confirmAction(
                                                                    'Present this clearing?',
                                                                    `Present clearing ${clearing.clearing_no}?`,
                                                                    'present',
                                                                    clearing.id,
                                                                )
                                                            }
                                                        >
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                            Present
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 gap-1.5"
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
                                                            <X className="h-3.5 w-3.5" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}

                                                {clearing.status ===
                                                    'PRESENTED' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 gap-1.5"
                                                            onClick={() =>
                                                                confirmAction(
                                                                    'Settle this clearing?',
                                                                    `Settle clearing ${clearing.clearing_no}?`,
                                                                    'settle',
                                                                    clearing.id,
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Settle
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 gap-1.5"
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
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            Return
                                                        </Button>
                                                    </>
                                                )}

                                                {(clearing.status ===
                                                    'CLEARED' ||
                                                    clearing.status ===
                                                        'BOUNCED' ||
                                                    clearing.status ===
                                                        'CANCELLED') && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        Completed
                                                        <ChevronRight className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
                                <FileCheck2 className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <h3 className="text-sm font-semibold">
                                No clearing records
                            </h3>

                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Create a clearing record above when a cheque is
                                ready to enter the clearing process.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
}
