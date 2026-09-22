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
import { Plus, Vault as VaultIcon } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface VaultListItem {
    id: number;
    code: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    maximum_balance?: string | number | null;
    cash_location?: {
        code: string;
        name: string;
        branch?: { name: string; code: string } | null;
    } | null;
}

interface VaultIndexProps extends SharedData {
    vaults: {
        data: VaultListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { vaults, filters, auth } = usePage<VaultIndexProps>().props;
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
            get(route('vaults.index'), { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Vaults', href: route('vaults.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Vaults" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Vaults"
                    description="Review vault locations and their operating limits across the active organization."
                    action={
                        canCreate ? (
                            <Button
                                type="button"
                                onClick={() =>
                                    (window.location.href =
                                        route('vaults.create'))
                                }
                            >
                                <Plus className="h-4 w-4" />
                                Create vault
                            </Button>
                        ) : undefined
                    }
                />
                <Input
                    className="w-full bg-card sm:w-72"
                    placeholder="Search vault, code, or branch..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {vaults.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No vaults found"
                        description="Create a vault to begin managing branch cash locations."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-180 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Vault',
                                        'Branch',
                                        'Status',
                                        'Maximum Balance',
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
                                {vaults.data.map((vault, index) => (
                                    <tr
                                        key={vault.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(vaults.current_page - 1) *
                                                vaults.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <VaultIcon className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {vault.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {vault.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {vault.cash_location?.branch
                                                ?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <StatusBadge
                                                tone={
                                                    vault.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {vault.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-2 py-2">
                                            {vault.maximum_balance ?? '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <DataTablePagination
                    perPage={vaults.per_page}
                    currentPage={vaults.current_page}
                    totalItems={vaults.data.length}
                    totalPages={vaults.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', vaults.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, vaults.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
