import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem } from '@/types';
import type {
    VaultSessionIndexProps,
    VaultSessionListItem,
} from '@/types/treasury-cash/vault-sessions';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Clock3, LockKeyhole, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';

export default function Index() {
    const { vault_sessions, branch_day, filters, auth } =
        usePage<VaultSessionIndexProps>().props;
    const [closingSession, setClosingSession] =
        useState<VaultSessionListItem | null>(null);
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });
    const closeForm = useForm({
        closing_cash: '',
        closing_note: '',
    });

    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canOpen = permissions.has('vault_sessions.open');
    const canClose = permissions.has('vault_sessions.close');

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('vault-sessions.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Vault Sessions', href: route('vault-sessions.index') },
    ];

    const handleClose = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!closingSession) return;

        appSwal
            .fire({
                title: 'Close vault session?',
                text: `Close the session for ${closingSession.vault?.name ?? 'this vault'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Close session',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                closeForm.post(
                    route('vault-sessions.close', closingSession.id),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setClosingSession(null);
                            closeForm.reset();
                        },
                    },
                );
            });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Vault Sessions" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Vault Sessions"
                    description="Review vault session status and cash position for each business day."
                    action={
                        canOpen ? (
                            <Button
                                type="button"
                                disabled={!branch_day}
                                title={
                                    !branch_day
                                        ? 'Open a branch day before creating a vault session.'
                                        : undefined
                                }
                                onClick={() =>
                                    router.visit(route('vault-sessions.create'))
                                }
                            >
                                <Plus className="h-4 w-4" />
                                Open vault session
                            </Button>
                        ) : null
                    }
                />
                {!branch_day && canOpen && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                        Open a branch day before creating a vault session.
                    </div>
                )}
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search vault, branch, date, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {vault_sessions.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No vault sessions found"
                        description="Open a vault session to begin cash operations."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-240 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Vault',
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
                                {vault_sessions.data.map((session, index) => (
                                    <tr
                                        key={session.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(vault_sessions.current_page - 1) *
                                                vault_sessions.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {session.vault?.name ??
                                                            '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {session.vault?.code ??
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
                                            {Number(
                                                session.opening_cash,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.closing_cash != null
                                                ? Number(
                                                      session.closing_cash,
                                                  ).toLocaleString()
                                                : '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.cash_difference != null
                                                ? Number(
                                                      session.cash_difference,
                                                  ).toLocaleString()
                                                : '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {canClose &&
                                            session.status === 'OPEN' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setClosingSession(
                                                            session,
                                                        )
                                                    }
                                                >
                                                    <LockKeyhole className="mr-1 h-4 w-4" />
                                                    Close
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <DataTablePagination
                    perPage={vault_sessions.per_page}
                    currentPage={vault_sessions.current_page}
                    totalItems={vault_sessions.total}
                    totalPages={vault_sessions.last_page}
                    onPageChange={(page) => setData('page', page)}
                    onPerPageChange={(perPage) => setData('per_page', perPage)}
                />
            </div>
            <Dialog
                open={Boolean(closingSession)}
                onOpenChange={(open) => {
                    if (!open) setClosingSession(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Close vault session</DialogTitle>
                        <DialogDescription>
                            Enter the cash counted for{' '}
                            {closingSession?.vault?.name ?? 'this vault'}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleClose} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Closing cash
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={closeForm.data.closing_cash}
                                onChange={(event) =>
                                    closeForm.setData(
                                        'closing_cash',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Note</label>
                            <Input
                                value={closeForm.data.closing_note}
                                onChange={(event) =>
                                    closeForm.setData(
                                        'closing_note',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setClosingSession(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={closeForm.processing}
                            >
                                Close session
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CustomAuthLayout>
    );
}
