import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import {
    FinancialAccountSearchInput,
    type FinancialAccountSearchResult,
} from '@/modules/financial-services/components/financial-account-search-input';
import type { TellerCashTransactionFormPageProps } from '@/modules/treasury-cash/types/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    CalendarDays,
    CircleAlert,
    CircleDollarSign,
    Eye,
    Plus,
    ReceiptText,
    Trash2,
    UserRound,
    WalletCards,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { route } from 'ziggy-js';

import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

export default function Form() {
    const { transaction_type, teller_sessions } =
        usePage<TellerCashTransactionFormPageProps>().props;

    const isDeposit = transaction_type === 'DEPOSIT';
    const routeType = isDeposit ? 'deposit' : 'withdrawal';

    const { data, setData, post, processing, errors } = useForm({
        teller_session_id: '',
        amount: '',
        reference: '',
        note: '',
        lines: [{ financial_account_id: '', amount: '', description: '' }],
    });

    const selectedTellerSession =
        teller_sessions.find(
            (session) => String(session.id) === data.teller_session_id,
        ) ?? null;
    const [depositLines, setDepositLines] = useState(data.lines);
    const [selectedDepositAccounts, setSelectedDepositAccounts] = useState<
        (FinancialAccountSearchResult | null)[]
    >([null]);
    const [selectedWithdrawalAccount, setSelectedWithdrawalAccount] =
        useState<FinancialAccountSearchResult | null>(null);

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: isDeposit ? 'Cash Deposit' : 'Cash Withdrawal',
            href: route('teller-transactions.' + routeType),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('teller-transactions.' + routeType + '.store'));
    };

    const updateDepositLines = (lines: typeof depositLines) => {
        const amount = lines
            .reduce((total, line) => total + Number(line.amount || 0), 0)
            .toFixed(4);

        setDepositLines(lines);
        setData('lines', lines);
        setData('amount', amount);
    };

    const addLine = () => {
        setSelectedDepositAccounts((accounts) => [...accounts, null]);
        updateDepositLines([
            ...depositLines,
            {
                financial_account_id: '',
                amount: '',
                description: '',
            },
        ]);
    };

    const removeLine = (index: number) => {
        if (depositLines.length === 1) return;

        setSelectedDepositAccounts((accounts) =>
            accounts.filter((_, lineIndex) => lineIndex !== index),
        );
        updateDepositLines(
            depositLines.filter((_, lineIndex) => lineIndex !== index),
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'} />

            <div className="w-full max-w-none space-y-5 pb-8 text-foreground">
                <header className="flex flex-col gap-2 py-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                            Teller · Cash operations
                        </p>
                        <h1 className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                            {isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'}
                        </h1>
                        <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                            {isDeposit
                                ? 'Record cash received from customers against their financial accounts.'
                                : 'Pay out cash to a customer and record the debit against their account.'}
                        </p>
                    </div>
                    <StatusBadge tone={isDeposit ? 'success' : 'warning'}>
                        {isDeposit ? 'DEPOSIT' : 'WITHDRAWAL'}
                    </StatusBadge>
                </header>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                    <div className="relative min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
                        {/* Teller Session */}
                        <div className="border-b bg-muted/20 px-5 py-4 sm:px-7">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-8 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                                        <CalendarDays className="size-4" />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="teller_session_id"
                                            className="block text-sm font-semibold"
                                        >
                                            Teller session
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            Choose an open session for this
                                            transaction.
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge
                                    tone={
                                        teller_sessions.length > 0
                                            ? 'success'
                                            : 'warning'
                                    }
                                >
                                    {teller_sessions.length}{' '}
                                    {teller_sessions.length === 1
                                        ? 'session available'
                                        : 'sessions available'}
                                </StatusBadge>
                            </div>

                            <Select
                                id="teller_session_id"
                                className="h-10 bg-background"
                                value={data.teller_session_id}
                                onChange={(value) =>
                                    setData('teller_session_id', value)
                                }
                                placeholder="Select open teller session"
                                options={[
                                    {
                                        value: '',
                                        label: 'Select open teller session',
                                    },
                                    ...teller_sessions.map((session) => ({
                                        value: String(session.id),
                                        label: `${session.teller?.name ?? 'Teller'} (${session.teller?.code ?? '-'}) · ${formatDate(session.branch_day?.business_date)}`,
                                    })),
                                ]}
                            />

                            <div className="mt-3 overflow-hidden rounded-lg border bg-background/80">
                                <div className="border-b px-3 py-2 text-xs font-medium">
                                    {selectedTellerSession
                                        ? `${selectedTellerSession.teller?.name ?? 'Teller'}${selectedTellerSession.teller?.code ? ` (${selectedTellerSession.teller.code})` : ''}`
                                        : 'Teller cash balance'}
                                </div>
                                <div className="grid grid-cols-2">
                                    <div className="px-3 py-2.5">
                                        <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Opening cash
                                        </div>
                                        <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                            BDT{' '}
                                            {formatBDTCurrency(
                                                selectedTellerSession?.opening_cash ??
                                                    0,
                                                false,
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-l px-3 py-2.5">
                                        <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Current cash
                                        </div>
                                        <div className="mt-0.5 text-sm font-semibold tabular-nums">
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

                            {errors.teller_session_id && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.teller_session_id}
                                </p>
                            )}

                            {teller_sessions.length === 0 && (
                                <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-500/10 px-2.5 py-2 text-xs text-amber-700 dark:text-amber-400">
                                    <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                                    <span>
                                        No open teller session is available.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Transaction Details */}
                        <div className="space-y-6 p-5 sm:p-7">
                            {isDeposit ? (
                                <section className="space-y-4">
                                    <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                                <WalletCards className="size-5" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-sm font-semibold">
                                                        Customer deposits
                                                    </h2>
                                                    <StatusBadge tone="info">
                                                        {depositLines.length}{' '}
                                                        {depositLines.length ===
                                                        1
                                                            ? 'line'
                                                            : 'lines'}
                                                    </StatusBadge>
                                                </div>
                                                <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                                                    Add one or more customer
                                                    accounts, then enter the
                                                    cash amount for each
                                                    deposit.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-2 border-emerald-500/25 bg-background px-3 text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-200"
                                            onClick={addLine}
                                        >
                                            <Plus className="size-4" />
                                            Add customer
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {depositLines.map((line, index) => (
                                            <div
                                                key={index}
                                                className="relative grid gap-3 rounded-xl border bg-background p-3 shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.32fr)_2.5rem] sm:items-center sm:p-4"
                                            >
                                                <div className="min-w-0 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-xs font-medium">
                                                            Customer account
                                                        </span>
                                                    </div>
                                                    <FinancialAccountSearchInput
                                                        onSelect={(account) => {
                                                            setSelectedDepositAccounts(
                                                                (accounts) => {
                                                                    const nextAccounts =
                                                                        [
                                                                            ...accounts,
                                                                        ];
                                                                    nextAccounts[
                                                                        index
                                                                    ] = account;
                                                                    return nextAccounts;
                                                                },
                                                            );
                                                            const lines = [
                                                                ...depositLines,
                                                            ];

                                                            lines[index] = {
                                                                ...line,
                                                                financial_account_id:
                                                                    String(
                                                                        account.id,
                                                                    ),
                                                            };

                                                            updateDepositLines(
                                                                lines,
                                                            );
                                                        }}
                                                        clearSelectedAccount={() => {
                                                            setSelectedDepositAccounts(
                                                                (accounts) => {
                                                                    const nextAccounts =
                                                                        [
                                                                            ...accounts,
                                                                        ];
                                                                    nextAccounts[
                                                                        index
                                                                    ] = null;
                                                                    return nextAccounts;
                                                                },
                                                            );
                                                            const lines = [
                                                                ...depositLines,
                                                            ];
                                                            lines[index] = {
                                                                ...line,
                                                                financial_account_id:
                                                                    '',
                                                            };
                                                            updateDepositLines(
                                                                lines,
                                                            );
                                                        }}
                                                        placeholder="Search customer or account..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-1.5 text-xs font-medium">
                                                        <CircleDollarSign className="size-3.5 text-muted-foreground" />
                                                        Deposit amount
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="0.0001"
                                                        step="0.0001"
                                                        placeholder="0.00"
                                                        className="h-10 text-right font-semibold tabular-nums"
                                                        value={line.amount}
                                                        onChange={(event) => {
                                                            const lines = [
                                                                ...depositLines,
                                                            ];

                                                            lines[index] = {
                                                                ...line,
                                                                amount: event
                                                                    .target
                                                                    .value,
                                                            };

                                                            updateDepositLines(
                                                                lines,
                                                            );
                                                        }}
                                                        required
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 justify-self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:mt-5"
                                                    disabled={
                                                        depositLines.length ===
                                                        1
                                                    }
                                                    onClick={() =>
                                                        removeLine(index)
                                                    }
                                                    aria-label={`Remove deposit line ${index + 1}`}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>

                                                <div className="grid grid-cols-2 overflow-hidden rounded-lg border bg-muted/20 sm:col-span-3">
                                                    <div className="px-3 py-2.5">
                                                        <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                            Available balance
                                                        </div>
                                                        <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                                            BDT{' '}
                                                            {formatBDTCurrency(
                                                                selectedDepositAccounts[
                                                                    index
                                                                ]
                                                                    ?.available_balance ??
                                                                    0,
                                                                false,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="border-l px-3 py-2.5">
                                                        <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                            Current balance
                                                        </div>
                                                        <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                                            BDT{' '}
                                                            {formatBDTCurrency(
                                                                selectedDepositAccounts[
                                                                    index
                                                                ]?.balance ?? 0,
                                                                false,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {errors.lines && (
                                        <p className="mt-1.5 text-xs text-destructive">
                                            {errors.lines}
                                        </p>
                                    )}

                                    {/* Total */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3.5 sm:px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                <ArrowDownToLine className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Total cash received
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Across {depositLines.length}{' '}
                                                    {depositLines.length === 1
                                                        ? 'deposit'
                                                        : 'deposits'}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xl font-semibold tracking-tight text-emerald-800 tabular-nums dark:text-emerald-200">
                                            BDT{' '}
                                            {formatBDTCurrency(
                                                Number(data.amount || 0),
                                                false,
                                            )}
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)]">
                                    <div className="space-y-3 rounded-xl border bg-background p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <UserRound className="size-4" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold">
                                                    Customer account
                                                </label>
                                                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                                    Search by account number,
                                                    account name, or customer
                                                    name.
                                                </p>
                                            </div>
                                        </div>
                                        <FinancialAccountSearchInput
                                            scope="deposit"
                                            placeholder="Search customer or savings account..."
                                            onSelect={(account) => {
                                                setSelectedWithdrawalAccount(
                                                    account,
                                                );
                                                const lines = [...data.lines];
                                                lines[0] = {
                                                    ...lines[0],
                                                    financial_account_id:
                                                        String(account.id),
                                                };
                                                setData('lines', lines);
                                            }}
                                            clearSelectedAccount={() => {
                                                setSelectedWithdrawalAccount(
                                                    null,
                                                );
                                                const lines = [...data.lines];
                                                lines[0] = {
                                                    ...lines[0],
                                                    financial_account_id: '',
                                                };
                                                setData('lines', lines);
                                            }}
                                        />
                                        {errors[
                                            'lines.0.financial_account_id'
                                        ] && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    errors[
                                                        'lines.0.financial_account_id'
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center rounded-xl border border-orange-500/20 bg-orange-500/[0.04] p-4 sm:p-5">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <label
                                                htmlFor="amount"
                                                className="text-sm font-semibold"
                                            >
                                                Withdrawal amount
                                            </label>
                                            <span className="rounded-md border bg-background px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
                                                BDT
                                            </span>
                                        </div>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.0001"
                                            value={data.amount}
                                            onChange={(event) => {
                                                setData(
                                                    'amount',
                                                    event.target.value,
                                                );
                                                setData('lines', [
                                                    {
                                                        ...data.lines[0],
                                                        amount: event.target
                                                            .value,
                                                    },
                                                ]);
                                            }}
                                            className="h-14 border-orange-500/20 bg-background text-right text-2xl font-semibold tabular-nums shadow-sm"
                                            placeholder="0.00"
                                            required
                                        />
                                        <p className="mt-2 text-right text-xs text-muted-foreground">
                                            Enter the cash amount to pay out.
                                        </p>
                                        {errors.amount && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.amount}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 overflow-hidden rounded-lg border bg-muted/20 lg:col-span-2">
                                        <div className="px-3 py-2.5">
                                            <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                Available balance
                                            </div>
                                            <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                                BDT{' '}
                                                {formatBDTCurrency(
                                                    selectedWithdrawalAccount?.available_balance ??
                                                        0,
                                                    false,
                                                )}
                                            </div>
                                        </div>
                                        <div className="border-l px-3 py-2.5">
                                            <div className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                                Current balance
                                            </div>
                                            <div className="mt-0.5 text-sm font-semibold tabular-nums">
                                                BDT{' '}
                                                {formatBDTCurrency(
                                                    selectedWithdrawalAccount?.balance ??
                                                        0,
                                                    false,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Reference + Note */}
                            <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="reference"
                                        className="flex items-center gap-2 text-xs font-semibold"
                                    >
                                        <ReceiptText className="size-3.5 text-muted-foreground" />
                                        Reference
                                        <span className="ml-1 font-normal text-muted-foreground">
                                            optional
                                        </span>
                                    </label>

                                    <Input
                                        id="reference"
                                        value={data.reference}
                                        onChange={(event) =>
                                            setData(
                                                'reference',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={255}
                                        placeholder="e.g. receipt / external reference"
                                        className="h-9"
                                    />

                                    {errors.reference && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.reference}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="note"
                                        className="mb-1.5 block text-xs font-medium"
                                    >
                                        Note
                                        <span className="ml-1 font-normal text-muted-foreground">
                                            optional
                                        </span>
                                    </label>

                                    <Input
                                        id="note"
                                        value={data.note}
                                        onChange={(event) =>
                                            setData('note', event.target.value)
                                        }
                                        maxLength={2000}
                                        placeholder="Add a short note..."
                                        className="h-9"
                                    />

                                    {errors.note && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-3 rounded-b-2xl border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                Transaction will be created as
                                <StatusBadge tone="warning">
                                    Pending
                                </StatusBadge>
                            </p>

                            <Button
                                type="submit"
                                disabled={
                                    processing || teller_sessions.length === 0
                                }
                                className={`h-10 gap-2 px-5 font-semibold shadow-sm ${
                                    isDeposit
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                }`}
                            >
                                {isDeposit ? (
                                    <ArrowDownToLine className="h-4 w-4" />
                                ) : (
                                    <ArrowUpFromLine className="h-4 w-4" />
                                )}

                                {processing
                                    ? 'Processing...'
                                    : `Create ${isDeposit ? 'deposit' : 'withdrawal'}`}
                            </Button>
                        </div>
                    </div>

                    <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                        <section
                            className={`overflow-hidden rounded-2xl border bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02] ${
                                isDeposit
                                    ? 'border-emerald-500/15'
                                    : 'border-orange-500/15'
                            }`}
                        >
                            <div
                                className={`relative overflow-hidden border-b px-4 py-4 ${
                                    isDeposit
                                        ? 'bg-gradient-to-br from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent'
                                        : 'bg-gradient-to-br from-orange-500/[0.12] via-orange-500/[0.04] to-transparent'
                                }`}
                            >
                                <div
                                    className={`pointer-events-none absolute -top-10 right-0 size-28 rounded-full blur-3xl ${
                                        isDeposit
                                            ? 'bg-emerald-500/10'
                                            : 'bg-orange-500/10'
                                    }`}
                                />
                                <div className="relative flex items-center gap-2.5">
                                    <span
                                        className={`flex size-9 items-center justify-center rounded-xl ring-1 ${
                                            isDeposit
                                                ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/15 dark:text-emerald-300'
                                                : 'bg-orange-500/10 text-orange-700 ring-orange-500/15 dark:text-orange-300'
                                        }`}
                                    >
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                            Cash operations
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Transaction preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div
                                    className={`rounded-xl p-3.5 ring-1 ${
                                        isDeposit
                                            ? 'bg-gradient-to-br from-emerald-500/[0.08] to-muted/30 ring-emerald-500/10'
                                            : 'bg-gradient-to-br from-orange-500/[0.08] to-muted/30 ring-orange-500/10'
                                    }`}
                                >
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        {isDeposit
                                            ? 'Total cash received'
                                            : 'Cash to be paid'}
                                    </p>
                                    <p
                                        className={`mt-1 text-2xl font-semibold tracking-tight break-words tabular-nums ${
                                            isDeposit
                                                ? 'text-emerald-700 dark:text-emerald-300'
                                                : 'text-orange-700 dark:text-orange-300'
                                        }`}
                                    >
                                        BDT{' '}
                                        {formatBDTCurrency(
                                            Number(data.amount || 0),
                                            false,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {isDeposit
                                            ? `${depositLines.length} ${depositLines.length === 1 ? 'customer deposit' : 'customer deposits'}`
                                            : 'Single account withdrawal'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <CalendarDays className="size-3.5 text-primary" />
                                        Teller session
                                    </div>
                                    {selectedTellerSession ? (
                                        <>
                                            <p className="mt-2 text-sm font-semibold">
                                                {selectedTellerSession.teller
                                                    ?.name ?? 'Teller'}
                                                {selectedTellerSession.teller
                                                    ?.code
                                                    ? ` (${selectedTellerSession.teller.code})`
                                                    : ''}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {formatDate(
                                                    selectedTellerSession
                                                        .branch_day
                                                        ?.business_date,
                                                )}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                                                <span className="text-muted-foreground">
                                                    Current teller cash
                                                </span>
                                                <span className="font-semibold tabular-nums">
                                                    BDT{' '}
                                                    {formatBDTCurrency(
                                                        selectedTellerSession.expected_cash ??
                                                            selectedTellerSession.opening_cash ??
                                                            0,
                                                        false,
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            Select an open session to preview
                                            its teller and business date.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 px-1 text-xs font-medium">
                                        <WalletCards className="size-3.5 text-primary" />
                                        {isDeposit
                                            ? 'Customer deposits'
                                            : 'Customer account'}
                                    </p>
                                    {isDeposit ? (
                                        <div className="max-h-64 space-y-2 overflow-y-auto">
                                            {depositLines.map((line, index) => {
                                                const account =
                                                    selectedDepositAccounts[
                                                        index
                                                    ];

                                                return (
                                                    <div
                                                        key={`preview-${index}`}
                                                        className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-medium">
                                                                {account
                                                                    ? account.name ||
                                                                      account.account_no
                                                                    : 'Select customer account'}
                                                            </p>
                                                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                                                {account
                                                                    ? `${account.account_no} · ${account.account_type}`
                                                                    : `Deposit ${index + 1}`}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 text-right text-xs font-semibold tabular-nums">
                                                            BDT{' '}
                                                            {formatBDTCurrency(
                                                                Number(
                                                                    line.amount ||
                                                                        0,
                                                                ),
                                                                false,
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-border/60 bg-background px-3 py-2.5">
                                            <p className="truncate text-xs font-medium">
                                                {selectedWithdrawalAccount?.name ??
                                                    'Select customer account'}
                                            </p>
                                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                                {selectedWithdrawalAccount
                                                    ? `${selectedWithdrawalAccount.account_no} · ${selectedWithdrawalAccount.account_type}`
                                                    : 'Account details will appear here'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {(data.reference || data.note) && (
                                    <div className="space-y-2">
                                        {data.reference && (
                                            <div className="flex min-w-0 items-start gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                                <ReceiptText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                        Reference
                                                    </p>
                                                    <p className="text-xs font-medium break-words">
                                                        {data.reference}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {data.note && (
                                            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    Note
                                                </p>
                                                <p className="mt-0.5 line-clamp-3 text-xs break-words">
                                                    {data.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 text-xs">
                                    <span className="text-muted-foreground">
                                        Transaction status
                                    </span>
                                    <StatusBadge tone="warning">
                                        PENDING
                                    </StatusBadge>
                                </div>
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
