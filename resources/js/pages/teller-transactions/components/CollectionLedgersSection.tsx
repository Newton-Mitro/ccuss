import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { Customer } from '../../../types/customer';
import { CustomerSearchBox } from '../../customer-mgmt/customers/customer-search-box';

interface CollectionLine {
    id: number | string;
    credit?: number;
    particulars?: string;
}

interface CollectionLedgersSectionProps {
    lines: CollectionLine[];
    processing: boolean;
    onCustomerSelect: (customer: Customer) => void;
    handleLineChange: (
        index: number,
        field: keyof CollectionLine,
        value: any,
    ) => void;
    onSubmit: () => void;
    onCollectLater: () => void;
}

function CollectionLedgersSection({
    lines,
    processing,
    onCustomerSelect,
    handleLineChange,
    onSubmit,
    onCollectLater,
}: CollectionLedgersSectionProps) {
    const totalCredit = lines.reduce(
        (sum, line) => sum + (Number(line.credit) || 0),
        0,
    );

    return (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-muted/30 p-4">
            {/* Header */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-primary">
                    Customer Cash Deposit
                </h2>

                <CustomerSearchBox
                    onSelect={(customer) => {
                        onCustomerSelect(customer);
                    }}
                />

                {/* Table Wrapper */}
                <div className="rounded-md border border-border md:block">
                    {/* Table Header */}
                    <div className="bg-muted/30 px-2">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-1/12 border-b border-border p-2 text-center text-sm font-medium text-muted-foreground">
                                        <Checkbox checked />
                                    </th>
                                    <th className="w-8/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
                                        Ledger & Sub-Ledger
                                    </th>
                                    <th className="w-3/12 border-b border-border p-2 text-left text-sm font-medium text-muted-foreground">
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
                                {lines.map((line, index) => (
                                    <tr
                                        key={`collection-ledger-${index}`}
                                        className="rounded-md odd:bg-secondary/50 even:bg-primary/20"
                                    >
                                        {/* Checkbox */}
                                        <td className="w-1/12 text-center align-middle">
                                            <div className="flex h-9 items-center justify-center">
                                                <Checkbox checked />
                                            </div>
                                        </td>

                                        {/* Ledger Info */}
                                        <td className="w-8/12 border border-destructive align-middle">
                                            <div className="-mt-1 flex items-center justify-end border-x border-border px-2 py-1">
                                                <div className="flex gap-2">
                                                    <span className="text-xs text-muted-foreground underline">
                                                        Ledger Code - Name
                                                    </span>
                                                    <span className="text-xs text-muted-foreground underline">
                                                        Acc. Name - Number
                                                    </span>
                                                    <span className="text-xs text-muted-foreground underline">
                                                        Ref. Acc. Name - Number
                                                    </span>
                                                </div>
                                            </div>
                                            {line.particulars && (
                                                <div className="-mt-1 flex items-center justify-end border-x border-border px-2">
                                                    <span className="text-xs text-muted-foreground underline">
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
                                                onChange={(e) =>
                                                    handleLineChange(
                                                        index,
                                                        'credit',
                                                        Number(e.target.value),
                                                    )
                                                }
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
                                    <div className="text-sm text-destructive">
                                        Debit total: 0, Credit total:{' '}
                                        {formatBDTCurrency(totalCredit)}. Both
                                        must be equal and greater than zero.
                                    </div>
                                </td>

                                <td className="w-3/12 p-2">
                                    {`Total: ${formatBDTCurrency(totalCredit)}`}
                                </td>
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
                    onClick={onCollectLater}
                >
                    {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Clock className="h-4 w-4" />
                    )}
                    Collect Later
                </Button>

                <Button type="button" disabled={processing} onClick={onSubmit}>
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

export default CollectionLedgersSection;
