import { appSwal } from '@/lib/appSwal';
import { CustomerSearchBox } from '@/pages/customer-kyc/customers/components/customer-search-box';
import type { Customer } from '@/types/customer_kyc_module';
import type { SavingsChequeWithdrawalPageProps } from '@/types/treasury-cash/forms';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpFromLine, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import {
    ResourcePageHeader,
    StatusBadge,
} from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function SavingsChequeWithdrawalPage() {
    useFlashToastHandler();

    const { customer, savings_accounts, available_cheques, teller_sessions } =
        usePage<SavingsChequeWithdrawalPageProps>().props;

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        customer ?? null,
    );
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedChequeId, setSelectedChequeId] = useState('');
    const [selectedTellerSessionId, setSelectedTellerSessionId] = useState(
        teller_sessions.length === 1 ? String(teller_sessions[0].id) : '',
    );
    const [note, setNote] = useState('');

    const selectedAccount = useMemo(
        () =>
            savings_accounts.find(
                (account) => String(account.id) === selectedAccountId,
            ) ?? null,
        [savings_accounts, selectedAccountId],
    );

    const relevantCheques = useMemo(
        () =>
            available_cheques.filter(
                (cheque) =>
                    String(cheque.financial_account_id) === selectedAccountId &&
                    (cheque.status === 'UNUSED' || cheque.status === 'ISSUED'),
            ),
        [available_cheques, selectedAccountId],
    );

    const selectedCheque = useMemo(
        () =>
            relevantCheques.find(
                (cheque) => String(cheque.id) === selectedChequeId,
            ) ?? null,
        [relevantCheques, selectedChequeId],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        {
            title: 'Savings Cheque Withdrawal',
            href: route('teller-transactions.savings-cheque-withdrawal'),
        },
    ];

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSelectedAccountId('');
        setSelectedChequeId('');
        setNote('');

        router.get(
            route('teller-transactions.savings-cheque-withdrawal'),
            { customer_id: customer.id },
            { preserveState: true, replace: true },
        );
    };

    const submit = () => {
        if (
            !selectedCustomer ||
            !selectedAccount ||
            !selectedCheque ||
            !selectedTellerSessionId
        ) {
            return;
        }

        appSwal
            .fire({
                title: 'Post cheque withdrawal?',
                text: `Withdraw ${selectedCheque.amount} from ${selectedAccount.account_no} using cheque ${selectedCheque.cheque_no}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Post withdrawal',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (!result.isConfirmed) return;

                router.post(
                    route(
                        'teller-transactions.savings-cheque-withdrawal.store',
                    ),
                    {
                        customer_id: selectedCustomer.id,
                        teller_session_id: selectedTellerSessionId,
                        financial_account_id: selectedAccount.id,
                        cheque_id: selectedCheque.id,
                        note,
                    },
                    { preserveScroll: true },
                );
            });
    };

    const canSubmit =
        Boolean(selectedCustomer) &&
        Boolean(selectedAccount) &&
        Boolean(selectedCheque) &&
        Boolean(selectedTellerSessionId);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Savings Cheque Withdrawal" />
            <div className="space-y-5 text-foreground">
                <ResourcePageHeader
                    title="Savings Cheque Withdrawal"
                    description="Select a customer, choose an active savings account, and cash an issued cheque against the teller session."
                    action={
                        <StatusBadge tone="info">Teller cash-out</StatusBadge>
                    }
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
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-4 rounded-xl border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold">
                                    Savings account
                                </h2>
                                <StatusBadge tone="success">
                                    {selectedCustomer.status ?? 'ACTIVE'}
                                </StatusBadge>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="savings-account"
                                    className="text-sm font-medium"
                                >
                                    Account
                                </label>
                                <select
                                    id="savings-account"
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    value={selectedAccountId}
                                    onChange={(event) => {
                                        setSelectedAccountId(
                                            event.target.value,
                                        );
                                        setSelectedChequeId('');
                                    }}
                                    required
                                >
                                    <option value="">
                                        Select savings account
                                    </option>
                                    {savings_accounts.map((account) => (
                                        <option
                                            key={account.id}
                                            value={account.id}
                                        >
                                            {account.account_no} -{' '}
                                            {account.name ??
                                                account.account_type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedAccount && (
                                <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Available balance
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {Number(
                                                selectedAccount.available_balance ||
                                                    0,
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Current balance
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {Number(
                                                selectedAccount.balance || 0,
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label
                                    htmlFor="cheque-id"
                                    className="text-sm font-medium"
                                >
                                    Issued cheque
                                </label>
                                <select
                                    id="cheque-id"
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    value={selectedChequeId}
                                    onChange={(event) =>
                                        setSelectedChequeId(event.target.value)
                                    }
                                    disabled={!selectedAccountId}
                                    required
                                >
                                    <option value="">Select cheque</option>
                                    {relevantCheques.map((cheque) => (
                                        <option
                                            key={cheque.id}
                                            value={cheque.id}
                                        >
                                            {cheque.cheque_no} - {cheque.status}{' '}
                                            -{' '}
                                            {Number(cheque.amount || 0).toFixed(
                                                2,
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="teller-session"
                                    className="text-sm font-medium"
                                >
                                    Teller session
                                </label>
                                <select
                                    id="teller-session"
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
                                        Select open teller session
                                    </option>
                                    {teller_sessions.map((session) => (
                                        <option
                                            key={session.id}
                                            value={session.id}
                                        >
                                            {session.teller?.name ?? 'Teller'} (
                                            {session.teller?.code ?? '-'}) -{' '}
                                            {session.branch_day
                                                ?.business_date ?? '-'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="note"
                                    className="text-sm font-medium"
                                >
                                    Note
                                </label>
                                <textarea
                                    id="note"
                                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    placeholder="Optional withdrawal note"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Review
                            </div>

                            {selectedCheque ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Cheque
                                        </span>
                                        <span className="font-medium">
                                            {selectedCheque.cheque_no}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Amount
                                        </span>
                                        <span className="font-medium">
                                            {Number(
                                                selectedCheque.amount || 0,
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Status
                                        </span>
                                        <StatusBadge tone="warning">
                                            {selectedCheque.status}
                                        </StatusBadge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Account
                                        </span>
                                        <span className="font-medium">
                                            {selectedAccount?.account_no}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Select a valid savings account and cheque to
                                    review the withdrawal.
                                </p>
                            )}

                            <Button
                                type="button"
                                className="w-full"
                                onClick={submit}
                                disabled={!canSubmit}
                            >
                                <ArrowUpFromLine className="h-4 w-4" />
                                Post withdrawal
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
