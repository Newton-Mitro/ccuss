import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import ReportExportActions from '@/components/report-export-actions';
import { ResourceEmptyState } from '@/components/resource-page-shell';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { AccountBalancesReportPageProps } from '@/modules/financial-services/types/financial-services';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
export default function AccountBalancesReport() {
    const { accounts, products, filters } =
        usePage<AccountBalancesReportPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        { title: 'Account Balances', href: '' },
    ];
    const isEmpty = accounts.data.length === 0;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Balances" />
            <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Account balances"
                        description="Current and available balances across financial accounts."
                    />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Select
                        className="w-full bg-card sm:w-72"
                        value={String(filters.product_id ?? '')}
                        onChange={(value) =>
                            router.get(
                                route('financial-reports.account-balances'),
                                {
                                    product_id: value || undefined,
                                    per_page: accounts.per_page,
                                    page: 1,
                                },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        options={[
                            { value: '', label: 'All products' },
                            ...products.map((product) => ({
                                value: String(product.id),
                                label: `${product.code} · ${product.name}`,
                            })),
                        ]}
                    />
                    <ReportExportActions
                        report="account-balances"
                        query={{
                            product_id: filters.product_id || undefined,
                        }}
                    />
                </div>
                {isEmpty ? (
                    <ResourceEmptyState
                        title="No account balances found"
                        description="No financial accounts match the selected product."
                    />
                ) : (
                    <>
                        <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                            <table className="w-full min-w-[720px] border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Account',
                                            'Product',
                                            'Status',
                                            'Balance',
                                            'Available',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className={`border-b p-2 text-left text-sm font-medium ${header === 'Balance' || header === 'Available' ? 'text-right' : ''}`}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.data.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                <div className="font-medium">
                                                    {account.name ||
                                                        account.account_no}
                                                </div>
                                                {account.name && (
                                                    <div className="font-mono text-xs text-muted-foreground">
                                                        {account.account_no}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                {account.product?.name ??
                                                    account.account_type}
                                            </td>
                                            <td className="px-2 py-1">
                                                {account.status}
                                            </td>
                                            <td className="px-2 py-1 text-right tabular-nums">
                                                {formatBDTCurrency(
                                                    account.balance,
                                                    false,
                                                )}
                                            </td>
                                            <td className="px-2 py-1 text-right tabular-nums">
                                                {formatBDTCurrency(
                                                    account.available_balance,
                                                    false,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <DataTablePagination
                            perPage={accounts.per_page}
                            links={accounts.links}
                            onPerPageChange={(perPage) =>
                                router.get(
                                    route('financial-reports.account-balances'),
                                    {
                                        product_id:
                                            filters.product_id || undefined,
                                        per_page: perPage,
                                        page: 1,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        />
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
