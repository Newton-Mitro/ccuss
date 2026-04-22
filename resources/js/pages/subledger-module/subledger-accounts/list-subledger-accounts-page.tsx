import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Select } from '../../../components/ui/select';

interface Account {
    id: number;
    account_number: string;
    name: string | null;
    type: string;
    status: string;
    branch?: { name: string };
    subledger?: { name: string };
    accountable_type: string;
}

interface PageProps extends SharedData {
    accounts: {
        data: Account[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { accounts, filters } = usePage<PageProps>().props;

    useFlashToastHandler();

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        type: filters.type || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('subledger-accounts.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.type, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Account "${name}" will be deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('subledger-accounts.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subledger Management', href: '' },
        {
            title: 'Subledger Accounts',
            href: route('subledger-accounts.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Subledger Accounts" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Subledger Accounts"
                        description="Manage all customer, vendor, bank and internal accounts"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="w-64">
                        <Input
                            placeholder="Search account..."
                            className="bg-card"
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="w-60">
                        <Select
                            className="bg-card"
                            value={data.type}
                            onChange={(value) => setData('type', value)}
                            options={[
                                { label: 'All Types', value: '' },
                                { label: 'Bank', value: 'bank' },
                                { label: 'Deposit', value: 'deposit' },
                                { label: 'Loan', value: 'loan' },
                                { label: 'Customer', value: 'customer' },
                                { label: 'Vendor', value: 'vendor' },
                                { label: 'Petty Cash', value: 'petty_cash' },
                            ]}
                        />
                    </div>

                    <div className="w-60">
                        <Select
                            value={data.status}
                            className="bg-card"
                            onChange={(value) => setData('status', value)}
                            options={[
                                { label: 'All Status', value: '' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Active', value: 'active' },
                                { label: 'Dormant', value: 'dormant' },
                                { label: 'Frozen', value: 'frozen' },
                                { label: 'Closed', value: 'closed' },
                            ]}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-340px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted text-sm">
                            <tr>
                                {[
                                    'Account No',
                                    'Name',
                                    'Type',
                                    'Status',
                                    'Branch',
                                    'Subledger',
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
                            {accounts.data.length > 0 ? (
                                accounts.data.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b transition-all even:bg-muted hover:scale-[1.01] hover:opacity-50"
                                    >
                                        <td className="px-2 py-1">
                                            {a.account_number}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.name || '-'}
                                        </td>
                                        <td className="px-2 py-1 capitalize">
                                            {a.type}
                                        </td>
                                        <td className="px-2 py-1 capitalize">
                                            {a.status}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.branch?.name || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.subledger?.name || '-'}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    {/* View */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'subledger-accounts.show',
                                                                    a.id,
                                                                )}
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
                                                                    'subledger-accounts.edit',
                                                                    a.id,
                                                                )}
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
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        a.id,
                                                                        a.account_number,
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
                                        colSpan={7}
                                        className="py-6 text-center text-muted-foreground"
                                    >
                                        No accounts found.
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
                    links={accounts.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
