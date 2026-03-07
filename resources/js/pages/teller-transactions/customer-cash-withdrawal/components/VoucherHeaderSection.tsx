import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { formatDate } from '../../../../lib/date_util';
import { FiscalPeriod, FiscalYear } from '../../../../types/accounting';
import { Branch } from '../../../../types/branch';

interface VoucherHeaderSectionProps {
    data: any;
    errors: any;
    setData: (key: string, value: any) => void;
    fiscal_years: FiscalYear[];
    accounting_periods: FiscalPeriod[];
    branches: Branch[];
}

function VoucherHeaderSection({
    data,
    errors,
    setData,
    fiscal_years,
    accounting_periods,
    branches,
}: VoucherHeaderSectionProps) {
    return (
        <div className="rounded-md border border-border bg-card md:col-span-6">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-destructive/5 px-4 py-3">
                <h2 className="text-sm font-medium">Voucher Header</h2>
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
                        onChange={(e) =>
                            setData('voucher_type', e.target.value)
                        }
                    />
                </div>

                {/* Fiscal Year */}
                <div>
                    <Label className="text-xs">Fiscal Year</Label>
                    <Select
                        disabled
                        error={errors?.fiscal_year_id}
                        value={data.fiscal_year_id?.toString() || ''}
                        options={fiscal_years.map((fy) => ({
                            value: fy.id.toString(),
                            label: fy.code,
                        }))}
                        onChange={(e) => {
                            setData('fiscal_year_id', Number(e.target.value));
                            setData('accounting_period_id', null);
                        }}
                    />
                </div>

                {/* Fiscal Period */}
                <div>
                    <Label className="text-xs">Fiscal Period</Label>
                    <Select
                        disabled
                        error={errors?.accounting_period_id}
                        value={data.accounting_period_id?.toString() || ''}
                        options={accounting_periods
                            .filter(
                                (fp) =>
                                    fp.fiscal_year_id === data.fiscal_year_id,
                            )
                            .map((fp) => ({
                                value: fp.id.toString(),
                                label: fp.period_name,
                            }))}
                        onChange={(e) =>
                            setData(
                                'accounting_period_id',
                                Number(e.target.value),
                            )
                        }
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
                        onChange={(e) =>
                            setData('branch_id', Number(e.target.value))
                        }
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
                <div>
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
