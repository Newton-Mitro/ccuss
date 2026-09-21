import { Button } from '@/components/ui/button';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { WalletCards } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../../components/data-table-pagination';
import HeadingSmall from '../../../../components/heading-small';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface PettyCashFundListItem {
    id: number;
    code: string;
    name: string;
    fund_limit: string | number;
    current_balance: string | number;
    method: 'IMPREST' | 'VARIABLE';
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    custodian?: { name: string } | null;
    cash_location?: { branch?: { name: string; code: string } | null } | null;
}

interface PettyCashIndexProps extends SharedData {
    funds: {
        data: PettyCashFundListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { funds, filters } = usePage<PettyCashIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('petty-cash-accounts.index'), {
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
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Accounts" />
            <div className="space-y-4 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Petty Cash Accounts"
                        description="Review petty cash funds, custodians, limits, and available balances."
                    />
                    <Button asChild>
                        <Link href={route('petty-cash-accounts.create')}>
                            Create Fund
                        </Link>
                    </Button>
                </div>
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search fund, code, or branch..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-240 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Fund',
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
                            {funds.data.length > 0 ? (
                                funds.data.map((fund, index) => (
                                    <tr
                                        key={fund.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(funds.current_page - 1) *
                                                funds.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <WalletCards className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {fund.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {fund.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {fund.cash_location?.branch?.name ??
                                                '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {fund.custodian?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {fund.method}
                                        </td>
                                        <td className="px-2 py-2">
                                            {fund.current_balance}
                                        </td>
                                        <td className="px-2 py-2">
                                            {fund.fund_limit}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {fund.status}
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
                                        No petty cash funds found for this
                                        organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={funds.per_page}
                    currentPage={funds.current_page}
                    totalItems={funds.total}
                    totalPages={funds.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', funds.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, funds.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
