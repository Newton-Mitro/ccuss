import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    CheckCircle2,
    ReceiptText,
} from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../../components/data-table-pagination';
import HeadingSmall from '../../../../components/heading-small';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface PettyCashTransactionListItem {
    id: number;
    transaction_no: string;
    type: 'FUNDING' | 'EXPENSE' | 'REPLENISHMENT' | 'RETURN' | 'ADJUSTMENT';
    amount: string | number;
    status: 'PENDING' | 'POSTED' | 'CANCELLED';
    payee?: string | null;
    description?: string | null;
    branch_day?: { business_date: string } | null;
    petty_cash_fund?: { code: string; name: string } | null;
}

interface PettyCashTransactionIndexProps extends SharedData {
    transactions: {
        data: PettyCashTransactionListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { transactions, filters, auth } =
        usePage<PettyCashTransactionIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canPost = permissions.has('petty_cash.expense');
    const canFund = permissions.has('petty_cash.create');
    const canExpense = permissions.has('petty_cash.expense');

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('petty-cash-transactions.index'), {
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
            title: 'Petty Cash Transactions',
            href: route('petty-cash-transactions.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Transactions" />
            <div className="space-y-4 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Petty Cash Transactions"
                        description="Review and post pending petty cash funding and expenses."
                    />
                    <div className="flex flex-wrap gap-2">
                        {canFund && (
                            <Button asChild variant="outline">
                                <Link
                                    href={route(
                                        'petty-cash-transactions.funding',
                                    )}
                                >
                                    <ArrowDownToLine className="h-4 w-4" />
                                    Add funding
                                </Link>
                            </Button>
                        )}
                        {canExpense && (
                            <Button asChild>
                                <Link
                                    href={route(
                                        'petty-cash-transactions.expense',
                                    )}
                                >
                                    <ArrowUpFromLine className="h-4 w-4" />
                                    Add expense
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search transaction, fund, payee, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-260 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Transaction',
                                    'Fund',
                                    'Business Date',
                                    'Type',
                                    'Amount',
                                    'Payee',
                                    'Status',
                                    'Actions',
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
                            {transactions.data.length > 0 ? (
                                transactions.data.map((transaction, index) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(transactions.current_page - 1) *
                                                transactions.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <ReceiptText className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            transaction.transaction_no
                                                        }
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {transaction.description ??
                                                            '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.petty_cash_fund
                                                ?.name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.branch_day
                                                ?.business_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.type}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.amount}
                                        </td>
                                        <td className="px-2 py-2">
                                            {transaction.payee ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            {canPost &&
                                                transaction.status ===
                                                    'PENDING' && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.post(
                                                                route(
                                                                    'petty-cash-transactions.post',
                                                                    transaction.id,
                                                                ),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        aria-label={`Post ${transaction.transaction_no}`}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                                    </Button>
                                                )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No petty cash transactions found for
                                        this branch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={transactions.per_page}
                    currentPage={transactions.current_page}
                    totalItems={transactions.total}
                    totalPages={transactions.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() =>
                        setData('page', transactions.current_page + 1)
                    }
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, transactions.current_page - 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
