import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { AdvanceAccountIndexProps } from '@/types/treasury-cash/advance-accounts';
import { Head, useForm, usePage } from '@inertiajs/react';
import { HandCoins } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function Index() {
    const { advance_accounts, filters } =
        usePage<AdvanceAccountIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('petty-cash-advance-accounts.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: 'Advance Accounts',
            href: route('petty-cash-advance-accounts.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Advance Accounts" />
            <div className="space-y-4 text-foreground">
                <ResourcePageHeader
                    title="Advance Accounts"
                    description="Track petty cash advance accounts, custodians, and balances for the active branch."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search advance account or custodian..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                {advance_accounts.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No advance accounts found"
                        description="Create an advance account to begin petty cash tracking."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-240 border-collapse text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        '#',
                                        'Account',
                                        'Branch',
                                        'Custodian',
                                        'Method',
                                        'Balance',
                                        'Limit',
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
                                {advance_accounts.data.map((account, index) => (
                                    <tr
                                        key={account.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(advance_accounts.current_page -
                                                1) *
                                                advance_accounts.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <HandCoins className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {account.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {account.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.branch_name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.custodian_name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.method}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.current_balance}
                                        </td>
                                        <td className="px-2 py-2">
                                            {account.fund_limit}
                                        </td>
                                        <td className="px-2 py-2">
                                            <StatusBadge
                                                tone={
                                                    account.status === 'ACTIVE'
                                                        ? 'success'
                                                        : account.status ===
                                                            'INACTIVE'
                                                          ? 'warning'
                                                          : 'neutral'
                                                }
                                            >
                                                {account.status}
                                            </StatusBadge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <DataTablePagination
                    perPage={advance_accounts.per_page}
                    currentPage={advance_accounts.current_page}
                    totalItems={advance_accounts.total}
                    totalPages={advance_accounts.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() =>
                        setData('page', advance_accounts.current_page + 1)
                    }
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, advance_accounts.current_page - 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
