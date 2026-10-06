import { appSwal } from '@/lib/appSwal';
import type { Customer } from '@/types/customer_kyc_module';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    CreditCard,
    Search,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import {
    ResourcePageHeader,
    StatusBadge,
} from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import {
    FinancialAccountSearchInput,
    type FinancialAccountSearchResult,
} from './components/financial-account-search-input';

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

interface CustomerDepositPageProps extends Record<string, unknown> {
    customer: Customer | null;
    selectedAccount: FinancialAccountSearchResult | null;
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

    const {
        customer,
        selectedAccount: initialSelectedAccount,
        customerAccounts,
        obligations,
        totals,
        teller_sessions,
    } = usePage<CustomerDepositPageProps>().props;
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        customer ?? null,
    );
    const [selectedAccount, setSelectedAccount] =
        useState<FinancialAccountSearchResult | null>(initialSelectedAccount);
    const [selectedTellerSessionId, setSelectedTellerSessionId] = useState(
        teller_sessions.length === 1 ? String(teller_sessions[0].id) : '',
    );
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>(
        {},
    );
    const [note, setNote] = useState('');

    const selectedTellerSession = useMemo(
        () =>
            teller_sessions.find(
                (session) => String(session.id) === selectedTellerSessionId,
            ) ?? null,
        [selectedTellerSessionId, teller_sessions],
    );

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

    const handleSelectAccount = (account: FinancialAccountSearchResult) => {
        if (!account.holder) return;

        setSelectedAccount(account);
        setSelectedCustomer(account.holder);
        setSelectedTellerSessionId(
            teller_sessions.length === 1 ? String(teller_sessions[0].id) : '',
        );
        setDepositAmount('');
        setSelectedRows({});
        setNote('');

        router.get(
            route('teller-transactions.customer-deposit'),
            { customer_id: account.holder.id, account_id: account.id },
            { preserveState: true, replace: true },
        );
    };

    const toggleRow = (id: string) => {
        setSelectedRows((current) => ({ ...current, [id]: !current[id] }));
    };

    const selectedObligationIds = obligations
        .filter((row) => selectedRows[row.id])
        .map((row) => row.id);

    const submit = () => {
        if (
            !selectedCustomer ||
            !selectedTellerSessionId ||
            selectedObligationIds.length === 0
        ) {
            return;
        }

        appSwal
            .fire({
                title: 'Post this customer deposit?',
                text: `Post a teller deposit of ${depositAmount || totalSelected.toFixed(2)} for ${selectedCustomer.name}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Post deposit',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route('teller-transactions.customer-deposit.store'),
                    {
                        teller_session_id: selectedTellerSessionId,
                        customer_id: selectedCustomer.id,
                        account_id: selectedAccount?.id,
                        amount: depositAmount || totalSelected.toFixed(2),
                        selected: selectedObligationIds,
                        note,
                    },
                    { preserveScroll: true },
                );
            });
    };

    const canSubmit =
        Boolean(selectedCustomer) &&
        Boolean(selectedTellerSessionId) &&
        selectedObligationIds.length > 0 &&
        Number(depositAmount || totalSelected || 0) > 0;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Deposit" />
            <div className="space-y-3 text-foreground">
                <ResourcePageHeader
                    title="Customer Deposit"
                    description="Review accounts and post a teller deposit."
                    action={<StatusBadge tone="info">Teller ready</StatusBadge>}
                />

                <div className="w-full pr-1 lg:w-1/2">
                    <FinancialAccountSearchInput
                        onSelect={handleSelectAccount}
                        initialAccount={selectedAccount}
                        scope="customer"
                        placeholder="Search customer or financial account"
                    />
                </div>

                {!selectedCustomer && (
                    <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed bg-card px-6 py-8 text-center">
                        <div className="max-w-md">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Search className="h-5 w-5" />
                            </div>
                            <h2 className="text-base font-semibold">
                                Search for a customer to begin
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Search by customer name or number, account name,
                                or account number to review balances and due
                                obligations.
                            </p>
                        </div>
                    </div>
                )}

                {selectedCustomer && (
                    <>
                        <div className="grid gap-2 xl:grid-cols-2">
                            {/* Customer */}
                            <div className="flex min-w-0 items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted">
                                    {selectedCustomer.photo?.url ? (
                                        <img
                                            src={selectedCustomer.photo.url}
                                            alt={selectedCustomer.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                            {selectedCustomer.name?.charAt(0) ??
                                                '?'}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="truncate text-sm font-semibold">
                                            {selectedCustomer.name}
                                        </h2>

                                        <StatusBadge tone="success">
                                            {selectedCustomer.status}
                                        </StatusBadge>
                                    </div>

                                    <div className="flex flex-wrap gap-x-2.5 text-[11px] text-muted-foreground">
                                        <span>
                                            {selectedCustomer.customer_no}
                                        </span>
                                        <span>{selectedCustomer.type}</span>
                                        <span>
                                            {selectedCustomer.primary_phone ??
                                                'No phone'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Teller Session */}
                            <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-2.5 py-2">
                                <div className="min-w-0 flex-1">
                                    <label
                                        htmlFor="customer-deposit-session"
                                        className="mb-1 block text-[11px] font-medium text-muted-foreground"
                                    >
                                        Teller Session
                                    </label>

                                    <Select
                                        id="customer-deposit-session"
                                        className="h-8 px-2 text-xs font-medium"
                                        value={selectedTellerSessionId}
                                        onChange={(value) =>
                                            setSelectedTellerSessionId(value)
                                        }
                                        placeholder="Select session"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select session',
                                            },
                                            ...teller_sessions.map(
                                                (session) => ({
                                                    value: String(session.id),
                                                    label: `${session.teller?.name ?? 'Teller'} (${session.teller?.code ?? '-'}) — ${session.branch_day?.business_date ?? '-'}`,
                                                }),
                                            ),
                                        ]}
                                    />
                                </div>

                                <div className="shrink-0 border-l pl-3">
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Expected Cash
                                    </div>

                                    <div className="text-sm font-bold text-foreground tabular-nums">
                                        BDT{' '}
                                        {Number(
                                            selectedTellerSession?.expected_cash ??
                                                selectedTellerSession?.opening_cash ??
                                                0,
                                        ).toLocaleString('en-BD', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 divide-x overflow-hidden rounded-lg border bg-card">
                            <div className="px-3 py-2">
                                <div className="text-xs text-muted-foreground">
                                    Current month
                                </div>
                                <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                    BDT {totals.current_due.toFixed(2)}
                                </div>
                            </div>
                            <div className="px-3 py-2">
                                <div className="text-xs text-muted-foreground">
                                    Previous months
                                </div>
                                <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                    BDT {totals.previous_due.toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-primary/4 px-3 py-2">
                                <div className="text-xs font-medium text-primary">
                                    Total due
                                </div>
                                <div className="mt-0.5 text-sm font-semibold text-primary tabular-nums">
                                    BDT {totals.total_due.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="grid items-start gap-4 xl:grid-cols-2">
                            <div className="flex h-90 min-h-0 flex-col overflow-hidden rounded-lg border bg-card sm:h-105">
                                <div className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <WalletCards className="h-4 w-4 text-primary" />
                                        Customer accounts
                                    </div>
                                    <StatusBadge tone="info">
                                        {customerAccounts.length} accounts
                                    </StatusBadge>
                                </div>
                                {customerAccounts.length > 0 ? (
                                    <div className="min-h-0 flex-1 overflow-auto">
                                        <table className="w-full min-w-150 text-sm">
                                            <thead className="sticky top-0 z-10 bg-muted text-left text-xs text-muted-foreground">
                                                <tr>
                                                    <th className="px-3 py-1.5 font-medium">
                                                        Account
                                                    </th>
                                                    <th className="px-3 py-1.5 font-medium">
                                                        Type
                                                    </th>
                                                    <th className="px-3 py-1.5 text-right font-medium">
                                                        Balance
                                                    </th>
                                                    <th className="px-3 py-1.5 text-right font-medium">
                                                        Available
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {customerAccounts.map(
                                                    (account) => (
                                                        <tr
                                                            key={account.id}
                                                            className="hover:bg-muted/30"
                                                        >
                                                            <td className="px-3 py-1.5">
                                                                <div className="font-medium">
                                                                    {
                                                                        account.account_no
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {account.name ??
                                                                        'Unnamed account'}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-1.5 text-xs text-muted-foreground">
                                                                {account.account_type.replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-right tabular-nums">
                                                                BDT{' '}
                                                                {account.balance.toFixed(
                                                                    2,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                                                                BDT{' '}
                                                                {account.available_balance.toFixed(
                                                                    2,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="px-3 py-4 text-sm text-muted-foreground">
                                        No eligible savings, share, recurring
                                        deposit, or loan account found for this
                                        customer.
                                    </div>
                                )}
                            </div>

                            <div className="flex h-90 min-h-0 flex-col overflow-hidden rounded-lg border bg-card sm:h-105">
                                <div className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        Obligations
                                    </div>
                                    <StatusBadge tone="warning">
                                        {obligations.length} items
                                    </StatusBadge>
                                </div>

                                {obligations.length > 0 ? (
                                    <div className="min-h-0 flex-1 overflow-auto">
                                        <table className="w-full min-w-145 border-collapse text-sm">
                                            <thead className="sticky top-0 z-10 bg-muted text-left text-muted-foreground">
                                                <tr>
                                                    <th className="border-b px-2 py-1.5">
                                                        Select
                                                    </th>
                                                    <th className="border-b px-2 py-1.5">
                                                        Account
                                                    </th>
                                                    <th className="border-b px-2 py-1.5">
                                                        Due type
                                                    </th>
                                                    <th className="border-b px-2 py-1.5">
                                                        Month
                                                    </th>
                                                    <th className="border-b px-2 py-1.5 text-right">
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
                                                        <td className="px-2 py-1.5">
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
                                                                className="h-4 w-4 accent-primary"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            {row.account_type}
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            {row.due_type}
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            {row.month}
                                                        </td>
                                                        <td className="px-2 py-1.5 text-right font-medium tabular-nums">
                                                            BDT{' '}
                                                            {row.amount.toFixed(
                                                                2,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
                                        No obligation details are available for
                                        this customer yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full rounded-lg border bg-card p-3">
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Deposit summary
                            </div>
                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] md:items-end">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
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
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
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

                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                    <div className="grid grid-cols-3 divide-x rounded-md bg-muted/40 py-2 text-xs">
                                        <div className="min-w-0 px-2">
                                            <span className="block truncate text-muted-foreground">
                                                Selected due
                                            </span>
                                            <span className="mt-0.5 block truncate font-medium tabular-nums">
                                                BDT {totalSelected.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 px-2">
                                            <span className="block truncate text-muted-foreground">
                                                Entered
                                            </span>
                                            <span className="mt-0.5 block truncate font-medium tabular-nums">
                                                BDT{' '}
                                                {Number(
                                                    depositAmount ||
                                                        totalSelected ||
                                                        0,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 px-2">
                                            <span className="block truncate text-muted-foreground">
                                                Difference
                                            </span>
                                            <span className="mt-0.5 block truncate font-medium tabular-nums">
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
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" type="button">
                                            Review
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={submit}
                                            disabled={!canSubmit}
                                        >
                                            <ArrowDownToLine className="mr-2 h-4 w-4" />
                                            Submit deposit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
