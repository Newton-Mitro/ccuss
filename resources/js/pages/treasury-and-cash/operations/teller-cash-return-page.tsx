import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10];

export default function TellerToVaultTransferPage() {
    const { teller_subledger_accounts, vault_subledger_accounts, branches } =
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
     * Handle denomination input
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
     * Sync voucher lines
     */
    const syncVoucher = (total: number, denomsData: any[]) => {
        if (!teller || !vault || total <= 0) return;

        const lines = [
            {
                subledger_id: vault.id,
                name: vault.name,
                debit: total,
                credit: 0,
            },
            {
                subledger_id: teller.id,
                name: teller.name,
                debit: 0,
                credit: total,
            },
        ];

        setData('lines', lines);
        setData('denominations', denomsData);
        setData(
            'narration',
            `Cash transferred from teller ${teller.name} to vault ${vault.name}`,
        );
    };

    /**
     * Submit handler
     */
    const submitTransfer = () => {
        const total = denoms.reduce((sum, d) => sum + d.amount, 0);

        if (!teller || !vault) {
            alert('Select teller and vault');
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
            <Head title="Teller to Vault Transfer" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* LEFT */}
                <div className="space-y-6 md:col-span-8">
                    {/* Selection */}
                    <div className="rounded-xl border p-6">
                        <h2 className="mb-4 font-semibold">
                            Teller → Vault Transfer
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Teller */}
                            <select
                                className="rounded border p-2"
                                onChange={(e) =>
                                    setTeller(
                                        teller_subledger_accounts.find(
                                            (t: any) => t.id == e.target.value,
                                        ),
                                    )
                                }
                            >
                                <option>Select Teller</option>
                                {teller_subledger_accounts.map((t: any) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>

                            {/* Vault */}
                            <select
                                className="rounded border p-2"
                                onChange={(e) =>
                                    setVault(
                                        vault_subledger_accounts.find(
                                            (v: any) => v.id == e.target.value,
                                        ),
                                    )
                                }
                            >
                                <option>Select Vault</option>
                                {vault_subledger_accounts.map((v: any) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Denomination */}
                    <div className="rounded-xl border p-6">
                        <h3 className="mb-4 font-semibold">
                            Denomination Entry
                        </h3>

                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th>Note</th>
                                    <th>Qty</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {denoms.map((d, i) => (
                                    <tr key={i}>
                                        <td>{d.note}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="w-full border p-1"
                                                value={d.qty}
                                                onChange={(e) =>
                                                    handleDenomChange(
                                                        i,
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>{d.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 font-bold">
                            Total:{' '}
                            {denoms.reduce((sum, d) => sum + d.amount, 0)}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={submitTransfer}
                        disabled={processing}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        {processing ? 'Processing...' : 'Transfer Cash'}
                    </button>
                </div>

                {/* RIGHT */}
                <div className="space-y-6 md:col-span-4">
                    {/* Preview */}
                    <div className="rounded border p-4">
                        <h3 className="mb-2 font-semibold">Voucher Preview</h3>

                        {data.lines.map((l: any, i: number) => (
                            <div key={i} className="text-sm">
                                {l.name} → Debit: {l.debit} | Credit: {l.credit}
                            </div>
                        ))}
                    </div>

                    {/* Narration */}
                    <textarea
                        className="w-full rounded border p-2"
                        placeholder="Narration"
                        value={data.narration}
                        onChange={(e) => setData('narration', e.target.value)}
                    />
                </div>
            </div>
        </CustomAuthLayout>
    );
}
