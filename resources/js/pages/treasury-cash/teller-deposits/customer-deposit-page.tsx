import { CustomerSearchBox } from '@/pages/customer-kyc/customers/components/customer-search-box';
import type { Customer } from '@/types/customer_kyc_module';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    CalendarRange,
    CreditCard,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import {
    ResourcePageHeader,
    StatusBadge,
} from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface CustomerAccount {
    id: number;
    account_type: string;
    account_no: string;
    name: string | null;
    balance: number;
    available_balance: number;
}

interface ObligationsRow {
    id: string;
    account_id: number;
    account_type: string;
    due_type: string;
    month: string;
    amount: number;
}

interface TellerSessionOption {
    id: number;
    teller?: { name: string; code: string } | null;
    branch_day?: { business_date: string } | null;
    opening_cash?: string | number;
    expected_cash?: string | number | null;
}

interface CustomerDepositPageProps {
    customer: Customer | null;
    customerAccounts: CustomerAccount[];
    obligations: ObligationsRow[];
    totals: {
        current_due: number;
        previous_due: number;
        total_due: number;
    };
    teller_sessions: TellerSessionOption[];
    filters: { customer_id?: string };
}

export default function CustomerDepositPage() {
    useFlashToastHandler();

    const { customer, customerAccounts, obligations, totals, teller_sessions } =
        usePage<CustomerDepositPageProps>().props;
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        customer ?? null,
    );
    const [selectedTellerSessionId, setSelectedTellerSessionId] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>(
        {},
    );
    const [note, setNote] = useState('');

    useEffect(() => {
        setSelectedCustomer(customer ?? null);
        setDepositAmount('');
        setSelectedRows({});
        setNote('');
    }, [customer]);

    const totalSelected = useMemo(
        () =>
            obligations
                .filter((row) => selectedRows[row.id])
                .reduce((sum, row) => sum + Number(row.amount || 0), 0),
        [obligations, selectedRows],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        {
            title: 'Customer Deposit',
            href: route('teller-transactions.customer-deposit'),
        },
    ];

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        router.get(
            route('teller-transactions.customer-deposit'),
            { customer_id: customer.id },
            { preserveState: true, replace: true },
        );
    };

    const toggleRow = (id: string) => {
        setSelectedRows((current) => ({ ...current, [id]: !current[id] }));
    };

    const submit = () => {
        if (!selectedCustomer || !selectedTellerSessionId) {
            return;
        }

        router.post(
            route('teller-transactions.customer-deposit.store'),
            {
                teller_session_id: selectedTellerSessionId,
                customer_id: selectedCustomer.id,
                amount: depositAmount || totalSelected.toFixed(2),
                selected: obligations
                    .filter((row) => selectedRows[row.id])
                    .map((row) => row.id),
                note,
            },
            { preserveScroll: true },
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Deposit" />
            <div className="space-y-5 text-foreground">
                <ResourcePageHeader
                    title="Customer Deposit"
                    description="Search a customer, review due obligations, and post a teller deposit."
                    action={<StatusBadge tone="info">Teller ready</StatusBadge>}
                />

                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-3 text-sm font-medium text-foreground">
                        <Search className="h-4 w-4 text-primary" />
                        Customer lookup
                    </div>

                    <CustomerSearchBox
                        onSelect={handleSelectCustomer}
                        label="Search customer"
                        selectedCustomer={selectedCustomer ?? undefined}
                        placeholder="Search by name, customer number, or ID"
                    />
                </div>

                {selectedCustomer && (
                    <>
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-xl border bg-card p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-base font-semibold">
                                        Customer summary
                                    </h2>
                                    <StatusBadge tone="success">
                                        {selectedCustomer.status}
                                    </StatusBadge>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="customer-deposit-session"
                                        className="mb-1 block text-sm font-medium"
                                    >
                                        Open teller session
                                    </label>
                                    <select
                                        id="customer-deposit-session"
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        value={selectedTellerSessionId}
                                        onChange={(event) =>
                                            setSelectedTellerSessionId(
                                                event.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select teller session
                                        </option>
                                        {teller_sessions.map((session) => (
                                            <option
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {session.teller?.name ??
                                                    'Teller'}{' '}
                                                ({session.teller?.code ?? '-'})
                                                -{' '}
                                                {session.branch_day
                                                    ?.business_date ?? '-'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="h-16 w-16 overflow-hidden rounded-full border bg-muted">
                                        {selectedCustomer.photo?.url ? (
                                            <img
                                                src={selectedCustomer.photo.url}
                                                alt={selectedCustomer.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                                                {selectedCustomer.name?.charAt(
                                                    0,
                                                ) ?? '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-semibold">
                                            {selectedCustomer.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedCustomer.customer_no} •{' '}
                                            {selectedCustomer.type}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedCustomer.primary_phone ??
                                                'No phone'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                    <CalendarRange className="h-4 w-4 text-primary" />
                                    Due summary
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                                        <span className="text-sm text-muted-foreground">
                                            Current month
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            BDT {totals.current_due.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                                        <span className="text-sm text-muted-foreground">
                                            Previous months
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            BDT {totals.previous_due.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
                                        <span className="text-sm font-medium text-primary">
                                            Total due
                                        </span>
                                        <span className="font-semibold text-primary">
                                            BDT {totals.total_due.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {customerAccounts.length > 0 ? (
                                customerAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="rounded-xl border bg-card p-4 shadow-sm"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {account.account_type}
                                            </span>
                                            <StatusBadge tone="info">
                                                Active
                                            </StatusBadge>
                                        </div>
                                        <div className="text-base font-semibold">
                                            {account.account_no}
                                        </div>
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            {account.name ?? 'Unnamed account'}
                                        </div>
                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-muted-foreground">
                                                    Balance
                                                </span>
                                                <span className="font-medium">
                                                    BDT{' '}
                                                    {account.balance.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-muted-foreground">
                                                    Available
                                                </span>
                                                <span className="font-medium">
                                                    BDT{' '}
                                                    {account.available_balance.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground md:col-span-2 xl:col-span-4">
                                    No eligible savings, share, recurring
                                    deposit, or loan account found for this
                                    customer.
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border bg-card p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Obligations
                                </div>
                                <StatusBadge tone="warning">
                                    {obligations.length} items
                                </StatusBadge>
                            </div>

                            {obligations.length > 0 ? (
                                <div className="overflow-auto rounded-md border">
                                    <table className="w-full min-w-[700px] border-collapse text-sm">
                                        <thead className="bg-muted text-left text-muted-foreground">
                                            <tr>
                                                <th className="border-b p-2">
                                                    Select
                                                </th>
                                                <th className="border-b p-2">
                                                    Account
                                                </th>
                                                <th className="border-b p-2">
                                                    Due type
                                                </th>
                                                <th className="border-b p-2">
                                                    Month
                                                </th>
                                                <th className="border-b p-2 text-right">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {obligations.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="border-b even:bg-muted/40"
                                                >
                                                    <td className="p-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(
                                                                selectedRows[
                                                                    row.id
                                                                ],
                                                            )}
                                                            onChange={() =>
                                                                toggleRow(
                                                                    row.id,
                                                                )
                                                            }
                                                            className="h-4 w-4"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        {row.account_type}
                                                    </td>
                                                    <td className="p-2">
                                                        {row.due_type}
                                                    </td>
                                                    <td className="p-2">
                                                        {row.month}
                                                    </td>
                                                    <td className="p-2 text-right font-medium tabular-nums">
                                                        BDT{' '}
                                                        {row.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-md border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                                    No obligation details are available for this
                                    customer yet.
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border bg-card p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Deposit summary
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Deposit amount
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                depositAmount ||
                                                totalSelected.toFixed(2)
                                            }
                                            onChange={(event) =>
                                                setDepositAmount(
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Note
                                        </label>
                                        <Input
                                            value={note}
                                            onChange={(event) =>
                                                setNote(event.target.value)
                                            }
                                            placeholder="Optional payment note"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-md border bg-muted/40 p-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Selected due
                                            </span>
                                            <span className="font-semibold">
                                                BDT {totalSelected.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Deposit entered
                                            </span>
                                            <span className="font-semibold">
                                                BDT{' '}
                                                {Number(
                                                    depositAmount ||
                                                        totalSelected ||
                                                        0,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Difference
                                            </span>
                                            <span className="font-semibold">
                                                BDT{' '}
                                                {Math.max(
                                                    0,
                                                    Number(
                                                        depositAmount ||
                                                            totalSelected,
                                                    ) - totalSelected,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" type="button">
                                    Review
                                </Button>
                                <Button type="button" onClick={submit}>
                                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                                    Submit deposit
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
