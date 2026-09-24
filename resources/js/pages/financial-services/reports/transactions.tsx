import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { TransactionsReportPageProps } from '@/types/financial-services';
import { Head, router, usePage } from '@inertiajs/react';
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
                <ReportExportActions
                    report="transactions"
                    query={{ status: filters.status || undefined }}
                />
                <ResourcePageHeader
                    title="Transaction report"
                    description="Operational movements across financial accounts."
                />
                <Select
                    className="w-full bg-card sm:w-56"
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
                <ResourceTableCard>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">Number</th>
                                <th className="px-3 py-2">Account</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="px-3 py-2 font-mono text-xs">
                                        {transaction.transaction_no}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.entries
                                            ?.map(
                                                (entry) =>
                                                    entry.financial_account
                                                        ?.account_no,
                                            )
                                            .filter(Boolean)
                                            .join(', ') || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.transaction_date}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.transaction_type}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {Number(transaction.amount).toFixed(4)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {transaction.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ResourceTableCard>
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
            </div>
        </CustomAuthLayout>
    );
}
