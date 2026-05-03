import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';

export default function TellerCashAdjustmentPage() {
    const { teller_subledger_accounts, adjustment_accounts, branches } =
        usePage().props as any;

    const { data, setData, post, processing } = useForm({
        voucher_type: 'JOURNAL_OR_NON_CASH',
        voucher_date: new Date().toISOString().split('T')[0],
        branch_id: branches[0]?.id,
        narration: '',
        reference: '',
        amount: 0,
        lines: [],
    });

    const [tellerAccount, setTellerAccount] = useState<any>(null);
    const [adjustmentType, setAdjustmentType] = useState<'short' | 'excess'>(
        'short',
    );

    // 🔹 CORE ACCOUNTING ENGINE
    const syncVoucher = (amount: number) => {
        if (!tellerAccount || amount <= 0) return;

        const adjustmentAccount =
            adjustmentType === 'short'
                ? adjustment_accounts.short
                : adjustment_accounts.excess;

        let lines = [];

        if (adjustmentType === 'short') {
            // Loss
            lines = [
                {
                    subledger_id: adjustmentAccount.id,
                    name: adjustmentAccount.name,
                    debit: amount,
                    credit: 0,
                },
                {
                    subledger_id: tellerAccount.id,
                    name: tellerAccount.name,
                    debit: 0,
                    credit: amount,
                },
            ];
        } else {
            // Gain
            lines = [
                {
                    subledger_id: tellerAccount.id,
                    name: tellerAccount.name,
                    debit: amount,
                    credit: 0,
                },
                {
                    subledger_id: adjustmentAccount.id,
                    name: adjustmentAccount.name,
                    debit: 0,
                    credit: amount,
                },
            ];
        }

        setData('lines', lines);

        setData(
            'narration',
            `Cash ${adjustmentType} adjustment for teller ${tellerAccount.name}`,
        );
    };

    // 🔹 Re-sync on changes
    useEffect(() => {
        syncVoucher(Number(data.amount));
    }, [data.amount, tellerAccount, adjustmentType]);

    // 🔹 Submit
    const submitAdjustment = () => {
        if (!tellerAccount) {
            alert('Select teller account');
            return;
        }

        if (!data.amount || Number(data.amount) <= 0) {
            alert('Enter valid amount');
            return;
        }

        post('/voucher_entries');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury and Cash', href: '#' },
        { title: 'Teller Operations', href: '#' },
        { title: 'Cash Adjustment', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Cash Adjustment" />

            <div className="space-y-4 text-foreground">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* LEFT */}
                    <div className="space-y-4 md:col-span-8">
                        {/* HEADER */}
                        <div className="rounded-md border bg-card">
                            <div className="rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-3 text-sm font-semibold">
                                Teller Cash Adjustment
                            </div>

                            <div className="grid gap-3 px-4 py-3 md:grid-cols-2 lg:grid-cols-3">
                                {/* Branch */}
                                <div>
                                    <Label className="text-xs">Branch</Label>
                                    <Select
                                        disabled
                                        value={data.branch_id?.toString()}
                                        options={branches.map((b: any) => ({
                                            value: b.id.toString(),
                                            label: b.name,
                                        }))}
                                        onChange={(v) =>
                                            setData('branch_id', Number(v))
                                        }
                                    />
                                </div>

                                {/* Teller */}
                                <div>
                                    <Label className="text-xs">
                                        Teller Account
                                    </Label>
                                    <Select
                                        value={
                                            tellerAccount?.id?.toString() || ''
                                        }
                                        onChange={(v) =>
                                            setTellerAccount(
                                                teller_subledger_accounts.find(
                                                    (x: any) =>
                                                        x.id.toString() === v,
                                                ),
                                            )
                                        }
                                        options={teller_subledger_accounts.map(
                                            (t: any) => ({
                                                value: t.id.toString(),
                                                label: t.name,
                                            }),
                                        )}
                                    />
                                </div>

                                {/* Adjustment Type */}
                                <div>
                                    <Label className="text-xs">
                                        Adjustment Type
                                    </Label>
                                    <Select
                                        value={adjustmentType}
                                        onChange={(v) =>
                                            setAdjustmentType(v as any)
                                        }
                                        options={[
                                            {
                                                value: 'short',
                                                label: 'Cash Short',
                                            },
                                            {
                                                value: 'excess',
                                                label: 'Cash Excess',
                                            },
                                        ]}
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <Label className="text-xs">Amount</Label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData(
                                                'amount',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>

                                {/* Reference */}
                                <div>
                                    <Label className="text-xs">Reference</Label>
                                    <Input
                                        className="h-8 text-sm"
                                        value={data.reference}
                                        onChange={(e) =>
                                            setData('reference', e.target.value)
                                        }
                                    />
                                </div>

                                {/* Narration */}
                                <div>
                                    <Label className="text-xs">Narration</Label>
                                    <Input
                                        disabled
                                        className="h-8 text-sm"
                                        value={data.narration}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SUMMARY */}
                        <div className="rounded-md border bg-card px-4 py-3 font-semibold">
                            Total Adjustment:{' '}
                            {formatBDTCurrency(Number(data.amount || 0))}
                        </div>

                        {/* SUBMIT */}
                        <Button
                            onClick={submitAdjustment}
                            disabled={processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/80"
                        >
                            {processing ? 'Processing...' : 'Submit Adjustment'}
                        </Button>
                    </div>

                    {/* RIGHT */}
                    <div className="md:col-span-4">
                        <div className="rounded-md border bg-card">
                            <div className="flex justify-between rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-3 text-sm">
                                <span>Voucher Preview</span>
                                <span>{formatDate(data.voucher_date)}</span>
                            </div>

                            <div className="p-3 text-sm">
                                {data.lines.map((line: any, i: number) => (
                                    <div
                                        key={i}
                                        className="flex justify-between py-1"
                                    >
                                        <span>{line.name}</span>
                                        <span>
                                            Dr: {line.debit} | Cr: {line.credit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
