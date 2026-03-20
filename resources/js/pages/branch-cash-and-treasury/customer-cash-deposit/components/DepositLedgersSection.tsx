import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { formatBDTCurrency } from '../../../../lib/bdtCurrencyFormatter';
import { VoucherLine } from '../../../../types/accounting';
import { Customer } from '../../../../types/customer';
import { CustomerSearchBox } from '../../../customer-kyc/customers/components/customer-search-box';

interface CollectionLedgersSectionProps {
    errors: any;
    creditLines: VoucherLine[];
    processing: boolean;
    onCustomerSelect: (customer: Customer) => void;
    toggleSelectAll: () => void;
    toggleSelect: (id: number) => void;
    handleCreditLineChange: (
        id: number,
        field: keyof VoucherLine,
        value: any,
    ) => void;
    collectNowHandler: () => void;
    collectLaterHandler: () => void;
}

function DepositLedgersSection({
    errors,
    creditLines,
    processing,
    onCustomerSelect,
    toggleSelectAll,
    toggleSelect,
    handleCreditLineChange,
    collectNowHandler,
    collectLaterHandler,
}: CollectionLedgersSectionProps) {
    const totalCredit = creditLines.reduce(
        (sum, line) => sum + (Number(line.credit) || 0),
        0,
    );

    const allSelected =
        creditLines.length > 0 && creditLines.every((line) => line.is_selected);

    return (
        <div className="flex flex-col gap-4 rounded-md border bg-muted/30 p-4">
            {/* Header */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-primary">
                    Cash Receipt
                </h2>

                <CustomerSearchBox onSelect={onCustomerSelect} />

                {/* Table Wrapper */}
                <div className="rounded-md border md:block">
                    {/* Table Header */}
                    <div className="bg-muted/30 px-2">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-1/12 border-b p-2 text-center text-sm font-medium text-muted-foreground">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="w-8/12 border-b p-2 text-left text-sm font-medium text-muted-foreground">
                                        Ledger, Subledger and Particulars
                                    </th>
                                    <th className="w-3/12 border-b p-2 text-left text-sm font-medium text-muted-foreground">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Scroll Body */}
                    <div className="h-[calc(100vh/2-86px)] overflow-y-auto bg-card p-2">
                        <table className="w-full table-fixed border-separate border-spacing-y-2">
                            <tbody>
                                {creditLines.map((line, index) => (
                                    <tr
                                        key={`collection-ledger-${index}`}
                                        className={`rounded-md ${
                                            line.is_selected
                                                ? 'odd:bg-primary/10 even:bg-accent/10'
                                                : 'odd:bg-primary/5 even:bg-accent/5'
                                        } ${errors?.lines?.[index]?.credit && 'bg-destructive/20'} `}
                                    >
                                        {/* Checkbox */}
                                        <td className="w-1/12 text-center align-middle">
                                            <div className="flex h-9 items-center justify-center">
                                                <Checkbox
                                                    checked={!!line.is_selected}
                                                    onCheckedChange={() =>
                                                        toggleSelect(
                                                            Number(line.id),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>

                                        {/* Ledger Info */}
                                        <td className="w-8/12 border border-destructive align-middle">
                                            <div className="-mt-1 flex items-center justify-end border-x px-2 py-1">
                                                <div className="flex gap-2">
                                                    <span className="text-xs text-muted-foreground underline">
                                                        {`${
                                                            line.ledger_account
                                                                ?.name
                                                        } - ${line.ledger_account?.code}`}
                                                    </span>
                                                </div>
                                            </div>
                                            {line.particulars && (
                                                <div className="-mt-1 flex items-center justify-end border-x px-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {line.particulars}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="w-3/12 px-1 align-middle">
                                            <Input
                                                type="number"
                                                value={line.credit || ''}
                                                onChange={(e) => {
                                                    handleCreditLineChange(
                                                        Number(line.id),
                                                        'credit',
                                                        Number(e.target.value),
                                                    );
                                                }}
                                                className="h-8 rounded-none text-sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <table className="w-full table-fixed border-collapse">
                        <tfoot>
                            <tr className="bg-muted/30 font-medium">
                                <td className="w-9/12 p-2" colSpan={2}>
                                    <div className="text-sm text-destructive"></div>
                                </td>
                                <td className="w-3/12 p-2">{`Total: ${formatBDTCurrency(totalCredit)}`}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-end gap-3 sm:flex-row">
                <Button
                    type="button"
                    variant="ghost"
                    disabled={processing}
                    onClick={collectLaterHandler}
                >
                    {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Clock className="h-4 w-4" />
                    )}
                    Collect Later
                </Button>

                <Button
                    type="button"
                    disabled={processing}
                    onClick={collectNowHandler}
                >
                    {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                    Collect Now
                </Button>
            </div>
        </div>
    );
}

export default DepositLedgersSection;
