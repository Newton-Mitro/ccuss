import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
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

export default function DebitVoucherEntry({ backUrl }: { backUrl: string }) {
    const {
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

    const { data, setData, post, processing } = useForm<VoucherFormData>({
        voucher_no: '',
        voucher_date: new Date().toISOString().split('T')[0],
        voucher_type: 'DEBIT_OR_PAYMENT',
        fiscal_year_id: activeFiscalYearId || 0,
        fiscal_period_id: activeFiscalPeriodId || 0,
        branch_id: userBranchId || branches[0]?.id,
        status: 'DRAFT',
        narration: '',

        cash_ledger_id: cashLedgerId,
        cash_subledger_id: cashSubledgerId,

        lines: [],
    });

    console.log(cashLedgers);

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            {
                // Frontend-only temp ID (safe for React keys)
                id: -Date.now(),

                voucher_id: 0,

                ledger_account_id: 0,
                ledger_account: undefined,

                // Polymorphic subledger
                subledger_id: null,
                subledger_type: null,
                subledger: null,

                // Polymorphic reference
                reference_id: null,
                reference_type: null,
                reference: null,

                // Instrument details
                instrument_type: null,
                instrument_no: null,

                particulars: null,

                debit: 0,
                credit: 0,

                // Audit fields
                created_by: null,
                created_by_user: null,
                updated_by: null,
                updated_by_user: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } satisfies VoucherLine,
        ]);
    };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const handleLineChange = (
        index: number,
        field: keyof VoucherLine,
        value: any,
    ) => {
        const updatedLines: VoucherLine[] = [...data.lines];
        updatedLines[index] = { ...updatedLines[index], [field]: value };
        setData('lines', updatedLines);
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
        { title: 'Vouchers', href: '/vouchers' },
        { title: 'Create Debit Voucher', href: '' },
    ];

    // Calculate totals
    const debitTotal = data.lines.reduce(
        (sum, line) => sum + (line.debit || 0),
        0,
    );
    const creditTotal = data.lines.reduce(
        (sum, line) => sum + (line.credit || 0),
        0,
    );

    const isBalanced = data.lines.length > 0 && debitTotal === creditTotal;

    const showBalanceError =
        data.lines.length > 0 && debitTotal !== creditTotal;

    const handleDeleteLine = (index: number) => {
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
        setData(
            'cash_ledger_id',
            e.target.value ? Number(e.target.value) : null, // convert back to number
        );
        router.get(
            '/vouchers/debit/create',
            {
                cash_ledger_id: e.target.value ? Number(e.target.value) : null,
                cash_subledger_id: data.cash_subledger_id,
            },
            { preserveState: true },
        );
    };

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
                    {/* Voucher Details - 8/12 */}
                    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-8">
                        <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                            Voucher Details
                        </h2>
                        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-5">
                            <div>
                                <Label className="text-xs">Voucher No</Label>
                                <Input
                                    disabled
                                    value={data.voucher_no}
                                    className="h-8 text-sm"
                                    onChange={(e) =>
                                        setData('voucher_no', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Voucher Date</Label>
                                <AppDatePicker
                                    disabled
                                    value={data.voucher_date}
                                    onChange={(e) => setData('voucher_date', e)}
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
                                    onChange={(e) =>
                                        setData('voucher_type', e.target.value)
                                    }
                                />
                            </div>
                            {/* Fiscal Year */}
                            <div>
                                <Label className="text-xs">Fiscal Year</Label>
                                <Select
                                    value={
                                        data.fiscal_year_id?.toString() || ''
                                    }
                                    options={fiscalYears.map((fy: any) => ({
                                        value: fy.id.toString(),
                                        label: fy.code,
                                    }))}
                                    onChange={(e) => {
                                        const selectedYearId = Number(
                                            e.target.value,
                                        );
                                        setData(
                                            'fiscal_year_id',
                                            selectedYearId,
                                        );
                                    }}
                                />
                            </div>

                            {/* Fiscal Period */}
                            <div>
                                <Label className="text-xs">Fiscal Period</Label>
                                <Select
                                    value={
                                        data.fiscal_period_id?.toString() || ''
                                    }
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
                            <div>
                                <Label className="text-xs">Branch</Label>
                                <Select
                                    disabled
                                    value={data.branch_id || ''}
                                    options={branches.map((b) => ({
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
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <Label className="text-xs">Narration</Label>
                                <Input
                                    value={data.narration}
                                    className="h-8 text-sm"
                                    onChange={(e) =>
                                        setData('narration', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
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
                                    value={data.cash_ledger_id || ''}
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
                                    value={data.cash_subledger_id || ''}
                                    options={cashSubledgers.map((ledger) => ({
                                        value: ledger.id?.toString(),
                                        label: `${ledger.code} - ${ledger.name}`,
                                    }))}
                                    onChange={(e) =>
                                        setData(
                                            'cash_subledger_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null, // convert back to number
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cash Details - 4/12 */}
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
                                                        placeholder="Ledger Account"
                                                        onSelect={() => {}}
                                                    />
                                                    <SubLedgerSearchInput
                                                        placeholder="Sub-Ledger"
                                                        onSelect={() => {}}
                                                    />
                                                    <SubLedgerSearchInput
                                                        placeholder="Ref Sub-Ledger"
                                                        onSelect={() => {}}
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
                                                />
                                            </div>
                                        </td>

                                        <td className="px-2 py-1">
                                            <Select
                                                value={line.instrument_type}
                                                options={[
                                                    {
                                                        value: 'CHEQUE',
                                                        label: 'Cheque',
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
                                                placeholder="Instrument Number"
                                                className="h-8 text-sm"
                                                value={line.instrument_no || ''}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'instrument_no',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="px-2 py-1">
                                            <Input
                                                type="number"
                                                value={
                                                    line.debit === 0
                                                        ? ''
                                                        : line.debit
                                                }
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'debit',
                                                        e.target.value === ''
                                                            ? 0
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </td>

                                        <td className="px-2 py-1">
                                            <Input
                                                type="number"
                                                disabled
                                                value={
                                                    line.credit === 0
                                                        ? ''
                                                        : line.credit
                                                }
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'credit',
                                                        e.target.value === ''
                                                            ? 0
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <button
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
                                    <td colSpan={2} className="p-2">
                                        {showBalanceError && (
                                            <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                                Debit and Credit totals must be
                                                equal before creating the
                                                voucher.
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2 text-right">Totals</td>
                                    <td className="p-2">
                                        {debitTotal.toFixed(2)}
                                    </td>
                                    <td className="p-2">
                                        {creditTotal.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
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

                                {/* Ledger */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Ledger Account
                                    </Label>
                                    <LedgerSearchInput
                                        placeholder="Ledger Account"
                                        onSelect={(value) =>
                                            handleLineChange(
                                                index,
                                                'ledger_account_id',
                                                value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Sub-Ledger */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Sub-Ledger Account
                                    </Label>
                                    <SubLedgerSearchInput
                                        placeholder="Sub-Ledger Account"
                                        onSelect={(value) =>
                                            handleLineChange(
                                                index,
                                                'subledger_id',
                                                value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Reference Sub-Ledger */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Reference Account
                                    </Label>
                                    <SubLedgerSearchInput
                                        placeholder="Reference Account"
                                        onSelect={(value) =>
                                            handleLineChange(
                                                index,
                                                'reference_id',
                                                value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Instrument Type */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Instrument Type
                                    </Label>
                                    <Select
                                        value={line.instrument_type || ''}
                                        options={[
                                            {
                                                value: 'CHEQUE',
                                                label: 'Cheque',
                                            },
                                            { value: 'CASH', label: 'Cash' },
                                            { value: 'OTHER', label: 'Other' },
                                        ]}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'instrument_type',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Instrument Number */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Instrument Number
                                    </Label>
                                    <Input
                                        placeholder="Instrument Number"
                                        className="h-8 text-sm"
                                        value={line.instrument_no || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'instrument_no',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Debit */}
                                <div className="space-y-1">
                                    <Label className="text-xs">Debit</Label>
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
                                </div>

                                {/* Credit */}
                                <div className="space-y-1">
                                    <Label className="text-xs">Credit</Label>
                                    <Input
                                        type="number"
                                        disabled
                                        value={line.credit}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'credit',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>

                                {/* Particulars */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Particulars
                                    </Label>
                                    <Input
                                        value={line.particulars || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'particulars',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Mobile Totals */}
                        {data.lines.length > 0 && (
                            <div className="mt-3 flex justify-between rounded-md border border-border bg-muted p-3 text-sm font-medium">
                                <span>Debit Total:</span>
                                <span>{debitTotal.toFixed(2)}</span>
                                <span>Credit Total:</span>
                                <span>{creditTotal.toFixed(2)}</span>
                            </div>
                        )}
                        {/* 🔴 Balance Error */}
                        {data.lines.length > 0 &&
                            debitTotal !== creditTotal && (
                                <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                                    Debit and Credit totals must be equal.
                                </div>
                            )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="submit"
                        disabled={processing || !isBalanced}
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
