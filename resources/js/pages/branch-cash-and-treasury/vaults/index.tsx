import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem } from '../../../types';
import { vaultStatuses } from './data/vault_status';

interface VaultPageProps {
    vaults: {
        data: {
            id: number;
            name: string;
            total_balance: number;
            is_active: boolean;
            branch: { id: number; name: string };
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { vaults, filters } = usePage().props as unknown as VaultPageProps;

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        branch_id: filters.branch_id || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get('/vaults', { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page, data.branch_id, data.status]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Vault "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('vaults.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            toast.success(
                                `Vault "${name}" deleted successfully!`,
                            );
                        },
                        onError: () => {
                            toast.error('Failed to delete the vault.');
                        },
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vaults', href: '/vaults' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Vaults" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Vaults"
                        description="Manage branch vaults and their balances"
                    />
                    <Link
                        href="/vaults/create"
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Vault
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search vaults..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {/* Branch Filter */}
                        <Select
                            value={data.branch_id}
                            onChange={(value) => {
                                setData('branch_id', value);
                                setData('page', 1);
                            }}
                            options={(usePage().props as any).branches?.map(
                                (b: any) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ),
                            )}
                        />

                        {/* Status Filter */}
                        <Select
                            value={data.status}
                            onChange={(value) => {
                                setData('status', value);
                                setData('page', 1);
                            }}
                            options={vaultStatuses}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Name',
                                    'Branch',
                                    'Balance',
                                    'Status',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {vaults.data.length > 0 ? (
                                vaults.data.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{v.name}</td>
                                        <td className="px-2 py-1">
                                            {v.branch?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {(
                                                Number(v.total_balance) || 0
                                            ).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {v.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'vaults.show',
                                                                    v.id,
                                                                )}
                                                                className="text-info"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {/* Edit */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'vaults.edit',
                                                                    v.id,
                                                                )}
                                                                className="text-success"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Delete */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        v.id,
                                                                        v.name,
                                                                    )
                                                                }
                                                                className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Delete
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No vaults found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={vaults.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
