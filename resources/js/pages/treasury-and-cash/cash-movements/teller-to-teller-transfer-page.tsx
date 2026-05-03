import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';

interface VoucherFormData {
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    branch_id?: number;
    status: string;
    reference?: string;
    narration: string;
    lines: any[];
}

export default function TellerToTellerTransferPage() {
    const { teller_subledger_accounts, branches, user_branch_id } = usePage()
        .props as any;

    const { data, setData, post, processing, errors } =
        useForm<VoucherFormData>({
            voucher_no: '',
            voucher_date: new Date().toISOString().split('T')[0],
            voucher_type: 'CONTRA',
            branch_id: user_branch_id || branches[0]?.id,
            status: 'DRAFT',
            reference: '',
            narration: '',
            lines: [],
        });

    useFlashToastHandler();

    const [fromTeller, setFromTeller] = useState<any>(null);
    const [toTeller, setToTeller] = useState<any>(null);
    const [amount, setAmount] = useState<number>(0);

    const initializeLines = (from: any, to: any, amt: number) => {
        if (!from || !to || !amt) return;

        const lines = [
            {
                subledger_id: from.id,
                name: from.name,
                debit: amt,
                credit: 0,
            },
            {
                subledger_id: to.id,
                name: to.name,
                debit: 0,
                credit: amt,
            },
        ];

        setData('lines', lines);
        setData('narration', `Cash transfer from ${from.name} to ${to.name}`);
    };

    const handleFromChange = (id: string) => {
        const teller = teller_subledger_accounts.find(
            (t: any) => t.id === Number(id),
        );
        setFromTeller(teller);
        initializeLines(teller, toTeller, amount);
    };

    const handleToChange = (id: string) => {
        const teller = teller_subledger_accounts.find(
            (t: any) => t.id === Number(id),
        );
        setToTeller(teller);
        initializeLines(fromTeller, teller, amount);
    };

    const handleAmountChange = (val: number) => {
        setAmount(val);
        initializeLines(fromTeller, toTeller, val);
    };

    const submitTransfer = () => {
        if (!fromTeller || !toTeller) {
            alert('Select both tellers');
            return;
        }

        if (fromTeller.id === toTeller.id) {
            alert('From and To teller cannot be same');
            return;
        }

        if (amount <= 0) {
            alert('Enter valid amount');
            return;
        }

        post('/voucher_entries', {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury and Cash', href: '#' },
        { title: 'Cash Movements', href: '' },
        { title: 'Teller To Teller Transfer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller to Teller Transfer" />
            <div className="space-y-4 text-foreground">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* LEFT SIDE */}
                    <div className="space-y-6 md:col-span-8">
                        <div className="rounded-md border bg-card">
                            <div className="rounded-tl-md rounded-tr-md border-b bg-sidebar text-card-foreground">
                                <h3 className="px-4 py-3 text-sm font-semibold">
                                    Teller to Teller Transfer
                                </h3>
                            </div>
                            <div className="space-y-2 p-4">
                                {/* FROM & TO */}
                                <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <Label className="text-xs">
                                            Voucher Type
                                        </Label>
                                        <Select
                                            disabled
                                            error={errors?.voucher_type}
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
                                                {
                                                    value: 'SALE',
                                                    label: 'Sale',
                                                },
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
                                        <Label className="text-xs">
                                            Branch
                                        </Label>
                                        <Select
                                            disabled
                                            error={errors?.branch_id}
                                            value={
                                                data.branch_id?.toString() || ''
                                            }
                                            options={branches.map((b) => ({
                                                value: b.id.toString(),
                                                label: b.name,
                                            }))}
                                            onChange={(value) =>
                                                setData(
                                                    'branch_id',
                                                    Number(value),
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Reference */}
                                    <div>
                                        <Label className="text-xs">
                                            Deposit Slip Reference
                                        </Label>
                                        <Input
                                            error={errors?.reference}
                                            value={data.reference}
                                            className="h-8 text-sm"
                                            onChange={(e) =>
                                                setData(
                                                    'reference',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="">
                                        <Label className="text-xs">
                                            From Teller Account
                                        </Label>
                                        <Select
                                            value={fromTeller?.id.toString()}
                                            onChange={(value) =>
                                                handleFromChange(value)
                                            }
                                            options={teller_subledger_accounts.map(
                                                (t: any) => ({
                                                    value: t.id.toString(),
                                                    label: t.name,
                                                }),
                                            )}
                                        />
                                    </div>

                                    <div className="">
                                        <Label className="text-xs">
                                            To Teller Account
                                        </Label>
                                        <Select
                                            value={toTeller?.id.toString()}
                                            onChange={(value) =>
                                                handleToChange(value)
                                            }
                                            options={teller_subledger_accounts.map(
                                                (t: any) => ({
                                                    value: t.id.toString(),
                                                    label: t.name,
                                                }),
                                            )}
                                        />
                                    </div>

                                    {/* Narration */}
                                    <div className="">
                                        <Label className="text-xs">
                                            Narration
                                        </Label>
                                        <Input
                                            disabled
                                            error={errors?.narration}
                                            value={data.narration || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'narration',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="">
                                    <Label className="text-xs">Amount</Label>
                                    {/* AMOUNT */}
                                    <Input
                                        type="number"
                                        className="w-full rounded border p-2"
                                        placeholder="Enter amount"
                                        onChange={(e) =>
                                            handleAmountChange(
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>

                                {/* PREVIEW */}
                                <div className="rounded border bg-muted/30 p-4">
                                    <h3 className="mb-2 font-medium">
                                        Preview
                                    </h3>

                                    {data.lines.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            No data yet
                                        </p>
                                    )}

                                    {data.lines.map((line, index) => (
                                        <div key={index} className="text-sm">
                                            {line.name} → Debit: {line.debit} |
                                            Credit: {line.credit}
                                        </div>
                                    ))}
                                </div>

                                {/* ACTION */}
                                <Button
                                    onClick={submitTransfer}
                                    disabled={processing}
                                    className="mt-2 rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
                                >
                                    {processing
                                        ? 'Processing...'
                                        : 'Transfer Now'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6 md:col-span-4">
                        {/* Voucher Header */}
                        <div className="rounded-md border bg-card md:col-span-4">
                            <div className="sticky top-0 z-10 flex items-center justify-between rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-3">
                                <h2 className="text-sm font-medium text-card-foreground">
                                    Recent Voucher Entries
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    {data.voucher_date &&
                                        formatDate(data.voucher_date)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-x-3 p-3 sm:grid-cols-2 md:grid-cols-2">
                                {/* Voucher Type */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
