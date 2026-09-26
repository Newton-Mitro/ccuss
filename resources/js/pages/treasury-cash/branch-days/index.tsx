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
import { BreadcrumbItem } from '@/types';
import type { BranchDayListItem } from '@/types/treasury-cash/branch-days';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, LockKeyhole, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function Index() {
    const { branch_days, filters, auth } = usePage<any>().props;
    const userHasBranch = !!auth?.user?.branch_id;

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

    const handleClose = (branchDay: BranchDayListItem) => {
        router.post(
            route('branch-days.close', branchDay.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Days" />

            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Branch Days"
                    description="Track business-day activity across the active organization branches."
                    action={
                        <Button
                            type="button"
                            disabled={!userHasBranch}
                            title={
                                !userHasBranch
                                    ? 'Assign a branch to your user'
                                    : undefined
                            }
                            onClick={() =>
                                router.visit(route('branch-days.create'))
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Open branch day
                        </Button>
                    }
                />

                {!userHasBranch && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                        Assign a branch to your user
                    </div>
                )}

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

                {branch_days.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No branch days found"
                        description="Open a branch day to begin daily operations."
                    />
                ) : (
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
                                {branch_days.data.map((branchDay, index) => (
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
                                            <StatusBadge
                                                tone={
                                                    branchDay.status === 'OPEN'
                                                        ? 'success'
                                                        : branchDay.status ===
                                                            'CLOSING'
                                                          ? 'warning'
                                                          : 'neutral'
                                                }
                                            >
                                                {branchDay.status}
                                            </StatusBadge>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
