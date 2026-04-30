import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../../lib/date_util';

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10];

export default function VaultToVaultTransferPage() {
    const { vault_subledger_accounts, branches } = usePage().props as any;

    const { data, setData, post, processing } = useForm({
        voucher_type: 'JOURNAL',
        voucher_date: new Date().toISOString().split('T')[0],
        branch_id: branches[0]?.id,
        narration: '',
        lines: [],
        denominations: [],
    });

    const [fromVault, setFromVault] = useState<any>(null);
    const [toVault, setToVault] = useState<any>(null);

    const [denoms, setDenoms] = useState(
        DENOMINATIONS.map((d) => ({
            note: d,
            qty: 0,
            amount: 0,
        })),
    );

    /**
     * Handle denomination change
     */
    const handleDenominationChange = (index: number, qty: number) => {
        const updated = [...denoms];
        updated[index].qty = qty;
        updated[index].amount = qty * updated[index].note;

        setDenoms(updated);

        const total = updated.reduce((sum, d) => sum + d.amount, 0);

        updateVoucherLines(total);
    };

    /**
     * Sync voucher lines with total
     */
    const updateVoucherLines = (total: number) => {
        if (!fromVault || !toVault || total <= 0) return;

        const lines = [
            {
                subledger_id: fromVault.id,
                debit: total,
                credit: 0,
            },
            {
                subledger_id: toVault.id,
                debit: 0,
                credit: total,
            },
        ];

        setData('lines', lines);
        setData('denominations', denoms);
        setData(
            'narration',
            `Cash moved from ${fromVault.name} to ${toVault.name}`,
        );
    };

    /**
     * Submit
     */
    const submitTransfer = () => {
        const total = denoms.reduce((sum, d) => sum + d.amount, 0);

        if (!fromVault || !toVault) {
            alert('Select vaults');
            return;
        }

        if (fromVault.id === toVault.id) {
            alert('Vault cannot be same');
            return;
        }

        if (total <= 0) {
            alert('Enter denominations');
            return;
        }

        post('/voucher_entries');
    };

    return (
        <CustomAuthLayout>
            <Head title="Vault Transfer with Denomination" />
            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Vault Transfer with Denomination"
                        description="Transfer cash from one vault to another with denomination"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* LEFT */}
                    <div className="space-y-6 md:col-span-8">
                        {/* Vault Selection */}
                        <div className="rounded-xl border bg-card p-6">
                            <h2 className="mb-4 font-semibold">
                                Vault Transfer
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    value={fromVault?.id.toString()}
                                    onChange={(value) =>
                                        setFromVault(
                                            vault_subledger_accounts.find(
                                                (v: any) => v.id == value,
                                            ),
                                        )
                                    }
                                    options={vault_subledger_accounts.map(
                                        (account) => {
                                            return {
                                                value: account.id.toString(),
                                                label: account.name,
                                            };
                                        },
                                    )}
                                />

                                <Select
                                    value={toVault?.id.toString()}
                                    onChange={(value) =>
                                        setToVault(
                                            vault_subledger_accounts.find(
                                                (v: any) => v.id == value,
                                            ),
                                        )
                                    }
                                    options={vault_subledger_accounts.map(
                                        (account) => {
                                            return {
                                                value: account.id.toString(),
                                                label: account.name,
                                            };
                                        },
                                    )}
                                />
                            </div>
                        </div>

                        {/* Denomination Table */}
                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="mb-4 font-semibold">
                                Denominations
                            </h3>

                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-left">Note</th>
                                        <th className="p-2 text-left">Qty</th>
                                        <th className="p-2 text-left">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {denoms.map((d, i) => (
                                        <tr key={i}>
                                            <td className="pr-2 text-left">
                                                <Input
                                                    type="number"
                                                    disabled
                                                    value={d.note}
                                                />
                                            </td>
                                            <td className="px-2 text-left">
                                                <Input
                                                    type="number"
                                                    value={d.qty}
                                                    onChange={(e) =>
                                                        handleDenominationChange(
                                                            i,
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 text-left">
                                                <Input
                                                    type="number"
                                                    disabled
                                                    value={d.amount}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4 font-bold">
                                Total:{' '}
                                {formatBDTCurrency(
                                    denoms.reduce(
                                        (sum, d) => sum + d.amount,
                                        0,
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            onClick={submitTransfer}
                            disabled={processing}
                            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
                        >
                            {processing ? 'Processing...' : 'Transfer Cash'}
                        </Button>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6 md:col-span-4">
                        {/* Voucher Header */}
                        <div className="rounded-md border bg-card md:col-span-4">
                            <div className="sticky top-0 z-10 flex items-center justify-between rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-3">
                                <h2 className="text-sm font-medium text-card-foreground">
                                    Voucher Header
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    {data.voucher_date &&
                                        formatDate(data.voucher_date)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-x-3 p-3 sm:grid-cols-2 md:grid-cols-2">
                                {/* Voucher Type */}
                                <div>
                                    <Label className="text-xs">
                                        Voucher Type
                                    </Label>
                                    <Select
                                        disabled
                                        value={data.voucher_type || ''}
                                        options={[
                                            {
                                                value: 'CREDIT_OR_RECEIPT',
                                                label: 'Credit/Receipt',
                                            },
                                            {
                                                value: 'DEBIT_OR_PAYMENT',
                                                label: 'Debit/Payment',
                                            },
                                            {
                                                value: 'JOURNAL_OR_NON_CASH',
                                                label: 'Journal/Non-Cash',
                                            },
                                            {
                                                value: 'PURCHASE',
                                                label: 'Purchase',
                                            },
                                            { value: 'SALE', label: 'Sale' },
                                            {
                                                value: 'DEBIT_NOTE',
                                                label: 'Debit Note',
                                            },
                                            {
                                                value: 'CREDIT_NOTE',
                                                label: 'Credit Note',
                                            },
                                            {
                                                value: 'CONTRA',
                                                label: 'Contra',
                                            },
                                        ]}
                                        onChange={(value) =>
                                            setData('voucher_type', value)
                                        }
                                    />
                                </div>

                                {/* Branch */}
                                <div>
                                    <Label className="text-xs">Branch</Label>
                                    <Select
                                        disabled
                                        value={data.branch_id?.toString() || ''}
                                        options={branches.map((b) => ({
                                            value: b.id.toString(),
                                            label: b.name,
                                        }))}
                                        onChange={(value) =>
                                            setData('branch_id', Number(value))
                                        }
                                    />
                                </div>

                                {/* Reference */}
                                <div>
                                    <Label className="text-xs">
                                        Deposit Slip Reference
                                    </Label>
                                    <Input
                                        value={''}
                                        className="h-8 text-sm"
                                        onChange={(e) =>
                                            setData('reference', e.target.value)
                                        }
                                    />
                                </div>

                                {/* Narration */}
                                <div className="md:col-span-2">
                                    <Label className="text-xs">Narration</Label>
                                    <Input
                                        disabled
                                        value={data.narration || ''}
                                        onChange={(e) =>
                                            setData('narration', e.target.value)
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Preview */}
                        <div className="rounded border p-4">
                            <h3 className="mb-2 font-semibold">
                                Voucher Preview
                            </h3>

                            {data.lines.map((l, i) => (
                                <div key={i} className="text-sm">
                                    {l.subledger_id} → Debit: {l.debit} |
                                    Credit: {l.credit}
                                </div>
                            ))}
                        </div>

                        {/* Narration */}
                        <textarea
                            className="w-full rounded border p-2"
                            placeholder="Narration"
                            value={data.narration}
                            onChange={(e) =>
                                setData('narration', e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
