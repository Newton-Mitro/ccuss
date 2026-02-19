import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Voucher, VoucherLine } from '../../../types/accounting';

interface VoucherEditProps {
    voucher?: Voucher;
    accounts: { id: number; name: string }[];
    fiscalYears: { id: number; code: string }[];
    fiscalPeriods: {
        id: number;
        period_name: string;
        fiscal_year_id: number;
    }[];
    branches: { id: number; name: string }[];
    flash: { success?: string; error?: string };
    backUrl: string;
}

export default function VoucherEdit({ backUrl }: { backUrl: string }) {
    const { voucher, accounts, fiscalYears, fiscalPeriods, branches, flash } =
        usePage().props as unknown as VoucherEditProps;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const { data, setData, post, put, processing } = useForm({
        voucher_no: voucher?.voucher_no || '',
        voucher_date: voucher?.voucher_date || '',
        voucher_type: voucher?.voucher_type || '',
        fiscal_year_id: voucher?.fiscal_year_id || undefined,
        fiscal_period_id: voucher?.fiscal_period_id || undefined,
        branch_id: voucher?.branch_id || undefined,
        status: voucher?.status || 'draft',
        narration: voucher?.narration || '',
        lines: voucher?.lines || ([] as VoucherLine[]),
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
                voucher_id: voucher?.id || 0,
                account_id: 0,
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
        if (voucher?.id) {
            put(`/vouchers/${voucher.id}`, { preserveScroll: true });
        } else {
            post(`/vouchers`, { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers' },
        {
            title: voucher
                ? `Edit Voucher ${voucher.voucher_no}`
                : 'Create Voucher',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    voucher
                        ? `Edit Voucher ${voucher.voucher_no}`
                        : 'Create Voucher'
                }
            />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        voucher
                            ? `Edit Voucher ${voucher.voucher_no}`
                            : 'Create Voucher'
                    }
                    description="Edit voucher details"
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

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-4 rounded-md border border-border bg-card p-4 sm:p-6"
            >
                {/* Voucher Info */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <div>
                        <Label className="text-xs">Voucher No</Label>
                        <Input
                            value={data.voucher_no}
                            onChange={(e) =>
                                setData('voucher_no', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                            type="date"
                            value={data.voucher_date}
                            onChange={(e) =>
                                setData('voucher_date', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Type</Label>
                        <select
                            value={data.voucher_type}
                            onChange={(e) =>
                                setData('voucher_type', e.target.value)
                            }
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select Voucher Type</option>
                            <option value="RECEIPT">RECEIPT</option>
                            <option value="PAYMENT">PAYMENT</option>
                            <option value="JOURNAL">JOURNAL</option>
                            <option value="PURCHASE">PURCHASE</option>
                            <option value="SALE">SALE</option>
                            <option value="DEBIT NOTE">DEBIT NOTE</option>
                            <option value="CREDIT NOTE">CREDIT NOTE</option>
                            <option value="PETTY CASH">PETTY CASH</option>
                            <option value="CONTRA">CONTRA</option>
                        </select>
                    </div>

                    <div>
                        <Label className="text-xs">Fiscal Year</Label>
                        <select
                            value={data.fiscal_year_id || ''}
                            onChange={(e) =>
                                setData(
                                    'fiscal_year_id',
                                    Number(e.target.value),
                                )
                            }
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select Fiscal Year</option>
                            {fiscalYears.map((fy) => (
                                <option key={fy.id} value={fy.id}>
                                    {fy.code}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label className="text-xs">Fiscal Period</Label>
                        <select
                            value={data.fiscal_period_id || ''}
                            onChange={(e) =>
                                setData(
                                    'fiscal_period_id',
                                    Number(e.target.value),
                                )
                            }
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select Fiscal Period</option>
                            {fiscalPeriods
                                .filter(
                                    (fp) =>
                                        fp.fiscal_year_id ===
                                        data.fiscal_year_id,
                                )
                                .map((fp) => (
                                    <option key={fp.id} value={fp.id}>
                                        {fp.period_name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <Label className="text-xs">Branch</Label>
                        <select
                            value={data.branch_id || ''}
                            onChange={(e) =>
                                setData('branch_id', Number(e.target.value))
                            }
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select Branch</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label className="text-xs">Status</Label>
                        <select
                            disabled
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="DRAFT">DRAFT</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="POSTED">POSTED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                        <Label className="text-xs">Description</Label>
                        <Input
                            value={data.narration || ''}
                            onChange={(e) =>
                                setData('narration', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                    </div>
                </div>

                {/* Voucher Lines */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Voucher Lines</h3>
                        <Button
                            type="button"
                            onClick={addLine}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" /> Add Line
                        </Button>
                    </div>

                    <div className="hidden overflow-auto rounded-md border border-border md:block">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-muted">
                                <tr>
                                    {[
                                        'GL & Subledger Account',
                                        'Account Number',
                                        'Debit',
                                        'Credit',
                                        'Narration',
                                        'Actions',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {data.lines.map((line, index) => (
                                    <tr
                                        key={line.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        {/* Account */}
                                        <td className="px-2 py-1">
                                            <Input
                                                placeholder="Ledger Account"
                                                value={
                                                    line.subledger_name || ''
                                                }
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'subledger_name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                placeholder="Personal Ledger Account"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                placeholder="Reference Personal Ledger Account"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                placeholder="Instrument Type"
                                                className="h-8 text-sm"
                                            />
                                        </td>

                                        {/* Account Code */}
                                        <td className="px-2 py-1">
                                            <Input
                                                placeholder="Ledger Code"
                                                value={line.account_code || ''}
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'account_code',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                placeholder="Personal Ledger Account No"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                placeholder="Reference Personal Ledger Account No"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                placeholder="Instrument Number"
                                                className="h-8 text-sm"
                                            />
                                        </td>

                                        <td className="px-2 py-1">
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
                                        </td>

                                        <td className="px-2 py-1">
                                            <Input
                                                type="number"
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

                                        <td className="px-2 py-1">
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
                    <div className="space-y-3 md:hidden">
                        {data.lines.map((line, index) => (
                            <div
                                key={line.id}
                                className="space-y-3 rounded-md border border-border bg-card p-3"
                            >
                                {/* Header */}
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

                                {/* Ledger / Subledger */}
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Ledger Account
                                    </Label>
                                    <Input
                                        value={line.subledger_name || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'subledger_name',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />
                                    <Label className="text-xs">
                                        Ledger Code
                                    </Label>
                                    <Input
                                        value={line.account_code || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'account_code',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />

                                    <Label className="text-xs">
                                        Personal Ledger Account
                                    </Label>
                                    <Input className="h-8 text-sm" />
                                    <Label className="text-xs">
                                        Personal Ledger Account No
                                    </Label>
                                    <Input
                                        value={line.subledger_type || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'subledger_type',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />

                                    <Label className="text-xs">
                                        Reference Personal Ledger Account
                                    </Label>
                                    <Input className="h-8 text-sm" />
                                    <Label className="text-xs">
                                        Reference Personal Ledger Account No
                                    </Label>
                                    <Input
                                        value={line.associate_ledger_Code || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'associate_ledger_Code',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />

                                    <Label className="text-xs">
                                        Instrument Type
                                    </Label>
                                    <Input className="h-8 text-sm" />
                                    <Label className="text-xs">
                                        Instrument Number
                                    </Label>
                                    <Input
                                        value={line.associate_ledger_Code || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'associate_ledger_Code',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 text-sm"
                                    />
                                </div>

                                {/* Debit / Credit */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
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

                                    <div>
                                        <Label className="text-xs">
                                            Credit
                                        </Label>
                                        <Input
                                            type="number"
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
                                </div>

                                {/* Narration */}
                                <div>
                                    <Label className="text-xs">Narration</Label>
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
                        {voucher ? 'Update Voucher' : 'Create Voucher'}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
