import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';

import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';

import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { Vault } from '../../../types/cash_treasury_module';

interface VaultPageProps extends SharedData {
    vaults: {
        data: Vault[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    branches: Branch[];
    filters: Record<string, string>;
}

export default function Index() {
    const { vaults, branches, filters } = usePage<VaultPageProps>().props;

    useFlashToastHandler();

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        branch_id: filters.branch_id || '',
        account_id: filters.account_id || '',
        is_active: filters.is_active || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get('/vaults', { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [
        data.search,
        data.per_page,
        data.page,
        data.branch_id,
        data.account_id,
        data.is_active,
    ]);

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

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Vaults"
                        description="Manage branch vaults linked with accounts"
                    />

                    <Link
                        href="/vaults/create"
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Vault
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        type="text"
                        placeholder="Search vaults..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="w-60"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                        {/* Branch */}
                        <div className="w-60">
                            <Select
                                value={data.branch_id}
                                onChange={(value) => {
                                    setData('branch_id', value);
                                    setData('page', 1);
                                }}
                                options={[
                                    {
                                        value: '',
                                        label: 'All Branch',
                                    },
                                    ...branches.map((b) => ({
                                        value: b.id.toString(),
                                        label: b.name,
                                    })),
                                ]}
                                placeholder="Select Branch"
                            />
                        </div>

                        {/* Status (is_active) */}
                        <div className="w-60">
                            <Select
                                value={data.is_active}
                                onChange={(value) => {
                                    setData('is_active', value);
                                    setData('page', 1);
                                }}
                                options={[
                                    { value: '', label: 'All Status' },
                                    { value: '1', label: 'Active' },
                                    { value: '0', label: 'Inactive' },
                                ]}
                                placeholder="Select Status"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted/10 text-sm text-muted">
                            <tr>
                                {[
                                    'Branch',
                                    'Name',
                                    'Account Number',
                                    'Account',
                                    'Status',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {vaults.data.length > 0 ? (
                                vaults.data.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="border-b even:bg-muted/10"
                                    >
                                        <td className="px-2 py-1">
                                            {v.branch?.name}
                                        </td>

                                        <td className="px-2 py-1">{v.name}</td>

                                        <td className="px-2 py-1">
                                            {v.account?.account_number ?? '—'}
                                        </td>

                                        <td className="px-2 py-1">
                                            {v?.account?.name ?? '—'}
                                        </td>

                                        <td className="px-2 py-1">
                                            {v.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'vaults.show',
                                                                    v.id,
                                                                )}
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'vaults.edit',
                                                                    v.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        v.id,
                                                                        v.name,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="text-destructive"
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
                                        className="py-6 text-center text-muted-foreground"
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
                    onPerPageChange={(value: number) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={vaults.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
