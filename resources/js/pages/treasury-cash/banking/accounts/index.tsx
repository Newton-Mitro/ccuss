import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../../components/data-table-pagination';
import HeadingSmall from '../../../../components/heading-small';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface BankAccountListItem {
    id: number;
    account_name: string;
    account_number: string;
    routing_number?: string | null;
    account_type: 'CURRENT' | 'SAVINGS' | 'FDR' | 'OTHER';
    opening_balance: string | number;
    is_reconcilable: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    bank?: { name: string; code: string } | null;
    branch?: { name: string; code: string } | null;
}

interface BankAccountIndexProps extends SharedData {
    accounts: {
        data: BankAccountListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { accounts, filters, auth } = usePage<BankAccountIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('bank-accounts.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Bank Accounts', href: route('bank-accounts.index') },
    ];
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Accounts" />
            <div className="space-y-4 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Bank Accounts"
                        description="Review bank accounts, branch assignments, and reconciliation settings."
                    />
                    {permissions.has('bank_accounts.create') && (
                        <Button
                            type="button"
                            onClick={() =>
                                (window.location.href = route(
                                    'bank-accounts.create',
                                ))
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Create bank account
                        </Button>
                    )}
                </div>
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search account, bank, or branch..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-240 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Account',
                                    'Bank',
                                    'Branch',
                                    'Type',
                                    'Opening Balance',
                                    'Reconciliation',
                                    'Status',
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
                            {accounts.data.length > 0 ? (
                                accounts.data.map((account, index) => (
                                    <tr
                                        key={account.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(accounts.current_page - 1) *
                                                accounts.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {account.account_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {account.account_number}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.bank?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.branch?.name ??
                                                'Organization-wide'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.account_type}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.opening_balance}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.is_reconcilable
                                                ? 'Yes'
                                                : 'No'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {account.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No bank accounts found for this
                                        organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={accounts.per_page}
                    currentPage={accounts.current_page}
                    totalItems={accounts.total}
                    totalPages={accounts.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', accounts.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, accounts.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
