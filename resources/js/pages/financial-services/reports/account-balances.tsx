import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { AccountBalancesReportPageProps } from '@/types/financial-services';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import ReportExportActions from '../../../components/report-export-actions';
import { Select } from '../../../components/ui/select';
export default function AccountBalancesReport() {
    const { accounts, products, filters } =
        usePage<AccountBalancesReportPageProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Account Balances', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Balances" />
            <div className="space-y-4">
                <ReportExportActions
                    report="account-balances"
                    query={{
                        product_id: filters.product_id || undefined,
                    }}
                />
                <ResourcePageHeader
                    title="Account balances"
                    description="Current and available balances across financial accounts."
                />
                <div className="flex flex-wrap items-center gap-2">
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
                </div>
                <ResourceTableCard>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">Account</th>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">
                                    Balance
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Available
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.data.map((account) => (
                                <tr
                                    key={account.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="px-3 py-2 font-mono text-xs">
                                        {account.account_no}
                                    </td>
                                    <td className="px-3 py-2">
                                        {account.product?.name ??
                                            account.account_type}
                                    </td>
                                    <td className="px-3 py-2">
                                        {account.status}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {Number(account.balance).toFixed(4)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {Number(
                                            account.available_balance,
                                        ).toFixed(4)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={accounts.per_page}
                    links={accounts.links}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('financial-reports.account-balances'),
                            {
                                product_id: filters.product_id || undefined,
                                per_page: perPage,
                                page: 1,
                            },
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
