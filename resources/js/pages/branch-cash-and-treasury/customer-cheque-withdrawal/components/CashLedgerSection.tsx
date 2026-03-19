import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { LedgerAccount, VoucherLine } from '../../../../types/accounting';

interface CashLedgerSectionProps {
    data: any;
    errors: any;
    cash_ledgers: LedgerAccount[];
    cash_subledgers: LedgerAccount[];
    instrument_types: any;
    handleCashLedgerLineChange: (
        id: number,
        field: keyof VoucherLine,
        value: any,
    ) => void;
}

function CashLedgerSection({
    data,
    errors,
    cash_ledgers,
    cash_subledgers,
    instrument_types,
    handleCashLedgerLineChange,
}: CashLedgerSectionProps) {
    console.log(data);
    return (
        <div className="rounded-md border bg-card md:col-span-6">
            <div className="bg-destructive/5 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-medium">Cash Ledger</h2>
            </div>

            <div className="grid grid-cols-1 gap-x-3 p-3 md:grid-cols-2">
                {/* Cash Ledger */}
                <div>
                    <Label className="text-xs">Ledger Account</Label>
                    <Select
                        disabled
                        error={errors?.cash_ledger_id}
                        value={data.ledger_account_id?.toString() || ''}
                        options={cash_ledgers.map((ledger) => ({
                            value: ledger.id.toString(),
                            label: `${ledger.code} - ${ledger.name}`,
                        }))}
                        onChange={(value) => {
                            handleCashLedgerLineChange(
                                1,
                                'ledger_account_id',
                                value ? Number(value) : null,
                            );
                        }}
                    />
                </div>

                {/* Cash Sub Ledger */}
                <div>
                    <Label className="text-xs">Subledger Account</Label>
                    <Select
                        disabled
                        error={errors?.cash_subledger_id}
                        value={data.cash_subledger_id?.toString() || ''}
                        options={cash_subledgers.map((ledger) => ({
                            value: ledger.id.toString(),
                            label: `${ledger.code} - ${ledger.name}`,
                        }))}
                        onChange={(value) => {
                            handleCashLedgerLineChange(
                                1,
                                'subledger_id',
                                value ? Number(value) : null,
                            );
                        }}
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
                        options={instrument_types.map((type) => ({
                            value: type.id,
                            label: type.name,
                        }))}
                        onChange={(value) => {
                            handleCashLedgerLineChange(
                                1,
                                'instrument_id',
                                value ? Number(value) : null,
                            );
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default CashLedgerSection;
