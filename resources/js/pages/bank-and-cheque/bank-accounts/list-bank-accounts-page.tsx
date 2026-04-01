// resources/js/Pages/BankAccount/Index.tsx
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';

interface BankAccountPageProps extends SharedData {
    accounts: {
        data: {
            id: number;
            account_name: string;
            account_number: string;
            balance: number;
            currency: string;
            status: 'active' | 'inactive' | 'closed';
            bank: { id: number; name: string };
            branch?: { id: number; name: string };
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    banks: { id: number; name: string }[];
    branches: { id: number; name: string; bank_id: number }[];
    filters: Record<string, string>;
}

export default function Index() {
    const { accounts, banks, branches, filters } =
        usePage<BankAccountPageProps>().props;

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        bank_id: filters.bank_id || '',
        branch_id: filters.branch_id || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('bank-accounts.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [
        data.search,
        data.bank_id,
        data.branch_id,
        data.status,
        data.per_page,
        data.page,
    ]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Bank Account "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('bank-accounts.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Bank Account "${name}" deleted successfully!`,
                            ),
                        onError: () =>
                            toast.error('Failed to delete bank account.'),
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bank Accounts', href: '/bank-accounts' },
    ];

    // Filter branches based on selected bank
    const filteredBranches = data.bank_id
        ? branches.filter((b) => b.bank_id.toString() === data.bank_id)
        : branches;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Accounts" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Bank Accounts"
                        description="Manage bank accounts and balances"
                    />
                    <Link
                        href={route('bank-accounts.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Account
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search account name/number..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="w-44">
                            <select
                                className="input w-full"
                                value={data.bank_id}
                                onChange={(e) => {
                                    setData('bank_id', e.target.value);
                                    setData('branch_id', '');
                                    setData('page', 1);
                                }}
                            >
                                <option value="">All Banks</option>
                                {banks.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-44">
                            <select
                                className="input w-full"
                                value={data.branch_id}
                                onChange={(e) => {
                                    setData('branch_id', e.target.value);
                                    setData('page', 1);
                                }}
                                disabled={!data.bank_id}
                            >
                                <option value="">All Branches</option>
                                {filteredBranches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-36">
                            <select
                                className="input w-full"
                                value={data.status}
                                onChange={(e) => {
                                    setData('status', e.target.value);
                                    setData('page', 1);
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Account Name',
                                    'Account Number',
                                    'Bank',
                                    'Branch',
                                    'Balance',
                                    'Currency',
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
                            {accounts.data.length > 0 ? (
                                accounts.data.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            {a.account_name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.account_number}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.bank?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.branch?.name || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.balance.toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.currency}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.status}
                                        </td>
                                        <td className="flex space-x-2 px-2 py-1">
                                            <Link
                                                href={route(
                                                    'bank-accounts.edit',
                                                    a.id,
                                                )}
                                                className="text-success"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Link>
                                            <button
                                                disabled={processing}
                                                onClick={() =>
                                                    handleDelete(
                                                        a.id,
                                                        a.account_name,
                                                    )
                                                }
                                                className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No bank accounts found.
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
