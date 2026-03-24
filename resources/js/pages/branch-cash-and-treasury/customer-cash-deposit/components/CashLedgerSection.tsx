import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { LedgerAccount, VoucherLine } from '../../../../types/accounting';

interface CashLedgerSectionProps {
    data: any;
    errors: any;
    cash_ledgers: LedgerAccount[];
    cash_subledgers: LedgerAccount[];
    instrument_types: any;
    handleDebitLineChange: (
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
    handleDebitLineChange,
}: CashLedgerSectionProps) {
    return (
        <div className="rounded-md border bg-card md:col-span-6">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <h2 className="text-sm font-medium text-primary-foreground">
                    Cash Ledger
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-3 p-3 md:grid-cols-3">
                {/* Cash Ledger */}
                <div>
                    <Label className="text-xs">Ledger Account</Label>
                    <Select
                        disabled
                        error={errors?.ledger_account_id}
                        value={data[0]?.ledger_account_id?.toString() || ''}
                        options={cash_ledgers.map((ledger) => ({
                            value: ledger.id.toString(),
                            label: `${ledger.code} - ${ledger.name}`,
                        }))}
                        onChange={(value) => {
                            handleDebitLineChange(
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
                        error={errors?.subledger_id}
                        value={data[0]?.subledger_id?.toString() || ''}
                        options={cash_subledgers.map((ledger) => ({
                            value: ledger.id.toString(),
                            label: `${ledger.code} - ${ledger.name}`,
                        }))}
                        onChange={(value) =>
                            handleDebitLineChange(
                                1,
                                'subledger_id',
                                value ? Number(value) : null,
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
                        error={errors?.instrument_type_id}
                        value={data[0].instrument_type_id || ''}
                        options={instrument_types.map((type) => ({
                            value: type.id,
                            label: type.name,
                        }))}
                        onChange={(value) =>
                            handleDebitLineChange(
                                1,
                                'instrument_type_id',
                                value,
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default CashLedgerSection;
