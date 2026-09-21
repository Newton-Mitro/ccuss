import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, LockKeyhole, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';

interface BranchDayListItem {
    id: number;
    business_date: string;
    status: 'OPEN' | 'CLOSING' | 'CLOSED';
    opened_at?: string | null;
    closed_at?: string | null;
    branch?: { id: number; name: string; code: string } | null;
    opened_by?: { id: number; name: string } | null;
    closed_by?: { id: number; name: string } | null;
}

interface BranchDayIndexProps extends SharedData {
    branch_days: {
        data: BranchDayListItem[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        per_page: number;
    };
    filters: {
        search?: string;
        page?: number;
        per_page?: number;
    };
}

export default function Index() {
    const { branch_days, filters } = usePage<BranchDayIndexProps>().props;
    const [openDialog, setOpenDialog] = useState(false);
    const [businessDate, setBusinessDate] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [openingNote, setOpeningNote] = useState('');

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('branch-days.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Branch Days', href: route('branch-days.index') },
    ];

    const handleOpen = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            route('branch-days.open'),
            {
                business_date: businessDate,
                opening_note: openingNote || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpenDialog(false);
                    setOpeningNote('');
                },
            },
        );
    };

    const handleClose = (branchDay: BranchDayListItem) => {
        appSwal
            .fire({
                title: 'Close branch day?',
                text: `Close ${branchDay.business_date} for ${branchDay.branch?.name ?? 'this branch'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Close branch day',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        route('branch-days.close', branchDay.id),
                        {},
                        { preserveScroll: true },
                    );
                }
            });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Days" />

            <div className="space-y-4 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Branch Days"
                        description="Track business-day activity across the active organization branches."
                    />
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button type="button">
                                <Plus className="h-4 w-4" />
                                Open branch day
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Open branch day</DialogTitle>
                                <DialogDescription>
                                    Open a business day for your assigned
                                    branch.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleOpen} className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="business_date"
                                        className="text-sm font-medium"
                                    >
                                        Business date
                                    </label>
                                    <Input
                                        id="business_date"
                                        type="date"
                                        value={businessDate}
                                        onChange={(event) =>
                                            setBusinessDate(event.target.value)
                                        }
                                        required
                                    />
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
                                        value={openingNote}
                                        onChange={(event) =>
                                            setOpeningNote(event.target.value)
                                        }
                                        placeholder="Optional note"
                                        maxLength={2000}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        Open branch day
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        className="w-full bg-card sm:w-72"
                        placeholder="Search branch or business date..."
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                    />
                </div>

                <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-180 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Branch',
                                    'Business Date',
                                    'Status',
                                    'Opened By',
                                    'Closed By',
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
                            {branch_days.data.length > 0 ? (
                                branch_days.data.map((branchDay, index) => (
                                    <tr
                                        key={branchDay.id}
                                        className="border-b transition-colors even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(branch_days.current_page - 1) *
                                                branch_days.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {branchDay.branch
                                                            ?.name ?? '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {branchDay.branch
                                                            ?.code ?? '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {branchDay.business_date}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {branchDay.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            {branchDay.opened_by?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {branchDay.closed_by?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {branchDay.status === 'OPEN' && (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleClose(branchDay)
                                                    }
                                                    aria-label={`Close ${branchDay.branch?.name ?? 'branch day'}`}
                                                >
                                                    <LockKeyhole className="h-4 w-4 text-warning" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No branch days found for this
                                        organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <DataTablePagination
                    perPage={branch_days.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    currentPage={branch_days.current_page}
                    totalItems={branch_days.data.length}
                    totalPages={Math.max(
                        1,
                        Math.ceil(
                            branch_days.data.length / branch_days.per_page,
                        ),
                    )}
                    onNext={() => setData('page', branch_days.current_page + 1)}
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, branch_days.current_page - 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
