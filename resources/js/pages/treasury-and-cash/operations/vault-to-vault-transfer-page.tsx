import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../../lib/date_util';

const NOTES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
const COINS = [5, 2, 1]; // extend later if needed (e.g. 0.5)

type Denom = {
    type: 'note' | 'coin';
    value: number;
    qty: number;
    amount: number;
};

export default function VaultToVaultTransferPage() {
    const { vault_subledger_accounts, branches } = usePage().props as any;

    const { data, setData, post, processing } = useForm({
        voucher_type: 'CONTRA',
        voucher_date: new Date().toISOString().split('T')[0],
        branch_id: branches[0]?.id,
        narration: '',
        reference: '',
        lines: [],
        denominations: [],
    });

    const [fromVault, setFromVault] = useState<any>(null);
    const [toVault, setToVault] = useState<any>(null);

    const [denoms, setDenoms] = useState<Denom[]>([
        ...NOTES.map((v) => ({
            type: 'note' as const,
            value: v,
            qty: 0,
            amount: 0,
        })),
        ...COINS.map((v) => ({
            type: 'coin' as const,
            value: v,
            qty: 0,
            amount: 0,
        })),
    ]);

    const handleDenomChange = (index: number, qty: number) => {
        let safeQty = isNaN(qty) ? 0 : qty;
        if (safeQty < 0) safeQty = 0;
        if (safeQty > 10000) safeQty = 10000;

        const updated = [...denoms];
        updated[index].qty = safeQty;
        updated[index].amount = safeQty * updated[index].value;

        setDenoms(updated);

        const total = updated.reduce((sum, d) => sum + d.amount, 0);
        syncVoucher(total, updated);
    };

    const syncVoucher = (total: number, denomsData: Denom[]) => {
        if (!fromVault || !toVault || total <= 0) return;

        const lines = [
            {
                subledger_id: fromVault.id,
                name: fromVault.name,
                debit: total,
                credit: 0,
            },
            {
                subledger_id: toVault.id,
                name: toVault.name,
                debit: 0,
                credit: total,
            },
        ];

        setData('lines', lines);
        setData('denominations', denomsData);

        setData(
            'narration',
            `Cash deposited from vault ${fromVault.name} to bank ${toVault.name}`,
        );
    };

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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* LEFT */}
                    <div className="space-y-4 md:col-span-8">
                        {/* Vault Selection */}
                        <div className="rounded-md border bg-card">
                            <div className="rounded-tl-md rounded-tr-md border-b bg-sidebar text-card-foreground">
                                <h3 className="px-4 py-3 text-sm font-semibold">
                                    Vault to Vault Transfer
                                </h3>
                            </div>
                            <div className="grid gap-2 px-4 py-3 md:grid-cols-2 lg:grid-cols-3">
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

                                <div className="">
                                    <Label className="text-xs">
                                        From Vault Account
                                    </Label>
                                    <Select
                                        value={fromVault?.toString() || ''}
                                        onChange={(v) =>
                                            setFromVault(
                                                vault_subledger_accounts.find(
                                                    (x: any) =>
                                                        x.id.toString() == v,
                                                ),
                                            )
                                        }
                                        options={vault_subledger_accounts.map(
                                            (v: any) => ({
                                                value: v.id.toString(),
                                                label: v.name,
                                            }),
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <Label className="text-xs">
                                        To Vault Account
                                    </Label>
                                    <Select
                                        value={toVault?.toString() || ''}
                                        onChange={(v) =>
                                            setToVault(
                                                vault_subledger_accounts.find(
                                                    (x: any) =>
                                                        x.id.toString() == v,
                                                ),
                                            )
                                        }
                                        options={vault_subledger_accounts.map(
                                            (b: any) => ({
                                                value: b.id.toString(),
                                                label: b.name,
                                            }),
                                        )}
                                    />
                                </div>

                                {/* Narration */}
                                <div className="">
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

                        {/* Denomination Table */}
                        <div className="rounded-md border bg-card">
                            <div className="rounded-tl-md rounded-tr-md border-b bg-sidebar px-6 py-3 text-sm font-medium text-card-foreground">
                                Denomination
                            </div>
                            <div className="flex gap-4 px-4 py-3">
                                {/* NOTES */}
                                <div className="rounded-md border bg-muted/30">
                                    <h3 className="rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-2 text-sm font-semibold text-card-foreground">
                                        Notes
                                    </h3>

                                    <div className="px-4 py-2">
                                        {denoms
                                            .filter((d) => d.type === 'note')
                                            .map((d) => {
                                                const index = denoms.findIndex(
                                                    (x) => x === d,
                                                );
                                                return (
                                                    <div
                                                        key={index}
                                                        className="mb-0.5 grid grid-cols-3 gap-2"
                                                    >
                                                        <Input
                                                            disabled
                                                            value={d.value}
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={d.qty}
                                                            onChange={(e) =>
                                                                handleDenomChange(
                                                                    index,
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <Input
                                                            disabled
                                                            value={d.amount}
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* COINS */}
                                <div className="rounded-md border bg-muted/30">
                                    <h3 className="rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-2 text-sm font-semibold text-card-foreground">
                                        Coins
                                    </h3>

                                    <div className="px-4 py-2">
                                        {denoms
                                            .filter((d) => d.type === 'coin')
                                            .map((d) => {
                                                const index = denoms.findIndex(
                                                    (x) => x === d,
                                                );
                                                return (
                                                    <div
                                                        key={index}
                                                        className="mb-0.5 grid grid-cols-3 gap-2"
                                                    >
                                                        <Input
                                                            disabled
                                                            value={d.value}
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={d.qty}
                                                            onChange={(e) =>
                                                                handleDenomChange(
                                                                    index,
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <Input
                                                            disabled
                                                            value={d.amount}
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>

                            <div className="mx-8 mb-4 font-bold">
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
                                    Voucher Entries
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    {data.voucher_date &&
                                        formatDate(data.voucher_date)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-x-3 p-3 sm:grid-cols-2 md:grid-cols-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
