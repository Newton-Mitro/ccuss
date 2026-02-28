import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { SubLedgerSearchInput } from '../../components/sub-ledger-search-input';
import AppDatePicker from '../../components/ui/app_date_picker';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem } from '../../types';
import { VoucherLine } from '../../types/accounting';
import { LedgerSearchInput } from '../accounting/components/ledger-search-input';
import { CustomerSearchInput } from '../customer-mgmt/customers/customer-search-input';

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
        narration: 'Daily Collection Voucher.',
        cash_ledger_id: cashLedgerId || null,
        cash_subledger_id: cashSubledgerId || null,
        lines: [],
    });

    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

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
                particulars: null,
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

    const debitTotal = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const creditTotal = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const hasValidLines = data.lines.every((l) => (l.debit || l.credit) > 0);
    const isBalanced =
        data.lines.length > 0 && debitTotal === creditTotal && hasValidLines;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Daily Transaction', href: '#' },
        { title: 'Daily Collection', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Collection" />

            {/* ---------------- Form Card ---------------- */}
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-md border border-border bg-card p-4 sm:p-6"
            >
                {/* Voucher Details & Cash Ledger */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Voucher Details */}
                    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-3 md:col-span-8">
                        <h2 className="border-b border-border pb-1 text-sm font-medium text-primary">
                            Voucher Details
                        </h2>
                        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-4">
                            <div>
                                <Label className="text-xs">Voucher Date</Label>
                                <AppDatePicker
                                    error={errors.voucher_date}
                                    value={data.voucher_date}
                                    onChange={(e) => setData('voucher_date', e)}
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

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-primary">
                                Collection Accounts
                            </h3>
                            <div className="w-full md:w-96">
                                <CustomerSearchInput
                                    onSelect={function (): void {
                                        throw new Error(
                                            'Function not implemented.',
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="hidden min-h-96 rounded-md border border-border md:block">
                            <table className="w-full table-fixed border-collapse">
                                <thead className="sticky top-0 bg-muted">
                                    <tr>
                                        <th className="w-1/12 border-b border-border p-2 text-center text-sm font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                        <th className="w-7/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                            Ledger & Sub-Ledger, Ref Sub-Ledger
                                        </th>

                                        <th className="w-2/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lines.map((line, index) => (
                                        <tr
                                            key={line.id}
                                            className="border-b border-border even:bg-muted/30"
                                        >
                                            <td className="px-2 py-1 text-center">
                                                <Checkbox
                                                    checked={true}
                                                    onCheckedChange={(e) =>
                                                        handleLineChange(
                                                            index,
                                                            'is_selected',
                                                            e,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-end justify-end gap-1 text-right">
                                                        <span className="text-xs text-muted-foreground">
                                                            {`${line.ledger_account?.code} - ${line.ledger_account?.name} | John Doe - 10000014 - Personal | Ref Subledger`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-2 py-1">
                                                <Input
                                                    type="number"
                                                    value={line.credit || ''}
                                                    onChange={(e) =>
                                                        handleLineChange(
                                                            index,
                                                            'credit',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="h-8 text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-muted font-medium">
                                        <td className="p-2"></td>
                                        <td className="p-2 text-right">
                                            Totals
                                        </td>
                                        <td className="p-2">
                                            {creditTotal.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {!isBalanced && data.lines.length > 0 && (
                                <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                                    Voucher is not balanced. Debit total:{' '}
                                    {formatBDTCurrency(debitTotal)}, Credit
                                    total: {formatBDTCurrency(creditTotal)}.
                                    Both must be equal and greater than zero.
                                </div>
                            )}
                        </div>

                        {/* Mobile */}
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
                                        onSelect={(value) =>
                                            handleLineChange(
                                                index,
                                                'ledger_account_id',
                                                value,
                                            )
                                        }
                                        error={
                                            errors.lines?.[index]
                                                ?.ledger_account_id
                                        }
                                        value={''}
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
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Debit"
                                        value={line.debit || ''}
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
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={processing || !isBalanced}>
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
