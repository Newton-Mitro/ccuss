import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit2, Printer } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate, formatDateTime } from '../../../lib/date_util';
import { takaToText } from '../../../lib/taka_to_text';
import { BreadcrumbItem } from '../../../types';
import { Voucher } from '../../../types/accounting';

interface VoucherViewProps {
    voucher: Voucher;
    flash: { success?: string; error?: string };
    backUrl: string;
}

export default function VoucherView({ backUrl }: { backUrl: string }) {
    const { voucher, flash } = usePage().props as unknown as VoucherViewProps;

    console.log(voucher);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const getTotals = (lines?: { debit: number; credit: number }[]) => {
        const totalDebit =
            lines?.reduce((sum, l) => sum + Number(l.debit), 0) || 0;
        const totalCredit =
            lines?.reduce((sum, l) => sum + Number(l.credit), 0) || 0;
        return { totalDebit, totalCredit };
    };

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers' },
        { title: `Voucher ${voucher.voucher_no}`, href: '' },
    ];

    const totals = getTotals(voucher.lines);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Voucher ${voucher.voucher_no}`} />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <HeadingSmall
                    title={`Voucher ${voucher.voucher_no}`}
                    description="View voucher details"
                />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <Link
                        href={`/vouchers/${voucher.id}/edit`}
                        className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-500"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Print-only Header */}
            <div className="mb-6 hidden print:block">
                <div className="mb-2 text-center">
                    <h1 className="text-2xl font-bold tracking-wide uppercase">
                        PAYMENT VOUCHER
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Official Transaction Record
                    </p>
                </div>

                <div className="mt-4 flex justify-between text-sm">
                    {/* Left Side - Company Info */}
                    <div>
                        <p className="font-semibold">Your Company Name</p>
                        <p>123 Business Street</p>
                        <p>City, State, ZIP</p>
                        <p>Phone: (123) 456-7890</p>
                    </div>

                    {/* Right Side - Voucher Info */}
                    <div className="text-right">
                        <p>
                            <span className="font-semibold">Voucher No:</span>{' '}
                            {voucher.voucher_no}
                        </p>
                        <p>
                            <span className="font-semibold">Date:</span>{' '}
                            {formatDate(voucher.voucher_date)}
                        </p>
                        <p>
                            <span className="font-semibold">Reference:</span>{' '}
                            {voucher.reference || '-'}
                        </p>
                    </div>
                </div>

                <hr className="my-4 border-t border-border" />
            </div>

            {/* Voucher Details & Lines */}
            <div className="print-area mt-4 space-y-4 rounded-md bg-card p-4 sm:p-6">
                {/* Voucher Info */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Voucher No
                        </span>
                        <p className="text-sm">{voucher.voucher_no || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Voucher Date
                        </span>
                        <p className="text-sm">
                            {new Date(
                                voucher.voucher_date,
                            ).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Voucher Type
                        </span>
                        <p className="text-sm">{voucher.voucher_type || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Fiscal Year
                        </span>
                        <p className="text-sm">
                            {voucher.fiscal_year?.code || '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Fiscal Period
                        </span>
                        <p className="text-sm">
                            {voucher.fiscal_period?.period_name || '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Branch
                        </span>
                        <p className="text-sm">{voucher.branch?.name || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Voucher Status
                        </span>
                        <p className="text-sm">{voucher.status || '-'}</p>
                    </div>

                    {voucher.narration && (
                        <div className="sm:col-span-2 md:col-span-3">
                            <span className="text-xs text-muted-foreground">
                                Narration
                            </span>
                            <p className="text-sm">
                                {voucher.narration || '-'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Voucher Lines Table */}
                <div className="mt-4 overflow-auto rounded-md border border-border">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Ledger, Subledger, Reference Account',
                                    'Instrument Type',
                                    'Instrument No.',
                                    'Debit',
                                    'Credit',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className={`border-b border-border p-2 text-sm font-medium text-muted-foreground ${
                                            h === 'Debit' || h === 'Credit'
                                                ? 'text-right'
                                                : 'text-left'
                                        }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {voucher.lines.length > 0 ? (
                                voucher.lines.map((line) => (
                                    <tr
                                        key={line.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            <div className="">
                                                <div className="flex">
                                                    {`
                                                    ${line.ledger_account?.code} - ${line.ledger_account?.name} 
                                                    ${line.subledger ? `'|' ${line.subledger?.account_no || ''} - - ${line.subledger?.name || ''}` : ''}  
                                                    ${line.reference ? `'|' ${line.reference?.account_no || ''} - - ${line.reference?.name || ''}` : ''}  
                                                    `}
                                                </div>
                                                {line.particulars ? (
                                                    <div className="">
                                                        {line.particulars}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            {line.instrument_type || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {line.instrument_no || '-'}
                                        </td>
                                        <td className="px-2 py-1 text-right">
                                            {line.debit}
                                        </td>
                                        <td className="px-2 py-1 text-right">
                                            {line.credit}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-border font-medium">
                                <td colSpan={2}></td>

                                <td className="px-2 py-1 text-right">
                                    Totals:
                                </td>
                                <td className="px-2 py-1 text-right">
                                    {totals.totalDebit?.toFixed(2)}
                                </td>
                                <td className="px-2 py-1 text-right">
                                    {totals.totalCredit?.toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                            <tr className="border-t border-border text-right font-medium">
                                <td colSpan={5} className="p-3">
                                    {`In Word: ${takaToText(totals.totalCredit)} only.`}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex flex-col justify-between gap-6 md:flex-row">
                    <div className="">
                        <span className="text-xs text-primary">
                            Prepared By
                        </span>
                        <div className="text-sm">
                            <div className="">
                                {voucher.creator?.name || '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(voucher.created_at &&
                                    formatDateTime(voucher.created_at)) ||
                                    '-'}
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <span className="text-xs text-primary">Poster By</span>
                        <div className="text-sm">
                            <div className="">
                                {voucher.poster?.name || '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(voucher.posted_at &&
                                    formatDateTime(voucher.posted_at)) ||
                                    '-'}
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <span className="text-xs text-primary">
                            Approved By
                        </span>
                        <div className="text-sm">
                            <div className="">
                                {voucher.approver?.name || '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(voucher.approved_at &&
                                    formatDateTime(voucher.approved_at)) ||
                                    '-'}
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <span className="text-xs text-primary">
                            Rejected/Canceled By
                        </span>
                        <div className="text-sm">
                            <div className="">
                                {voucher.rejector?.name || '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(voucher.rejected_at &&
                                    formatDateTime(voucher.rejected_at)) ||
                                    '-'}
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <span className="text-xs text-primary">Updated By</span>
                        <div className="text-sm">
                            <div className="">
                                {voucher.updater?.name || '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(voucher.updated_at &&
                                    formatDateTime(voucher.updated_at)) ||
                                    '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
