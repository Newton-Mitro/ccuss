import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import ReportExportActions from '../../../components/report-export-actions';
interface Account {
    id: number;
    account_no: string;
    account_type: string;
    status: string;
    balance: string | number;
    available_balance: string | number;
    product?: { name?: string } | null;
}
export default function AccountBalancesReport() {
    const { accounts } = usePage<{ accounts: { data: Account[] } }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Account Balances', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Balances" />
            <div className="space-y-4">
                <ReportExportActions report="account-balances" />
                <ResourcePageHeader
                    title="Account balances"
                    description="Current and available balances across financial accounts."
                />
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
            </div>
        </CustomAuthLayout>
    );
}
