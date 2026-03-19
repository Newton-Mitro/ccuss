import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import InputError from '../../../../components/input-error';
import { SubLedgerSearchInput } from '../../../../components/sub-ledger-search-input';
import AppDatePicker from '../../../../components/ui/app_date_picker';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem } from '../../../../types';
import { VoucherLine } from '../../../../types/accounting';
import { LedgerSearchInput } from '../../components/ledger-search-input';

/* -------------------------------------------------------
 | Helpers
 ------------------------------------------------------- */
function normalizeErrors(errors: Record<string, string>) {
    const result: any = {};
    const lines: any[] = [];

    Object.entries(errors || {}).forEach(([key, message]) => {
        // Check if the key starts with "lines."
        const lineMatch = key.match(/^lines\.(\d+)\.(.+)$/);
        if (lineMatch) {
            const index = Number(lineMatch[1]);
            const field = lineMatch[2];
            lines[index] = lines[index] || {};
            // Remove the "The lines.X." prefix from the message
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
    accounting_period_id?: number;
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
export default function JournalVoucherEntryPage({
    backUrl,
}: {
    backUrl: string;
}) {
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

    const {
        data,
        setData,
        post,
        processing,
        errors: rawErrors,
    } = useForm<VoucherFormData>({
        voucher_no: '',
        voucher_date: new Date().toISOString().split('T')[0],
        voucher_type: 'JOURNAL_OR_NON_CASH',
        fiscal_year_id: activeFiscalYearId || 0,
        accounting_period_id: activeFiscalPeriodId || 0,
        branch_id: userBranchId || branches[0]?.id,
        status: 'DRAFT',
        narration: '',
        cash_ledger_id: cashLedgerId || null,
        cash_subledger_id: cashSubledgerId || null,
        lines: [],
    });

    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            {
                id: -Date.now(),
                voucher_id: 0,
                ledger_account_id: null,
                ledger_account: null,
                subledger_id: null,
                subledger_type: null,
                subledger: null,
                reference_id: null,
                reference_type: null,
                reference: null,
                instrument_type: 'CASH',
                instrument_no: null,
                particulars: 'Purchase furniture for office',
                debit: 0,
                credit: 0,
                created_by: null,
                updated_by: null,
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
        const updated = [...data.lines];
        updated.splice(index, 1);
        setData('lines', updated);
    };

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
        setData('cash_subledger_id', null);
        setData(
            'cash_ledger_id',
            e.target.value ? Number(e.target.value) : null,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/vouchers', { preserveScroll: true });
    };

    const debitTotal = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const creditTotal = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const hasValidLines = data.lines.every((l) => (l.debit || l.credit) > 0);
    const isBalanced =
        data.lines.length > 0 && debitTotal === creditTotal && hasValidLines;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers' },
        { title: 'Journal/Non-Cash Voucher Entry', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal/Non-Cash Voucher Entry" />

            {/* ---------------- Form Card ---------------- */}
            <form onSubmit={handleSubmit} className="">
                {/* Voucher Header & Cash Ledger */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    <div className="md:col-span-8">
                        {/* Voucher Lines */}
                        <div className="space-y-1">
                            <div className="bg-muted/30 space-y-2 rounded-md border p-3">
                                <h2 className="border-b pb-3 text-sm font-medium text-primary">
                                    Voucher Details/Lines
                                </h2>
                                <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-3">
                                    <div>
                                        <Label className="text-xs">
                                            Ledger Account
                                        </Label>
                                        <LedgerSearchInput />
                                        <InputError
                                            message={errors.voucher_no}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">
                                            Subledger Account
                                        </Label>
                                        <SubLedgerSearchInput />
                                    </div>
                                    <div>
                                        <Label className="text-xs">
                                            Ref Subledger
                                        </Label>
                                        <SubLedgerSearchInput />
                                    </div>
                                    <div className="">
                                        <Label className="text-xs">
                                            Particulars
                                        </Label>
                                        <Input
                                            error={errors.particulars}
                                            value={data.particulars}
                                            onChange={(e) =>
                                                setData(
                                                    'particulars',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="">
                                        <Label className="text-xs">Debit</Label>
                                        <Input
                                            type="number"
                                            error={errors.debit}
                                            value={data.debit}
                                            onChange={(e) =>
                                                setData('debit', e.target.value)
                                            }
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="">
                                        <Label className="text-xs">
                                            Credit
                                        </Label>
                                        <Input
                                            type="number"
                                            error={errors.credit}
                                            value={data.credit}
                                            onChange={(e) =>
                                                setData(
                                                    'credit',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button type="button" onClick={addLine}>
                                        <Plus className="h-4 w-4" /> Add Line
                                    </Button>
                                </div>

                                <div className="">
                                    {/* Table header */}
                                    <div className="bg-secondary/30 px-2">
                                        <table className="w-full table-fixed border-collapse">
                                            <thead className="sticky top-0">
                                                <tr className="">
                                                    <th className="w-8/12 border-b p-2 text-left text-sm font-medium text-muted-foreground">
                                                        Ledger, Subledger and
                                                        Particulars
                                                    </th>
                                                    <th className="w-3/12 border-b p-2 text-left text-sm font-medium text-muted-foreground">
                                                        Debit
                                                    </th>
                                                    <th className="w-3/12 border-b p-2 text-left text-sm font-medium text-muted-foreground">
                                                        Credit
                                                    </th>
                                                    <th className="w-1/12 border-b p-2 text-center text-sm font-medium text-muted-foreground">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>

                                    {/* Scrollable body */}
                                    <div className="bg-muted/40 h-[calc(100vh/2-86px)] overflow-y-auto p-2">
                                        <table className="w-full table-fixed border-separate border-spacing-y-2">
                                            <tbody>
                                                {data.lines.map(
                                                    (line, index) => (
                                                        <tr
                                                            key={line.id}
                                                            className="odd:bg-secondary/50 even:bg-primary/20 rounded-md"
                                                        >
                                                            {/* Ledger info */}
                                                            <td className="w-8/12 border border-destructive align-middle">
                                                                <div className="-mt-1 flex items-center justify-end border-x px-2 py-1">
                                                                    <div className="flex gap-2">
                                                                        <span className="text-xs text-muted-foreground underline">
                                                                            Ledger
                                                                            Code
                                                                            -
                                                                            Name
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground underline">
                                                                            Acc.Name
                                                                            -
                                                                            Number
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground underline">
                                                                            Ref
                                                                            Acc.Name
                                                                            -
                                                                            Number
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {line.particulars && (
                                                                    <div className="-mt-1 flex items-center justify-end border-x px-2">
                                                                        <span className="text-xs text-muted-foreground underline">
                                                                            {
                                                                                line.particulars
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            {/* Amount */}
                                                            <td className="w-3/12 px-1 align-middle">
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        line.debit ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleLineChange(
                                                                            index,
                                                                            'debit',
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="h-8 rounded-none text-sm"
                                                                />
                                                            </td>

                                                            {/* Amount */}
                                                            <td className="w-3/12 align-middle">
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        line.credit ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleLineChange(
                                                                            index,
                                                                            'credit',
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="h-8 rounded-none text-sm"
                                                                />
                                                            </td>

                                                            <td className="w-1/12 text-center align-middle">
                                                                <button
                                                                    className="flex h-full w-full items-center justify-center"
                                                                    onClick={() =>
                                                                        handleDeleteLine(
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-6 w-6 text-destructive" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Table footer */}
                                    <table className="w-full table-fixed border-collapse">
                                        <tfoot>
                                            <tr className="bg-muted font-medium">
                                                <td className="w-8/12 p-2">
                                                    <div className="text-sm text-destructive">
                                                        Debit total: , Credit
                                                        total: . Both must be
                                                        equal and greater than
                                                        zero.
                                                    </div>
                                                </td>

                                                <td className="w-3/12 p-2">
                                                    {formatBDTCurrency(
                                                        debitTotal,
                                                    )}
                                                </td>
                                                <td className="w-3/12 p-2">
                                                    {formatBDTCurrency(
                                                        creditTotal,
                                                    )}
                                                </td>
                                                <td className="w-1/12 p-2"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="mt-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing || !isBalanced}
                                        className="hover:bg-primary/90 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <CheckCheck className="h-5 w-5" />
                                        )}
                                        <span>Submit</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 md:col-span-4">
                        {/* Voucher Header */}
                        <div className="bg-muted/30 space-y-2 rounded-md border p-3">
                            <h2 className="border-b pb-3 text-sm font-medium text-primary">
                                Voucher Header
                            </h2>
                            <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-2">
                                <div>
                                    <Label className="text-xs">
                                        Voucher No
                                    </Label>
                                    <Input
                                        disabled
                                        error={errors.voucher_no}
                                        value={data.voucher_no}
                                        className="h-8 text-sm"
                                        onChange={(e) =>
                                            setData(
                                                'voucher_no',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.voucher_no} />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Voucher Date
                                    </Label>
                                    <AppDatePicker
                                        error={errors.voucher_date}
                                        value={data.voucher_date}
                                        onChange={(e) =>
                                            setData('voucher_date', e)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Voucher Type
                                    </Label>
                                    <Select
                                        error={errors.voucher_type}
                                        value={data.voucher_type}
                                        options={[
                                            {
                                                value: 'CREDIT_OR_RECEIPT',
                                                label: 'Credit/Receipt',
                                            },
                                            {
                                                value: 'DEBIT_OR_PAYMENT',
                                                label: 'Journal/Non-Cash',
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
                                {/* Fiscal Year */}
                                <div>
                                    <Label className="text-xs">
                                        Fiscal Year
                                    </Label>
                                    <Select
                                        error={errors.fiscal_year_id}
                                        value={
                                            data.fiscal_year_id?.toString() ||
                                            ''
                                        }
                                        options={fiscalYears.map((fy: any) => ({
                                            value: fy.id.toString(),
                                            label: fy.code,
                                        }))}
                                        onChange={(value) => {
                                            setData(
                                                'fiscal_year_id',
                                                Number(value),
                                            );
                                            setData(
                                                'accounting_period_id',
                                                null,
                                            );
                                        }}
                                    />
                                </div>
                                {/* Fiscal Period */}
                                <div>
                                    <Label className="text-xs">
                                        Fiscal Period
                                    </Label>
                                    <Select
                                        error={errors.accounting_period_id}
                                        value={
                                            data.accounting_period_id?.toString() ||
                                            ''
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
                                        onChange={(value) =>
                                            setData(
                                                'accounting_period_id',
                                                Number(value),
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
                                        options={[
                                            { value: 'DRAFT', label: 'Draft' },
                                            {
                                                value: 'POSTED',
                                                label: 'Posted',
                                            },
                                            {
                                                value: 'CANCELLED',
                                                label: 'Cancelled',
                                            },
                                        ]}
                                        onChange={(value) =>
                                            setData('status', value)
                                        }
                                    />
                                </div>

                                {/* Branch */}
                                <div>
                                    <Label className="text-xs">Branch</Label>
                                    <Select
                                        error={errors.branch_id}
                                        value={data.branch_id?.toString() || ''}
                                        options={branches.map((b: any) => ({
                                            value: b.id.toString(),
                                            label: b.name,
                                        }))}
                                        onChange={(value) =>
                                            setData('branch_id', Number(value))
                                        }
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-xs">Narration</Label>
                                    <Input
                                        error={errors.narration}
                                        value={data.narration}
                                        onChange={(e) =>
                                            setData('narration', e.target.value)
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
