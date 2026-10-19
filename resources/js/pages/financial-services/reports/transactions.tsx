import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import { BreadcrumbItem } from '@/types';
import type { TransactionsReportPageProps } from '@/types/financial-services';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { route } from 'ziggy-js';
import ReportExportActions from '../../../components/report-export-actions';
import { Select } from '../../../components/ui/select';

export default function TransactionReport() {
    const { transactions, filters } =
        usePage<TransactionsReportPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transaction Report', href: '' },
    ];
    const isEmpty = transactions.data.length === 0;

    const updateReport = (query: {
        status?: string;
        per_page: number;
        page: number;
    }) =>
        router.get(route('financial-reports.transactions'), query, {
            preserveState: true,
            preserveScroll: true,
        });

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Report" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Transaction report"
                    description="Operational movements across financial accounts."
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Select
                        className="w-full bg-card sm:w-72"
                        value={filters.status ?? ''}
                        onChange={(status) =>
                            updateReport({
                                status: status || undefined,
                                per_page: transactions.per_page,
                                page: 1,
                            })
                        }
                        options={[
                            { value: '', label: 'All statuses' },
                            { value: 'PENDING', label: 'Pending' },
                            { value: 'POSTED', label: 'Posted' },
                            { value: 'REVERSED', label: 'Reversed' },
                            { value: 'CANCELLED', label: 'Cancelled' },
                        ]}
                    />
                    <ReportExportActions
                        report="transactions"
                        query={{ status: filters.status || undefined }}
                    />
                </div>
                {isEmpty ? (
                    <ResourceEmptyState
                        title="No transactions found"
                        description="No financial transactions match the selected status."
                    />
                ) : (
                    <>
                        <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Number',
                                            'Account',
                                            'Date',
                                            'Type',
                                            'Amount',
                                            'Status',
                                            'Actions',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className={`border-b p-2 text-left text-sm font-medium ${header === 'Amount' ? 'text-right' : ''}`}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1 font-mono text-xs">
                                                {transaction.transaction_no}
                                            </td>
                                            <td className="px-2 py-1">
                                                {transaction.entries
                                                    ?.map(
                                                        (entry) =>
                                                            entry
                                                                .financial_account
                                                                ?.account_no,
                                                    )
                                                    .filter(Boolean)
                                                    .join(', ') || '-'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {formatDate(
                                                    transaction.transaction_date,
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                {transaction.transaction_type}
                                            </td>
                                            <td className="px-2 py-1 text-right tabular-nums">
                                                {formatBDTCurrency(
                                                    transaction.amount,
                                                    false,
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                {transaction.status}
                                            </td>
                                            <td className="px-2 py-1">
                                                <Link
                                                    href={route(
                                                        'financial-transactions.show',
                                                        transaction.id,
                                                    )}
                                                    aria-label={`View transaction ${transaction.transaction_no}`}
                                                    title="View transaction"
                                                    className="inline-flex rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <DataTablePagination
                            perPage={transactions.per_page}
                            links={transactions.links}
                            onPerPageChange={(perPage) =>
                                updateReport({
                                    status: filters.status || undefined,
                                    per_page: perPage,
                                    page: 1,
                                })
                            }
                        />
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
