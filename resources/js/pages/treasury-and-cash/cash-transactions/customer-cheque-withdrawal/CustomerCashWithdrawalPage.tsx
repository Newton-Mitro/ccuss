import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useMemo } from 'react';
import { route } from 'ziggy-js';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { normalizeErrors } from '../../../../lib/normalize_errors';
import { BreadcrumbItem, SharedData } from '../../../../types';
import { Customer } from '../../../../types/customer_kyc_module';
import VoucherHeaderSection from './components/VoucherHeaderSection';
import VoucherQueueSection from './components/VoucherQueueSection';
import WithdrawalLedgerSection from './components/WithdrawalLedgerSection';

interface VoucherFormData extends SharedData {
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    branches: any[];
    voucher_entries: any[];
    branch_id?: number;
    user_branch_id?: number;
    status: string;
    reference?: string;
    narration: string;
    lines: any[];
}

export default function CustomerCashWithdrawalPage() {
    const { branches, lines, voucher_entries, user_branch_id } =
        usePage<VoucherFormData>().props;

    const {
        data,
        setData,
        processing,
        errors: rawErrors,
    } = useForm({
        voucher_no: '',
        voucher_date: new Date().toISOString().split('T')[0],
        voucher_type: 'DEBIT_OR_PAYMENT',
        branch_id: user_branch_id || branches[0]?.id,
        status: 'DRAFT',
        reference: '',
        narration: '',
        lines: lines || [],
    });

    const errors = useMemo(() => normalizeErrors(rawErrors), [rawErrors]);

    useFlashToastHandler();

    const creditLines = useMemo(
        () =>
            data.lines.filter((line) => line.dr_cr === 'CR' || line.credit > 0),
        [data.lines],
    );

    const onCustomerSelected = async (customer: Customer) => {
        try {
            const res2 = await axios.get(
                route('teller-transactions.get-collection-ledgers'),
            );
            const _newCreditLines = res2.data || [];

            setData('lines', _newCreditLines);
            setData(
                'narration',
                `${customer.name} (${customer.customer_no}) withdrew from his/her accounts via cash counter.`,
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleDebitLineChange = (
        id: number,
        field: keyof any,
        value: any,
    ) => {
        const updated = data.lines.map((line) =>
            line.id === id ? { ...line, [field]: value } : line,
        );
        setData('lines', updated);
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

                <div className="flex flex-col gap-4 md:col-span-4">
                    {/* Voucher Header Section */}
                    <VoucherHeaderSection
                        data={data}
                        errors={errors}
                        setData={setData}
                        branches={branches}
                    />

                    {/* Voucher Queue Section */}
                    <VoucherQueueSection
                        voucher_entries={voucher_entries}
                        handleVoucherCancel={cancelVoucherHandler}
                        handleVoucherView={viewVoucherHandler}
                    />
                </div>
            </div>
        </CustomAuthLayout>
    );
}
