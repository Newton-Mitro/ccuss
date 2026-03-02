import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import AppDatePicker from '../../components/ui/app_date_picker';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../lib/date_util';
import { BreadcrumbItem } from '../../types';
import { LedgerAccount } from '../../types/accounting';
import { CustomerSearchBox } from '../customer-mgmt/customers/customer-search-box';

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

interface VoucherLine {
    id: number;
    voucher_id: number;

    ledger_account_id: number;
    ledger_account?: LedgerAccount;

    // Polymorphic subledger (DepositAccount, LoanAccount, etc.)
    subledger_id?: number | null;
    subledger_type?: string | null;
    subledger?: object | null;

    // Polymorphic reference (Invoice, Cheque, Transfer, etc.)
    reference_id?: number | null;
    reference_type?: string | null;
    reference?: object | null;

    // Instrument details
    instrument_type?: string | null;
    instrument_no?: string | null;

    particulars?: string | null;

    debit: number;
    credit: number;

    created_by?: number | null;
    updated_by?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    is_selected: boolean;
}

interface VoucherFormData {
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    fiscal_year_id?: number;
    fiscal_period_id?: number;
    branch_id?: number;
    status: string;
    reference?: string;
    narration: string;
    cash_ledger_id?: number;
    cash_subledger_id?: number;
    lines: VoucherLine[];
}

/* -------------------------------------------------------
 | Component
 ------------------------------------------------------- */
export default function DebitVoucherEntry() {
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

    const vouchers = [
        {
            id: 1,
            voucher_no: 'DV-00045',
            customer_name: 'John Doe',
            date: '2026-02-28',
            amount: 2000,
            status: 'PENDING',
        },
        {
            id: 2,
            voucher_no: 'DV-00046',
            customer_name: 'John Doe',
            date: '2026-02-28',
            amount: 8000,
            status: 'PENDING',
        },
        {
            id: 3,
            voucher_no: 'DV-00047',
            customer_name: 'Alice Smith',
            date: '2026-02-27',
            amount: 1000,
            status: 'PENDING',
        },
        {
            id: 4,
            voucher_no: 'DV-00048',
            customer_name: 'Robert Brown',
            date: '2026-02-27',
            amount: 500,
            status: 'PENDING',
        },
        {
            id: 5,
            voucher_no: 'DV-00049',
            customer_name: 'Michael Lee',
            date: '2026-02-26',
            amount: 500,
            status: 'PENDING',
        },
        {
            id: 6,
            voucher_no: 'DV-00050',
            customer_name: 'Emily Davis',
            date: '2026-02-26',
            amount: 5000,
            status: 'COLLECTED',
        },
        {
            id: 7,
            voucher_no: 'DV-00051',
            customer_name: 'Daniel Wilson',
            date: '2026-02-25',
            amount: 7600,
            status: 'COLLECTED',
        },
        {
            id: 8,
            voucher_no: 'DV-00052',
            customer_name: 'Sophia Martinez',
            date: '2026-02-25',
            amount: 9100,
            status: 'COLLECTED',
        },
        {
            id: 9,
            voucher_no: 'DV-00053',
            customer_name: 'Chris Taylor',
            date: '2026-02-24',
            amount: 4300,
            status: 'COLLECTED',
        },
        {
            id: 10,
            voucher_no: 'DV-00054',
            customer_name: 'Olivia Anderson',
            date: '2026-02-24',
            amount: 15000,
            status: 'COLLECTED',
        },
        {
            id: 11,
            voucher_no: 'DV-00055',
            customer_name: 'William Thomas',
            date: '2026-02-23',
            amount: 2200,
            status: 'CANCELLED',
        },
        {
            id: 12,
            voucher_no: 'DV-00056',
            customer_name: 'Emma Jackson',
            date: '2026-02-23',
            amount: 6400,
            status: 'CANCELLED',
        },
        {
            id: 13,
            voucher_no: 'DV-00057',
            customer_name: 'Noah White',
            date: '2026-02-22',
            amount: 3000,
            status: 'CANCELLED',
        },
        {
            id: 14,
            voucher_no: 'DV-00058',
            customer_name: 'Liam Harris',
            date: '2026-02-22',
            amount: 8700,
            status: 'CANCELLED',
        },
        {
            id: 15,
            voucher_no: 'DV-00059',
            customer_name: 'Mia Clark',
            date: '2026-02-21',
            amount: 4100,
            status: 'CANCELLED',
        },
        {
            id: 16,
            voucher_no: 'DV-00060',
            customer_name: 'Ethan Lewis',
            date: '2026-02-21',
            amount: 9800,
            status: 'CANCELLED',
        },
    ];

    const {
        data,
        setData,
        post,
        processing,
        errors: rawErrors,
    } = useForm<VoucherFormData>({
        voucher_no: '',
        voucher_date: new Date().toISOString().split('T')[0],
        voucher_type: 'CREDIT_OR_RECEIPT',
        fiscal_year_id: activeFiscalYearId || 0,
        fiscal_period_id: activeFiscalPeriodId || 0,
        branch_id: userBranchId || branches[0]?.id,
        status: 'DRAFT',
        reference: '',
        narration: 'Customer deposit via cash counter.',
        cash_ledger_id: cashLedgerId || null,
        cash_subledger_id: cashSubledgerId || null,
        lines: [],
    });

    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const setCollectionLedgers = (voucherLines: VoucherLine[]) => {
        setData('lines', [
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
                particulars: null,
                debit: 0,
                credit: 0,
                created_by: null,
                updated_by: null,
                is_selected: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } satisfies VoucherLine,
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
                particulars: null,
                debit: 0,
                credit: 0,
                created_by: null,
                updated_by: null,
                is_selected: true,
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
    const toggleSelectAll = () => {
        // TODO: Add toggleSelectAll
    };
    const toggleSelect = (index: number) => {
        // TODO: Add toggleSelect
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
            '/daily-collections',
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Transactions', href: '#' },
        { title: 'Teller Collection', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Collection" />
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Voucher Form */}
                    <div className="flex flex-col gap-4 md:col-span-7">
                        {/* Collection Accounts */}
                        <div className="space-y-4">
                            <div className="">
                                <CustomerSearchBox
                                    onSelect={() => {
                                        setCollectionLedgers([]);
                                    }}
                                />
                            </div>

                            <div>
                                <h2 className="text-sm font-medium text-primary">
                                    Collection Ledgers
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border border-border md:block">
                                {/* Table header */}
                                <div className="bg-secondary/30 px-2">
                                    <table className="w-full table-fixed border-collapse">
                                        <thead className="sticky top-0">
                                            <tr className="">
                                                <th className="w-1/12 border-b border-border p-2 text-center text-sm font-medium text-muted-foreground">
                                                    <Checkbox checked={true} />
                                                </th>
                                                <th className="w-7/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                                    Ledger & Sub-Ledger, Ref
                                                    Sub-Ledger
                                                </th>
                                                <th className="w-4/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>

                                {/* Scrollable body */}
                                <div className="h-[calc(100vh/2-86px)] overflow-y-auto bg-muted/40 p-2">
                                    <table className="w-full table-fixed border-separate border-spacing-y-2">
                                        <tbody>
                                            {data.lines.map((line, index) => (
                                                <tr
                                                    key={line.id}
                                                    className="rounded-md odd:bg-secondary/50 even:bg-primary/20"
                                                >
                                                    {/* Checkbox */}
                                                    <td className="w-1/12 text-center align-middle">
                                                        <div className="flex h-9 items-center justify-center">
                                                            <Checkbox checked />
                                                        </div>
                                                    </td>

                                                    {/* Ledger info */}
                                                    <td className="w-7/12 border border-destructive align-middle">
                                                        <div className="flex h-9 items-center justify-end border-x border-border px-2">
                                                            <div className="flex gap-2">
                                                                <span className="text-xs text-muted-foreground underline">
                                                                    10001 -
                                                                    Saving
                                                                    Deposit
                                                                </span>
                                                                <span className="text-xs text-muted-foreground underline">
                                                                    John Doe -
                                                                    10000014 -
                                                                    Personal
                                                                </span>
                                                                <span className="text-xs text-muted-foreground underline">
                                                                    Saving Ref
                                                                    Subledger
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="w-4/12 align-middle">
                                                        <Input
                                                            type="number"
                                                            value={
                                                                line.credit ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleLineChange(
                                                                    index,
                                                                    'credit',
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="h-9 rounded-none border border-l-0 text-sm"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table footer */}
                                <table className="w-full table-fixed border-collapse">
                                    <tfoot>
                                        <tr className="bg-muted font-medium">
                                            <td className="p-2" colSpan={2}>
                                                <div className="text-sm text-destructive">
                                                    Debit total: , Credit total:{' '}
                                                    . Both must be equal and
                                                    greater than zero.
                                                </div>
                                            </td>

                                            <td className="p-2">
                                                {`Total: ${formatBDTCurrency(0)}`}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Balance warning */}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col items-center justify-end gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-sm sm:flex-row">
                            {/* Collect Later Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Clock className="h-4 w-4" />
                                )}
                                Collect Later
                            </Button>

                            {/* Collect Now Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Collect Now
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:col-span-5">
                        {/* Voucher Header */}
                        <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-6">
                            <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                                Voucher Header
                            </h2>
                            <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-3">
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
                                        onChange={(e) =>
                                            setData(
                                                'voucher_type',
                                                e.target.value,
                                            )
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
                                    <Label className="text-xs">
                                        Fiscal Period
                                    </Label>
                                    <Select
                                        error={errors.fiscal_period_id}
                                        value={
                                            data.fiscal_period_id?.toString() ||
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
                                        onChange={(e) =>
                                            setData(
                                                'fiscal_period_id',
                                                Number(e.target.value),
                                            )
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
                                        onChange={(e) =>
                                            setData(
                                                'branch_id',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="">
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

                        {/* Cash Ledger */}
                        <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-6">
                            <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                                Cash Ledger
                            </h2>
                            <div className="grid grid-cols-1 gap-x-3 md:grid-cols-3">
                                <div>
                                    <Label className="text-xs">
                                        Cash Ledger Account
                                    </Label>
                                    <Select
                                        error={errors.cash_ledger_id}
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
                                        error={errors.cash_subledger_id}
                                        value={data.cash_subledger_id || ''}
                                        options={cashSubledgers.map(
                                            (ledger) => ({
                                                value: ledger.id?.toString(),
                                                label: `${ledger.code} - ${ledger.name}`,
                                            }),
                                        )}
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
                                <div className="">
                                    <Label className="text-xs font-medium">
                                        Instrument Type
                                    </Label>
                                    <Select
                                        value={data.instrument_type || ''}
                                        options={[
                                            { value: 'CASH', label: 'Cash' },
                                            {
                                                value: 'CHEQUE',
                                                label: 'Cheque',
                                            },
                                            {
                                                value: 'BANK_TRANSFER',
                                                label: 'Bank Transfer',
                                            },
                                            {
                                                value: 'MOBILE_BANKING',
                                                label: 'Mobile Banking',
                                            },
                                            { value: 'CARD', label: 'Card' },
                                            { value: 'OTHER', label: 'Other' },
                                        ]}
                                        onChange={(e) =>
                                            setData(
                                                'instrument_type',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full"
                                    />
                                </div>
                                <div className="">
                                    <Label className="text-xs">
                                        Instrument Ref
                                    </Label>

                                    <Input
                                        placeholder="Instrument No"
                                        value={data.instrument_no || ''}
                                        onChange={(e) =>
                                            setData(
                                                'instrument_no',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>

                                <div className="">
                                    <Label className="text-xs">
                                        Bill/Invoice Ref
                                    </Label>

                                    <Input
                                        placeholder="Customer / Vendor"
                                        value={data.invoice_id || ''}
                                        onChange={(e) =>
                                            setData(
                                                'invoice_id',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Voucher Queue */}
                        <div className="flex flex-col gap-4">
                            <div className="flex h-[calc(100vh/3+50px)] flex-col overflow-hidden rounded-md border border-border">
                                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                                    <div>
                                        <h2 className="text-sm font-medium text-primary">
                                            Voucher Queue
                                        </h2>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {vouchers.length} vouchers
                                    </span>
                                </div>

                                <div className="flex-1 divide-y overflow-y-auto">
                                    {vouchers.map((voucher) => (
                                        <div
                                            key={voucher.id}
                                            className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 bg-background px-3 py-2 transition odd:bg-muted/20 even:bg-muted/30 hover:bg-muted/40"
                                        >
                                            {/* Voucher Info */}
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium">
                                                    #{voucher.voucher_no} —{' '}
                                                    {voucher.customer_name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {formatDate(voucher.date)}
                                                </p>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right">
                                                <p className="text-xs font-semibold">
                                                    {formatBDTCurrency(
                                                        voucher.amount,
                                                    )}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        voucher.status ===
                                                        'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : voucher.status ===
                                                                'COLLECTED'
                                                              ? 'bg-green-100 text-green-700'
                                                              : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {voucher.status}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                <button
                                                    disabled={
                                                        voucher.status !==
                                                        'PENDING'
                                                    }
                                                    onClick={() =>
                                                        onCollect(voucher.id)
                                                    }
                                                    className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground disabled:opacity-50"
                                                >
                                                    Collect
                                                </button>
                                                <button
                                                    disabled={
                                                        voucher.status !==
                                                        'PENDING'
                                                    }
                                                    onClick={() =>
                                                        onCancel(voucher.id)
                                                    }
                                                    className="rounded border px-2 py-1 text-[10px] text-destructive disabled:opacity-50"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="sticky bottom-0 flex justify-between border-t bg-muted/30 px-4 py-3 text-sm">
                                    <span className="text-muted-foreground">
                                        Total Pending Amount
                                    </span>
                                    <span className="font-semibold">
                                        ৳{' '}
                                        {vouchers
                                            .filter(
                                                (v) => v.status === 'PENDING',
                                            )
                                            .reduce(
                                                (sum, v) => sum + v.amount,
                                                0,
                                            )
                                            .toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* end Voucher Queue */}
                </div>
            </form>

            {/* end grid */}
        </CustomAuthLayout>
    );
}
