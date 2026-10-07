import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

interface Account {
    id: number;
    code: string;
    name: string;
    type?: string;
    is_control_account?: boolean;
}

interface CostCenter {
    id: number;
    code: string;
    name: string;
}

interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
}

interface FiscalPeriod {
    id: number;
    name: string;
    fiscal_year?: {
        name: string;
    };
}

interface Entry {
    account_id: string;
    party_id: string;
    debit: string;
    credit: string;
    description: string;
    cost_center_id: string;
}

const emptyEntry = (): Entry => ({
    account_id: '',
    party_id: '',
    debit: '',
    credit: '',
    description: '',
    cost_center_id: '',
});

const voucherModes: Record<
    string,
    {
        label: string;
        description: string;
        accountHint: string;
        lineHint: string;
        debitLabel: string;
        creditLabel: string;
        rule: string;
    }
> = {
    JOURNAL: {
        label: 'Journal voucher',
        description: 'Record a balanced non-cash accounting adjustment.',
        accountHint: 'Choose the affected ledger account.',
        lineHint: 'Add each debit and credit movement.',
        debitLabel: 'Debit account',
        creditLabel: 'Credit account',
        rule: 'Use this for non-cash adjustments and reclassifications.',
    },

    PAYMENT: {
        label: 'Payment voucher',
        description: 'Record money paid from the organization.',
        accountHint: 'Choose the expense or payable account.',
        lineHint: 'Add the payment allocation lines.',
        debitLabel: 'Expense or payable',
        creditLabel: 'Cash or bank account',
        rule: 'Use one cash or bank credit line, with one or more expense or payable debit lines.',
    },

    RECEIPT: {
        label: 'Receipt voucher',
        description: 'Record money received by the organization.',
        accountHint: 'Choose the income, receivable, or source account.',
        lineHint: 'Add the receipt allocation lines.',
        debitLabel: 'Cash or bank account',
        creditLabel: 'Income or receivable',
        rule: 'Use one cash or bank debit line, with one or more income or receivable credit lines.',
    },

    CONTRA: {
        label: 'Contra voucher',
        description: 'Transfer value between cash and bank accounts.',
        accountHint: 'Choose the source or destination account.',
        lineHint: 'Use matching source and destination lines.',
        debitLabel: 'Receiving cash or bank',
        creditLabel: 'Paying cash or bank',
        rule: 'Use exactly two cash or bank accounts: one debit and one credit.',
    },

    ADJUSTMENT: {
        label: 'Adjustment voucher',
        description: 'Correct or reclassify an existing accounting balance.',
        accountHint: 'Choose the account to adjust.',
        lineHint: 'Document the correction clearly.',
        debitLabel: 'Debit account',
        creditLabel: 'Credit account',
        rule: 'Explain the correction in the description and line notes.',
    },

    OPENING: {
        label: 'Opening voucher',
        description: 'Set opening balances for the active fiscal period.',
        accountHint: 'Choose the opening balance account.',
        lineHint: 'Enter the opening debit and credit balances.',
        debitLabel: 'Debit account',
        creditLabel: 'Credit account',
        rule: 'Opening balances must balance before they can be saved.',
    },
};

export default function JournalVoucherEntryPage() {
    const { fiscalPeriods, accounts, costCenters, parties, voucherType } =
        usePage().props as unknown as {
            fiscalPeriods: FiscalPeriod[];
            accounts: Account[];
            costCenters: CostCenter[];
            parties: Party[];
            voucherType: string;
        };

    const mode = voucherModes[voucherType] ?? voucherModes.JOURNAL;

    const { data, setData, post, processing, errors } = useForm({
        fiscal_period_id: String(fiscalPeriods[0]?.id ?? ''),
        voucher_type: voucherType || 'JOURNAL',
        voucher_date: new Date().toISOString().slice(0, 10),
        description: '',
        entries: [] as Entry[],
    });

    const [draftEntry, setDraftEntry] = useState<Entry>(emptyEntry());
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draftDescription, setDraftDescription] = useState('');
    const [draftError, setDraftError] = useState('');

    useFlashToastHandler();

    const updateDraftEntry = (field: keyof Entry, value: string) => {
        setDraftError('');
        setDraftEntry((current) => {
            return { ...current, [field]: value };
        });
    };

    const isSettlementAccount = (account?: Account) =>
        Boolean(
            account &&
            account.type?.toLowerCase() === 'asset' &&
            /cash|bank/i.test(`${account.code} ${account.name}`),
        );

    const accountingLineIsValid = (
        account: Account | undefined,
        isDebit: boolean,
    ) => {
        if (!account) {
            setDraftError('Select a valid ledger account for this line.');
            return false;
        }

        const settlement = isSettlementAccount(account);

        if (voucherType === 'CONTRA' && !settlement) {
            setDraftError(
                'Contra vouchers can only use cash or bank accounts.',
            );
            return false;
        }

        if (voucherType === 'PAYMENT' && (isDebit ? settlement : !settlement)) {
            setDraftError(
                isDebit
                    ? 'Payment debits must use an expense, payable, or other non-cash account.'
                    : 'Payment credits must use a cash or bank account.',
            );
            return false;
        }

        if (voucherType === 'RECEIPT' && (isDebit ? !settlement : settlement)) {
            setDraftError(
                isDebit
                    ? 'Receipt debits must use a cash or bank account.'
                    : 'Receipt credits must use an income, receivable, or other non-cash account.',
            );
            return false;
        }

        if (
            (voucherType === 'PAYMENT' || voucherType === 'RECEIPT') &&
            settlement &&
            data.entries.some((entry, index) => {
                if (index === editingIndex) {
                    return false;
                }

                const existingAccount = accounts.find(
                    (item) => String(item.id) === entry.account_id,
                );
                return isSettlementAccount(existingAccount);
            })
        ) {
            setDraftError(
                `${mode.label} allows exactly one cash or bank line. Add other accounts on the allocation side.`,
            );
            return false;
        }

        return true;
    };

    const resetDraft = () => {
        setDraftEntry(emptyEntry());
        setDraftDescription('');
        setEditingIndex(null);
        setDraftError('');
    };

    const validateDraftEntry = (entry: Entry) => {
        const debit = Number(entry.debit || 0);
        const credit = Number(entry.credit || 0);
        const hasDebit = debit > 0;
        const hasCredit = credit > 0;
        if (debit < 0 || credit < 0 || hasDebit === hasCredit) {
            setDraftError(
                'Enter a positive amount in either Debit or Credit, not both.',
            );
            return false;
        }

        const side = hasDebit ? 'debit' : 'credit';
        const account = accounts.find(
            (item) => String(item.id) === entry.account_id,
        );
        const amount = Number(entry[side] || 0);
        if (!account) {
            setDraftError('Select a valid ledger account.');
            return false;
        }
        if (amount <= 0) return false;
        return accountingLineIsValid(account, side === 'debit');
    };

    const addOrUpdateEntry = () => {
        if (!validateDraftEntry(draftEntry)) return;

        const updatedEntry = {
            ...draftEntry,
            description: draftDescription,
        };
        if (editingIndex !== null) {
            setData(
                'entries',
                data.entries.map((current, index) =>
                    index === editingIndex ? updatedEntry : current,
                ),
            );
            resetDraft();
            return;
        }

        setData('entries', [...data.entries, updatedEntry]);
        resetDraft();
    };

    const editEntry = (index: number) => {
        const entry = data.entries[index];

        if (!entry) {
            return;
        }

        setDraftEntry({ ...entry });
        setDraftDescription(entry.description);
        setEditingIndex(index);
    };

    const deleteEntry = (index: number) => {
        setData(
            'entries',
            data.entries.filter((_, current) => current !== index),
        );

        if (editingIndex === index) {
            resetDraft();
        } else if (editingIndex !== null && editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
    };

    const totalDebit = data.entries.reduce(
        (sum, entry) => sum + Number(entry.debit || 0),
        0,
    );

    const totalCredit = data.entries.reduce(
        (sum, entry) => sum + Number(entry.credit || 0),
        0,
    );

    const difference = Math.abs(totalDebit - totalCredit);

    const balanced =
        data.entries.length >= 2 &&
        totalDebit > 0 &&
        totalCredit > 0 &&
        difference < 0.0001;

    const accountingIssue = (() => {
        if (voucherType === 'CONTRA') {
            if (data.entries.length > 2) {
                return 'A contra voucher must contain exactly two lines.';
            }

            if (
                data.entries.some((entry) => {
                    const account = accounts.find(
                        (item) => String(item.id) === entry.account_id,
                    );
                    return !isSettlementAccount(account);
                })
            ) {
                return 'Contra vouchers require cash or bank accounts on both sides.';
            }
        }

        if (voucherType === 'PAYMENT' || voucherType === 'RECEIPT') {
            const settlementLineCount = data.entries.filter((entry) => {
                const account = accounts.find(
                    (item) => String(item.id) === entry.account_id,
                );
                return isSettlementAccount(account);
            }).length;

            const hasAllocation = data.entries.some((entry) => {
                const account = accounts.find(
                    (item) => String(item.id) === entry.account_id,
                );
                return !isSettlementAccount(account);
            });

            if (settlementLineCount !== 1 || !hasAllocation) {
                return `${mode.label} needs exactly one cash/bank line and one or more allocation lines.`;
            }
        }

        return '';
    })();

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!balanced || accountingIssue || processing) {
            return;
        }

        post(route('vouchers.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'General Accounting',
            href: '',
        },
        {
            title: 'Vouchers',
            href: route('vouchers.index'),
        },
        {
            title: 'Create Voucher',
            href: '',
        },
    ];

    const canAddEntry = Boolean(
        draftEntry.account_id || draftEntry.debit || draftEntry.credit,
    );

    const accountOptionsFor = (entry: Entry) =>
        accounts.filter((account) => {
            const selected = String(account.id) === entry.account_id;
            return (
                selected ||
                voucherType !== 'CONTRA' ||
                isSettlementAccount(account)
            );
        });

    const renderDraftEntry = () => {
        const entry = draftEntry;

        return (
            <div className="space-y-1.5">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_120px_120px_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto] lg:items-end">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-xs">Ledger account</Label>
                        <Select
                            value={entry.account_id}
                            onChange={(value) =>
                                updateDraftEntry('account_id', value)
                            }
                            options={[
                                { value: '', label: 'Select ledger account' },
                                ...accountOptionsFor(entry).map((account) => ({
                                    value: String(account.id),
                                    label: `${account.code} - ${account.name}${account.is_control_account ? ' · Control' : ''}`,
                                })),
                            ]}
                        />
                    </div>
                    {(['debit', 'credit'] as const).map((side) => (
                        <div key={side}>
                            <Label
                                className={`text-xs font-medium ${side === 'debit' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}
                            >
                                {side === 'debit'
                                    ? 'Debit amount'
                                    : 'Credit amount'}
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={entry[side]}
                                placeholder="0.00"
                                onChange={(event) =>
                                    updateDraftEntry(side, event.target.value)
                                }
                            />
                        </div>
                    ))}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-xs">Party</Label>
                        <Select
                            value={entry.party_id}
                            onChange={(value) =>
                                updateDraftEntry('party_id', value)
                            }
                            options={[
                                { value: '', label: 'No party' },
                                ...parties.map((party) => ({
                                    value: String(party.id),
                                    label: `${party.code} - ${party.name}`,
                                })),
                            ]}
                        />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-xs">Line description</Label>
                        <Input
                            value={draftDescription}
                            placeholder="Optional"
                            onChange={(event) =>
                                setDraftDescription(event.target.value)
                            }
                        />
                    </div>
                    <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                        {editingIndex !== null && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetDraft}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="button"
                            size="sm"
                            onClick={addOrUpdateEntry}
                            disabled={!canAddEntry}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            {editingIndex === null
                                ? 'Add entry'
                                : 'Update entry'}
                        </Button>
                    </div>
                </div>

                <details
                    open={Boolean(entry.cost_center_id)}
                    className="border-t border-border/60 pt-1"
                >
                    <summary className="w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Cost center
                    </summary>
                    <div className="mt-1 max-w-sm">
                        <Select
                            value={entry.cost_center_id}
                            onChange={(value) =>
                                updateDraftEntry('cost_center_id', value)
                            }
                            options={[
                                { value: '', label: 'None' },
                                ...costCenters.map((center) => ({
                                    value: String(center.id),
                                    label: `${center.code} - ${center.name}`,
                                })),
                            ]}
                        />
                    </div>
                </details>
            </div>
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${data.voucher_type} Voucher`} />

            <div className="space-y-3">
                <ResourcePageHeader
                    title={mode.label}
                    description={mode.description}
                    action={
                        <StatusBadge
                            tone={
                                balanced && !accountingIssue
                                    ? 'success'
                                    : 'warning'
                            }
                        >
                            {balanced && !accountingIssue
                                ? 'Ready to save'
                                : balanced
                                  ? 'Needs review'
                                  : 'Needs balancing'}
                        </StatusBadge>
                    }
                />

                <form
                    onSubmit={submit}
                    className="space-y-2 rounded-xl border border-border/80 bg-card p-2 sm:p-3"
                >
                    <div className="space-y-2">
                        {/* Voucher Details */}
                        <section className="rounded-lg border border-border/70 bg-muted/20 p-2">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Voucher details
                                    </h2>

                                    <p className="text-[11px] text-muted-foreground">
                                        Period, date, purpose
                                    </p>
                                </div>

                                <p className="hidden text-xs text-muted-foreground sm:block">
                                    {mode.label}
                                </p>
                            </div>

                            <div className="grid gap-2 md:grid-cols-[minmax(200px,0.9fr)_160px_minmax(240px,1.5fr)] md:items-end">
                                <div>
                                    <Label className="text-xs">
                                        Fiscal period
                                    </Label>

                                    <Select
                                        value={data.fiscal_period_id}
                                        onChange={(value) =>
                                            setData('fiscal_period_id', value)
                                        }
                                        options={fiscalPeriods.map(
                                            (period) => ({
                                                value: String(period.id),
                                                label: `${period.name}${
                                                    period.fiscal_year?.name
                                                        ? ` - ${period.fiscal_year.name}`
                                                        : ''
                                                }`,
                                            }),
                                        )}
                                    />

                                    <InputError
                                        message={errors.fiscal_period_id}
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs">
                                        Voucher date
                                    </Label>

                                    <AppDatePicker
                                        value={data.voucher_date}
                                        onChange={(value) =>
                                            setData('voucher_date', value)
                                        }
                                    />

                                    <InputError message={errors.voucher_date} />
                                </div>

                                <div>
                                    <Label className="text-xs">
                                        Description
                                    </Label>

                                    <Input
                                        value={data.description}
                                        placeholder="Voucher purpose"
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    <InputError message={errors.description} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-2 rounded-lg border border-border/70 bg-card p-2 sm:p-3">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Voucher entries
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground">
                                        {mode.rule}
                                    </p>
                                </div>
                                <StatusBadge tone="info">
                                    {data.entries.length} lines
                                </StatusBadge>
                            </div>

                            <div className="grid gap-2">
                                {renderDraftEntry()}
                            </div>

                            {draftError && (
                                <p className="text-sm text-destructive">
                                    {draftError}
                                </p>
                            )}
                            <InputError message={errors.entries} />
                        </section>
                    </div>

                    {/* Added Voucher Lines */}
                    <section className="space-y-2 rounded-lg border border-border/70 bg-card p-2">
                        <div className="flex items-center justify-between border-b border-border/70 pb-2">
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Added voucher lines
                                </h2>

                                <p className="text-[11px] text-muted-foreground">
                                    {data.entries.length
                                        ? 'Review or edit before saving.'
                                        : 'Add an account entry above.'}
                                </p>
                            </div>

                            <span className="text-xs text-muted-foreground">
                                {data.entries.length} lines
                            </span>
                        </div>

                        {data.entries.length === 0 ? (
                            <div className="rounded-md border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground">
                                Select a ledger account and enter a debit or
                                credit amount above to begin.
                            </div>
                        ) : (
                            <div className="max-h-40 overflow-auto rounded-md border bg-background">
                                <table className="w-full min-w-180 border-collapse text-sm">
                                    <thead className="bg-muted text-left text-muted-foreground">
                                        <tr>
                                            <th className="border-b px-2 py-1 text-xs">
                                                Account details
                                            </th>

                                            <th className="border-b px-2 py-1 text-right text-xs">
                                                Debit
                                            </th>

                                            <th className="border-b px-2 py-1 text-right text-xs">
                                                Credit
                                            </th>

                                            <th className="border-b px-2 py-1 text-xs">
                                                Description
                                            </th>

                                            <th className="border-b px-2 py-1 text-right text-xs">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.entries.map((entry, index) => {
                                            const account = accounts.find(
                                                (item) =>
                                                    String(item.id) ===
                                                    entry.account_id,
                                            );

                                            const party = parties.find(
                                                (item) =>
                                                    String(item.id) ===
                                                    entry.party_id,
                                            );

                                            const costCenter = costCenters.find(
                                                (center) =>
                                                    String(center.id) ===
                                                    entry.cost_center_id,
                                            );
                                            return (
                                                <tr
                                                    key={`${entry.account_id}-${index}`}
                                                    className="border-b last:border-b-0 even:bg-muted/40 hover:bg-accent/20"
                                                >
                                                    <td className="px-2 py-1">
                                                        <div className="leading-tight font-medium">
                                                            {account
                                                                ? `${account.code} - ${account.name}`
                                                                : '-'}
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-2 text-[11px] leading-tight text-muted-foreground">
                                                            {party && (
                                                                <span>
                                                                    Party:{' '}
                                                                    {party.name}
                                                                </span>
                                                            )}
                                                            {costCenter && (
                                                                <span>
                                                                    {
                                                                        costCenter.name
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-1 text-right tabular-nums">
                                                        {Number(
                                                            entry.debit || 0,
                                                        ).toFixed(4)}
                                                    </td>

                                                    <td className="px-2 py-1 text-right tabular-nums">
                                                        {Number(
                                                            entry.credit || 0,
                                                        ).toFixed(4)}
                                                    </td>

                                                    <td className="max-w-48 truncate px-2 py-1 text-muted-foreground">
                                                        {entry.description ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-2 py-1">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    editEntry(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Delete line"
                                                                onClick={() =>
                                                                    deleteEntry(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="flex flex-col gap-2 border-t pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge tone="info">
                                    Debit {totalDebit.toFixed(4)}
                                </StatusBadge>

                                <StatusBadge tone="info">
                                    Credit {totalCredit.toFixed(4)}
                                </StatusBadge>

                                {!balanced && data.entries.length > 0 && (
                                    <StatusBadge tone="warning">
                                        Difference {difference.toFixed(4)}
                                    </StatusBadge>
                                )}

                                {accountingIssue && data.entries.length > 0 && (
                                    <StatusBadge tone="warning">
                                        {accountingIssue}
                                    </StatusBadge>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    !balanced ||
                                    Boolean(accountingIssue)
                                }
                            >
                                {processing
                                    ? 'Saving...'
                                    : 'Save draft voucher'}
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
