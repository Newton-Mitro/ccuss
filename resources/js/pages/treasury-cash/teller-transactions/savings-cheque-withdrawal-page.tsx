import { appSwal } from '@/lib/appSwal';
import {
    FinancialAccountSearchInput,
    type FinancialAccountSearchResult,
} from '@/pages/treasury-cash/teller-deposits/components/financial-account-search-input';
import type { Customer } from '@/types/customer_kyc_module';
import type { SavingsChequeWithdrawalPageProps } from '@/types/treasury-cash/forms';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowUpFromLine,
    CheckCircle2,
    UserRound,
    WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';

import ReactPanZoom from 'react-image-pan-zoom-rotate';
import {
    ResourcePageHeader,
    StatusBadge,
} from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface SignatureOption {
    key: string;
    name: string;
    detail: string;
    signature: {
        url: string;
        verification_status: string;
    } | null;
}

export default function SavingsChequeWithdrawalPage() {
    useFlashToastHandler();

    const {
        customer,
        signature_verified,
        savings_accounts,
        available_cheques,
        teller_sessions,
    } = usePage<SavingsChequeWithdrawalPageProps>().props;

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        customer ?? null,
    );

    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedChequeId, setSelectedChequeId] = useState('');
    const [selectedSignatureKey, setSelectedSignatureKey] = useState('');

    const [selectedTellerSessionId, setSelectedTellerSessionId] = useState(
        teller_sessions.length === 1 ? String(teller_sessions[0].id) : '',
    );

    const [note, setNote] = useState('');

    const signatureVerified = Boolean(
        customer && selectedCustomer?.id === customer.id && signature_verified,
    );

    const selectedAccount = useMemo(
        () =>
            savings_accounts.find(
                (account) => String(account.id) === selectedAccountId,
            ) ?? null,
        [savings_accounts, selectedAccountId],
    );

    const selectedTellerSession = useMemo(
        () =>
            teller_sessions.find(
                (session) => String(session.id) === selectedTellerSessionId,
            ) ?? null,
        [selectedTellerSessionId, teller_sessions],
    );

    const accountHolders = useMemo(() => {
        if (!selectedAccount) return [];

        const existingPrimary = selectedAccount.account_holders.find(
            (holder) => holder.id === selectedAccount.account_holder?.id,
        );

        const otherHolders = selectedAccount.account_holders.filter(
            (holder) => holder.id !== selectedAccount.account_holder?.id,
        );

        if (!selectedAccount.account_holder) return otherHolders;

        return [
            existingPrimary ?? {
                ...selectedAccount.account_holder,
                role: 'PRIMARY',
                ownership_percent: 100,
            },
            ...otherHolders,
        ];
    }, [selectedAccount]);

    const signatureOptions = useMemo<SignatureOption[]>(
        () => [
            ...accountHolders.map((holder) => ({
                key: `holder:${holder.id}`,
                name: holder.name,
                detail: `${holder.role.replaceAll('_', ' ')} holder · ${holder.customer_no}`,
                signature: holder.signature,
            })),

            ...(selectedAccount?.authorized_persons ?? []).map((person) => ({
                key: `authorized:${person.id}`,
                name: person.customer_name ?? 'Unnamed authorized person',
                detail: `${person.authorization_type.replaceAll('_', ' ')}${
                    person.designation ? ` · ${person.designation}` : ''
                }`,
                signature: person.signature,
            })),
        ],
        [accountHolders, selectedAccount],
    );

    const selectedSignatureOption =
        signatureOptions.find(
            (option) => option.key === selectedSignatureKey,
        ) ??
        signatureOptions[0] ??
        null;

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
        {
            title: 'Treasury & Cash',
            href: '',
        },
        {
            title: 'Savings Cheque Withdrawal',
            href: route('teller-transactions.savings-cheque-withdrawal'),
        },
    ];

    const handleSelectAccount = (account: FinancialAccountSearchResult) => {
        const accountHolder = account.holder;

        if (!accountHolder) return;

        setSelectedCustomer(accountHolder);

        setSelectedAccountId(
            account.account_type === 'SAVINGS' ? String(account.id) : '',
        );

        setSelectedChequeId('');
        setSelectedSignatureKey('');
        setNote('');

        router.get(
            route('teller-transactions.savings-cheque-withdrawal'),
            {
                customer_id: accountHolder.id,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearSelectedCustomer = () => {
        setSelectedCustomer(null);
        setSelectedAccountId('');
        setSelectedChequeId('');
        setSelectedSignatureKey('');
        setNote('');

        router.get(
            route('teller-transactions.savings-cheque-withdrawal'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const submit = () => {
        if (
            !selectedCustomer ||
            !signatureVerified ||
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
                    {
                        preserveScroll: true,
                    },
                );
            });
    };

    const canSubmit =
        Boolean(selectedCustomer) &&
        signatureVerified &&
        Boolean(selectedAccount) &&
        Boolean(selectedCheque) &&
        Boolean(selectedTellerSessionId);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Savings Cheque Withdrawal" />

            <div className="space-y-3 text-foreground 2xl:flex 2xl:h-full 2xl:min-h-0 2xl:flex-col 2xl:gap-2 2xl:space-y-0 2xl:overflow-hidden">
                {/* =========================================================
                    PAGE HEADER
                ========================================================= */}
                <ResourcePageHeader
                    title="Savings Cheque Withdrawal"
                    description="Verify the account holder signature and cash an issued cheque."
                    action={
                        <StatusBadge
                            tone={signatureVerified ? 'success' : 'warning'}
                        >
                            {signatureVerified
                                ? 'Signature verified'
                                : 'Verification required'}
                        </StatusBadge>
                    }
                />

                <div className="grid gap-2 md:grid-cols-2">
                    <div
                        className={`flex min-w-0 flex-col justify-center rounded-lg border bg-card p-2.5 shadow-sm ${!selectedCustomer ? 'md:col-span-2' : ''}`}
                    >
                        <div className="mb-1.5 flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold">
                                Find customer or account
                            </span>
                        </div>
                        <FinancialAccountSearchInput
                            onSelect={handleSelectAccount}
                            clearSelectedCustomer={clearSelectedCustomer}
                            scope="customer"
                            placeholder="Search customer or savings account..."
                        />
                    </div>

                    {selectedCustomer && (
                        <div className="flex min-h-16 items-center rounded-lg border bg-card p-2.5 shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
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
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-sm font-semibold">
                                            {selectedCustomer.name}
                                        </h2>
                                        <StatusBadge tone="success">
                                            {selectedCustomer.status ??
                                                'ACTIVE'}
                                        </StatusBadge>
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
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
                        </div>
                    )}
                </div>

                {!selectedCustomer && (
                    <div className="rounded-lg border border-dashed bg-card px-4 py-3 text-center">
                        <h2 className="text-xs font-semibold">
                            No customer selected
                        </h2>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Search an account to load customer and signatory
                            details.
                        </p>
                    </div>
                )}

                {selectedCustomer && (
                    <div className="flex min-w-0 flex-col gap-2 2xl:min-h-0 2xl:flex-1 2xl:overflow-hidden">
                        <div className="grid min-w-0 gap-2 md:grid-cols-2 2xl:min-h-0 2xl:flex-1 2xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.9fr)_minmax(280px,0.9fr)]">
                            {/* =================================================
                                LEFT COLUMN
                            ================================================= */}
                            <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm md:col-span-2 2xl:col-span-1 2xl:flex 2xl:min-h-0 2xl:flex-col">
                                <div className="flex items-center justify-between border-b px-3 py-2.5">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Account & signatories
                                        </h2>

                                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                                            Review account holders and
                                            signatures.
                                        </p>
                                    </div>

                                    {selectedAccount && (
                                        <StatusBadge tone="info">
                                            {selectedAccount.account_no}
                                        </StatusBadge>
                                    )}
                                </div>

                                <div className="space-y-3 p-3 2xl:grid 2xl:min-h-0 2xl:flex-1 2xl:grid-rows-[auto_minmax(0,1fr)_auto] 2xl:gap-2 2xl:space-y-0 2xl:p-2">
                                    <div className="space-y-2">
                                        {/* Account */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="savings-account"
                                                className="text-xs font-medium"
                                            >
                                                Savings account
                                            </label>

                                            <Select
                                                id="savings-account"
                                                className="h-9"
                                                value={selectedAccountId}
                                                onChange={(value) => {
                                                    setSelectedAccountId(value);
                                                    setSelectedChequeId('');
                                                    setSelectedSignatureKey('');
                                                }}
                                                placeholder="Select savings account"
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select savings account',
                                                    },
                                                    ...savings_accounts.map(
                                                        (account) => ({
                                                            value: String(
                                                                account.id,
                                                            ),
                                                            label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        </div>

                                        {/* Balance */}
                                        {selectedAccount && (
                                            <div className="grid grid-cols-2 overflow-hidden rounded-lg border bg-muted/20">
                                                <div className="px-3 py-2.5">
                                                    <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        Available balance
                                                    </div>

                                                    <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                                        BDT{' '}
                                                        {Number(
                                                            selectedAccount.available_balance ||
                                                                0,
                                                        ).toLocaleString(
                                                            'en-BD',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-l px-3 py-2.5">
                                                    <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        Current balance
                                                    </div>

                                                    <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                                        BDT{' '}
                                                        {Number(
                                                            selectedAccount.balance ||
                                                                0,
                                                        ).toLocaleString(
                                                            'en-BD',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid min-h-0 gap-2 sm:grid-cols-2">
                                        {/* Account holders */}
                                        <section className="min-w-0 space-y-1.5 2xl:min-h-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-semibold">
                                                    Account holders
                                                </h3>

                                                <span className="text-[10px] text-muted-foreground">
                                                    {accountHolders.length}{' '}
                                                    holder
                                                    {accountHolders.length !== 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </div>

                                            <div className="grid gap-1.5 2xl:max-h-36 2xl:overflow-y-auto">
                                                {accountHolders.length > 0 ? (
                                                    accountHolders.map(
                                                        (holder) => {
                                                            const key = `holder:${holder.id}`;

                                                            const isSelected =
                                                                (selectedSignatureOption?.key ??
                                                                    signatureOptions[0]
                                                                        ?.key) ===
                                                                key;

                                                            return (
                                                                <button
                                                                    key={key}
                                                                    type="button"
                                                                    aria-pressed={
                                                                        isSelected
                                                                    }
                                                                    onClick={() =>
                                                                        setSelectedSignatureKey(
                                                                            key,
                                                                        )
                                                                    }
                                                                    className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                                                                        isSelected
                                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                                            : 'bg-background hover:border-primary/40 hover:bg-muted/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                                                        {holder.name?.charAt(
                                                                            0,
                                                                        ) ??
                                                                            '?'}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-xs font-medium">
                                                                            {
                                                                                holder.name
                                                                            }
                                                                        </div>

                                                                        <div className="truncate text-[10px] text-muted-foreground">
                                                                            {holder.role.replaceAll(
                                                                                '_',
                                                                                ' ',
                                                                            )}{' '}
                                                                            ·{' '}
                                                                            {
                                                                                holder.customer_no
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    {isSelected && (
                                                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <div className="col-span-full rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                                                        No account holders
                                                        found.
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Authorized persons */}
                                        <section className="min-w-0 space-y-1.5 2xl:min-h-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-semibold">
                                                    Authorized persons
                                                </h3>

                                                <span className="text-[10px] text-muted-foreground">
                                                    {selectedAccount
                                                        ?.authorized_persons
                                                        ?.length ?? 0}{' '}
                                                    available
                                                </span>
                                            </div>

                                            <div className="grid gap-1.5 2xl:max-h-36 2xl:overflow-y-auto">
                                                {selectedAccount
                                                    ?.authorized_persons
                                                    ?.length ? (
                                                    selectedAccount.authorized_persons.map(
                                                        (person) => {
                                                            const key = `authorized:${person.id}`;

                                                            const isSelected =
                                                                selectedSignatureOption?.key ===
                                                                key;

                                                            return (
                                                                <button
                                                                    key={key}
                                                                    type="button"
                                                                    aria-pressed={
                                                                        isSelected
                                                                    }
                                                                    onClick={() =>
                                                                        setSelectedSignatureKey(
                                                                            key,
                                                                        )
                                                                    }
                                                                    className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                                                                        isSelected
                                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                                            : 'bg-background hover:border-primary/40 hover:bg-muted/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                                                        {(
                                                                            person.customer_name ??
                                                                            '?'
                                                                        ).charAt(
                                                                            0,
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-xs font-medium">
                                                                            {person.customer_name ??
                                                                                'Unnamed authorized person'}
                                                                        </div>

                                                                        <div className="truncate text-[10px] text-muted-foreground">
                                                                            {person.authorization_type.replaceAll(
                                                                                '_',
                                                                                ' ',
                                                                            )}
                                                                            {person.designation
                                                                                ? ` · ${person.designation}`
                                                                                : ''}
                                                                        </div>
                                                                    </div>

                                                                    {isSelected && (
                                                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <div className="col-span-full rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                                                        No authorized persons
                                                        found.
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                                MIDDLE SECTION
                            ================================================= */}
                            <div className="min-w-0 space-y-3 rounded-xl border bg-card p-3 shadow-sm">
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Withdrawal details
                                    </h2>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        Choose the teller session and cheque.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                                    <WalletCards className="h-4 w-4 shrink-0 text-primary" />
                                    <div className="min-w-0 flex-1">
                                        <label
                                            htmlFor="teller-session"
                                            className="mb-1 block text-[10px] font-medium text-muted-foreground"
                                        >
                                            Teller session
                                        </label>
                                        <Select
                                            id="teller-session"
                                            className="h-8 px-2 text-xs font-medium"
                                            value={selectedTellerSessionId}
                                            onChange={(value) =>
                                                setSelectedTellerSessionId(
                                                    value,
                                                )
                                            }
                                            placeholder="Select session"
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select session',
                                                },
                                                ...teller_sessions.map(
                                                    (session) => ({
                                                        value: String(
                                                            session.id,
                                                        ),
                                                        label: `${session.teller?.name ?? 'Teller'} (${session.teller?.code ?? '-'}) · ${session.branch_day?.business_date ?? '-'}`,
                                                    }),
                                                ),
                                            ]}
                                        />
                                    </div>
                                    <div className="shrink-0 border-l pl-2">
                                        <div className="text-[9px] text-muted-foreground">
                                            Expected cash
                                        </div>
                                        <div className="text-xs font-semibold tabular-nums">
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

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="cheque-id"
                                        className="text-xs font-medium"
                                    >
                                        Issued cheque
                                    </label>
                                    <Select
                                        id="cheque-id"
                                        className="h-9"
                                        value={selectedChequeId}
                                        onChange={(value) =>
                                            setSelectedChequeId(value)
                                        }
                                        disabled={!selectedAccountId}
                                        placeholder={
                                            selectedAccountId
                                                ? 'Select cheque'
                                                : 'Select a savings account first'
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: selectedAccountId
                                                    ? 'Select cheque'
                                                    : 'Select a savings account first',
                                            },
                                            ...relevantCheques.map(
                                                (cheque) => ({
                                                    value: String(cheque.id),
                                                    label: `${cheque.cheque_no} · ${cheque.status} · BDT ${Number(cheque.amount || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`,
                                                }),
                                            ),
                                        ]}
                                    />
                                    {selectedAccountId &&
                                        relevantCheques.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground">
                                                No issued cheques for this
                                                savings account.
                                            </p>
                                        )}
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="note"
                                        className="text-xs font-medium"
                                    >
                                        Note
                                    </label>
                                    <input
                                        id="note"
                                        type="text"
                                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                        value={note}
                                        onChange={(event) =>
                                            setNote(event.target.value)
                                        }
                                        placeholder="Optional withdrawal note"
                                    />
                                </div>
                                {/* Selected signature */}
                                <section className="space-y-1.5 border-t pt-2 2xl:min-h-0 2xl:overflow-hidden">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="text-xs font-semibold">
                                                Selected signature
                                            </h3>
                                            <p className="truncate text-[10px] text-muted-foreground">
                                                {selectedSignatureOption
                                                    ? `${selectedSignatureOption.name} · ${selectedSignatureOption.detail}`
                                                    : 'Choose a holder or authorized person'}
                                            </p>
                                        </div>
                                        {selectedSignatureOption && (
                                            <StatusBadge
                                                tone={
                                                    selectedSignatureOption
                                                        .signature
                                                        ?.verification_status ===
                                                    'VERIFIED'
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                            >
                                                {selectedSignatureOption
                                                    .signature
                                                    ?.verification_status ??
                                                    'Missing'}
                                            </StatusBadge>
                                        )}
                                    </div>
                                    <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/10">
                                        {selectedSignatureOption?.signature
                                            ?.url ? (
                                            <ReactPanZoom
                                                image={
                                                    selectedSignatureOption
                                                        .signature.url
                                                }
                                                alt={`${selectedSignatureOption.name} signature`}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                                No signature available
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {signatureVerified
                                            ? 'Account holder signature verified for withdrawal.'
                                            : 'Account holder signature verification is required.'}
                                    </p>
                                </section>
                            </div>

                            {/* =================================================
                                RIGHT COLUMN
                            ================================================= */}
                            <div className="min-w-0 space-y-3">
                                {/* =============================================
                                    REVIEW
                                ============================================= */}
                                <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm 2xl:flex 2xl:min-h-0 2xl:flex-col">
                                    <div className="flex items-center gap-2.5 border-b px-4 py-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <ArrowUpFromLine className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-semibold">
                                                Withdrawal review
                                            </h2>

                                            <p className="text-[10px] text-muted-foreground">
                                                Confirm transaction details
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-3 2xl:min-h-0 2xl:flex-1 2xl:overflow-y-auto">
                                        {selectedCheque ? (
                                            <div className="space-y-3">
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-muted-foreground">
                                                            Cheque
                                                        </span>

                                                        <span className="font-medium">
                                                            {
                                                                selectedCheque.cheque_no
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-muted-foreground">
                                                            Account
                                                        </span>

                                                        <span className="font-medium">
                                                            {
                                                                selectedAccount?.account_no
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-muted-foreground">
                                                            Status
                                                        </span>

                                                        <StatusBadge tone="warning">
                                                            {
                                                                selectedCheque.status
                                                            }
                                                        </StatusBadge>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="rounded-lg border bg-muted/20 p-2.5">
                                                    <div className="text-[9px] font-medium tracking-wider text-muted-foreground uppercase">
                                                        Withdrawal amount
                                                    </div>

                                                    <div className="mt-1 text-xl font-bold tabular-nums">
                                                        BDT{' '}
                                                        {Number(
                                                            selectedCheque.amount ||
                                                                0,
                                                        ).toLocaleString(
                                                            'en-BD',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Validation summary */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-[11px]">
                                                        <CheckCircle2
                                                            className={`h-3.5 w-3.5 ${
                                                                selectedAccount
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                        <span>
                                                            Savings account
                                                            selected
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px]">
                                                        <CheckCircle2
                                                            className={`h-3.5 w-3.5 ${
                                                                selectedCheque
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                        <span>
                                                            Issued cheque
                                                            selected
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px]">
                                                        <CheckCircle2
                                                            className={`h-3.5 w-3.5 ${
                                                                signatureVerified
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                        <span>
                                                            Signature verified
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px]">
                                                        <CheckCircle2
                                                            className={`h-3.5 w-3.5 ${
                                                                selectedTellerSessionId
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                        <span>
                                                            Teller session
                                                            selected
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    className="h-9 w-full"
                                                    onClick={submit}
                                                    disabled={!canSubmit}
                                                >
                                                    <ArrowUpFromLine className="h-4 w-4" />
                                                    Post withdrawal
                                                </Button>

                                                {!canSubmit && (
                                                    <p className="text-center text-[10px] text-muted-foreground">
                                                        {!signatureVerified
                                                            ? 'Verify the signature to continue.'
                                                            : 'Complete the required transaction fields.'}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-7 text-center">
                                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                                                </div>

                                                <p className="mt-2 text-xs font-medium">
                                                    No cheque selected
                                                </p>

                                                <p className="mx-auto mt-1 max-w-xs text-[10px] leading-4 text-muted-foreground">
                                                    Select a savings account and
                                                    issued cheque to review the
                                                    withdrawal.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
