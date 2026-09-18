import ReportExportActions from '@/components/report-export-actions';
import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
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

const statementPeriods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half-yearly' },
    { value: 'yearly', label: 'Yearly' },
];

export default function AccountStatement() {
    const {
        accounts,
        account,
        period,
        statementDate,
        periodStart,
        periodEnd,
        totals,
    } = usePage<{
        accounts: Account[];
        account?: SelectedAccount | null;
        period: string;
        statementDate: string;
        periodStart: string;
        periodEnd: string;
        totals: { debit: number; credit: number; count: number };
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
                {account && (
                    <ReportExportActions
                        report="account-statement"
                        query={{
                            account_id: account.id,
                            period,
                            date: statementDate,
                        }}
                    />
                )}
                <div className="grid max-w-4xl gap-3 rounded-md border bg-card p-4 sm:grid-cols-3">
                    <div>
                        <Label>Financial account</Label>
                        <Select
                            value={account ? String(account.id) : ''}
                            onChange={(value) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: value,
                                        period,
                                        date: statementDate,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
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
                    <div>
                        <Label>Statement period</Label>
                        <Select
                            value={period}
                            onChange={(value) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: account?.id,
                                        period: value,
                                        date: statementDate,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            options={statementPeriods}
                        />
                    </div>
                    <div>
                        <Label>Reference date</Label>
                        <Input
                            type="date"
                            value={statementDate}
                            onChange={(event) =>
                                router.get(
                                    route('financial-account-statements.index'),
                                    {
                                        account_id: account?.id,
                                        period,
                                        date: event.target.value,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            className="bg-background"
                        />
                    </div>
                </div>
                {account ? (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-md border bg-card p-3">
                                <p className="text-xs text-muted-foreground">
                                    Period
                                </p>
                                <p className="font-medium">
                                    {periodStart} to {periodEnd}
                                </p>
                            </div>
                            <div className="rounded-md border bg-card p-3">
                                <p className="text-xs text-muted-foreground">
                                    Debit
                                </p>
                                <p className="font-semibold tabular-nums">
                                    {Number(totals.debit).toFixed(4)}
                                </p>
                            </div>
                            <div className="rounded-md border bg-card p-3">
                                <p className="text-xs text-muted-foreground">
                                    Credit
                                </p>
                                <p className="font-semibold tabular-nums">
                                    {Number(totals.credit).toFixed(4)}
                                </p>
                            </div>
                        </div>
                        <ResourceTableCard className="h-[calc(100vh-440px)] md:h-[calc(100vh-420px)]">
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
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        <th className="border-b p-2 text-left text-sm font-medium">
                                            Date
                                        </th>
                                        <th className="border-b p-2 text-left text-sm font-medium">
                                            Transaction
                                        </th>
                                        <th className="border-b p-2 text-left text-sm font-medium">
                                            Type
                                        </th>
                                        <th className="border-b p-2 text-left text-sm font-medium">
                                            Amount
                                        </th>
                                        <th className="border-b p-2 text-left text-sm font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(account.transactions ?? []).map(
                                        (movement) => (
                                            <tr
                                                key={movement.id}
                                                className="border-b even:bg-muted hover:bg-accent/20"
                                            >
                                                <td className="px-2 py-1">
                                                    {movement.transaction_date}
                                                </td>
                                                <td className="px-2 py-1 font-mono text-xs">
                                                    {movement.transaction_no}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {movement.transaction_type}
                                                </td>
                                                <td className="px-2 py-1 text-right tabular-nums">
                                                    {Number(
                                                        movement.amount,
                                                    ).toFixed(4)}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {movement.status}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </ResourceTableCard>
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                        Select an account to view its statement.
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
