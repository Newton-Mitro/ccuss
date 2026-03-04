import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { LedgerAccount } from '../../../../types/accounting';

interface CashLedgerSectionProps {
    data: any;
    errors: any;
    setData: (key: string, value: any) => void;
    cash_ledgers: LedgerAccount[];
    cash_subledgers: LedgerAccount[];
    handleCashLedgerChange: (value: string) => void;
}

function CashLedgerSection({
    data,
    errors,
    setData,
    cash_ledgers,
    cash_subledgers,
    handleCashLedgerChange,
}: CashLedgerSectionProps) {
    console.log(data);
    return (
        <div className="rounded-md border border-border bg-card md:col-span-6">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-destructive/5 px-4 py-3">
                <h2 className="text-sm font-medium">Cash Ledger</h2>
            </div>

            <div className="grid grid-cols-1 gap-x-3 p-3 md:grid-cols-3">
                {/* Cash Ledger */}
                <div>
                    <Label className="text-xs">Cash Ledger Account</Label>
                    <Select
                        disabled
                        error={errors?.cash_ledger_id}
                        value={data.ledger_account_id?.toString() || ''}
                        options={cash_ledgers.map((ledger) => ({
                            value: ledger.id.toString(),
                            label: `${ledger.code} - ${ledger.name}`,
                        }))}
                        onChange={(e) => {
                            handleCashLedgerChange(e.target.value);
                            setData(
                                'cash_ledger_id',
                                e.target.value ? Number(e.target.value) : null,
                            );
                        }}
                    />
                </div>

                {/* Cash Sub Ledger */}
                <div>
                    <Label className="text-xs">Cash Sub-Ledger</Label>
                    <Select
                        disabled
                        error={errors?.cash_subledger_id}
                        value={data.cash_subledger_id?.toString() || ''}
                        options={cash_subledgers.map((ledger) => ({
                            value: ledger.id.toString(),
                            label: `${ledger.code} - ${ledger.name}`,
                        }))}
                        onChange={(e) =>
                            setData(
                                'cash_subledger_id',
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                    />
                </div>

                {/* Instrument Type */}
                <div>
                    <Label className="text-xs font-medium">
                        Instrument Type
                    </Label>
                    <Select
                        disabled
                        value={data.instrument_type || ''}
                        options={[
                            { value: 'CASH', label: 'Cash' },
                            { value: 'CHEQUE', label: 'Cheque' },
                            { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                            {
                                value: 'MOBILE_BANKING',
                                label: 'Mobile Banking',
                            },
                            { value: 'CARD', label: 'Card' },
                            { value: 'OTHER', label: 'Other' },
                        ]}
                        onChange={(e) =>
                            setData('instrument_type', e.target.value)
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default CashLedgerSection;
