import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import {
    FinancialAccountSearchInput,
    type FinancialAccountSearchResult,
} from '@/modules/financial-services/components/financial-account-search-input';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpRight,
    CreditCard,
    Search,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { route } from 'ziggy-js';

interface CustomerAccount {
    id: number;
    account_type: string;
    account_no: string;
    name: string | null;
    balance: number;
    available_balance: number;
    last_deposit_date: string | null;
}

interface ObligationsRow {
    id: string;
    account_id: number;
    account_type: string;
    account_name: string | null;
    account_no: string;
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
    const hasClearedSelection = useRef(!customer && !initialSelectedAccount);
    const [selectedTellerSessionId, setSelectedTellerSessionId] = useState(
        teller_sessions.length === 1 ? String(teller_sessions[0].id) : '',
    );
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>(
        {},
    );
    const [obligationAmounts, setObligationAmounts] = useState<
        Record<string, string>
    >({});
    const [customerGivenAmount, setCustomerGivenAmount] = useState('');
    const [note, setNote] = useState('');
    const [reviewOpen, setReviewOpen] = useState(false);

    const selectedTellerSession = useMemo(
        () =>
            teller_sessions.find(
                (session) => String(session.id) === selectedTellerSessionId,
            ) ?? null,
        [selectedTellerSessionId, teller_sessions],
    );

    const accountDueTotals = useMemo(
        () =>
            obligations.reduce((totalsByAccount, obligation) => {
                totalsByAccount.set(
                    obligation.account_id,
                    (totalsByAccount.get(obligation.account_id) ?? 0) +
                        Number(obligation.amount),
                );

                return totalsByAccount;
            }, new Map<number, number>()),
        [obligations],
    );

    const getAccountViewRoute = (account: CustomerAccount) => {
        const routeName =
            account.account_type === 'SAVINGS'
                ? 'financial-accounts.savings.show'
                : account.account_type === 'SHARE'
                  ? 'financial-accounts.share.show'
                  : account.account_type === 'FIXED_DEPOSIT'
                    ? 'financial-accounts.fixed.show'
                    : account.account_type === 'RECURRING_DEPOSIT'
                      ? 'financial-accounts.recurring.show'
                      : account.account_type === 'LOAN'
                        ? 'loan-accounts.show'
                        : 'financial-accounts.show';

        return route(routeName, account.id);
    };

    const totalSelected = useMemo(
        () =>
            obligations
                .filter((row) => selectedRows[row.id])
                .reduce(
                    (sum, row) =>
                        sum +
                        Number(
                            obligationAmounts[row.id] ??
                                Number(row.amount).toFixed(2),
                        ),
                    0,
                ),
        [obligations, obligationAmounts, selectedRows],
    );
    const parsedCustomerGivenAmount =
        customerGivenAmount.trim() === ''
            ? totalSelected
            : Number(customerGivenAmount);
    const customerGivenTotal = Number.isFinite(parsedCustomerGivenAmount)
        ? parsedCustomerGivenAmount
        : 0;
    const changeAmount = Math.max(0, customerGivenTotal - totalSelected);
    const amountDueFromCustomer = customerGivenTotal < totalSelected;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        {
            title: 'Customer Deposit',
            href: route('teller-transactions.customer-deposit'),
        },
    ];

    const handleSelectAccount = (account: FinancialAccountSearchResult) => {
        if (!account.holder) return;

        hasClearedSelection.current = false;
        setSelectedAccount(account);
        setSelectedCustomer(account.holder);
        setSelectedTellerSessionId(
            teller_sessions.length === 1 ? String(teller_sessions[0].id) : '',
        );
        setSelectedRows({});
        setObligationAmounts({});
        setCustomerGivenAmount('');
        setNote('');

        router.get(
            route('teller-transactions.customer-deposit'),
            { customer_id: account.holder.id, account_id: account.id },
            { preserveState: true, replace: true },
        );
    };

    const handleClearAccountSelection = () => {
        if (hasClearedSelection.current) return;

        hasClearedSelection.current = true;
        setSelectedAccount(null);
        setSelectedCustomer(null);
        setSelectedRows({});
        setObligationAmounts({});
        setCustomerGivenAmount('');
        setNote('');
        setReviewOpen(false);

        router.get(
            route('teller-transactions.customer-deposit'),
            {},
            { preserveState: true, replace: true },
        );
    };

    const toggleRow = (id: string) => {
        setSelectedRows((current) => ({ ...current, [id]: !current[id] }));
    };

    const updateObligationAmount = (id: string, amount: string) => {
        setObligationAmounts((current) => ({ ...current, [id]: amount }));
    };

    const selectedObligations = obligations.filter(
        (row) => selectedRows[row.id],
    );
    const selectedObligationIds = selectedObligations.map((row) => row.id);

    const submit = () => {
        if (
            !selectedCustomer ||
            !selectedTellerSessionId ||
            selectedObligationIds.length === 0 ||
            amountDueFromCustomer
        ) {
            return;
        }

        appSwal
            .fire({
                title: 'Record this customer deposit?',
                text: `Record a deposit of ${formatBDTCurrency(totalSelected, false)} for ${selectedCustomer.name}? The customer gives ${formatBDTCurrency(customerGivenTotal, false)} and receives ${formatBDTCurrency(changeAmount, false)} change. The installment schedule updates after the transaction is posted.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Record deposit',
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
                        amount: totalSelected.toFixed(2),
                        selected: selectedObligationIds,
                        obligation_amounts: Object.fromEntries(
                            selectedObligationIds.map((id) => {
                                const row = obligations.find(
                                    (item) => item.id === id,
                                );

                                return [
                                    id,
                                    obligationAmounts[id] ??
                                        Number(row?.amount ?? 0).toFixed(2),
                                ];
                            }),
                        ),
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
        totalSelected > 0 &&
        !amountDueFromCustomer;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Deposit" />
            <div className="space-y-3 text-foreground">
                <ResourcePageHeader
                    title="Customer Deposit"
                    description="Record customer deposits, then post the teller transaction to update account schedules."
                    action={<StatusBadge tone="info">Teller ready</StatusBadge>}
                />

                <div className="w-full pr-1 lg:w-1/2">
                    <FinancialAccountSearchInput
                        onSelect={handleSelectAccount}
                        clearSelectedAccount={handleClearAccountSelection}
                        initialAccount={selectedAccount}
                        scope="deposit"
                        placeholder="Search customer or financial account"
                    />
                </div>

                <>
                    <div className="grid gap-2 xl:grid-cols-2">
                        {/* Customer */}
                        <div className="flex min-w-0 items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2">
                            {selectedCustomer ? (
                                <>
                                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted">
                                        {selectedCustomer?.photo?.url ? (
                                            <img
                                                src={
                                                    selectedCustomer?.photo
                                                        ?.url ?? ''
                                                }
                                                alt={
                                                    selectedCustomer?.name ??
                                                    'Customer'
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                                {selectedCustomer?.name?.charAt(
                                                    0,
                                                ) ?? '?'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="truncate text-sm font-semibold">
                                                {selectedCustomer?.name ??
                                                    'Customer'}
                                            </h2>

                                            <StatusBadge tone="success">
                                                {selectedCustomer?.status ??
                                                    'Unknown'}
                                            </StatusBadge>
                                        </div>

                                        <div className="flex flex-wrap gap-x-2.5 text-[11px] text-muted-foreground">
                                            <span>
                                                {selectedCustomer?.customer_no ??
                                                    '-'}
                                            </span>
                                            <span>
                                                {selectedCustomer?.type ?? '-'}
                                            </span>
                                            <span>
                                                {selectedCustomer?.primary_phone ??
                                                    'No phone'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                                        <Search className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-medium">
                                            No customer selected
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Search above to view accounts and
                                            obligations.
                                        </p>
                                    </div>
                                </div>
                            )}
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
                                        ...teller_sessions.map((session) => ({
                                            value: String(session.id),
                                            label: `${session.teller?.name ?? 'Teller'} (${session.teller?.code ?? '-'}) — ${session.branch_day?.business_date ?? '-'}`,
                                        })),
                                    ]}
                                />
                            </div>

                            <div className="shrink-0 border-l pl-3">
                                <div className="text-[10px] font-medium text-muted-foreground uppercase">
                                    Expected Cash
                                </div>

                                <div className="text-sm font-bold text-foreground tabular-nums">
                                    BDT{' '}
                                    {formatBDTCurrency(
                                        selectedTellerSession?.expected_cash ??
                                            selectedTellerSession?.opening_cash ??
                                            0,
                                        false,
                                    )}
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
                                BDT{' '}
                                {formatBDTCurrency(totals.current_due, false)}
                            </div>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-xs text-muted-foreground">
                                Previous months
                            </div>
                            <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                BDT{' '}
                                {formatBDTCurrency(totals.previous_due, false)}
                            </div>
                        </div>
                        <div className="bg-primary/4 px-3 py-2">
                            <div className="text-xs font-medium text-primary">
                                Total due
                            </div>
                            <div className="mt-0.5 text-sm font-semibold text-primary tabular-nums">
                                BDT {formatBDTCurrency(totals.total_due, false)}
                            </div>
                        </div>
                    </div>

                    <div className="grid items-start gap-4 xl:grid-cols-12">
                        {/* Customer Accounts — 5/12 */}
                        <div className="flex h-95 min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm sm:h-105 xl:col-span-5">
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <WalletCards className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold">
                                            Customer accounts
                                        </div>

                                        <p className="text-[11px] text-muted-foreground">
                                            Eligible accounts available for
                                            selection
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge tone="info">
                                    {customerAccounts.length} accounts
                                </StatusBadge>
                            </div>

                            {customerAccounts.length > 0 ? (
                                <div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto">
                                    {customerAccounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="space-y-1.5 px-3 py-2 transition-colors hover:bg-muted/20"
                                        >
                                            <div className="flex min-w-0 items-center gap-1.5">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                                    <WalletCards className="h-3.5 w-3.5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-xs font-semibold tabular-nums">
                                                        {account.account_no}
                                                    </div>
                                                    <div className="truncate text-[10px] leading-tight text-muted-foreground">
                                                        {account.name ??
                                                            'Unnamed account'}
                                                    </div>
                                                </div>

                                                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] leading-tight font-medium text-muted-foreground capitalize">
                                                    {account.account_type.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>

                                                <a
                                                    href={getAccountViewRoute(
                                                        account,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                                    title="View account"
                                                >
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </a>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-7">
                                                <div className="min-w-0">
                                                    <div className="truncate text-[10px] leading-tight">
                                                        <span className="text-muted-foreground">
                                                            Balance{' '}
                                                        </span>
                                                        <span className="font-medium text-foreground tabular-nums">
                                                            BDT{' '}
                                                            {formatBDTCurrency(
                                                                account.balance,
                                                                false,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate text-[10px] leading-tight">
                                                        <span className="text-muted-foreground">
                                                            Available{' '}
                                                        </span>
                                                        <span className="font-semibold text-primary tabular-nums">
                                                            BDT{' '}
                                                            {formatBDTCurrency(
                                                                account.available_balance,
                                                                false,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate text-[10px] leading-tight">
                                                        <span className="text-muted-foreground">
                                                            Total due{' '}
                                                        </span>
                                                        <span className="font-semibold text-amber-700 tabular-nums dark:text-amber-400">
                                                            BDT{' '}
                                                            {formatBDTCurrency(
                                                                accountDueTotals.get(
                                                                    account.id,
                                                                ) ?? 0,
                                                                false,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate text-[10px] leading-tight">
                                                        <span className="text-muted-foreground">
                                                            Last deposit{' '}
                                                        </span>
                                                        <span className="text-foreground">
                                                            {formatDate(
                                                                account.last_deposit_date,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">
                                    <div className="max-w-sm">
                                        <WalletCards className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />

                                        <p className="text-sm font-medium">
                                            No eligible accounts
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            No eligible savings, share, fixed
                                            deposit, recurring deposit, or loan
                                            account was found for this customer.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Obligations — 7/12 */}
                        <div className="flex h-95 min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm sm:h-105 xl:col-span-7">
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                        <CreditCard className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold">
                                            Obligations
                                        </div>

                                        <p className="text-[11px] text-muted-foreground">
                                            Outstanding customer obligations
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge tone="warning">
                                    {obligations.length} items
                                </StatusBadge>
                            </div>

                            {obligations.length > 0 ? (
                                <div className="min-h-0 flex-1 overflow-auto">
                                    <table className="w-full min-w-145 border-collapse text-sm">
                                        <thead className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                                            <tr>
                                                <th className="w-12 px-3 py-2 text-center text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Select
                                                </th>

                                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Account
                                                </th>

                                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Due type
                                                </th>

                                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Reference
                                                </th>

                                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Month
                                                </th>

                                                <th className="px-4 py-2 text-right text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border/60">
                                            {obligations.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="group transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-3 py-2.5 text-center">
                                                        <label className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors hover:bg-primary/10">
                                                            <Input
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
                                                                className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                                                            />
                                                        </label>
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <div className="min-w-0">
                                                            <div className="truncate font-semibold">
                                                                {
                                                                    row.account_name
                                                                }
                                                            </div>

                                                            <div className="truncate text-xs text-muted-foreground">
                                                                {row.account_no}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <span className="inline-flex rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                                            {row.due_type}
                                                        </span>
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <span className="font-mono text-[11px] text-muted-foreground">
                                                            {row.id}
                                                        </span>
                                                    </td>

                                                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                                                        {row.month}
                                                    </td>

                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="ml-auto flex max-w-36 items-center gap-1">
                                                            <span className="text-[10px] text-muted-foreground">
                                                                BDT
                                                            </span>
                                                            <Input
                                                                aria-label={`Amount for ${row.due_type} ${row.account_no}`}
                                                                type="number"
                                                                min="0.01"
                                                                max={row.amount}
                                                                step="0.01"
                                                                value={
                                                                    obligationAmounts[
                                                                        row.id
                                                                    ] ??
                                                                    Number(
                                                                        row.amount,
                                                                    ).toFixed(2)
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateObligationAmount(
                                                                        row.id,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 min-w-0 text-right tabular-nums"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">
                                    <div>
                                        <CreditCard className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />

                                        <p className="text-sm font-medium">
                                            No outstanding obligations
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            No obligation details are currently
                                            available.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full rounded-lg border bg-card p-3 shadow-sm">
                        <div className="mb-2.5 flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <ShieldCheck className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-sm font-semibold">
                                Deposit summary
                            </h2>
                        </div>

                        <div className="grid items-end gap-2.5 xl:grid-cols-[minmax(160px,0.85fr)_minmax(0,2.2fr)_auto]">
                            <div className="min-w-0 xl:pb-0.5">
                                <label
                                    htmlFor="customer-deposit-note"
                                    className="mb-1 block text-[11px] font-medium text-muted-foreground"
                                >
                                    Note{' '}
                                    <span className="font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <Input
                                    id="customer-deposit-note"
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    placeholder="Optional note"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="grid min-w-0 grid-cols-3 divide-x overflow-hidden rounded-lg border bg-muted/20">
                                <div className="flex min-h-12 min-w-0 flex-col justify-center gap-1 px-2.5 py-1.5">
                                    <span className="truncate text-[10px] leading-tight font-medium text-muted-foreground">
                                        Deposit amount
                                    </span>
                                    <div className="truncate text-sm font-semibold tabular-nums">
                                        <span className="mr-1 text-[10px] font-medium text-muted-foreground">
                                            BDT
                                        </span>
                                        {formatBDTCurrency(
                                            totalSelected,
                                            false,
                                        )}
                                    </div>
                                </div>

                                <div className="flex min-h-12 min-w-0 flex-col justify-center gap-1 px-2.5 py-1.5">
                                    <label
                                        htmlFor="customer-given-amount"
                                        className="truncate text-[10px] leading-tight font-medium text-muted-foreground"
                                    >
                                        Customer given
                                    </label>
                                    <div className="flex min-w-0 items-center gap-1">
                                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                                            BDT
                                        </span>
                                        <Input
                                            id="customer-given-amount"
                                            type="number"
                                            min={totalSelected.toFixed(2)}
                                            step="0.01"
                                            value={
                                                customerGivenAmount ||
                                                totalSelected.toFixed(2)
                                            }
                                            onChange={(event) =>
                                                setCustomerGivenAmount(
                                                    event.target.value,
                                                )
                                            }
                                            className="h-7 min-w-0 bg-background px-1.5 text-right text-xs font-semibold tabular-nums"
                                        />
                                    </div>
                                </div>

                                <div className="flex min-h-12 min-w-0 flex-col justify-center gap-1 px-2.5 py-1.5">
                                    <span className="truncate text-[10px] leading-tight font-medium text-muted-foreground">
                                        Change
                                    </span>
                                    <div className="truncate text-sm font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                                        <span className="mr-1 text-[10px] font-medium text-muted-foreground">
                                            BDT
                                        </span>
                                        {formatBDTCurrency(changeAmount, false)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    className="h-8 px-3"
                                    disabled={!canSubmit}
                                    onClick={() => setReviewOpen(true)}
                                >
                                    Review
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 px-3"
                                    onClick={submit}
                                    disabled={!canSubmit}
                                >
                                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                                    Submit deposit
                                </Button>
                            </div>

                            {amountDueFromCustomer && (
                                <p className="text-xs text-destructive xl:col-span-3">
                                    Customer given amount must cover the
                                    selected deposit amount.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            </div>
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review customer deposit</DialogTitle>
                        <DialogDescription>
                            Verify the selected obligations and cash amounts
                            before submitting this deposit.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Customer
                                </div>
                                <div className="font-medium">
                                    {selectedCustomer?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {selectedCustomer?.customer_no}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Teller session
                                </div>
                                <div className="font-medium">
                                    {selectedTellerSession?.teller?.name ??
                                        'Teller'}{' '}
                                    (
                                    {selectedTellerSession?.teller?.code ?? '-'}
                                    )
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Business date:{' '}
                                    {selectedTellerSession?.branch_day
                                        ?.business_date ?? '-'}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border">
                            <div className="border-b bg-muted/30 px-3 py-2 text-sm font-medium">
                                Selected obligations (
                                {selectedObligations.length})
                            </div>
                            <div className="divide-y">
                                {selectedObligations.map((row) => (
                                    <div
                                        key={row.id}
                                        className="flex items-start justify-between gap-3 px-3 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">
                                                {row.account_name ??
                                                    'Unnamed account'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.account_no} ·{' '}
                                                {row.due_type} · {row.month}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right text-sm font-medium tabular-nums">
                                            BDT{' '}
                                            {formatBDTCurrency(
                                                obligationAmounts[row.id] ??
                                                    Number(row.amount).toFixed(
                                                        2,
                                                    ),
                                                false,
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <dl className="grid gap-2 rounded-lg bg-muted/30 p-3 text-sm sm:grid-cols-3">
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Deposit amount
                                </dt>
                                <dd className="font-semibold tabular-nums">
                                    BDT{' '}
                                    {formatBDTCurrency(totalSelected, false)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Customer given
                                </dt>
                                <dd className="font-semibold tabular-nums">
                                    BDT{' '}
                                    {formatBDTCurrency(
                                        customerGivenTotal,
                                        false,
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Change
                                </dt>
                                <dd className="font-semibold tabular-nums">
                                    BDT {formatBDTCurrency(changeAmount, false)}
                                </dd>
                            </div>
                        </dl>

                        {note.trim() && (
                            <div className="rounded-lg border px-3 py-2">
                                <div className="text-xs text-muted-foreground">
                                    Note
                                </div>
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                    {note}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReviewOpen(false)}
                        >
                            Close review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CustomAuthLayout>
    );
}
