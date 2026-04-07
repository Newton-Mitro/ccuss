import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { route } from 'ziggy-js';
import { Button } from '../../../components/ui/button';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate, formatDateTime } from '../../../lib/date_util';
import { SharedData } from '../../../types';
import { BranchDay, TellerSession } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    branch_day: BranchDay | null;
    sessions: TellerSession[];
}

export default function BranchDayStatusPage({ branch_day, sessions }: Props) {
    useFlashToastHandler();

    const handleClose = () => {
        if (!branch_day) return;

        router.post(route('branch-days.close'), {
            branch_day_id: branch_day.id,
        });
    };

    const hasOpenSession = sessions.some((s) => s.status === 'open');

    return (
        <CustomAuthLayout>
            <Head title="Branch Day Status" />

            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">
                        Branch Day Overview
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Real-time operational snapshot
                    </p>
                </div>

                {branch_day?.status === 'open' && (
                    <Button
                        onClick={handleClose}
                        disabled={hasOpenSession}
                        className="h-9 rounded-full px-4 text-xs"
                        variant="destructive"
                    >
                        Close Day
                    </Button>
                )}
            </div>

            {!branch_day ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {/* STATUS STRIP */}
                    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <StatusDot status={branch_day.status} />
                            <span className="text-sm font-medium">
                                {branch_day.status.toUpperCase()} DAY
                            </span>
                        </div>

                        <span className="text-xs text-muted-foreground">
                            {formatDate(branch_day.business_date)}
                        </span>
                    </div>

                    {/* INFO CARDS */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Stat label="Branch" value={branch_day.branch?.name} />
                        <Stat
                            label="Opened"
                            value={formatDateTime(branch_day.opened_at)}
                        />
                        <Stat
                            label="Closed"
                            value={
                                branch_day.closed_at
                                    ? formatDateTime(branch_day.closed_at)
                                    : '—'
                            }
                        />
                        <Stat
                            label="Operator"
                            value={branch_day.opened_by?.name}
                        />
                    </div>

                    {/* SESSIONS */}
                    <div>
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
                            <h3 className="mb-2 text-sm font-semibold">
                                Teller Sessions
                            </h3>

                            <Link
                                href={route('teller-sessions.create')}
                                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" /> Open Teller Session
                            </Link>
                        </div>

                        {sessions.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                No sessions found
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {sessions.map((s) => {
                                    const isActive = s.status === 'open';

                                    return (
                                        <div
                                            key={s.id}
                                            className="flex items-center justify-between rounded-lg border bg-card px-2.5 py-2 text-xs hover:bg-muted/40"
                                        >
                                            {/* LEFT */}
                                            <div className="flex min-w-0 items-center gap-2">
                                                <StatusDot status={s.status} />

                                                <span className="truncate font-medium">
                                                    {s.teller?.name}
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {' • '}
                                                    {formatDateTime(
                                                        s.opened_at,
                                                    )}
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {' • '}
                                                    {s.closed_at
                                                        ? 'Closed'
                                                        : 'Live'}
                                                </span>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="flex shrink-0 items-center gap-2">
                                                <StatusBadge
                                                    status={s.status}
                                                />

                                                {isActive && (
                                                    <Link
                                                        href={route(
                                                            'teller-sessions.close-page',
                                                            s.id,
                                                        )}
                                                        className="rounded-full bg-destructive px-4 py-1.5 text-xs font-medium text-destructive-foreground hover:underline hover:ring-2 hover:ring-destructive/50"
                                                    >
                                                        Close Teller Session
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </CustomAuthLayout>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        open: 'bg-green-100 text-green-800 ',
        closed: 'bg-red-100 text-red-800',
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-800'}`}
        >
            {status.toUpperCase()}
        </span>
    );
};

const StatusDot = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        open: 'bg-success',
        closed: 'bg-destructive',
    };

    return (
        <span
            className={`h-4 w-4 animate-pulse rounded-full transition-all duration-300 ${map[status]}`}
        />
    );
};

function Stat({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-xl border bg-card px-3 py-2 shadow-sm">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="truncate text-sm font-semibold">{value || '—'}</p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-10 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
                No active branch day
            </p>
            <Link
                href={route('branch-days.create')}
                className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground"
            >
                Open Branch Day
            </Link>
        </div>
    );
}
