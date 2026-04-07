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
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { AdvanceExpense } from '../../../types/petty_cash_module';

interface ListAdvanceExpensesPageProps extends SharedData {
    accounts: {
        data: AdvanceExpense[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    branches: Branch[];
    filters: Record<string, string>;
}

export default function ListAdvanceExpensesPage() {
    const { accounts, branches, filters, flash } =
        usePage<ListAdvanceExpensesPageProps>().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

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
        get('/advance-expenses', { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.branch_id, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Advance "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('advance-expenses.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Advance Expenses', href: '/advance-expenses' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Advance Expenses" />

            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Advance Expenses"
                        description="Manage employee advance petty cash balances"
                    />
                    <Link
                        href="/advance-expenses/create"
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Advance
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search advances..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="w-44">
                            <Select
                                value={data.branch_id}
                                onChange={(value) => {
                                    setData('branch_id', value);
                                    setData('page', 1);
                                }}
                                options={branches.map((b) => ({
                                    value: b.id.toString(),
                                    label: b.name,
                                }))}
                            />
                        </div>

                        <div className="w-36">
                            <Select
                                value={data.status}
                                onChange={(value) => {
                                    setData('status', value);
                                    setData('page', 1);
                                }}
                                options={[
                                    { value: '', label: 'All' },
                                    { value: '1', label: 'Active' },
                                    { value: '0', label: 'Inactive' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Name',
                                    'Code',
                                    'Employee',
                                    'Petty Cash',
                                    'Branch',
                                    'Balance',
                                    'Status',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b p-2 text-left text-sm text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {accounts.data.length ? (
                                accounts.data.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{a.name}</td>
                                        <td className="px-2 py-1">{a.code}</td>
                                        <td className="px-2 py-1">
                                            {a.employee?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.petty_cash_account?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.branch?.name}
                                        </td>
                                        <td className="px-2 py-1 font-medium">
                                            {Number(a.balance).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.is_active
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
                                                                    'advance-expenses.show',
                                                                    a.id,
                                                                )}
                                                            >
                                                                <Eye className="h-5 w-5 text-info" />
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
                                                                    'advance-expenses.edit',
                                                                    a.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-5 w-5 text-success" />
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
                                                                        a.id,
                                                                        a.name,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                <Trash2 className="h-5 w-5 text-destructive" />
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
                                        colSpan={8}
                                        className="py-6 text-center text-muted-foreground"
                                    >
                                        No advance accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={accounts.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
