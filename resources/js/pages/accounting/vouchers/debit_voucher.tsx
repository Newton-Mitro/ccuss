import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import { SubLedgerSearchInput } from '../../../components/sub-ledger-search-input';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { VoucherLine } from '../../../types/accounting';
import { LedgerSearchInput } from '../components/ledger-search-input';

export default function DebitVoucherEntry({ backUrl }: { backUrl: string }) {
    const { ledger_accounts, fiscalYears, fiscalPeriods, branches, flash } =
        usePage().props as any;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const { data, setData, post, processing } = useForm({
        voucher_no: '',
        voucher_date: new Date().toISOString().split('T')[0],
        voucher_type: 'DEBIT_OR_PAYMENT',
        fiscal_year_id: undefined,
        fiscal_period_id: undefined,
        branch_id: undefined,
        status: 'DRAFT',
        narration: '',
        cash_type: '',
        lines: [] as VoucherLine[],
    });

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const handleLineChange = (
        index: number,
        field: keyof VoucherLine,
        value: any,
    ) => {
        const updatedLines = [...data.lines];
        updatedLines[index] = { ...updatedLines[index], [field]: value };
        setData('lines', updatedLines);
    };

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            {
                id: Date.now(),
                voucher_id: 0,
                ledger_account_id: 0,
                account_code: '',
                subledger_name: '',
                subledger_type: '',
                associate_ledger_Code: '',
                debit: 0,
                credit: 0,
                narration: '',
            } as VoucherLine,
        ]);
    };

    const removeLine = (index: number) => {
        const updatedLines = [...data.lines];
        updatedLines.splice(index, 1);
        setData('lines', updatedLines);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/vouchers', { preserveScroll: true });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers/list' },
        { title: 'Create Debit Voucher', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Debit / Payment Voucher" />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Create Debit / Payment Voucher"
                    description="Enter debit / payment voucher details"
                />
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            {/* ---------------- Form Card ---------------- */}
            <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-6 rounded-md border border-border bg-card p-4 sm:p-6"
            >
                {/* ---------------- Voucher + Cash Details ---------------- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Voucher Details - 10/12 */}
                    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-8">
                        <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                            Voucher Details
                        </h2>
                        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-3">
                            <div>
                                <Label className="text-xs">Voucher No</Label>
                                <Input
                                    disabled
                                    value={data.voucher_no}
                                    className="h-8 text-sm"
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Voucher Date</Label>
                                <AppDatePicker
                                    disabled
                                    value={data.voucher_date}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Voucher Type</Label>
                                <Select
                                    disabled
                                    value={data.voucher_type}
                                    options={[
                                        {
                                            value: 'CREDIT_OR_RECEIPT',
                                            label: 'Credit / Receipt',
                                        },
                                        {
                                            value: 'DEBIT_OR_PAYMENT',
                                            label: 'Debit / Payment',
                                        },
                                        {
                                            value: 'JOURNAL_OR_NON_CASH',
                                            label: 'Journal / Non-Cash',
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
                                            value: 'PETTY_CASH',
                                            label: 'Petty Cash',
                                        },
                                        { value: 'CONTRA', label: 'Contra' },
                                    ]}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Fiscal Year</Label>
                                <Select
                                    disabled
                                    value={data.fiscal_year_id || ''}
                                    options={fiscalYears}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Fiscal Period</Label>
                                <Select
                                    disabled
                                    value={data.fiscal_period_id || ''}
                                    options={fiscalPeriods}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Branch</Label>
                                <Select
                                    disabled
                                    value={data.branch_id || ''}
                                    options={branches}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">
                                    Voucher Status
                                </Label>
                                <Select
                                    value={data.status}
                                    options={[
                                        { value: 'DRAFT', label: 'Draft' },
                                        {
                                            value: 'APPROVED',
                                            label: 'Approved',
                                        },
                                        { value: 'POSTED', label: 'Posted' },
                                        {
                                            value: 'CANCELLED',
                                            label: 'Cancelled',
                                        },
                                    ]}
                                    disabled
                                    includeNone={false}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <Label className="text-xs">Narration</Label>
                                <Input
                                    value={data.narration}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cash Details - 2/12 */}
                    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-4">
                        <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                            Cash Ledger
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1">
                            <div>
                                <Label className="text-xs">Cash Type</Label>
                                <Select
                                    value={data.cash_type || ''}
                                    onChange={(e) =>
                                        setData('cash_type', e.target.value)
                                    }
                                    options={[
                                        {
                                            value: 'CASH_IN_HAND',
                                            label: 'Cash in Hand',
                                        },
                                        {
                                            value: 'CASH_IN_BANK',
                                            label: 'Cash in Bank',
                                        },
                                        {
                                            value: 'PETTY_CASH',
                                            label: 'Petty Cash',
                                        },
                                    ]}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">
                                    Cash Ledger Account
                                </Label>
                                <LedgerSearchInput
                                    placeholder="Cash Ledger Account"
                                    onSelect={() => {}}
                                />
                            </div>

                            <div>
                                <Label className="text-xs">
                                    Cash Sub-Ledger
                                </Label>
                                <SubLedgerSearchInput
                                    placeholder="Cash Sub-Ledger Account"
                                    onSelect={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------------- Voucher Lines ---------------- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-primary">
                            Voucher Lines
                        </h3>
                        <Button
                            type="button"
                            onClick={addLine}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" /> Add Line
                        </Button>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden min-h-80 rounded-md border border-border md:block">
                        <table className="w-full table-fixed border-collapse">
                            <thead className="sticky top-0 bg-muted">
                                <tr>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Ledger Account
                                    </th>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Subledger Account
                                    </th>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Ref Subledger Account
                                    </th>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Instrument Type
                                    </th>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Instrument Number
                                    </th>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Amount
                                    </th>
                                    <th className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Narration
                                    </th>
                                    <th className="w-[60px] border-b border-border p-2 text-center text-sm font-medium text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {data.lines.map((line, index) => (
                                    <tr
                                        key={line.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            <LedgerSearchInput
                                                placeholder="Ledger Account"
                                                onSelect={() => {}}
                                            />
                                        </td>

                                        <td className="px-2 py-1">
                                            <SubLedgerSearchInput
                                                placeholder="Sub-Ledger Account"
                                                onSelect={() => {}}
                                            />
                                        </td>

                                        <td className="px-2 py-1">
                                            <SubLedgerSearchInput
                                                placeholder="Reference Sub-Ledger Account"
                                                onSelect={() => {}}
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Select
                                                value={''}
                                                options={[
                                                    {
                                                        value: 'CHEQUE',
                                                        label: 'Cheque',
                                                    },
                                                    {
                                                        value: 'DD',
                                                        label: 'Demand Draft (DD)',
                                                    },
                                                    {
                                                        value: 'NEFT',
                                                        label: 'NEFT',
                                                    },
                                                    {
                                                        value: 'RTGS',
                                                        label: 'RTGS',
                                                    },
                                                    {
                                                        value: 'IMPS',
                                                        label: 'IMPS',
                                                    },
                                                    {
                                                        value: 'CASH',
                                                        label: 'Cash',
                                                    },
                                                    {
                                                        value: 'OTHER',
                                                        label: 'Other',
                                                    },
                                                ]}
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Input
                                                placeholder="Instrument Number"
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Input
                                                type="number"
                                                value={0}
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Input
                                                value={line.narration || ''}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'narration',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeLine(index)
                                                }
                                                className="text-destructive hover:text-destructive/80"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Lines */}
                    <div className="space-y-3 md:hidden">
                        {data.lines.map((line, index) => (
                            <div
                                key={line.id}
                                className="space-y-3 rounded-md border border-border bg-card p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Line #{index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeLine(index)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <LedgerSearchInput
                                    placeholder="Ledger Account"
                                    onSelect={() => {}}
                                />
                                <SubLedgerSearchInput
                                    placeholder="Sub-Ledger Account"
                                    onSelect={() => {}}
                                />
                                <SubLedgerSearchInput
                                    placeholder="Reference Sub-Ledger Account"
                                    onSelect={() => {}}
                                />
                                <Select
                                    value={''}
                                    options={[
                                        { value: 'CHEQUE', label: 'Cheque' },
                                        {
                                            value: 'DD',
                                            label: 'Demand Draft (DD)',
                                        },
                                        { value: 'NEFT', label: 'NEFT' },
                                        { value: 'RTGS', label: 'RTGS' },
                                        { value: 'IMPS', label: 'IMPS' },
                                        { value: 'CASH', label: 'Cash' },
                                        { value: 'OTHER', label: 'Other' },
                                    ]}
                                />
                                <Input
                                    placeholder="Instrument Number"
                                    className="h-8 text-sm"
                                />
                                <Input
                                    type="number"
                                    value={line.debit}
                                    onChange={(e) =>
                                        handleLineChange(
                                            index,
                                            'debit',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                                <Input
                                    value={line.narration || ''}
                                    onChange={(e) =>
                                        handleLineChange(
                                            index,
                                            'narration',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2"
                    >
                        {processing ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <CheckCheck />
                        )}
                        Create Voucher
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
