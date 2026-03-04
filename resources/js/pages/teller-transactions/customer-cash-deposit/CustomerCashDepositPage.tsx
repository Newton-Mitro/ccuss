import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { LedgerAccount } from '../../../types/accounting';
import { Customer } from '../../../types/customer';
import CashLedgerSection from './components/CashLedgerSection';
import CollectionLedgersSection from './components/CollectionLedgersSection';
import VoucherHeaderSection from './components/VoucherHeaderSection';
import VoucherQueueSection from './components/VoucherQueueSection';

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
        lines: lines || [],
    });

    const [debitLines, setDebitLines] = useState<VoucherLine[]>([]);
    const [creditLines, setCreditLines] = useState<VoucherLine[]>([]);

    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        if (!data.lines || !Array.isArray(data.lines)) return;

        const debit: VoucherLine[] = [];
        const credit: VoucherLine[] = [];

        data.lines.forEach((line: VoucherLine) => {
            if (line.ledger_account?.code === '1111') {
                debit.push(line);
            } else {
                credit.push(line);
            }
        });

        setDebitLines(debit);
        setCreditLines(credit);
    }, [data.lines]);

    const onCustomerSelected = (customer: Customer) => {
        const newLines: VoucherLine[] = [
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
            },
            {
                id: -Date.now() - 1,
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
            },
        ];

        setData('lines', newLines);
        setData(
            'narration',
            `Deposit to "${customer.name}" (${customer.customer_no}) via cash counter.`,
        );
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

    const handleCashLedgerChange = (value: string) => {
        setData('cash_subledger_id', null);
        setData('cash_ledger_id', value ? Number(value) : null);

        router.get(
            '/customer-cash-deposit',
            {
                cash_ledger_id: value ? Number(value) : null,
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
        { title: 'Customer Cash Deposit', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Cash Deposit" />
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    <div className="md:col-span-7">
                        {/* Collection Ledger Section */}
                        <CollectionLedgersSection
                            lines={creditLines}
                            processing={processing}
                            handleLineChange={handleLineChange}
                            onSubmit={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                            onCollectLater={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                            onCustomerSelect={onCustomerSelected}
                        />
                    </div>

                    <div className="flex flex-col gap-6 md:col-span-5">
                        {/* Voucher Header Section */}
                        <VoucherHeaderSection
                            data={data}
                            errors={errors}
                            setData={setData}
                            fiscal_years={fiscal_years}
                            fiscal_periods={fiscal_periods}
                            branches={branches}
                        />

                        {/* Cash Ledger Section */}
                        <CashLedgerSection
                            data={debitLines.length > 0 ? debitLines[0] : data}
                            errors={errors}
                            setData={setData}
                            cash_ledgers={cash_ledgers}
                            cash_subledgers={cash_subledgers}
                            handleCashLedgerChange={handleCashLedgerChange}
                        />

                        {/* Voucher Queue Section */}
                        <VoucherQueueSection
                            vouchers={vouchers}
                            onCollect={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                            onCancel={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                        />
                    </div>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
