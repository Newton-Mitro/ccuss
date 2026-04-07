import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useMemo } from 'react';

import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

import { route } from 'ziggy-js';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { normalizeErrors } from '../../../lib/normalize_errors';
import { Customer } from '../../../types/customer_kyc_module';
import DepositLedgersSection from './components/DepositLedgersSection';
import VoucherHeaderSection from './components/VoucherHeaderSection';
import VoucherQueueSection from './components/VoucherQueueSection';

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
    lines: any[];
}

export default function CustomerCashDepositPage() {
    const {
        fiscal_years,
        fiscal_periods,
        branches,
        lines,
        voucher_entries,
        user_branch_id,
        fiscal_year_id,
        fiscal_period_id,
    } = usePage().props as any;

    const { data, setData, post, processing, errors } =
        useForm<VoucherFormData>({
            voucher_no: '',
            voucher_date: new Date().toISOString().split('T')[0],
            voucher_type: 'CREDIT_OR_RECEIPT',
            fiscal_year_id: fiscal_year_id || 0,
            fiscal_period_id: fiscal_period_id || 0,
            branch_id: user_branch_id || branches[0]?.id,
            status: 'DRAFT',
            reference: '',
            narration: '',
            lines: lines || [],
        });

    const memoized_errors = useMemo(() => normalizeErrors(errors), [errors]);

    useFlashToastHandler();

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
            const res = await axios.get(
                route('teller-transactions.get-collection-ledgers'),
            );
            const newCreditLines = res.data || [];
            const newDebitLines = [
                {
                    ...debitLines[0],
                    credit: 0,
                    debit: newCreditLines.reduce((a, b) => a + b.credit, 0),
                },
            ];

            setData('lines', [...newDebitLines, ...newCreditLines]);
            setData(
                'narration',
                `${customer.name} (${customer.customer_no}) deposited to his/her accounts via cash counter.`,
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreditLineChange = (id: number, field: any, value: any) => {
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

    const handleDebitLineChange = (id: number, field: any, value: any) => {
        const updated = data.lines.map((line) =>
            line.id === id ? { ...line, [field]: value } : line,
        );
        setData('lines', updated);
    };

    const collectNowHandler = () =>
        post('/voucher_entries', {
            preserveScroll: true,
        });

    const collectLaterHandler = () =>
        post('/voucher_entries', {
            preserveScroll: true,
        });

    const voucherCollectNowHandler = (voucherId: number) => {
        router.get(
            `/voucher_entries/${voucherId}`,
            {},
            { preserveScroll: true },
        );
    };

    const viewVoucherHandler = (voucherId: number) => {
        window.open(
            route('voucher_entries.show', voucherId),
            '_blank',
            'noopener,noreferrer',
        );
    };

    const cancelVoucherHandler = (voucherId: number) => {
        if (!confirm('Cancel this voucher?')) return;
        router.delete(`/voucher_entries/${voucherId}`, {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cash Counter', href: '#' },
        { title: 'Customer Cash Receipt', href: '' },
    ];

    console.log(data.lines);
    console.log(debitLines);
    console.log(creditLines);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Cash Deposit" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-7">
                    <DepositLedgersSection
                        errors={errors}
                        creditLines={creditLines}
                        processing={processing}
                        handleCreditLineChange={handleCreditLineChange}
                        onCustomerSelect={onCustomerSelected}
                        collectNowHandler={collectNowHandler}
                        collectLaterHandler={collectLaterHandler}
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

                    <VoucherQueueSection
                        voucher_entries={voucher_entries}
                        onView={viewVoucherHandler}
                        voucherCollectNowHandler={voucherCollectNowHandler}
                        cancelVoucherHandler={cancelVoucherHandler}
                    />
                </div>
            </div>
        </CustomAuthLayout>
    );
}
