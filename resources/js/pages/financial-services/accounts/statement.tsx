import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { route } from 'ziggy-js';

interface Account {
    id: number;
    account_no: string;
    name?: string;
    account_type: string;
}
interface Movement {
    id: number;
    transaction_no: string;
    transaction_type: string;
    amount: string | number;
    status: string;
    transaction_date: string;
}
interface SelectedAccount extends Account {
    transactions?: Movement[];
    balance?: string | number;
}

export default function AccountStatement() {
    const { accounts, account } = usePage<{
        accounts: Account[];
        account?: SelectedAccount | null;
    }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Account Statements', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Statements" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account statements"
                    description="Review the operational movement history for a financial account."
                />
                <div className="max-w-xl rounded-xl border bg-card p-4 shadow-sm">
                    <Label>Financial account</Label>
                    <Select
                        value={account ? String(account.id) : ''}
                        onChange={(value) =>
                            router.get(
                                route('financial-account-statements.index'),
                                { account_id: value },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        options={[
                            { value: '', label: 'Select account' },
                            ...accounts.map((item) => ({
                                value: String(item.id),
                                label: `${item.account_no} - ${item.name ?? item.account_type}`,
                            })),
                        ]}
                    />
                </div>
                {account ? (
                    <ResourceTableCard>
                        <div className="flex items-center gap-3 border-b p-4">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold">
                                    {account.account_no}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {account.name ?? account.account_type}
                                </p>
                            </div>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Transaction</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2 text-right">
                                        Amount
                                    </th>
                                    <th className="px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(account.transactions ?? []).map(
                                    (movement) => (
                                        <tr
                                            key={movement.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-3 py-2">
                                                {movement.transaction_date}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs">
                                                {movement.transaction_no}
                                            </td>
                                            <td className="px-3 py-2">
                                                {movement.transaction_type}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums">
                                                {Number(
                                                    movement.amount,
                                                ).toFixed(4)}
                                            </td>
                                            <td className="px-3 py-2">
                                                {movement.status}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </ResourceTableCard>
                ) : (
                    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                        Select an account to view its statement.
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
