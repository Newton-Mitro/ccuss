import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';

import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

import { route } from 'ziggy-js';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { Customer } from '../../../types/customer_kyc_module';
import DepositLedgersSection from './components/DepositLedgersSection';
import VoucherHeaderSection from './components/VoucherHeaderSection';
import VoucherQueueSection from './components/VoucherQueueSection';

interface VoucherFormData {
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    branch_id?: number;
    status: string;
    reference?: string;
    narration: string;
    lines: any[];
}

export default function CustomerCashDepositPage() {
    const {
        cash_subledger_accounts,
        branches,
        voucher_entries,
        user_branch_id,
    } = usePage().props as any;

    const { data, setData, post, processing, errors } =
        useForm<VoucherFormData>({
            voucher_no: '',
            voucher_date: new Date().toISOString().split('T')[0],
            voucher_type: 'CREDIT_OR_RECEIPT',
            branch_id: user_branch_id || branches[0]?.id,
            status: 'DRAFT',
            reference: '',
            narration: '',
            lines: [],
        });

    useFlashToastHandler();

    const onCustomerSelected = async (customer: Customer) => {
        try {
            const res = await axios.get(
                route('teller-transactions.get-collection-ledgers'),
            );
            const newCreditLines = res.data || [];
            newCreditLines.forEach((line: any) => {
                line.customer_id = customer.id;
                line.customer_no = customer.customer_no;
                line.customer_name = customer.name;
                line.is_selected = true;
            });

            setData('lines', [...newCreditLines]);
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
                          particulars: value
                              ? `Customer deposited ${formatBDTCurrency(value)} in cash to ${line?.name}`
                              : '',
                      }
                    : line,
            );
        } else {
            creditLineUpdate = data.lines.map((line) =>
                line.id === id ? { ...line, [field]: value } : line,
            );
        }

        setData('lines', creditLineUpdate);
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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Cash Deposit" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-8">
                    <DepositLedgersSection
                        errors={errors}
                        collectionSubledgerAccounts={data.lines}
                        processing={processing}
                        handleCreditLineChange={handleCreditLineChange}
                        onCustomerSelect={onCustomerSelected}
                        collectNowHandler={collectNowHandler}
                        collectLaterHandler={collectLaterHandler}
                        toggleSelectAll={toggleSelectAll}
                        toggleSelect={toggleSelect}
                    />
                </div>

                <div className="flex flex-col gap-6 md:col-span-4">
                    <VoucherHeaderSection
                        data={data}
                        errors={errors}
                        setData={setData}
                        cash_subledger_accounts={cash_subledger_accounts}
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
