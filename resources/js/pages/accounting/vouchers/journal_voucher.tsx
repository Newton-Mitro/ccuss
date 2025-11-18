import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';

import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { LedgerSearch } from '../../../components/ledger-search';
import { Textarea } from '../../../components/ui/text-area';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ChevronRight, Plus, Search, Trash2 } from 'lucide-react';

export default function JournalVoucherEntry() {
    // Single row shape
    const emptyRow = {
        account_id: '',
        gl_account_id: '',
        gl_account_name: '',
        sl_account_id: '',
        sl_account_name: '',
        instrument_name: '',
        debit: '',
        credit: '',
    };

    const [rows, setRows] = useState([emptyRow]);

    const [voucherNo, setVoucherNo] = useState('');
    const [date, setDate] = useState('');
    const [reference, setReference] = useState('');
    const [narration, setNarration] = useState('');

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

    // Placeholder handlers — replace with your modal or API search
    const onSearchSL = (index) => {
        console.log('Search SL for row:', index);
        // open modal or fetch list
    };

    const onSearchInstrument = (index) => {
        console.log('Search Instrument for row:', index);
        // open modal or fetch list
    };

    // Totals calculation
    const totals = useMemo(() => {
        let debitTotal = 0;
        let creditTotal = 0;

        rows.forEach((r) => {
            debitTotal += parseFloat(r.debit || 0);
            creditTotal += parseFloat(r.credit || 0);
        });

        return { debitTotal, creditTotal };
    }, [rows]);

    const canSubmit =
        totals.debitTotal === totals.creditTotal && totals.debitTotal > 0;

    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Journal Voucher', href: '' },
            ]}
        >
            <Head title="Journal Voucher Entry" />

            <div className="animate-in space-y-6 text-foreground fade-in">
                <HeadingSmall
                    title="Journal Voucher Entry"
                    description="Create and manage journal vouchers efficiently"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full space-y-4"
                >
                    <Card className="rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardContent className="space-y-4 p-4">
                            {/* Voucher Info */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                    <Label>Voucher No</Label>
                                    <Input
                                        className="h-9 text-sm"
                                        value={voucherNo}
                                        onChange={(e) =>
                                            setVoucherNo(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        className="h-9 text-sm"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Reference</Label>
                                    <Input
                                        className="h-9 text-sm"
                                        value={reference}
                                        onChange={(e) =>
                                            setReference(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Journal Rows */}
                            <div className="space-y-2">
                                {/* Header Row (desktop only) */}
                                <div className="hidden items-end rounded-lg border-b border-gray-300 bg-gray-100 p-3 text-sm font-medium md:flex dark:border-gray-700 dark:bg-gray-800">
                                    <div className="w-full md:w-24">Acc ID</div>
                                    <div className="w-full md:flex-2">
                                        GL Account
                                    </div>
                                    <div className="w-full md:w-24">SL ID</div>
                                    <div className="w-full md:flex-2">
                                        SL Account
                                    </div>
                                    <div className="w-full md:flex-2">
                                        Instrument
                                    </div>
                                    <div className="w-full text-right md:w-28">
                                        Debit
                                    </div>
                                    <div className="w-full text-right md:w-28">
                                        Credit
                                    </div>
                                    <div className="w-full md:w-9"></div>
                                </div>

                                {rows.map((row, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 md:flex-row md:items-end md:gap-2 md:p-0 dark:bg-gray-900/40"
                                    >
                                        {/* Account ID */}
                                        <div className="w-full md:flex-1">
                                            <Label className="text-xs md:hidden">
                                                Account ID
                                            </Label>
                                            <Input
                                                className="h-9 text-sm"
                                                value={row.account_id}
                                                onChange={(e) => {
                                                    row.account_id =
                                                        e.target.value;
                                                    setRows([...rows]);
                                                }}
                                            />
                                        </div>

                                        {/* GL Account Search */}
                                        <div className="w-full md:flex-2">
                                            <Label className="text-xs md:hidden">
                                                GL Account
                                            </Label>
                                            <LedgerSearch
                                                query={row.gl_account_name}
                                                onQueryChange={(v) => {
                                                    row.gl_account_name = v;
                                                    setRows([...rows]);
                                                }}
                                                onSelect={(ledger) => {
                                                    row.gl_account_id =
                                                        ledger.id;
                                                    row.gl_account_name =
                                                        ledger.full_display ??
                                                        ledger.name;
                                                    setRows([...rows]);
                                                }}
                                                placeholder="Search GL account..."
                                            />
                                        </div>

                                        {/* SL ID */}
                                        <div className="w-full md:flex-1">
                                            <Label className="text-xs md:hidden">
                                                SL ID
                                            </Label>
                                            <Input
                                                className="h-9 text-sm"
                                                value={row.sl_account_id}
                                                onChange={(e) => {
                                                    row.sl_account_id =
                                                        e.target.value;
                                                    setRows([...rows]);
                                                }}
                                            />
                                        </div>

                                        {/* SL Account Search */}
                                        <div className="w-full md:flex-2">
                                            <Label className="text-xs md:hidden">
                                                SL Account
                                            </Label>
                                            <div className="flex gap-1">
                                                <Input
                                                    placeholder="Search SL..."
                                                    className="h-9 text-sm"
                                                    value={row.sl_account_name}
                                                    onChange={(e) => {
                                                        row.sl_account_name =
                                                            e.target.value;
                                                        setRows([...rows]);
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    onClick={() =>
                                                        onSearchSL(i)
                                                    }
                                                >
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Instrument Search */}
                                        <div className="w-full md:flex-2">
                                            <Label className="text-xs md:hidden">
                                                Instrument
                                            </Label>
                                            <div className="flex gap-1">
                                                <Input
                                                    placeholder="Search Instrument..."
                                                    className="h-9 text-sm"
                                                    value={row.instrument_name}
                                                    onChange={(e) => {
                                                        row.instrument_name =
                                                            e.target.value;
                                                        setRows([...rows]);
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    onClick={() =>
                                                        onSearchInstrument(i)
                                                    }
                                                >
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Debit */}
                                        <div className="w-full md:w-28">
                                            <Label className="text-xs md:hidden">
                                                Debit
                                            </Label>
                                            <Input
                                                type="number"
                                                className="h-9 text-sm"
                                                value={row.debit}
                                                onChange={(e) => {
                                                    const value = parseFloat(
                                                        e.target.value || 0,
                                                    );
                                                    row.debit = value;
                                                    if (value > 0)
                                                        row.credit = 0;
                                                    setRows([...rows]);
                                                }}
                                            />
                                        </div>

                                        {/* Credit */}
                                        <div className="w-full md:w-28">
                                            <Label className="text-xs md:hidden">
                                                Credit
                                            </Label>
                                            <Input
                                                type="number"
                                                className="h-9 text-sm"
                                                value={row.credit}
                                                onChange={(e) => {
                                                    const value = parseFloat(
                                                        e.target.value || 0,
                                                    );
                                                    row.credit = value;
                                                    if (value > 0)
                                                        row.debit = 0;
                                                    setRows([...rows]);
                                                }}
                                            />
                                        </div>

                                        {/* Delete Row */}
                                        <div className="flex justify-end md:block">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeRow(i)}
                                                className="h-9 w-9 rounded-full"
                                                disabled={rows.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Row */}
                                <Button
                                    variant="outline"
                                    className="flex h-9 items-center gap-2 rounded-lg border text-sm"
                                    onClick={addRow}
                                >
                                    <Plus className="h-4 w-4" /> Add Entry
                                </Button>

                                {/* Totals */}
                                <div className="flex flex-col gap-2 rounded-lg bg-gray-100 p-3 font-medium md:flex-row md:items-end md:gap-2 dark:bg-gray-900/40">
                                    <div className="flex-1">Total</div>

                                    <div className="flex w-full justify-between md:block md:w-24">
                                        <span className="text-xs md:hidden">
                                            Debit:
                                        </span>
                                        {totals.debitTotal.toFixed(2)}
                                    </div>

                                    <div className="flex w-full justify-between md:block md:w-24">
                                        <span className="text-xs md:hidden">
                                            Credit:
                                        </span>
                                        {totals.creditTotal.toFixed(2)}
                                    </div>

                                    <div className="hidden w-9 md:block"></div>
                                </div>

                                {totals.debitTotal !== totals.creditTotal && (
                                    <p className="mt-1 text-sm text-red-500">
                                        Debit and Credit totals must be equal to
                                        submit!
                                    </p>
                                )}
                            </div>

                            {/* Narration */}
                            <div>
                                <Label>Narration</Label>
                                <Textarea
                                    className="h-20 rounded-lg text-sm"
                                    value={narration}
                                    onChange={(e) =>
                                        setNarration(e.target.value)
                                    }
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    className="flex h-9 items-center gap-1 rounded-lg px-4"
                                    disabled={!canSubmit}
                                >
                                    Submit
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </CustomAuthLayout>
    );
}
