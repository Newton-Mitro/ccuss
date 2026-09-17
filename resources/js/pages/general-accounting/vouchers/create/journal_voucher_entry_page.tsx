import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
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
}

interface CostCenter {
    id: number;
    code: string;
    name: string;
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
    debit: string;
    credit: string;
    description: string;
    cost_center_id: string;
}

const emptyEntry = (): Entry => ({
    account_id: '',
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
    const { fiscalPeriods, accounts, costCenters, voucherType } = usePage()
        .props as unknown as {
        fiscalPeriods: FiscalPeriod[];
        accounts: Account[];
        costCenters: CostCenter[];
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
    const [draftError, setDraftError] = useState('');

    useFlashToastHandler();

    const updateDraftEntry = (field: keyof Entry, value: string) => {
        setDraftError('');
        setDraftEntry((current) => ({
            ...current,
            [field]: value,
        }));
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

    const addOrUpdateEntry = () => {
        const debit = Number(draftEntry.debit || 0);
        const credit = Number(draftEntry.credit || 0);
        const account = accounts.find(
            (item) => String(item.id) === draftEntry.account_id,
        );

        // An entry must have an account and exactly one side.
        if (!draftEntry.account_id) {
            setDraftError('Select a ledger account for this line.');
            return;
        }

        if ((debit <= 0 && credit <= 0) || (debit > 0 && credit > 0)) {
            setDraftError('Enter a positive amount on exactly one side.');
            return;
        }

        if (!accountingLineIsValid(account, debit > 0)) {
            return;
        }

        if (editingIndex === null) {
            setData('entries', [
                ...data.entries,
                {
                    ...draftEntry,
                },
            ]);
        } else {
            setData(
                'entries',
                data.entries.map((entry, index) =>
                    index === editingIndex ? { ...draftEntry } : entry,
                ),
            );
        }

        setDraftEntry(emptyEntry());
        setEditingIndex(null);
        setDraftError('');
    };

    const editEntry = (index: number) => {
        const entry = data.entries[index];

        if (!entry) {
            return;
        }

        setDraftEntry({
            ...entry,
        });

        setEditingIndex(index);
    };

    const deleteEntry = (index: number) => {
        setData(
            'entries',
            data.entries.filter((_, current) => current !== index),
        );

        if (editingIndex === index) {
            setDraftEntry(emptyEntry());
            setEditingIndex(null);
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

    const draftDebit = Number(draftEntry.debit || 0);
    const draftCredit = Number(draftEntry.credit || 0);

    const canAddEntry =
        Boolean(draftEntry.account_id) &&
        ((draftDebit > 0 && draftCredit === 0) ||
            (draftCredit > 0 && draftDebit === 0));

    const draftAccountOptions = accounts.filter((account) => {
        const selected = String(account.id) === draftEntry.account_id;

        if (voucherType === 'CONTRA') {
            return selected || isSettlementAccount(account);
        }

        if (voucherType === 'PAYMENT' && draftCredit > 0) {
            return selected || isSettlementAccount(account);
        }

        if (voucherType === 'PAYMENT' && draftDebit > 0) {
            return selected || !isSettlementAccount(account);
        }

        if (voucherType === 'RECEIPT' && draftDebit > 0) {
            return selected || isSettlementAccount(account);
        }

        if (voucherType === 'RECEIPT' && draftCredit > 0) {
            return selected || !isSettlementAccount(account);
        }

        return true;
    });

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
                    className="space-y-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-4"
                >
                    {/* Voucher Details */}
                    <section className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-medium text-foreground">
                                    Voucher details
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Period, date, and purpose
                                </p>
                            </div>

                            <p className="hidden text-xs text-muted-foreground sm:block">
                                {mode.label}
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label>Fiscal period</Label>

                                <Select
                                    value={data.fiscal_period_id}
                                    onChange={(value) =>
                                        setData('fiscal_period_id', value)
                                    }
                                    options={fiscalPeriods.map((period) => ({
                                        value: String(period.id),
                                        label: `${period.name}${
                                            period.fiscal_year?.name
                                                ? ` - ${period.fiscal_year.name}`
                                                : ''
                                        }`,
                                    }))}
                                />

                                <InputError message={errors.fiscal_period_id} />
                            </div>

                            <div>
                                <Label>Voucher date</Label>

                                <Input
                                    type="date"
                                    value={data.voucher_date}
                                    onChange={(event) =>
                                        setData(
                                            'voucher_date',
                                            event.target.value,
                                        )
                                    }
                                />

                                <InputError message={errors.voucher_date} />
                            </div>

                            <div>
                                <Label>Description</Label>

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

                    {/* Add Voucher Entry */}
                    <section className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-medium text-foreground">
                                    Voucher entries
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    {mode.lineHint} Debit and credit must
                                    balance.
                                </p>
                                <p className="text-xs font-medium text-primary">
                                    Rule: {mode.rule}
                                </p>
                            </div>

                            <StatusBadge tone="info">
                                {data.entries.length} added
                            </StatusBadge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            <div className="xl:col-span-2">
                                <Label>Account</Label>

                                <Select
                                    value={draftEntry.account_id}
                                    onChange={(value) =>
                                        updateDraftEntry('account_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select account',
                                        },
                                        ...draftAccountOptions.map(
                                            (account) => ({
                                                value: String(account.id),
                                                label: `${account.code} - ${account.name} (${account.type ?? 'ledger'})`,
                                            }),
                                        ),
                                    ]}
                                />
                            </div>

                            <div>
                                <Label>Cost center</Label>

                                <Select
                                    value={draftEntry.cost_center_id}
                                    onChange={(value) =>
                                        updateDraftEntry(
                                            'cost_center_id',
                                            value,
                                        )
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'None',
                                        },
                                        ...costCenters.map((costCenter) => ({
                                            value: String(costCenter.id),
                                            label: `${costCenter.code} - ${costCenter.name}`,
                                        })),
                                    ]}
                                />
                            </div>

                            <div>
                                <Label>{mode.debitLabel}</Label>

                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={draftEntry.debit}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        updateDraftEntry('debit', value);

                                        if (Number(value) > 0) {
                                            setDraftEntry((current) => ({
                                                ...current,
                                                debit: value,
                                                credit: '',
                                            }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <Label>{mode.creditLabel}</Label>

                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={draftEntry.credit}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        updateDraftEntry('credit', value);

                                        if (Number(value) > 0) {
                                            setDraftEntry((current) => ({
                                                ...current,
                                                credit: value,
                                                debit: '',
                                            }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <Label>Line description</Label>

                                <Input
                                    value={draftEntry.description}
                                    placeholder="Optional"
                                    onChange={(event) =>
                                        updateDraftEntry(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                onClick={addOrUpdateEntry}
                                disabled={!canAddEntry}
                            >
                                {editingIndex === null ? (
                                    <Plus className="mr-1.5 h-4 w-4" />
                                ) : null}

                                {editingIndex === null
                                    ? 'Add line'
                                    : 'Update line'}
                            </Button>
                        </div>

                        {draftError && (
                            <p className="text-sm text-destructive">
                                {draftError}
                            </p>
                        )}

                        <InputError message={errors.entries} />
                    </section>

                    {/* Added Voucher Lines */}
                    <section className="space-y-3 rounded-xl border border-border/70 bg-card p-3">
                        <div className="flex items-center justify-between border-b border-border/70 pb-2">
                            <div>
                                <h2 className="font-medium text-foreground">
                                    Added voucher lines
                                </h2>

                                <p className="text-xs text-muted-foreground">
                                    Review, edit, or remove lines before saving.
                                </p>
                            </div>

                            <span className="text-xs text-muted-foreground">
                                {data.entries.length} lines
                            </span>
                        </div>

                        {data.entries.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                                Add a debit or credit line above to begin.
                            </div>
                        ) : (
                            <div className="overflow-auto rounded-lg border">
                                <table className="w-full min-w-[850px] border-collapse text-sm">
                                    <thead className="bg-muted text-left text-muted-foreground">
                                        <tr>
                                            <th className="border-b px-2 py-1.5">
                                                Account
                                            </th>

                                            <th className="border-b px-2 py-1.5">
                                                Cost center
                                            </th>

                                            <th className="border-b px-2 py-1.5 text-right">
                                                Debit
                                            </th>

                                            <th className="border-b px-2 py-1.5 text-right">
                                                Credit
                                            </th>

                                            <th className="border-b px-2 py-1.5">
                                                Description
                                            </th>

                                            <th className="border-b px-2 py-1.5 text-right">
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
                                                    <td className="px-2 py-1.5 font-medium">
                                                        {account
                                                            ? `${account.code} - ${account.name}`
                                                            : '-'}
                                                    </td>

                                                    <td className="px-2 py-1.5 text-muted-foreground">
                                                        {costCenter?.name ??
                                                            'None'}
                                                    </td>

                                                    <td className="px-2 py-1.5 text-right tabular-nums">
                                                        {Number(
                                                            entry.debit || 0,
                                                        ).toFixed(4)}
                                                    </td>

                                                    <td className="px-2 py-1.5 text-right tabular-nums">
                                                        {Number(
                                                            entry.credit || 0,
                                                        ).toFixed(4)}
                                                    </td>

                                                    <td className="max-w-48 truncate px-2 py-1.5 text-muted-foreground">
                                                        {entry.description ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-2 py-1.5">
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
                        <div className="flex flex-col gap-2 border-t pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
