import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';

interface CashLedgerSectionProps {
    handleCashLedgerLineChange: (id: number, field: any, value: any) => void;
}

function CashLedgerSection({
    handleCashLedgerLineChange,
}: CashLedgerSectionProps) {
    return (
        <div className="rounded-md border bg-card">
            <div className="flex items-center justify-between border-b bg-destructive/5 px-4 py-3">
                <h2 className="text-sm font-medium text-primary-foreground">
                    Cash Ledger
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-3 p-3 md:grid-cols-2">
                {/* Cash Ledger */}
                <div>
                    <Label className="text-xs">Ledger Account</Label>
                    <Select
                        disabled
                        error={''}
                        value={''}
                        options={[]}
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
                        error={''}
                        value={''}
                        options={[]}
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
                        value={''}
                        options={[]}
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
