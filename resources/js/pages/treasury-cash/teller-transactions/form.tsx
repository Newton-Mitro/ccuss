import { formatDate } from '@/lib/date_util';
import { FinancialAccountSearchInput } from '@/pages/treasury-cash/teller-deposits/components/financial-account-search-input';
import type { TellerCashTransactionFormPageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    CircleAlert,
    Plus,
    Trash2,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { route } from 'ziggy-js';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

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

    const [depositLines, setDepositLines] = useState(data.lines);

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

        updateDepositLines(
            depositLines.filter((_, lineIndex) => lineIndex !== index),
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'} />

            <div className="w-full max-w-3xl space-y-4 text-foreground">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                                isDeposit
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            }`}
                        >
                            {isDeposit ? (
                                <ArrowDownToLine className="h-4 w-4" />
                            ) : (
                                <ArrowUpFromLine className="h-4 w-4" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-base font-semibold">
                                {isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'}
                            </h1>

                            <p className="truncate text-xs text-muted-foreground">
                                Create a pending{' '}
                                {isDeposit ? 'deposit' : 'withdrawal'} for an
                                open teller session.
                            </p>
                        </div>
                    </div>

                    <span
                        className={`hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                            isDeposit
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        }`}
                    >
                        {isDeposit ? 'DEPOSIT' : 'WITHDRAWAL'}
                    </span>
                </div>

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-lg border bg-card shadow-sm"
                >
                    {/* Teller Session */}
                    <div className="border-b px-4 py-3">
                        <div className="mb-1.5 flex items-center justify-between">
                            <label
                                htmlFor="teller_session_id"
                                className="text-xs font-medium"
                            >
                                Teller session
                            </label>

                            {teller_sessions.length > 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                    {teller_sessions.length} open session
                                    {teller_sessions.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <select
                            id="teller_session_id"
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                            value={data.teller_session_id}
                            onChange={(event) =>
                                setData('teller_session_id', event.target.value)
                            }
                            required
                        >
                            <option value="">Select open teller session</option>

                            {teller_sessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {session.teller?.name ?? 'Teller'} (
                                    {session.teller?.code ?? '-'}) ·{' '}
                                    {formatDate(
                                        session.branch_day?.business_date,
                                    )}
                                </option>
                            ))}
                        </select>

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
                    <div className="space-y-4 p-4">
                        {isDeposit ? (
                            <section>
                                <div className="mb-2 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Deposit lines
                                        </h2>
                                        <p className="text-[11px] text-muted-foreground">
                                            Select customer accounts and enter
                                            the cash amount.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 px-2.5"
                                        onClick={addLine}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add line
                                    </Button>
                                </div>

                                {/* Column labels */}
                                <div className="mb-1 hidden grid-cols-[1fr_8.5rem_2.25rem] gap-2 px-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:grid">
                                    <span>Customer / Account</span>
                                    <span>Amount</span>
                                    <span />
                                </div>

                                <div className="space-y-1.5">
                                    {depositLines.map((line, index) => (
                                        <div
                                            key={index}
                                            className="grid gap-1.5 rounded-md border bg-background p-1.5 sm:grid-cols-[1fr_8.5rem_2.25rem]"
                                        >
                                            <FinancialAccountSearchInput
                                                onSelect={(account) => {
                                                    const lines = [
                                                        ...depositLines,
                                                    ];

                                                    lines[index] = {
                                                        ...line,
                                                        financial_account_id:
                                                            String(account.id),
                                                    };

                                                    updateDepositLines(lines);
                                                }}
                                                placeholder="Search customer or account..."
                                            />

                                            <Input
                                                type="number"
                                                min="0.0001"
                                                step="0.0001"
                                                placeholder="0.00"
                                                className="h-9 text-right font-medium tabular-nums"
                                                value={line.amount}
                                                onChange={(event) => {
                                                    const lines = [
                                                        ...depositLines,
                                                    ];

                                                    lines[index] = {
                                                        ...line,
                                                        amount: event.target
                                                            .value,
                                                    };

                                                    updateDepositLines(lines);
                                                }}
                                                required
                                            />

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                                disabled={
                                                    depositLines.length === 1
                                                }
                                                onClick={() =>
                                                    removeLine(index)
                                                }
                                                aria-label="Remove deposit line"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {errors.lines && (
                                    <p className="mt-1.5 text-xs text-destructive">
                                        {errors.lines}
                                    </p>
                                )}

                                {/* Total */}
                                <div className="mt-2 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Total cash
                                    </span>

                                    <span className="text-sm font-semibold tabular-nums">
                                        {data.amount}
                                    </span>
                                </div>
                            </section>
                        ) : (
                            <section>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="amount"
                                        className="text-sm font-semibold"
                                    >
                                        Withdrawal amount
                                    </label>

                                    <span className="text-[11px] text-muted-foreground">
                                        BDT
                                    </span>
                                </div>

                                <Input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.0001"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData('amount', event.target.value)
                                    }
                                    className="h-11 text-right text-lg font-semibold tabular-nums"
                                    placeholder="0.00"
                                    required
                                />

                                {errors.amount && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.amount}
                                    </p>
                                )}
                            </section>
                        )}

                        {/* Reference + Note */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="reference"
                                    className="mb-1.5 block text-xs font-medium"
                                >
                                    Reference
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        optional
                                    </span>
                                </label>

                                <Input
                                    id="reference"
                                    value={data.reference}
                                    onChange={(event) =>
                                        setData('reference', event.target.value)
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

                            <div>
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
                    <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-muted-foreground">
                            Transaction will be created as{' '}
                            <span className="font-medium text-foreground">
                                Pending
                            </span>
                            .
                        </p>

                        <Button
                            type="submit"
                            disabled={
                                processing || teller_sessions.length === 0
                            }
                            className="h-9 gap-1.5"
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
                </form>
            </div>
        </CustomAuthLayout>
    );
}
