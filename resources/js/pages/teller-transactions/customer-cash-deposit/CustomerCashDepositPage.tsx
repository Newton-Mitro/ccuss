import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { LedgerAccount } from '../../../types/accounting';
import { Customer } from '../../../types/customer';

import CashLedgerSection from './components/CashLedgerSection';
import DepositLedgersSection from './components/DepositLedgersSection';
import VoucherHeaderSection from './components/VoucherHeaderSection';
import VoucherQueueSection from './components/VoucherQueueSection';

function normalizeErrors(errors: Record<string, string>) {
    const result: any = {};
    const lines: any[] = [];

    Object.entries(errors || {}).forEach(([key, message]) => {
        const lineMatch = key.match(/^lines\.(\d+)\.(.+)$/);
        if (lineMatch) {
            const index = Number(lineMatch[1]);
            const field = lineMatch[2];
            lines[index] = lines[index] || {};
            lines[index][field] = message;
        } else {
            result[key] = message;
        }
    });

    if (lines.length > 0) result.lines = lines;
    return result;
}

interface VoucherLine {
    id: number;
    voucher_id: number;

    ledger_account_id: number | null;
    ledger_account?: LedgerAccount | null;

    subledger_id?: number | null;
    subledger_type?: string | null;

    reference_id?: number | null;
    reference_type?: string | null;

    instrument_type?: string | null;
    instrument_no?: string | null;

    particulars?: string | null;

    debit: number;
    credit: number;

    is_selected: boolean;

    created_at?: string | null;
    updated_at?: string | null;
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
    cash_ledger_id?: number | null;
    cash_subledger_id?: number | null;
    lines: VoucherLine[];
}

export default function CustomerCashDepositPage() {
    const {
        fiscal_years,
        fiscal_periods,
        branches,
        cash_ledgers,
        cash_subledgers,
        lines,
        vouchers,
        user_branch_id,
        fiscal_year_id,
        fiscal_period_id,
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
        fiscal_year_id: fiscal_year_id || 0,
        fiscal_period_id: fiscal_period_id || 0,
        branch_id: user_branch_id || branches[0]?.id,
        status: 'DRAFT',
        reference: '',
        narration: 'Customer deposit via cash counter.',
        cash_ledger_id: null,
        cash_subledger_id: null,
        lines: lines || [],
    });

    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Derived lists (no useState needed)
    const creditLines = useMemo(
        () => data.lines.filter((line) => line.credit > 0),
        [data.lines],
    );

    const debitLines = useMemo(
        () =>
            data.lines.filter(
                (line) =>
                    line.debit > 0 || line.ledger_account?.code === '1111',
            ),
        [data.lines],
    );

    // Customer selection
    const onCustomerSelected = (customer: Customer) => {
        const newLine: VoucherLine = {
            id: -Date.now(),
            voucher_id: 0,
            ledger_account_id: null,
            ledger_account: null,
            debit: 0,
            credit: 100,
            instrument_type: 'CASH',
            is_selected: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setData('lines', [...data.lines, newLine]);
        setData(
            'narration',
            `Deposit to "${customer.name}" (${customer.customer_no}) via cash counter.`,
        );
    };

    // Update line field
    const handleCreditLineChange = (
        id: number,
        field: keyof VoucherLine,
        value: any,
    ) => {
        const updated = data.lines.map((line) =>
            line.id === id ? { ...line, [field]: value } : line,
        );
        setData('lines', updated);
    };

    // Toggle selection
    const toggleSelectAll = () => {
        const allSelected = data.lines.every((l) => l.is_selected);
        setData(
            'lines',
            data.lines.map((line) => ({ ...line, is_selected: !allSelected })),
        );
    };

    const toggleSelect = (id: number) => {
        const updated = data.lines.map((line) =>
            line.id === id ? { ...line, is_selected: !line.is_selected } : line,
        );
        setData('lines', updated);
    };

    const handleCashLedgerChange = (value: string) => {
        const ledgerId = value ? Number(value) : null;
        setData('cash_ledger_id', ledgerId);
        setData('cash_subledger_id', null);

        router.get(
            '/customer-cash-deposit',
            { cash_ledger_id: ledgerId },
            { preserveState: true },
        );
    };

    const onCollectNowSubmit = () =>
        post('/vouchers', {
            preserveScroll: true,
            onSuccess: () => toast.success('Voucher saved'),
        });

    const onCollectLaterSubmit = () =>
        post('/vouchers', {
            preserveScroll: true,
            onSuccess: () => toast.success('Voucher saved'),
        });

    const handleCollect = (voucherId: number) =>
        router.get(`/vouchers/${voucherId}`, {}, { preserveScroll: true });

    const handleCancel = (voucherId: number) => {
        if (!confirm('Cancel this voucher?')) return;
        router.delete(`/vouchers/${voucherId}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Voucher cancelled'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Transactions', href: '#' },
        { title: 'Customer Cash Deposit', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Cash Deposit" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-7">
                    <DepositLedgersSection
                        lines={creditLines}
                        processing={processing}
                        handleCreditLineChange={handleCreditLineChange}
                        onCustomerSelect={onCustomerSelected}
                        onCollectNowSubmit={onCollectNowSubmit}
                        onCollectLaterSubmit={onCollectLaterSubmit}
                        toggleSelectAll={toggleSelectAll}
                        toggleSelect={toggleSelect}
                    />
                </div>

                <div className="flex flex-col gap-6 md:col-span-5">
                    <VoucherHeaderSection
                        data={data}
                        errors={errors}
                        setData={setData}
                        fiscal_years={fiscal_years}
                        fiscal_periods={fiscal_periods}
                        branches={branches}
                    />

                    <CashLedgerSection
                        data={debitLines[0] || data}
                        errors={errors}
                        setData={setData}
                        cash_ledgers={cash_ledgers}
                        cash_subledgers={cash_subledgers}
                        handleCashLedgerChange={handleCashLedgerChange}
                    />

                    <VoucherQueueSection
                        vouchers={vouchers}
                        onCollect={handleCollect}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </CustomAuthLayout>
    );
}
