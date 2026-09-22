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
import { Plus, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface TellerListItem {
    id: number;
    code: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    maximum_cash?: string | number | null;
    user?: { name: string; email: string } | null;
    cash_location?: {
        code: string;
        name: string;
        branch?: { name: string; code: string } | null;
    } | null;
}

interface TellerIndexProps extends SharedData {
    tellers: {
        data: TellerListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { tellers, filters, auth } = usePage<TellerIndexProps>().props;
    useFlashToastHandler();
    const canCreate = [
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ].includes('cash_management.create');

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('tellers.index'), { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Tellers', href: route('tellers.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Tellers" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Tellers"
                    description="Review teller assignments, branches, and operating limits."
                    action={
                        canCreate ? (
                            <Button
                                type="button"
                                onClick={() =>
                                    (window.location.href =
                                        route('tellers.create'))
                                }
                            >
                                <Plus className="h-4 w-4" />
                                Create teller
                            </Button>
                        ) : undefined
                    }
                />
                <Input
                    className="w-full bg-card sm:w-72"
                    placeholder="Search teller, code, or branch..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {tellers.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No tellers found"
                        description="Create a teller to begin managing cash sessions."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-180 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Teller',
                                        'Assigned User',
                                        'Branch',
                                        'Status',
                                        'Maximum Cash',
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
                                {tellers.data.map((teller, index) => (
                                    <tr
                                        key={teller.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(tellers.current_page - 1) *
                                                tellers.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <UserRound className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {teller.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {teller.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {teller.user?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {teller.cash_location?.branch
                                                ?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <StatusBadge
                                                tone={
                                                    teller.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {teller.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-2 py-2">
                                            {teller.maximum_cash ?? '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <DataTablePagination
                    perPage={tellers.per_page}
                    currentPage={tellers.current_page}
                    totalItems={tellers.data.length}
                    totalPages={tellers.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', tellers.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, tellers.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
