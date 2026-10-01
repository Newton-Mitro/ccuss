import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface Account {
    id: number;
    code: string;
    name: string;
    is_control_account?: boolean;
}

interface FinancialAccount {
    id: number;
    account_no: string;
    name?: string | null;
    account_type?: string;
}

interface VoucherEntry {
    id?: number;
    account_id: number;
    financial_account_id?: number | string | null;
    instrument_type?: string | null;
    instrument_id?: number | string | null;
    account?: Account;
    financial_account?: FinancialAccount;
    debit: number | string;
    credit: number | string;
    description?: string | null;
    reference?: string | null;
}

interface Voucher {
    id: number;
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    fiscal_period_id: number;
    description?: string | null;
    status: string;
    entries: VoucherEntry[];
}

interface Props extends SharedData {
    voucher: Voucher;
    accounts: Account[];
    financialAccounts: FinancialAccount[];
    cheques: {
        id: number;
        financial_account_id: number | string | null;
        cheque_no: string;
        amount: number | string | null;
        status?: string;
    }[];
    fiscalPeriods: { id: number; name?: string; period_name?: string }[];
}

const voucherTypes = [
    'JOURNAL',
    'PAYMENT',
    'RECEIPT',
    'CONTRA',
    'OPENING',
    'ADJUSTMENT',
    'CLOSING',
    'SYSTEM',
].map((value) => ({ value, label: value }));

export default function VoucherEditPage() {
    const {
        voucher,
        accounts,
        fiscalPeriods,
        financialAccounts,
        cheques = [],
    } = usePage<Props>().props as Props & {
        financialAccounts: FinancialAccount[];
        cheques?: Props['cheques'];
    };
    const [voucherDate, setVoucherDate] = useState(
        voucher.voucher_date?.split('T')[0] ?? '',
    );
    const [voucherType, setVoucherType] = useState(voucher.voucher_type);
    const [fiscalPeriodId, setFiscalPeriodId] = useState(
        String(voucher.fiscal_period_id),
    );
    const [description, setDescription] = useState(voucher.description ?? '');
    const [entries, setEntries] = useState<VoucherEntry[]>(
        voucher.entries ?? [],
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useFlashToastHandler();

    const getEntryAccount = (entry: VoucherEntry) =>
        accounts.find(
            (account) => String(account.id) === String(entry.account_id),
        );

    const validateEntry = (entry: VoucherEntry) => {
        const account = getEntryAccount(entry);

        if (!account) {
            return 'Select a valid account for each voucher entry.';
        }

        if (account.is_control_account && !entry.financial_account_id) {
            return 'Control ledger accounts require a financial account selection.';
        }

        if (entry.instrument_type && entry.instrument_type !== 'CHEQUE') {
            return 'Unsupported voucher instrument type selected.';
        }

        if (entry.instrument_type === 'CHEQUE') {
            if (!entry.financial_account_id) {
                return 'Cheque instruments require a linked financial account.';
            }

            if (!entry.instrument_id) {
                return 'Select a cheque instrument for this voucher line.';
            }

            const selectedInstrument = cheques.find(
                (instrument) =>
                    String(instrument.id) === String(entry.instrument_id),
            );

            if (
                !selectedInstrument ||
                String(selectedInstrument.financial_account_id) !==
                    String(entry.financial_account_id)
            ) {
                return 'The selected cheque does not belong to the chosen financial account.';
            }
        }

        return '';
    };

    const debitTotal = entries.reduce(
        (sum, entry) => sum + Number(entry.debit || 0),
        0,
    );
    const creditTotal = entries.reduce(
        (sum, entry) => sum + Number(entry.credit || 0),
        0,
    );
    const isBalanced = entries.length > 0 && debitTotal === creditTotal;

    const updateEntry = (index: number, changes: Partial<VoucherEntry>) => {
        setEntries((current) =>
            current.map((entry, entryIndex) =>
                entryIndex === index ? { ...entry, ...changes } : entry,
            ),
        );
    };

    const addEntry = () => {
        setEntries((current) => [
            ...current,
            {
                account_id: 0,
                debit: 0,
                credit: 0,
                description: '',
                reference: '',
            },
        ]);
    };

    const removeEntry = (index: number) => {
        setEntries((current) =>
            current.filter((_, entryIndex) => entryIndex !== index),
        );
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        if (!isBalanced) {
            setError('Debit and credit totals must be equal.');
            return;
        }

        for (const entry of entries) {
            const validationMessage = validateEntry(entry);
            if (validationMessage) {
                setError(validationMessage);
                return;
            }
        }

        setProcessing(true);
        router.put(
            route('vouchers.update', voucher.id),
            {
                voucher_date: voucherDate,
                voucher_type: voucherType,
                fiscal_period_id: Number(fiscalPeriodId),
                description,
                entries: entries.map((entry) => ({
                    account_id: Number(entry.account_id),
                    financial_account_id: entry.financial_account_id
                        ? Number(entry.financial_account_id)
                        : null,
                    instrument_type: entry.instrument_type || null,
                    instrument_id:
                        entry.instrument_type === 'CHEQUE' &&
                        entry.instrument_id
                            ? Number(entry.instrument_id)
                            : null,
                    debit: Number(entry.debit || 0),
                    credit: Number(entry.credit || 0),
                    description: entry.description || null,
                    reference: entry.reference || null,
                })),
            },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: route('vouchers.index') },
        { title: `Edit ${voucher.voucher_no}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${voucher.voucher_no}`} />
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-medium">
                            Edit {voucher.voucher_no}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update this draft voucher.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('vouchers.show', voucher.id)}>
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-md border bg-card p-4 sm:p-6"
                >
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Label>Voucher number</Label>
                            <Input value={voucher.voucher_no} disabled />
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={voucherDate}
                                onChange={(event) =>
                                    setVoucherDate(event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select
                                value={voucherType}
                                onChange={setVoucherType}
                                options={voucherTypes}
                            />
                        </div>
                        <div>
                            <Label>Fiscal period</Label>
                            <Select
                                value={fiscalPeriodId}
                                onChange={setFiscalPeriodId}
                                options={fiscalPeriods.map((period) => ({
                                    value: String(period.id),
                                    label:
                                        period.period_name ??
                                        period.name ??
                                        String(period.id),
                                }))}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Input
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        />
                    </div>

                    <div className="overflow-auto rounded-md border">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-muted text-left text-muted-foreground">
                                <tr>
                                    <th className="border-b p-2">Account</th>
                                    <th className="border-b p-2">
                                        Financial account
                                    </th>
                                    <th className="border-b p-2">
                                        Instrument type
                                    </th>
                                    <th className="border-b p-2">Cheque</th>
                                    <th className="border-b p-2">
                                        Description
                                    </th>
                                    <th className="border-b p-2 text-right">
                                        Debit
                                    </th>
                                    <th className="border-b p-2 text-right">
                                        Credit
                                    </th>
                                    <th className="border-b p-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr
                                        key={entry.id ?? index}
                                        className="border-b even:bg-muted hover:bg-accent/20"
                                    >
                                        <td className="p-2">
                                            <Select
                                                value={String(
                                                    entry.account_id || '',
                                                )}
                                                onChange={(value) => {
                                                    const selectedAccount =
                                                        accounts.find(
                                                            (account) =>
                                                                String(
                                                                    account.id,
                                                                ) ===
                                                                String(value),
                                                        );

                                                    if (
                                                        !selectedAccount?.is_control_account
                                                    ) {
                                                        updateEntry(index, {
                                                            account_id: Number(
                                                                value || 0,
                                                            ),
                                                            financial_account_id:
                                                                null,
                                                            instrument_type:
                                                                null,
                                                            instrument_id: null,
                                                        });
                                                        return;
                                                    }

                                                    updateEntry(index, {
                                                        account_id: Number(
                                                            value || 0,
                                                        ),
                                                    });
                                                }}
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select account',
                                                    },
                                                    ...accounts.map(
                                                        (account) => ({
                                                            value: String(
                                                                account.id,
                                                            ),
                                                            label: `${account.code} - ${account.name}`,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                value={String(
                                                    entry.financial_account_id ??
                                                        '',
                                                )}
                                                disabled={
                                                    !getEntryAccount(entry)
                                                        ?.is_control_account
                                                }
                                                onChange={(value) =>
                                                    updateEntry(index, {
                                                        financial_account_id:
                                                            value || null,
                                                    })
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: getEntryAccount(
                                                            entry,
                                                        )?.is_control_account
                                                            ? 'Select financial account'
                                                            : 'Disabled',
                                                    },
                                                    ...financialAccounts.map(
                                                        (account) => ({
                                                            value: String(
                                                                account.id,
                                                            ),
                                                            label: `${account.account_no} - ${account.name ?? 'Unnamed account'}`,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                value={
                                                    entry.instrument_type ?? ''
                                                }
                                                disabled={
                                                    !getEntryAccount(entry)
                                                        ?.is_control_account ||
                                                    !entry.financial_account_id
                                                }
                                                onChange={(value) =>
                                                    updateEntry(index, {
                                                        instrument_type:
                                                            value || null,
                                                        instrument_id:
                                                            value === 'CHEQUE'
                                                                ? entry.instrument_id
                                                                : null,
                                                    })
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'None',
                                                    },
                                                    {
                                                        value: 'CHEQUE',
                                                        label: 'Cheque',
                                                    },
                                                ]}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                value={String(
                                                    entry.instrument_id ?? '',
                                                )}
                                                disabled={
                                                    !getEntryAccount(entry)
                                                        ?.is_control_account ||
                                                    !entry.financial_account_id ||
                                                    entry.instrument_type !==
                                                        'CHEQUE'
                                                }
                                                onChange={(value) =>
                                                    updateEntry(index, {
                                                        instrument_id: value
                                                            ? Number(value)
                                                            : null,
                                                    })
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label:
                                                            entry.instrument_type ===
                                                            'CHEQUE'
                                                                ? 'Select cheque'
                                                                : 'Disabled',
                                                    },
                                                    ...(entry.financial_account_id
                                                        ? cheques.filter(
                                                              (cheque) =>
                                                                  String(
                                                                      cheque.financial_account_id,
                                                                  ) ===
                                                                  String(
                                                                      entry.financial_account_id,
                                                                  ),
                                                          )
                                                        : []
                                                    ).map((instrument) => ({
                                                        value: String(
                                                            instrument.id,
                                                        ),
                                                        label: `${instrument.cheque_no} (${instrument.amount ?? '0'})`,
                                                    })),
                                                ]}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                value={entry.description ?? ''}
                                                onChange={(event) =>
                                                    updateEntry(index, {
                                                        description:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={entry.debit}
                                                onChange={(event) =>
                                                    updateEntry(index, {
                                                        debit: event.target
                                                            .value,
                                                        credit: 0,
                                                    })
                                                }
                                                className="text-right"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={entry.credit}
                                                onChange={(event) =>
                                                    updateEntry(index, {
                                                        credit: event.target
                                                            .value,
                                                        debit: 0,
                                                    })
                                                }
                                                className="text-right"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeEntry(index)
                                                }
                                                title="Remove entry"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-medium">
                                    <td colSpan={5} className="p-2 text-right">
                                        Totals
                                    </td>
                                    <td className="p-2 text-right">
                                        {debitTotal.toFixed(2)}
                                    </td>
                                    <td className="p-2 text-right">
                                        {creditTotal.toFixed(2)}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addEntry}
                        >
                            <Plus className="h-4 w-4" /> Add entry
                        </Button>
                        <div className="flex items-center gap-3">
                            <span
                                className={
                                    isBalanced
                                        ? 'text-success'
                                        : 'text-destructive'
                                }
                            >
                                {isBalanced ? 'Balanced' : 'Not balanced'}
                            </span>
                            <Button
                                type="submit"
                                disabled={processing || !isBalanced}
                            >
                                <Save className="h-4 w-4" /> Save changes
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </form>
            </div>
        </CustomAuthLayout>
    );
}
