import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatDate } from '@/lib/date_util';
import type { Props } from '@/modules/treasury-cash/types/cheques/clearings.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

    const { clearings, auth } = usePage<Props>().props;
    const canCreate = [
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ].includes('cheques.present');

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <HeadingSmall
                            title="Cheque Clearings"
                            description="Manage cheque presentation, settlement, returns, and clearing status."
                        />
                    </div>
                    {canCreate && (
                        <Button asChild className="shrink-0 gap-2">
                            <Link href={route('cheque-clearings.create')}>
                                <Plus className="size-4" />
                                New clearing
                            </Link>
                        </Button>
                    )}
                </div>

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
