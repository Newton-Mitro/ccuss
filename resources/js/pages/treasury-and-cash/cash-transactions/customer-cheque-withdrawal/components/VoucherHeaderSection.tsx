import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select } from '../../../../../components/ui/select';
import { formatDate } from '../../../../../lib/date_util';
import { Branch } from '../../../../../types/branch';

interface VoucherHeaderSectionProps {
    data: any;
    errors: any;
    setData: (key: string, value: any) => void;
    branches: Branch[];
}

function VoucherHeaderSection({
    data,
    errors,
    setData,
    branches,
}: VoucherHeaderSectionProps) {
    return (
        <div className="rounded-md border bg-card">
            <div className="flex items-center justify-between border-b bg-destructive/5 px-4 py-3">
                <h2 className="text-sm font-medium text-card-foreground">
                    Voucher Header
                </h2>
                <span className="text-xs text-muted-foreground">
                    {data.voucher_date && formatDate(data.voucher_date)}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-x-3 p-3 sm:grid-cols-2 md:grid-cols-2">
                {/* Voucher Type */}
                <div>
                    <Label className="text-xs">Voucher Type</Label>
                    <Select
                        disabled
                        error={errors?.voucher_type}
                        value={data.voucher_type || ''}
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
                            { value: 'PURCHASE', label: 'Purchase' },
                            { value: 'SALE', label: 'Sale' },
                            { value: 'DEBIT_NOTE', label: 'Debit Note' },
                            { value: 'CREDIT_NOTE', label: 'Credit Note' },
                            { value: 'CONTRA', label: 'Contra' },
                        ]}
                        onChange={(value) => setData('voucher_type', value)}
                    />
                </div>

                {/* Branch */}
                <div>
                    <Label className="text-xs">Branch</Label>
                    <Select
                        disabled
                        error={errors?.branch_id}
                        value={data.branch_id?.toString() || ''}
                        options={branches.map((b) => ({
                            value: b.id.toString(),
                            label: b.name,
                        }))}
                        onChange={(value) =>
                            setData('branch_id', Number(value))
                        }
                    />
                </div>

                <div>
                    <Label className="text-xs">Ledger Account</Label>
                    <Select
                        disabled
                        error={''}
                        value={''}
                        options={[]}
                        onChange={(value) => {
                            setData(
                                'ledger_account_id',
                                value ? Number(value) : null,
                            );
                        }}
                    />
                </div>

                {/* Reference */}
                <div>
                    <Label className="text-xs">Deposit Slip Reference</Label>
                    <Input
                        error={errors?.reference}
                        value={data.reference}
                        className="h-8 text-sm"
                        onChange={(e) => setData('reference', e.target.value)}
                    />
                </div>

                {/* Narration */}
                <div className="md:col-span-2">
                    <Label className="text-xs">Narration</Label>
                    <Input
                        disabled
                        error={errors?.narration}
                        value={data.narration || ''}
                        onChange={(e) => setData('narration', e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}

export default VoucherHeaderSection;
