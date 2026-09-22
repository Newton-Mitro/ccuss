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
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Banknote, Clock3, LockKeyhole, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';

interface TellerSessionListItem {
    id: number;
    status: 'OPEN' | 'CLOSING' | 'CLOSED';
    opening_cash: string | number;
    closing_cash?: string | number | null;
    expected_cash?: string | number | null;
    cash_difference?: string | number | null;
    opened_at?: string | null;
    closed_at?: string | null;
    teller?: { code: string; name: string } | null;
    branch_day?: {
        business_date: string;
        branch?: { name: string; code: string } | null;
    } | null;
    opened_by?: { name: string } | null;
    closed_by?: { name: string } | null;
}

interface TellerSessionIndexProps extends SharedData {
    teller_sessions: {
        data: TellerSessionListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    branch_day?: { id: number; business_date: string } | null;
    tellers: { id: number; code: string; name: string }[];
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { teller_sessions, branch_day, tellers, filters, auth } =
        usePage<TellerSessionIndexProps>().props;
    const [openDialog, setOpenDialog] = useState(false);
    const [closingSession, setClosingSession] =
        useState<TellerSessionListItem | null>(null);
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });
    const openForm = useForm({
        teller_id: '',
        opening_cash: '',
        opening_note: '',
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

    const handleOpen = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        openForm.post(route('teller-sessions.open'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDialog(false);
                openForm.reset();
            },
        });
    };

    const handleClose = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!closingSession) return;

        closeForm.post(route('teller-sessions.close', closingSession.id), {
            preserveScroll: true,
            onSuccess: () => {
                setClosingSession(null);
                closeForm.reset();
            },
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Sessions" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Teller Sessions"
                    description="Review teller session status and cash position for each business day."
                />
                {canOpen && (
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button type="button" disabled={!branch_day}>
                                <Plus className="h-4 w-4" />
                                Open teller session
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Open teller session</DialogTitle>
                                <DialogDescription>
                                    {branch_day
                                        ? `Open a session for ${branch_day.business_date}.`
                                        : 'An open branch day is required first.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleOpen} className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="teller_id"
                                        className="text-sm font-medium"
                                    >
                                        Teller
                                    </label>
                                    <select
                                        id="teller_id"
                                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                        value={openForm.data.teller_id}
                                        onChange={(event) =>
                                            openForm.setData(
                                                'teller_id',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select active teller
                                        </option>
                                        {tellers.map((teller) => (
                                            <option
                                                key={teller.id}
                                                value={teller.id}
                                            >
                                                {teller.name} ({teller.code})
                                            </option>
                                        ))}
                                    </select>
                                    {openForm.errors.teller_id && (
                                        <p className="text-sm text-destructive">
                                            {openForm.errors.teller_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="opening_cash"
                                        className="text-sm font-medium"
                                    >
                                        Opening cash
                                    </label>
                                    <Input
                                        id="opening_cash"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={openForm.data.opening_cash}
                                        onChange={(event) =>
                                            openForm.setData(
                                                'opening_cash',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {openForm.errors.opening_cash && (
                                        <p className="text-sm text-destructive">
                                            {openForm.errors.opening_cash}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="opening_note"
                                        className="text-sm font-medium"
                                    >
                                        Opening note
                                    </label>
                                    <Input
                                        id="opening_note"
                                        value={openForm.data.opening_note}
                                        onChange={(event) =>
                                            openForm.setData(
                                                'opening_note',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={2000}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={
                                            openForm.processing || !branch_day
                                        }
                                    >
                                        <Banknote className="h-4 w-4" />
                                        Open session
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                {teller_sessions.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No teller sessions found"
                        description="Open a teller session to begin cash operations."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-240 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
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
                                {teller_sessions.data.map((session, index) => (
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
                                            {session.opening_cash}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.closing_cash ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.cash_difference ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {canClose &&
                                                session.status === 'OPEN' && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            closeForm.reset();
                                                            setClosingSession(
                                                                session,
                                                            );
                                                        }}
                                                        aria-label={`Close ${session.teller?.name ?? 'teller session'}`}
                                                    >
                                                        <LockKeyhole className="h-4 w-4 text-warning" />
                                                    </Button>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
                <Dialog
                    open={closingSession !== null}
                    onOpenChange={(open) => !open && setClosingSession(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Close teller session</DialogTitle>
                            <DialogDescription>
                                Enter the counted closing cash for{' '}
                                {closingSession?.teller?.name ?? 'this teller'}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleClose} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="closing_cash"
                                    className="text-sm font-medium"
                                >
                                    Closing cash
                                </label>
                                <Input
                                    id="closing_cash"
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={closeForm.data.closing_cash}
                                    onChange={(event) =>
                                        closeForm.setData(
                                            'closing_cash',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                                {closeForm.errors.closing_cash && (
                                    <p className="text-sm text-destructive">
                                        {closeForm.errors.closing_cash}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="closing_note"
                                    className="text-sm font-medium"
                                >
                                    Closing note
                                </label>
                                <Input
                                    id="closing_note"
                                    value={closeForm.data.closing_note}
                                    onChange={(event) =>
                                        closeForm.setData(
                                            'closing_note',
                                            event.target.value,
                                        )
                                    }
                                    maxLength={2000}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={closeForm.processing}
                                >
                                    <LockKeyhole className="h-4 w-4" />
                                    Close session
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </CustomAuthLayout>
    );
}
