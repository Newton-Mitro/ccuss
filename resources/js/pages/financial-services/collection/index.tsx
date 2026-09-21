import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type CustomerResult = {
    id: number;
    customer_no: string;
    name: string;
    primary_phone?: string | null;
};

type CollectionSummary = {
    customer: CustomerResult & {
        primary_email?: string | null;
    };
    deposit_accounts: {
        account_no?: string;
        product?: string;
        account_kind: string;
        status: string;
        balance?: string | number;
        fine_total?: string | number;
    }[];
    loan_accounts: {
        loan_no: string;
        product?: string;
        status: string;
        balance?: string | number;
        fine_total?: string | number;
        arrears_total?: string | number;
        interest_due?: string | number;
        protection_fee_due?: string | number;
        protection_policy?: { required?: boolean; status?: string } | null;
        schedules: {
            installment_no: number;
            due_date?: string;
            total_due?: string | number;
            total_paid?: string | number;
            status: string;
        }[];
    }[];
};

const money = (value?: string | number) => Number(value ?? 0).toFixed(2);

export default function CustomerCollectionIndex() {
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState<CustomerResult[]>([]);
    const [summary, setSummary] = useState<CollectionSummary | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (search.trim().length < 2) {
            setCustomers([]);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            const response = await fetch(
                route('customer-collection.search', { search }),
                {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                },
            );
            if (response.ok) {
                const result = (await response.json()) as {
                    data: CustomerResult[];
                };
                setCustomers(result.data);
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [search]);

    const selectCustomer = async (customer: CustomerResult) => {
        setLoading(true);
        setCustomers([]);
        setSearch(customer.customer_no);
        const response = await fetch(
            route('customer-collection.summary', customer.id),
            { headers: { Accept: 'application/json' } },
        );
        if (response.ok) {
            setSummary((await response.json()) as CollectionSummary);
        }
        setLoading(false);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Customer Collection',
            href: route('customer-collection.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Collection" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Customer Collection"
                    description="Review deposit and loan dues before posting a collection."
                />
                <div className="relative max-w-xl">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search customer number, name, phone, or account..."
                        className="pl-9"
                    />
                    {customers.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full border bg-card shadow-sm">
                            {customers.map((customer) => (
                                <Button
                                    key={customer.id}
                                    variant="ghost"
                                    className="h-auto w-full justify-start rounded-none px-3 py-2 text-left"
                                    onClick={() => selectCustomer(customer)}
                                >
                                    <span>
                                        <strong>{customer.name}</strong>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {customer.customer_no}{' '}
                                            {customer.primary_phone ?? ''}
                                        </span>
                                    </span>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading account summary...
                    </p>
                )}

                {summary && (
                    <div className="space-y-4">
                        <section className="border bg-card p-4">
                            <h2 className="font-semibold">
                                {summary.customer.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {summary.customer.customer_no} ·{' '}
                                {summary.customer.primary_phone ?? 'No phone'}
                            </p>
                        </section>

                        <section className="border bg-card p-4">
                            <h2 className="mb-3 font-semibold">
                                Deposit Accounts
                            </h2>
                            <div className="overflow-auto">
                                <table className="w-full min-w-sm text-sm">
                                    <thead className="border-b text-left text-muted-foreground">
                                        <tr>
                                            <th className="p-2">Account</th>
                                            <th className="p-2">Product</th>
                                            <th className="p-2">Status</th>
                                            <th className="p-2 text-right">
                                                Balance
                                            </th>
                                            <th className="p-2 text-right">
                                                Fine
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.deposit_accounts.map(
                                            (account) => (
                                                <tr
                                                    key={account.account_no}
                                                    className="border-b"
                                                >
                                                    <td className="p-2 font-mono text-xs">
                                                        {account.account_no ??
                                                            '-'}
                                                    </td>
                                                    <td className="p-2">
                                                        {account.product ??
                                                            account.account_kind}
                                                    </td>
                                                    <td className="p-2">
                                                        {account.status}
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        {money(account.balance)}
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        {money(
                                                            account.fine_total,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="border bg-card p-4">
                            <h2 className="mb-3 font-semibold">
                                Loan Accounts
                            </h2>
                            {summary.loan_accounts.map((loan) => (
                                <div
                                    key={loan.loan_no}
                                    className="mb-4 border-b pb-3 last:mb-0 last:border-0"
                                >
                                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                                        <span className="font-mono">
                                            {loan.loan_no}
                                        </span>
                                        <span>
                                            {loan.product ?? '-'} ·{' '}
                                            {loan.status}
                                        </span>
                                        <span>
                                            Balance {money(loan.balance)} ·
                                            Interest {money(loan.interest_due)}{' '}
                                            · Arrears{' '}
                                            {money(loan.arrears_total)} · Fine{' '}
                                            {money(loan.fine_total)} ·
                                            Protection{' '}
                                            {money(loan.protection_fee_due)}
                                        </span>
                                    </div>
                                    <div className="mt-2 overflow-auto">
                                        <table className="w-full min-w-sm text-xs">
                                            <thead className="text-left text-muted-foreground">
                                                <tr>
                                                    <th className="p-1">
                                                        Installment
                                                    </th>
                                                    <th className="p-1">Due</th>
                                                    <th className="p-1 text-right">
                                                        Due
                                                    </th>
                                                    <th className="p-1 text-right">
                                                        Paid
                                                    </th>
                                                    <th className="p-1">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loan.schedules.map(
                                                    (schedule) => (
                                                        <tr
                                                            key={
                                                                schedule.installment_no
                                                            }
                                                            className="border-t"
                                                        >
                                                            <td className="p-1">
                                                                {
                                                                    schedule.installment_no
                                                                }
                                                            </td>
                                                            <td className="p-1">
                                                                {schedule.due_date ??
                                                                    '-'}
                                                            </td>
                                                            <td className="p-1 text-right">
                                                                {money(
                                                                    schedule.total_due,
                                                                )}
                                                            </td>
                                                            <td className="p-1 text-right">
                                                                {money(
                                                                    schedule.total_paid,
                                                                )}
                                                            </td>
                                                            <td className="p-1">
                                                                {
                                                                    schedule.status
                                                                }
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
