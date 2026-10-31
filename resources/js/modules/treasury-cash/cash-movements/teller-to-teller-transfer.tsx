import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { TellerTransferPageProps } from '@/modules/treasury-cash/types/forms';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownUp,
    ArrowLeft,
    ArrowRightLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Eye,
    FileText,
    Landmark,
    LoaderCircle,
    Wallet,
} from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function TellerToTellerTransfer() {
    const {
        branch_day,
        transfer_type,
        from_cash_locations,
        to_cash_locations,
        bank_accounts = [],
    } = usePage<TellerTransferPageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        from_cash_location_id: '',
        to_cash_location_id: '',
        bank_account_id: '',
        amount: '',
        note: '',
    });

    useFlashToastHandler();

    const transferConfig = {
        TELLER_TO_TELLER: {
            title: 'Teller to Teller Transfer',
            description: 'Transfer cash between active tellers in your branch.',
            fromLabel: 'From teller',
            toLabel: 'To teller',
            routeName: 'cash-movements.teller-to-teller.store',
        },
        VAULT_TO_TELLER: {
            title: 'Vault to Teller Transfer',
            description:
                'Transfer cash from a vault to an active teller in your branch.',
            fromLabel: 'From vault',
            toLabel: 'To teller',
            routeName: 'cash-movements.vault-to-teller.store',
        },
        TELLER_TO_VAULT: {
            title: 'Teller to Vault Transfer',
            description:
                'Transfer cash from an active teller to a vault in your branch.',
            fromLabel: 'From teller',
            toLabel: 'To vault',
            routeName: 'cash-movements.teller-to-vault.store',
        },
        VAULT_TO_VAULT: {
            title: 'Vault to Vault Transfer',
            description: 'Transfer cash between active vaults in your branch.',
            fromLabel: 'From vault',
            toLabel: 'To vault',
            routeName: 'cash-movements.vault-to-vault.store',
        },
        BANK_TO_VAULT: {
            title: 'Bank to Vault Funding',
            description:
                'Withdraw funds from a bank account and add them to an open vault session.',
            fromLabel: 'From bank account',
            toLabel: 'To vault',
            routeName: 'cash-movements.bank-to-vault.store',
        },
        VAULT_TO_BANK: {
            title: 'Vault to Bank Deposit',
            description:
                'Deposit cash from an open vault session into a bank account.',
            fromLabel: 'From vault',
            toLabel: 'To bank account',
            routeName: 'cash-movements.vault-to-bank.store',
        },
    }[transfer_type];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Cash Transfers',
            href: route('cash-movements.teller-to-teller'),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route(transferConfig.routeName));
    };

    const hasSource =
        transfer_type === 'BANK_TO_VAULT'
            ? Boolean(data.bank_account_id)
            : Boolean(data.from_cash_location_id);

    const hasDestination =
        transfer_type === 'VAULT_TO_BANK'
            ? Boolean(data.bank_account_id)
            : Boolean(data.to_cash_location_id);

    const isBankToVault = transfer_type === 'BANK_TO_VAULT';
    const isVaultToBank = transfer_type === 'VAULT_TO_BANK';

    const sourceId = isBankToVault
        ? 'bank_account_id'
        : 'from_cash_location_id';

    const destinationId = isVaultToBank
        ? 'bank_account_id'
        : 'to_cash_location_id';

    const sourceValue = isBankToVault
        ? data.bank_account_id
        : data.from_cash_location_id;

    const destinationValue = isVaultToBank
        ? data.bank_account_id
        : data.to_cash_location_id;
    const selectedSource = from_cash_locations.find(
        (location) => String(location.id) === data.from_cash_location_id,
    );
    const selectedDestination = to_cash_locations.find(
        (location) => String(location.id) === data.to_cash_location_id,
    );
    const selectedBankAccount = bank_accounts.find(
        (account) => String(account.id) === data.bank_account_id,
    );
    const previewSource = isBankToVault
        ? selectedBankAccount
            ? {
                  name: selectedBankAccount.account_name,
                  code: selectedBankAccount.account_number,
                  balance: selectedBankAccount.current_balance,
              }
            : null
        : selectedSource
          ? {
                name: selectedSource.name,
                code: selectedSource.code,
                balance: selectedSource.current_balance ?? null,
            }
          : null;
    const previewDestination = isVaultToBank
        ? selectedBankAccount
            ? {
                  name: selectedBankAccount.account_name,
                  code: selectedBankAccount.account_number,
                  balance: selectedBankAccount.current_balance,
              }
            : null
        : selectedDestination
          ? {
                name: selectedDestination.name,
                code: selectedDestination.code,
                balance: selectedDestination.current_balance ?? null,
            }
          : null;

    const sourceOptions = isBankToVault
        ? [
              { value: '', label: 'Select bank account' },
              ...bank_accounts.map((account) => ({
                  value: String(account.id),
                  label: `${account.account_name} (${account.account_number}) · ${formatBDTCurrency(account.current_balance, false)}`,
              })),
          ]
        : [
              { value: '', label: 'Select source' },
              ...from_cash_locations
                  .filter(
                      (location) =>
                          String(location.id) !== data.to_cash_location_id,
                  )
                  .map((location) => ({
                      value: String(location.id),
                      label: `${location.name} (${location.code}) · ${location.current_balance == null ? 'No open session' : formatBDTCurrency(location.current_balance, false)}`,
                  })),
          ];

    const destinationOptions = isVaultToBank
        ? [
              { value: '', label: 'Select bank account' },
              ...bank_accounts.map((account) => ({
                  value: String(account.id),
                  label: `${account.account_name} (${account.account_number}) · ${formatBDTCurrency(account.current_balance, false)}`,
              })),
          ]
        : [
              { value: '', label: 'Select destination' },
              ...to_cash_locations
                  .filter(
                      (location) =>
                          String(location.id) !== data.from_cash_location_id,
                  )
                  .map((location) => ({
                      value: String(location.id),
                      label: `${location.name} (${location.code}) · ${location.current_balance == null ? 'No open session' : formatBDTCurrency(location.current_balance, false)}`,
                  })),
          ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={transferConfig.title} />

            <div className="w-full max-w-7xl space-y-5 pb-24 text-foreground">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={transferConfig.title}
                        description={transferConfig.description}
                    />
                </div>

                {/* Business day status */}
                <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <CalendarDays className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Business day
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {branch_day
                                    ? formatDate(branch_day.business_date)
                                    : 'No open branch day'}
                            </p>
                        </div>
                    </div>

                    {branch_day ? (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {branch_day.status}
                        </span>
                    ) : (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive">
                            <span className="size-1.5 rounded-full bg-destructive" />
                            Branch day required
                        </span>
                    )}
                </section>

                {!branch_day && (
                    <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <CalendarDays className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div>
                            <p className="text-sm font-semibold">
                                Branch day is not open
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Open a branch day before creating a cash
                                transfer.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <form onSubmit={submit} className="min-w-0 space-y-5">
                        {/* Transfer route */}
                        <section className="overflow-hidden rounded-xl border bg-card">
                            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Transfer route
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Choose the source and destination.
                                    </p>
                                </div>
                                <ArrowDownUp className="size-5 text-muted-foreground" />
                            </div>

                            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-5">
                                {/* Source */}
                                <div className="min-w-0 space-y-3 rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
                                            <LocationIcon
                                                label={transferConfig.fromLabel}
                                                className="size-4 text-muted-foreground"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                TRANSFER FROM
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {transferConfig.fromLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <Select
                                        id={sourceId}
                                        className="h-10 w-full"
                                        value={sourceValue}
                                        onChange={(value) =>
                                            setData(
                                                isBankToVault
                                                    ? 'bank_account_id'
                                                    : 'from_cash_location_id',
                                                value,
                                            )
                                        }
                                        placeholder="Select source"
                                        options={sourceOptions}
                                    />

                                    {errors.from_cash_location_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.from_cash_location_id}
                                        </p>
                                    )}

                                    {selectedSource && (
                                        <p className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Current{' '}
                                                {selectedSource.type === 'VAULT'
                                                    ? 'vault'
                                                    : 'teller'}{' '}
                                                balance
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {selectedSource.current_balance ==
                                                null
                                                    ? 'No open session'
                                                    : formatBDTCurrency(
                                                          selectedSource.current_balance,
                                                          false,
                                                      )}
                                            </span>
                                        </p>
                                    )}
                                    {isBankToVault && selectedBankAccount && (
                                        <p className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Current bank balance
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {formatBDTCurrency(
                                                    selectedBankAccount.current_balance,
                                                    false,
                                                )}
                                            </span>
                                        </p>
                                    )}

                                    {isBankToVault &&
                                        errors.bank_account_id && (
                                            <p className="text-sm text-destructive">
                                                {errors.bank_account_id}
                                            </p>
                                        )}
                                </div>

                                {/* Direction indicator */}
                                <div className="flex justify-center">
                                    <div className="flex size-10 items-center justify-center rounded-full border bg-background">
                                        <ArrowRightLeft className="size-5 text-muted-foreground" />
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="min-w-0 space-y-3 rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
                                            <LocationIcon
                                                label={transferConfig.toLabel}
                                                className="size-4 text-muted-foreground"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                TRANSFER TO
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {transferConfig.toLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <Select
                                        id={destinationId}
                                        className="h-10 w-full"
                                        value={destinationValue}
                                        onChange={(value) =>
                                            setData(
                                                isVaultToBank
                                                    ? 'bank_account_id'
                                                    : 'to_cash_location_id',
                                                value,
                                            )
                                        }
                                        placeholder="Select destination"
                                        options={destinationOptions}
                                    />

                                    {errors.to_cash_location_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.to_cash_location_id}
                                        </p>
                                    )}

                                    {selectedDestination && (
                                        <p className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Current{' '}
                                                {selectedDestination.type ===
                                                'VAULT'
                                                    ? 'vault'
                                                    : 'teller'}{' '}
                                                balance
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {selectedDestination.current_balance ==
                                                null
                                                    ? 'No open session'
                                                    : formatBDTCurrency(
                                                          selectedDestination.current_balance,
                                                          false,
                                                      )}
                                            </span>
                                        </p>
                                    )}
                                    {isVaultToBank && selectedBankAccount && (
                                        <p className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Current bank balance
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {formatBDTCurrency(
                                                    selectedBankAccount.current_balance,
                                                    false,
                                                )}
                                            </span>
                                        </p>
                                    )}

                                    {isVaultToBank &&
                                        errors.bank_account_id && (
                                            <p className="text-sm text-destructive">
                                                {errors.bank_account_id}
                                            </p>
                                        )}
                                </div>
                            </div>
                        </section>

                        {/* Transfer details */}
                        <section className="overflow-hidden rounded-xl border bg-card">
                            <div className="border-b px-4 py-3 sm:px-5">
                                <h2 className="text-sm font-semibold">
                                    Transfer details
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Enter the amount and any supporting note.
                                </p>
                            </div>

                            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="amount"
                                        className="flex items-center gap-2 text-sm font-medium"
                                    >
                                        <CircleDollarSign className="size-4 text-muted-foreground" />
                                        Transfer amount
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
                                            className="h-11 pl-8 text-base font-semibold tabular-nums"
                                            placeholder="0.00"
                                            required
                                            aria-invalid={Boolean(
                                                errors.amount,
                                            )}
                                        />
                                    </div>

                                    {errors.amount && (
                                        <p className="text-sm text-destructive">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="note"
                                        className="flex items-center gap-2 text-sm font-medium"
                                    >
                                        <FileText className="size-4 text-muted-foreground" />
                                        Transfer note
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (Optional)
                                        </span>
                                    </label>

                                    <Input
                                        id="note"
                                        value={data.note}
                                        onChange={(event) =>
                                            setData('note', event.target.value)
                                        }
                                        maxLength={2000}
                                        placeholder="Enter a reference or reason"
                                        className="h-11"
                                        aria-invalid={Boolean(errors.note)}
                                    />

                                    <div className="flex justify-between gap-2">
                                        {errors.note ? (
                                            <p className="text-sm text-destructive">
                                                {errors.note}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                Add context for audit purposes.
                                            </p>
                                        )}
                                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                            {data.note.length}/2000
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Sticky actions */}
                        <div
                            data-slot="page-action-bar"
                            className="fixed bottom-0 z-30 border-t bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
                        >
                            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="size-4 shrink-0" />
                                    Transfer will be created as pending.
                                </p>

                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                    >
                                        <ArrowLeft className="mr-2 size-4" />
                                        Back
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            !branch_day ||
                                            !hasSource ||
                                            !hasDestination
                                        }
                                    >
                                        {processing ? (
                                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <ArrowRightLeft className="mr-2 size-4" />
                                        )}
                                        {processing
                                            ? 'Creating transfer...'
                                            : 'Create pending transfer'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>

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
                                            Transfer overview
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Live preview
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
                                        Transfer amount
                                    </div>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                        {formatBDTCurrency(data.amount || 0)}
                                    </p>
                                </div>

                                {[
                                    {
                                        label: transferConfig.fromLabel,
                                        location: previewSource,
                                        iconLabel: transferConfig.fromLabel,
                                    },
                                    {
                                        label: transferConfig.toLabel,
                                        location: previewDestination,
                                        iconLabel: transferConfig.toLabel,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-xl border border-border/60 bg-muted/20 p-3"
                                    >
                                        <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <LocationIcon
                                                label={item.iconLabel}
                                                className="size-3.5"
                                            />
                                            {item.label}
                                        </div>
                                        {item.location ? (
                                            <div className="mt-2 min-w-0">
                                                <p className="text-sm font-semibold">
                                                    {item.location.name}
                                                </p>
                                                <p className="mt-0.5 font-mono text-xs break-all text-muted-foreground">
                                                    {item.location.code}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2 text-[11px]">
                                                    <span className="text-muted-foreground">
                                                        Current balance
                                                    </span>
                                                    <span className="font-medium tabular-nums">
                                                        {item.location
                                                            .balance == null
                                                            ? 'No open session'
                                                            : formatBDTCurrency(
                                                                  item.location
                                                                      .balance,
                                                                  false,
                                                              )}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Select a{' '}
                                                {item.label.toLowerCase()} to
                                                preview it.
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <CalendarDays className="size-3.5" />
                                        Business day
                                    </div>
                                    <p className="mt-2 text-sm font-medium">
                                        {branch_day
                                            ? formatDate(
                                                  branch_day.business_date,
                                              )
                                            : 'No open branch day'}
                                    </p>
                                </div>

                                {data.note && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <FileText className="size-3.5" />
                                            Transfer note
                                        </div>
                                        <p className="mt-2 text-sm break-words">
                                            {data.note}
                                        </p>
                                    </div>
                                )}

                                <p className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground">
                                    <CheckCircle2 className="size-4 shrink-0 text-amber-600" />
                                    This transfer will be created as pending.
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

function LocationIcon({
    label,
    className,
}: {
    label: string;
    className: string;
}) {
    if (label.toLowerCase().includes('bank')) {
        return <Landmark className={className} />;
    }

    if (label.toLowerCase().includes('vault')) {
        return <Building2 className={className} />;
    }

    return <Wallet className={className} />;
}
