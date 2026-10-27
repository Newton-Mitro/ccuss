import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type {
    TellerSessionIndexProps,
    TellerSessionListItem,
} from '@/modules/treasury-cash/types/teller-sessions';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Clock3, LockKeyhole, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function Index() {
    const { teller_sessions, branch_day, filters, auth } =
        usePage<TellerSessionIndexProps>().props;
    const [isClosing, setIsClosing] = useState(false);
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canOpen = permissions.has('teller_sessions.open');
    const canClose = permissions.has('teller_sessions.close');

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('teller-sessions.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
    ];

    const handleClose = async (session: TellerSessionListItem) => {
        const result = await appSwal.fire({
            titleText: 'Close teller session?',
            icon: 'warning',
            iconColor: 'var(--warning)',
            width: '30rem',
            html: `
                <div class="mt-2 space-y-5 text-left">
                    <div class="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-3">
                        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                            <span aria-hidden="true">৳</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-foreground">End-of-session cash count</p>
                            <p id="closing_prompt" class="mt-0.5 text-xs leading-5 text-muted-foreground"></p>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-foreground" for="closing_cash">Closing cash <span class="text-destructive">*</span></label>
                        <div class="relative">
                            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">৳</span>
                            <input id="closing_cash" type="number" min="0" step="0.0001" required inputmode="decimal" autocomplete="off" aria-describedby="closing_cash_hint" class="swal2-input m-0! h-11! w-full! rounded-lg! border-border! bg-background! pl-8! pr-3! text-sm! text-foreground! shadow-none! focus:border-primary! focus:ring-2! focus:ring-primary/20!" />
                        </div>
                        <p id="closing_cash_hint" class="text-xs text-muted-foreground">Enter the counted amount. This is used to calculate the cash difference.</p>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-foreground" for="closing_note">Closing note <span class="font-normal text-muted-foreground">Optional</span></label>
                        <textarea id="closing_note" maxlength="2000" rows="3" placeholder="Add a note about the cash count, if needed" class="swal2-textarea m-0! min-h-20! w-full! resize-y! rounded-lg! border-border! bg-background! px-3! py-2! text-sm! text-foreground! shadow-none! placeholder:text-muted-foreground! focus:border-primary! focus:ring-2! focus:ring-primary/20!"></textarea>
                    </div>
                </div>
            `,
            didOpen: () => {
                const prompt = appSwal
                    .getPopup()
                    ?.querySelector<HTMLParagraphElement>('#closing_prompt');
                if (prompt) {
                    prompt.textContent = `Enter the counted closing cash for ${session.teller?.name ?? 'this teller'}.`;
                }
            },
            showCancelButton: true,
            confirmButtonText: 'Close session',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            didOpen: () => {
                const popup = appSwal.getPopup();
                const prompt =
                    popup?.querySelector<HTMLParagraphElement>(
                        '#closing_prompt',
                    );
                const cashInput =
                    popup?.querySelector<HTMLInputElement>('#closing_cash');
                if (prompt) {
                    prompt.textContent = `Counted cash for ${session.teller?.name ?? 'this teller'}`;
                }
                cashInput?.focus();
            },
            preConfirm: () => {
                const popup = appSwal.getPopup();
                const cashInput =
                    popup?.querySelector<HTMLInputElement>('#closing_cash');
                const noteInput =
                    popup?.querySelector<HTMLTextAreaElement>('#closing_note');
                const closingCash = cashInput?.value.trim() ?? '';
                const closingNote = noteInput?.value.trim() ?? '';

                if (
                    !closingCash ||
                    !Number.isFinite(Number(closingCash)) ||
                    Number(closingCash) < 0
                ) {
                    appSwal.showValidationMessage(
                        'Please enter a valid closing cash amount of zero or more.',
                    );
                    return;
                }

                return {
                    closing_cash: closingCash,
                    closing_note: closingNote,
                };
            },
        });

        if (!result.isConfirmed || !result.value || isClosing) return;

        setIsClosing(true);
        router.post(route('teller-sessions.close', session.id), result.value, {
            preserveScroll: true,
            onError: (errors) => {
                appSwal.fire({
                    icon: 'error',
                    title: 'Unable to close teller session',
                    text:
                        Object.values(errors).flat().join(' ') ||
                        'Please review the closing details and try again.',
                });
            },
            onFinish: () => setIsClosing(false),
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Sessions" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Teller Sessions"
                    description="Review teller session status and cash position for each business day."
                    action={
                        canOpen ? (
                            <Button
                                type="button"
                                disabled={!branch_day}
                                title={
                                    !branch_day
                                        ? 'Open a branch day before creating a teller session.'
                                        : undefined
                                }
                                onClick={() =>
                                    router.visit(
                                        route('teller-sessions.create'),
                                    )
                                }
                            >
                                <Plus className="h-4 w-4" />
                                Open teller session
                            </Button>
                        ) : null
                    }
                />
                {!branch_day && canOpen && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                        Open a branch day before creating a teller session.
                    </div>
                )}
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search teller, branch, date, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-240 border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Teller',
                                    'Branch',
                                    'Business Date',
                                    'Status',
                                    'Opening Cash',
                                    'Closing Cash',
                                    'Difference',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left font-medium"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teller_sessions.data.length > 0 ? (
                                teller_sessions.data.map((session, index) => (
                                    <tr
                                        key={session.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(teller_sessions.current_page -
                                                1) *
                                                teller_sessions.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {session.teller?.name ??
                                                            '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {session.teller?.code ??
                                                            '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.branch_day?.branch?.name ??
                                                '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.branch_day
                                                ?.business_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <StatusBadge
                                                tone={
                                                    session.status === 'OPEN'
                                                        ? 'success'
                                                        : session.status ===
                                                            'CLOSING'
                                                          ? 'warning'
                                                          : 'neutral'
                                                }
                                            >
                                                {session.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-2 py-2">
                                            {formatBDTCurrency(
                                                session.opening_cash,
                                                false,
                                            )}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.closing_cash != null
                                                ? formatBDTCurrency(
                                                      session.closing_cash,
                                                      false,
                                                  )
                                                : '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.cash_difference != null
                                                ? formatBDTCurrency(
                                                      session.cash_difference,
                                                      false,
                                                  )
                                                : '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {canClose &&
                                                session.status === 'OPEN' && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isClosing}
                                                        onClick={() =>
                                                            handleClose(session)
                                                        }
                                                        aria-label={`Close ${session.teller?.name ?? 'teller session'}`}
                                                    >
                                                        <LockKeyhole className="h-4 w-4 text-warning" />
                                                    </Button>
                                                )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="p-0">
                                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No teller sessions found. Open a
                                            teller session to begin cash
                                            operations.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={teller_sessions.per_page}
                    currentPage={teller_sessions.current_page}
                    totalItems={teller_sessions.total}
                    totalPages={teller_sessions.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() =>
                        setData('page', teller_sessions.current_page + 1)
                    }
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, teller_sessions.current_page - 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
