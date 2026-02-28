import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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

/* -------------------------------------------------------
 | Helpers
 ------------------------------------------------------- */
function normalizeErrors(errors: Record<string, string>) {
    const result: any = {};
    const lines: any[] = [];

    Object.entries(errors || {}).forEach(([key, message]) => {
        const lineMatch = key.match(/^lines\.(\d+)\.(.+)$/);
        if (lineMatch) {
            const index = Number(lineMatch[1]);
            const field = lineMatch[2];
            lines[index] = lines[index] || {};
            lines[index][field] = message
                .replace(/^The lines\.\d+\./, '')
                .trim();
        } else {
            result[key] = message;
        }
    });

    if (lines.length > 0) result.lines = lines;
    return result;
}

/* -------------------------------------------------------
 | Types
 ------------------------------------------------------- */
interface VoucherFormData {
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    fiscal_year_id?: number;
    fiscal_period_id?: number;
    branch_id?: number;
    status: string;
    narration: string;
    cash_ledger_id?: number;
    cash_subledger_id?: number;
    lines: VoucherLine[];
}

/* -------------------------------------------------------
 | Component
 ------------------------------------------------------- */
export default function EditDebitVoucherEntry({
    backUrl,
}: {
    backUrl: string;
}) {
    const {
        voucher,
        fiscalYears,
        fiscalPeriods,
        cashSubledgerId,
        cashSubledgers,
        branches,
        cashLedgerId,
        cashLedgers,
        activeFiscalYearId,
        activeFiscalPeriodId,
        userBranchId,
        flash,
    } = usePage().props as any;

    const isPosted = voucher?.status === 'POSTED';
    const disabled = isPosted;

    const {
        data,
        setData,
        put,
        processing,
        errors: rawErrors,
    } = useForm<VoucherFormData>({
        voucher_no: voucher.voucher_no,
        voucher_date: voucher.voucher_date,
        voucher_type: voucher.voucher_type,
        fiscal_year_id: voucher.fiscal_year_id,
        fiscal_period_id: voucher.fiscal_period_id,
        branch_id: voucher.branch_id,
        status: voucher.status,
        narration: voucher.narration || '',
        cash_ledger_id: voucher.cash_ledger_id,
        cash_subledger_id: voucher.cash_subledger_id,
        lines: voucher.lines.map((l: VoucherLine) => ({ ...l })),
    });

    console.log(voucher.voucher_date);
    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const addLine = () => {
        if (disabled) return;
        setData('lines', [
            ...data.lines,
            {
                id: -Date.now(),
                voucher_id: voucher.id,
                ledger_account_id: null,
                ledger_account: null,
                subledger_id: null,
                subledger_type: null,
                subledger: null,
                reference_id: null,
                reference_type: null,
                reference: null,
                instrument_type: null,
                instrument_no: null,
                particulars: null,
                debit: 0,
                credit: 0,
                created_by: null,
                created_by_user: null,
                updated_by: null,
                updated_by_user: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } satisfies VoucherLine,
        ]);
    };

    const handleLineChange = (
        index: number,
        field: keyof VoucherLine,
        value: any,
    ) => {
        const updated = [...data.lines];
        updated[index] = { ...updated[index], [field]: value };
        setData('lines', updated);
    };

    const removeLine = (index: number) => {
        if (disabled) return;
        const updated = [...data.lines];
        updated.splice(index, 1);
        setData('lines', updated);
    };

    const handleDeleteLine = (index: number) => {
        if (disabled) return;
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: `This voucher line will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                removeLine(index);
                toast.success('Voucher line deleted successfully!');
            }
        });
    };

    const handleCashLedgerChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setData('cash_subledger_id', null);
        setData(
            'cash_ledger_id',
            e.target.value ? Number(e.target.value) : null,
        );
        router.get(
            '/vouchers/debit/edit',
            {
                cash_ledger_id: e.target.value ? Number(e.target.value) : null,
                cash_subledger_id: data.cash_subledger_id,
            },
            { preserveState: true },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (debitTotal !== creditTotal) {
            toast.error('Debit and Credit totals must be equal!');
            return;
        }
        put(`/vouchers/${voucher.id}`, { preserveScroll: true });
    };

    const debitTotal = data.lines.reduce(
        (sum, l) => sum + Number(l.debit || 0),
        0,
    );
    const creditTotal = data.lines.reduce(
        (sum, l) => sum + Number(l.credit || 0),
        0,
    );
    const isBalanced = data.lines.length > 0 && debitTotal === creditTotal;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers' },
        { title: `Edit Debit Voucher: ${voucher.voucher_no}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Debit / Payment Voucher" />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Edit Debit / Payment Voucher"
                    description="Update voucher details"
                />
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-6 rounded-md border border-border bg-card p-4 sm:p-6"
            >
                {/* ---------------- Voucher Details & Cash Ledger ---------------- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Voucher Details */}
                    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-8">
                        <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                            Voucher Details
                        </h2>
                        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-5">
                            {/* Voucher No */}
                            <div>
                                <Label className="text-xs">Voucher No</Label>
                                <Input
                                    disabled
                                    error={errors.voucher_no}
                                    value={data.voucher_no}
                                    className="h-8 text-sm"
                                    onChange={(e) =>
                                        setData('voucher_no', e.target.value)
                                    }
                                />
                            </div>

                            {/* Voucher Date */}
                            <div>
                                <Label className="text-xs">Voucher Date</Label>
                                <AppDatePicker
                                    error={errors.voucher_date}
                                    value={
                                        data.voucher_date?.split('T')[0] || ''
                                    }
                                    onChange={(e) => setData('voucher_date', e)}
                                    disabled={disabled}
                                />
                            </div>

                            {/* Voucher Type */}
                            <div>
                                <Label className="text-xs">Voucher Type</Label>
                                <Select
                                    error={errors.voucher_type}
                                    value={data.voucher_type}
                                    disabled={disabled}
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
                                        { value: 'CONTRA', label: 'Contra' },
                                    ]}
                                    onChange={(e) =>
                                        setData('voucher_type', e.target.value)
                                    }
                                />
                            </div>

                            {/* Fiscal Year */}
                            <div>
                                <Label className="text-xs">Fiscal Year</Label>
                                <Select
                                    error={errors.fiscal_year_id}
                                    value={
                                        data.fiscal_year_id?.toString() || ''
                                    }
                                    disabled={disabled}
                                    options={fiscalYears.map((fy: any) => ({
                                        value: fy.id.toString(),
                                        label: fy.code,
                                    }))}
                                    onChange={(e) => {
                                        setData(
                                            'fiscal_year_id',
                                            Number(e.target.value),
                                        );
                                        setData('fiscal_period_id', null);
                                    }}
                                />
                            </div>

                            {/* Fiscal Period */}
                            <div>
                                <Label className="text-xs">Fiscal Period</Label>
                                <Select
                                    error={errors.fiscal_period_id}
                                    value={
                                        data.fiscal_period_id?.toString() || ''
                                    }
                                    disabled={disabled}
                                    options={fiscalPeriods
                                        .filter(
                                            (fp) =>
                                                fp.fiscal_year_id ===
                                                data.fiscal_year_id,
                                        )
                                        .map((fp) => ({
                                            value: fp.id.toString(),
                                            label: fp.period_name,
                                        }))}
                                    onChange={(e) =>
                                        setData(
                                            'fiscal_period_id',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <Label className="text-xs">Status</Label>
                                <Select
                                    error={errors.status}
                                    value={data.status}
                                    disabled={disabled}
                                    options={[
                                        { value: 'DRAFT', label: 'Draft' },
                                        { value: 'POSTED', label: 'Posted' },
                                        {
                                            value: 'CANCELLED',
                                            label: 'Cancelled',
                                        },
                                    ]}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                />
                            </div>

                            {/* Branch */}
                            <div>
                                <Label className="text-xs">Branch</Label>
                                <Select
                                    error={errors.branch_id}
                                    value={data.branch_id?.toString() || ''}
                                    disabled={disabled}
                                    options={branches.map((b: any) => ({
                                        value: b.id.toString(),
                                        label: b.name,
                                    }))}
                                    onChange={(e) =>
                                        setData(
                                            'branch_id',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>

                            {/* Narration */}
                            <div className="md:col-span-3">
                                <Label className="text-xs">Narration</Label>
                                <Input
                                    error={errors.narration}
                                    value={data.narration}
                                    disabled={disabled}
                                    onChange={(e) =>
                                        setData('narration', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cash Ledger */}
                    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-4">
                        <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                            Cash Ledger
                        </h2>
                        <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2">
                            <div>
                                <Label className="text-xs">
                                    Cash Ledger Account
                                </Label>
                                <Select
                                    error={errors.cash_ledger_id}
                                    value={data.cash_ledger_id || ''}
                                    disabled={disabled}
                                    options={cashLedgers.map((ledger) => ({
                                        value: ledger.id?.toString(),
                                        label: `${ledger.code} - ${ledger.name}`,
                                    }))}
                                    onChange={handleCashLedgerChange}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">
                                    Cash Sub-Ledger
                                </Label>
                                <Select
                                    error={errors.cash_subledger_id}
                                    value={data.cash_subledger_id || ''}
                                    disabled={disabled}
                                    options={cashSubledgers.map((ledger) => ({
                                        value: ledger.id?.toString(),
                                        label: `${ledger.code} - ${ledger.name}`,
                                    }))}
                                    onChange={(e) =>
                                        setData(
                                            'cash_subledger_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
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
                        {!disabled && (
                            <Button type="button" onClick={addLine}>
                                <Plus className="h-4 w-4" /> Add Line
                            </Button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="hidden min-h-96 rounded-md border border-border md:block">
                        <table className="w-full table-fixed border-collapse">
                            <thead className="sticky top-0 bg-muted">
                                <tr>
                                    <th className="w-7/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Ledger & Sub-Ledger, Ref Sub-Ledger &
                                        Particulars
                                    </th>
                                    <th className="w-2/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Instrument Type
                                    </th>
                                    <th className="w-2/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Instrument Number
                                    </th>
                                    <th className="w-2/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Debit
                                    </th>
                                    <th className="w-2/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Credit
                                    </th>
                                    <th className="w-1/12 border-b border-border p-2 text-center text-sm font-medium text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lines.map((line, index) => (
                                    <tr
                                        key={line.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-1">
                                                    <LedgerSearchInput
                                                        value={`${line.ledger_account.code} - ${
                                                            line.ledger_account
                                                                .name
                                                        }`}
                                                        placeholder="Ledger Account"
                                                        onSelect={(e) =>
                                                            handleLineChange(
                                                                index,
                                                                'ledger_account_id',
                                                                e.id,
                                                            )
                                                        }
                                                        error={
                                                            errors.lines?.[
                                                                index
                                                            ]?.ledger_account_id
                                                        }
                                                        disabled={disabled}
                                                    />
                                                    <SubLedgerSearchInput
                                                        placeholder="Sub-Ledger"
                                                        onSelect={() => {}}
                                                        disabled={disabled}
                                                    />
                                                    <SubLedgerSearchInput
                                                        placeholder="Ref Sub-Ledger"
                                                        onSelect={() => {}}
                                                        disabled={disabled}
                                                    />
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Particulars"
                                                    value={
                                                        line.particulars || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleLineChange(
                                                            index,
                                                            'particulars',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 h-8 text-sm"
                                                    disabled={disabled}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <Select
                                                value={
                                                    line.instrument_type || ''
                                                }
                                                disabled={disabled}
                                                options={[
                                                    {
                                                        value: 'CASH',
                                                        label: 'Cash',
                                                    },
                                                    {
                                                        value: 'CHEQUE',
                                                        label: 'Cheque',
                                                    },
                                                    {
                                                        value: 'OTHER',
                                                        label: 'Other',
                                                    },
                                                ]}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'instrument_type',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Input
                                                placeholder="Instrument No"
                                                value={line.instrument_no || ''}
                                                disabled={disabled}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'instrument_no',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Input
                                                type="number"
                                                value={line.debit || ''}
                                                disabled={disabled}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'debit',
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <Input
                                                type="number"
                                                value={line.credit || ''}
                                                disabled={disabled}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'credit',
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <button
                                                disabled={disabled}
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteLine(index)
                                                }
                                                className="text-destructive hover:text-destructive/80"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-muted font-medium">
                                    <td colSpan={2}></td>
                                    <td className="p-2 text-right">Totals</td>
                                    <td className="p-2">
                                        {debitTotal?.toFixed(2)}
                                    </td>
                                    <td className="p-2">
                                        {creditTotal?.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>

                        {!isBalanced && data.lines.length > 0 && (
                            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                                Debit and Credit totals must be equal.
                            </div>
                        )}
                    </div>

                    {/* Mobile view */}
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
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => removeLine(index)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <LedgerSearchInput
                                    placeholder="Ledger Account"
                                    onSelect={(value) =>
                                        handleLineChange(
                                            index,
                                            'ledger_account_id',
                                            value,
                                        )
                                    }
                                    error={
                                        errors.lines?.[index]?.ledger_account_id
                                    }
                                    disabled={disabled}
                                />
                                <SubLedgerSearchInput
                                    placeholder="Sub-Ledger"
                                    onSelect={(value) =>
                                        handleLineChange(
                                            index,
                                            'subledger_id',
                                            value,
                                        )
                                    }
                                    disabled={disabled}
                                />
                                <SubLedgerSearchInput
                                    placeholder="Reference"
                                    onSelect={(value) =>
                                        handleLineChange(
                                            index,
                                            'reference_id',
                                            value,
                                        )
                                    }
                                    disabled={disabled}
                                />
                                <Input
                                    type="number"
                                    placeholder="Debit"
                                    value={line.debit || ''}
                                    disabled={disabled}
                                    onChange={(e) =>
                                        handleLineChange(
                                            index,
                                            'debit',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Credit"
                                    value={line.credit || ''}
                                    disabled={disabled}
                                    onChange={(e) =>
                                        handleLineChange(
                                            index,
                                            'credit',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!isBalanced}>
                            {processing ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <CheckCheck />
                            )}
                            Update Voucher
                        </Button>
                    </div>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
