import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { normalizeErrors } from '../../../lib/normalize_errors';
import { BreadcrumbItem } from '../../../types';
import { VoucherLine } from '../../../types/accounting';
import { Customer } from '../../../types/customer';
import CashLedgerSection from './components/CashLedgerSection';
import VoucherHeaderSection from './components/VoucherHeaderSection';
import VoucherQueueSection from './components/VoucherQueueSection';
import WithdrawalLedgerSection from './components/WithdrawalLedgerSection';

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
    lines: VoucherLine[];
}

export default function CustomerCashWithdrawalPage() {
    const {
        fiscal_years,
        fiscal_periods,
        branches,
        cash_ledgers,
        cash_subledgers,
        instrument_types,
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
        voucher_type: 'DEBIT_OR_PAYMENT',
        fiscal_year_id: fiscal_year_id || 0,
        fiscal_period_id: fiscal_period_id || 0,
        branch_id: user_branch_id || branches[0]?.id,
        status: 'DRAFT',
        reference: '',
        narration: '',
        lines: lines || [],
    });

    console.log(data);
    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const creditLines = useMemo(
        () =>
            data.lines.filter((line) => line.dr_cr === 'CR' || line.credit > 0),
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

    const onCustomerSelected = async (customer: Customer) => {
        try {
            const res = await axios.get('/get-withdrawable-accounts');
            const _newDebitLines = res.data || [];
            const _newCreditLines = [
                {
                    ...debitLines[0],
                    credit: 0,
                    debit: _newDebitLines.reduce((a, b) => a + b.credit, 0),
                },
            ];

            setData('lines', [..._newCreditLines, ..._newDebitLines]);
            setData(
                'narration',
                `${customer.name} (${customer.customer_no}) withdrew from his/her accounts via cash counter.`,
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreditLineChange = (
        id: number,
        field: keyof VoucherLine,
        value: any,
    ) => {
        let creditLineUpdate = [];
        if (field === 'credit') {
            creditLineUpdate = data.lines.map((line) =>
                line.id === id
                    ? {
                          ...line,
                          [field]: value,
                          particulars: `${formatBDTCurrency(value)} cash deposited to ${line.ledger_account?.name}`,
                      }
                    : line,
            );
        } else {
            creditLineUpdate = data.lines.map((line) =>
                line.id === id ? { ...line, [field]: value } : line,
            );
        }

        const totalDebit = creditLineUpdate.reduce((a, b) => a + b.credit, 0);
        const debitLineUpdate = creditLineUpdate.map((line) =>
            line.id === 1 ? { ...line, debit: totalDebit } : line,
        );
        setData('lines', debitLineUpdate);
    };

    const handleDebitLineChange = (
        id: number,
        field: keyof VoucherLine,
        value: any,
    ) => {
        const updated = data.lines.map((line) =>
            line.id === id ? { ...line, [field]: value } : line,
        );
        setData('lines', updated);
    };

    const collectNowHandler = () =>
        post('/vouchers', {
            preserveScroll: true,
            onSuccess: () => toast.success('Voucher saved'),
        });

    const viewVoucherHandler = (voucherId: number) => {
        window.open(`/vouchers/${voucherId}`, '_blank', 'noopener,noreferrer');
    };

    const cancelVoucherHandler = (voucherId: number) => {
        if (!confirm('Cancel this voucher?')) return;
        router.delete(`/vouchers/${voucherId}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Voucher cancelled'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Transactions', href: '#' },
        { title: 'Customer Cash Withdrawal', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Cash Withdrawal" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-8">
                    {/* Collection Ledger Section */}
                    <WithdrawalLedgerSection
                        errors={errors}
                        lines={creditLines}
                        processing={processing}
                        handleDebitLineChange={handleDebitLineChange}
                        onSubmit={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        onCustomerSelect={onCustomerSelected}
                    />
                </div>

                <div className="flex flex-col gap-6 md:col-span-4">
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
                        data={creditLines.length > 0 ? creditLines[0] : data}
                        errors={errors}
                        cash_ledgers={cash_ledgers}
                        cash_subledgers={cash_subledgers}
                        instrument_types={instrument_types}
                        handleCashLedgerLineChange={handleCreditLineChange}
                    />

                    {/* Voucher Queue Section */}
                    <VoucherQueueSection
                        vouchers={vouchers}
                        handleVoucherCancel={cancelVoucherHandler}
                        handleVoucherView={viewVoucherHandler}
                    />
                </div>
            </div>
        </CustomAuthLayout>
    );
}
