import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10];

export default function VaultToTellerTransferPage() {
    const { vault_subledger_accounts, teller_subledger_accounts, branches } =
        usePage().props as any;

    const { data, setData, post, processing } = useForm({
        voucher_type: 'JOURNAL',
        voucher_date: new Date().toISOString().split('T')[0],
        branch_id: branches[0]?.id,
        narration: '',
        lines: [],
        denominations: [],
    });

    const [teller, setTeller] = useState<any>(null);
    const [vault, setVault] = useState<any>(null);

    const [denoms, setDenoms] = useState(
        DENOMINATIONS.map((d) => ({
            note: d,
            qty: 0,
            amount: 0,
        })),
    );

    /**
     * Handle denomination changes
     */
    const handleDenomChange = (index: number, qty: number) => {
        const updated = [...denoms];
        updated[index].qty = qty;
        updated[index].amount = qty * updated[index].note;

        setDenoms(updated);

        const total = updated.reduce((sum, d) => sum + d.amount, 0);

        syncVoucher(total, updated);
    };

    /**
     * Sync voucher lines (IMPORTANT: reversed from Teller→Vault)
     */
    const syncVoucher = (total: number, denomData: any[]) => {
        if (!teller || !vault || total <= 0) return;

        const lines = [
            {
                subledger_id: teller.id,
                name: teller.name,
                debit: total, // ✅ teller receives
                credit: 0,
            },
            {
                subledger_id: vault.id,
                name: vault.name,
                debit: 0,
                credit: total, // ✅ vault gives
            },
        ];

        setData('lines', lines);
        setData('denominations', denomData);
        setData(
            'narration',
            `Cash issued from vault ${vault.name} to teller ${teller.name}`,
        );
    };

    /**
     * Submit
     */
    const submitTransfer = () => {
        const total = denoms.reduce((sum, d) => sum + d.amount, 0);

        if (!teller || !vault) {
            alert('Select teller and vault');
            return;
        }

        if (teller.id === vault.id) {
            alert('Invalid selection');
            return;
        }

        if (total <= 0) {
            alert('Enter valid denomination');
            return;
        }

        post('/voucher_entries');
    };

    return (
        <CustomAuthLayout>
            <Head title="Vault to Teller Transfer" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Vault to Teller Transfer"
                        description="Transfer cash from vault to teller"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* LEFT SIDE */}
                    <div className="space-y-6 md:col-span-8">
                        {/* Selection */}
                        <div className="rounded-xl border bg-card p-6">
                            <h2 className="mb-4 font-semibold">
                                Vault → Teller Transfer
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Vault */}
                                <Select
                                    onChange={(value) =>
                                        setVault(
                                            vault_subledger_accounts.find(
                                                (v: any) => v.id == value,
                                            ),
                                        )
                                    }
                                    options={vault_subledger_accounts.map(
                                        (v) => {
                                            return {
                                                value: v.id,
                                                label: v.name,
                                            };
                                        },
                                    )}
                                />

                                {/* Teller */}
                                <Select
                                    onChange={(value) =>
                                        setTeller(
                                            teller_subledger_accounts.find(
                                                (t: any) => t.id == value,
                                            ),
                                        )
                                    }
                                    options={teller_subledger_accounts.map(
                                        (t) => {
                                            return {
                                                value: t.id,
                                                label: t.name,
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
                                                        handleDenomChange(
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

                    {/* RIGHT SIDE */}
                    <div className="space-y-6 md:col-span-4">
                        {/* Voucher Preview */}
                        <div className="rounded border p-4">
                            <h3 className="mb-2 font-semibold">
                                Voucher Preview
                            </h3>

                            {data.lines.map((l: any, i: number) => (
                                <div key={i} className="text-sm">
                                    {l.name} → Debit: {l.debit} | Credit:{' '}
                                    {l.credit}
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
