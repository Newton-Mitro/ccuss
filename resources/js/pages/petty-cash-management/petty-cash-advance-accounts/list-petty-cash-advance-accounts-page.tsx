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
import {
    PettyCashAccount,
    PettyCashAdvanceAccount,
} from '../../../types/petty_cash_module';

interface ListAdvanceExpensesPageProps extends SharedData {
    paginated_data: {
        data: PettyCashAdvanceAccount[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    pettyCashAccounts: PettyCashAccount[];
    filters: Record<string, string>;
}

export default function ListAdvanceExpensesPage() {
    const { paginated_data, filters, pettyCashAccounts } =
        usePage<ListAdvanceExpensesPageProps>().props;

    useFlashToastHandler();

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        petty_cash_account_id: filters.petty_cash_account_id || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('petty-cash-advance-accounts.index'), {
            preserveState: true,
        });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [
        data.search,
        data.petty_cash_account_id,
        data.status,
        data.per_page,
        data.page,
    ]);

    const handleDelete = (id: number, label: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `"${label}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('petty-cash-advance-accounts.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Petty Cash Advance Accounts',
            href: route('petty-cash-advance-accounts.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Advance Accounts" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Petty Cash Advance Accounts"
                        description="Manage employee advance petty cash"
                    />

                    <Link
                        href={route('petty-cash-advance-accounts.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Advance
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="w-64">
                        <Input
                            type="text"
                            placeholder="Search employee or account..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Petty Cash Account */}
                        <div className="w-56">
                            <Select
                                value={data.petty_cash_account_id}
                                onChange={(value) => {
                                    setData('petty_cash_account_id', value);
                                    setData('page', 1);
                                }}
                                options={[
                                    { value: '', label: 'All Accounts' },
                                    ...pettyCashAccounts.map((a) => ({
                                        value: a.id.toString(),
                                        label: a.name,
                                    })),
                                ]}
                            />
                        </div>

                        {/* Status */}
                        <div className="w-44">
                            <Select
                                value={data.status}
                                onChange={(value) => {
                                    setData('status', value);
                                    setData('page', 1);
                                }}
                                options={[
                                    { value: '', label: 'All Status' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'settled', label: 'Settled' },
                                    { value: 'rejected', label: 'Rejected' },
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
                                    'Employee',
                                    'Petty Cash Account',
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
                            {paginated_data.data.length ? (
                                paginated_data.data.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            {a.employee?.name}
                                        </td>

                                        <td className="px-2 py-1">
                                            {a.petty_cash_account?.name}
                                        </td>

                                        <td className="px-2 py-1 capitalize">
                                            {a.status}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    {/* View */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'petty-cash-advance-accounts.show',
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

                                                    {/* Edit */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'petty-cash-advance-accounts.edit',
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

                                                    {/* Delete */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        a.id,
                                                                        a
                                                                            .employee
                                                                            ?.name ||
                                                                            'Advance',
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
                                        colSpan={4}
                                        className="py-6 text-center text-muted-foreground"
                                    >
                                        No advances found.
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
                    links={paginated_data.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
