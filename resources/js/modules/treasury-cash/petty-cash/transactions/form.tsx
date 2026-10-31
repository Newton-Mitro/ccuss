import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { PettyCashTransactionFormPageProps } from '@/modules/treasury-cash/types/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    CircleDollarSign,
    Eye,
    FileText,
    HandCoins,
    Info,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';

export default function Form() {
    const { transaction_type, branch_day, funds } =
        usePage<PettyCashTransactionFormPageProps>().props;

    const isFunding = transaction_type === 'FUNDING';
    const routeType = isFunding ? 'funding' : 'expense';
    const pageTitle = isFunding ? 'Fund Petty Cash' : 'Petty Cash Expense';

    const { data, setData, post, processing, errors } = useForm({
        petty_cash_fund_id: '',
        amount: '',
        payee: '',
        description: '',
    });
    const selectedFund = funds.find(
        (fund) => String(fund.id) === data.petty_cash_fund_id,
    );

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: pageTitle,
            href: route(`petty-cash-transactions.${routeType}`),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route(`petty-cash-transactions.${routeType}.store`));
    };

    const canSubmit =
        !processing &&
        Boolean(branch_day) &&
        funds.length > 0 &&
        Boolean(data.petty_cash_fund_id) &&
        data.amount !== '' &&
        Number(data.amount) > 0;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="w-full max-w-7xl space-y-5 pb-28 text-foreground">
                <HeadingSmall
                    title={pageTitle}
                    description={
                        isFunding
                            ? 'Record a petty cash fund replenishment for the active business day.'
                            : 'Record a petty cash expense and document the payment details.'
                    }
                />

                {/* Transaction overview */}
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-start gap-3 p-4 sm:p-5">
                        <div
                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                isFunding
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-foreground'
                            }`}
                        >
                            {isFunding ? (
                                <Wallet className="size-5" />
                            ) : (
                                <HandCoins className="size-5" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-sm font-semibold">
                                    {isFunding
                                        ? 'Fund replenishment'
                                        : 'Expense transaction'}
                                </h2>

                                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    <span className="size-1.5 rounded-full bg-amber-500" />
                                    Pending approval
                                </span>
                            </div>

                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {isFunding
                                    ? 'Select the fund and enter the amount to be added.'
                                    : 'Select the fund and provide the expense amount and supporting details.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 border-t bg-muted/20 p-4 sm:grid-cols-2 sm:p-5">
                        <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Business date
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {branch_day
                                        ? formatDate(branch_day.business_date)
                                        : 'Unavailable'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                            {branch_day ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            ) : (
                                <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                            )}

                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Branch day status
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {branch_day?.status ?? 'No open branch day'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!branch_day && (
                        <div className="flex items-start gap-2.5 border-t border-destructive/20 bg-destructive/5 px-4 py-3 sm:px-5">
                            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                            <p className="text-xs leading-5 text-destructive">
                                An open branch day is required before you can
                                create a petty cash transaction.
                            </p>
                        </div>
                    )}
                </section>

                {/* Transaction form */}
                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                    <div className="min-w-0 space-y-4">
                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="size-4.5" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Transaction details
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Enter the fund, amount, and relevant
                                        transaction information.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 p-4 sm:p-5">
                                {/* Fund selection */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="petty_cash_fund_id"
                                        className="text-sm font-medium"
                                    >
                                        Petty cash fund{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>

                                    <Select
                                        id="petty_cash_fund_id"
                                        className="h-10 w-full"
                                        value={data.petty_cash_fund_id}
                                        onChange={(value) =>
                                            setData('petty_cash_fund_id', value)
                                        }
                                        placeholder="Select petty cash fund"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select petty cash fund',
                                            },
                                            ...funds.map((fund) => ({
                                                value: String(fund.id),
                                                label: `${fund.name} (${fund.code}) — Balance ${formatBDTCurrency(fund.current_balance, false)}`,
                                            })),
                                        ]}
                                    />

                                    {errors.petty_cash_fund_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.petty_cash_fund_id}
                                        </p>
                                    )}

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Choose the fund associated with this
                                        transaction.
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="amount"
                                        className="text-sm font-medium"
                                    >
                                        {isFunding
                                            ? 'Funding amount'
                                            : 'Expense amount'}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                                            ৳
                                        </span>

                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.0001"
                                            value={data.amount}
                                            onChange={(event) =>
                                                setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            required
                                            aria-invalid={Boolean(
                                                errors.amount,
                                            )}
                                            className="h-11 pl-8 font-medium tabular-nums"
                                        />
                                    </div>

                                    {errors.amount && (
                                        <p className="text-xs text-destructive">
                                            {errors.amount}
                                        </p>
                                    )}

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Enter the amount in Bangladeshi taka
                                        (BDT).
                                    </p>
                                </div>

                                {/* Payee: expenses only */}
                                {!isFunding && (
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="payee"
                                            className="text-sm font-medium"
                                        >
                                            Payee
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                (Optional)
                                            </span>
                                        </label>

                                        <Input
                                            id="payee"
                                            value={data.payee}
                                            onChange={(event) =>
                                                setData(
                                                    'payee',
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={255}
                                            placeholder="Enter the recipient or vendor name"
                                            aria-invalid={Boolean(errors.payee)}
                                            className="h-10"
                                        />

                                        {errors.payee && (
                                            <p className="text-xs text-destructive">
                                                {errors.payee}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="description"
                                        className="text-sm font-medium"
                                    >
                                        Description
                                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                                            (Optional)
                                        </span>
                                    </label>

                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={2000}
                                        placeholder={
                                            isFunding
                                                ? 'Reason for replenishing the fund'
                                                : 'Describe the purpose of this expense'
                                        }
                                        aria-invalid={Boolean(
                                            errors.description,
                                        )}
                                        className="h-10"
                                    />

                                    {errors.description && (
                                        <p className="text-xs text-destructive">
                                            {errors.description}
                                        </p>
                                    )}

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Include a brief explanation for future
                                        reference and audit review.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Submission actions */}
                        <div className="fixed inset-x-4 bottom-0 z-30 border-t bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:inset-x-auto md:left-[calc(var(--app-sidebar-offset,0px)+1.5rem)] md:w-[calc(100%-var(--app-sidebar-offset,0px)-3.25rem)]">
                            <div
                                data-slot="form-actions"
                                className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-start gap-2">
                                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        This transaction will be created as
                                        pending. Review all details before
                                        submitting.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="h-11 w-full shrink-0 gap-2 rounded-lg px-5 font-semibold sm:w-auto sm:min-w-56"
                                >
                                    {processing ? (
                                        <>
                                            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                            Creating transaction...
                                        </>
                                    ) : (
                                        <>
                                            <HandCoins className="size-4" />
                                            Create pending{' '}
                                            {isFunding ? 'funding' : 'expense'}
                                            <ArrowRight className="ml-auto size-4 sm:ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                            Petty cash
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            {isFunding
                                                ? 'Funding preview'
                                                : 'Expense preview'}
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CircleDollarSign className="size-4 text-primary" />
                                        {isFunding
                                            ? 'Funding amount'
                                            : 'Expense amount'}
                                    </div>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                        {formatBDTCurrency(
                                            data.amount || 0,
                                            false,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <Wallet className="size-3.5" />
                                        Selected fund
                                    </div>
                                    {selectedFund ? (
                                        <div className="mt-2">
                                            <p className="text-sm font-semibold">
                                                {selectedFund.name}
                                            </p>
                                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                {selectedFund.code}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Select a petty cash fund to preview
                                            it.
                                        </p>
                                    )}
                                </div>

                                {selectedFund && (
                                    <>
                                        <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                                            <span className="text-xs text-muted-foreground">
                                                Current balance
                                            </span>
                                            <span className="text-right text-xs font-medium tabular-nums">
                                                {formatBDTCurrency(
                                                    selectedFund.current_balance,
                                                    false,
                                                )}
                                            </span>
                                        </div>
                                        {Number(data.amount) > 0 && (
                                            <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
                                                <span className="text-xs text-muted-foreground">
                                                    Estimated balance after
                                                    posting
                                                </span>
                                                <span className="text-right text-xs font-semibold tabular-nums">
                                                    {formatBDTCurrency(
                                                        Number(
                                                            selectedFund.current_balance,
                                                        ) +
                                                            (isFunding
                                                                ? Number(
                                                                      data.amount,
                                                                  )
                                                                : -Number(
                                                                      data.amount,
                                                                  )),
                                                        false,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <CalendarDays className="size-3.5" />
                                        Business date
                                    </div>
                                    <p className="mt-2 text-sm font-medium">
                                        {branch_day
                                            ? formatDate(
                                                  branch_day.business_date,
                                              )
                                            : 'Unavailable'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {branch_day?.status ??
                                            'No open branch day'}
                                    </p>
                                </div>

                                {!isFunding && data.payee && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <HandCoins className="size-3.5" />
                                            Payee
                                        </div>
                                        <p className="mt-2 text-sm break-words">
                                            {data.payee}
                                        </p>
                                    </div>
                                )}

                                {data.description && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <FileText className="size-3.5" />
                                            Description
                                        </div>
                                        <p className="mt-2 text-sm break-words">
                                            {data.description}
                                        </p>
                                    </div>
                                )}

                                <p className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground">
                                    <Info className="size-4 shrink-0 text-amber-600" />
                                    This transaction is pending approval and
                                    does not change the balance until posted.
                                </p>
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
