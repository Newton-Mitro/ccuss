import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { formatBDTCurrency } from '../../../../../lib/bdtCurrencyFormatter';
import { Customer } from '../../../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../../../../customer-kyc/customers/components/customer-search-box';

interface CollectionLedgersSectionProps {
    errors: any;
    collectionSubledgerAccounts: any[];
    processing: boolean;
    onCustomerSelect: (customer: Customer) => void;
    toggleSelectAll: () => void;
    toggleSelect: (id: number) => void;
    handleCreditLineChange: (id: number, field: any, value: any) => void;
    collectNowHandler: () => void;
    collectLaterHandler: () => void;
}

function DepositLedgersSection({
    errors,
    collectionSubledgerAccounts,
    processing,
    onCustomerSelect,
    toggleSelectAll,
    toggleSelect,
    handleCreditLineChange,
    collectNowHandler,
    collectLaterHandler,
}: CollectionLedgersSectionProps) {
    console.log(collectionSubledgerAccounts);
    const totalCredit = collectionSubledgerAccounts.reduce(
        (sum, line) => sum + (line?.is_selected ? Number(line.credit) || 0 : 0),
        0,
    );

    const allSelected =
        collectionSubledgerAccounts.length > 0 &&
        collectionSubledgerAccounts.every((line) => line.is_selected);

    return (
        <div className="flex flex-col gap-4 rounded-md border bg-card">
            <h2 className="rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-3 text-sm font-medium text-card-foreground">
                Cash Receipt
            </h2>

            <div className="px-4">
                <CustomerSearchBox onSelect={onCustomerSelect} />
            </div>

            <div className="space-y-4 px-4 pb-4">
                {/* Header */}
                <div className="">
                    {/* Table Wrapper */}
                    <div className="rounded-md border md:block">
                        {/* Table Header */}
                        <div className="rounded-tl-md rounded-tr-md border-b bg-sidebar px-2">
                            <table className="w-full table-fixed border-collapse">
                                <thead>
                                    <tr className="">
                                        <th className="w-1/12 p-2 text-center text-sm font-medium text-muted-foreground">
                                            <div className="flex items-center justify-center">
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                />
                                            </div>
                                        </th>
                                        <th className="w-8/12 border-x border-border px-2 py-3 text-left text-sm font-medium text-muted-foreground">
                                            Particulars
                                        </th>
                                        <th className="w-3/12 p-2 text-left text-sm font-medium text-muted-foreground">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scroll Body */}
                        <div className="h-[calc(100vh/2-86px)] overflow-y-auto bg-muted/30 p-2">
                            <table className="w-full table-fixed border-separate border-spacing-y-2">
                                <tbody>
                                    {collectionSubledgerAccounts.map(
                                        (line, index) => (
                                            <tr
                                                key={`collection-ledger-${index}`}
                                                className={`${
                                                    line.is_selected
                                                        ? 'odd:bg-primary/20 even:bg-accent/20'
                                                        : 'odd:bg-primary/5 even:bg-accent/5'
                                                } ${errors?.lines?.[index]?.credit && 'bg-destructive/20'} `}
                                            >
                                                {/* Checkbox */}
                                                <td className="w-1/12 text-center align-middle">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={
                                                                !!line.is_selected
                                                            }
                                                            onCheckedChange={() =>
                                                                toggleSelect(
                                                                    Number(
                                                                        line.id,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </td>

                                                {/* Ledger Info */}
                                                <td className="w-8/12 border-x border-muted align-middle">
                                                    <div className="">
                                                        <div className="flex items-center justify-end px-2">
                                                            <div className="flex text-xs font-bold text-muted-foreground">
                                                                <span className="hover:cursor-pointer hover:underline">
                                                                    {`• ${line.subledger.name} (${line.subledger.code})`}
                                                                </span>
                                                                <span className="hover:cursor-pointer hover:underline">
                                                                    {`• ${
                                                                        line.name
                                                                    } (${line.account_number})`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {line.particulars && (
                                                            <div className="-mt-1 flex items-center justify-end px-2">
                                                                <span className="text-xs text-muted-foreground/80">
                                                                    {
                                                                        line.particulars
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="w-3/12 px-1 py-0.5 align-middle">
                                                    <Input
                                                        type="number"
                                                        disabled={
                                                            !line.is_selected
                                                        }
                                                        value={
                                                            line.credit || ''
                                                        }
                                                        onChange={(e) => {
                                                            handleCreditLineChange(
                                                                Number(line.id),
                                                                'credit',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            );
                                                        }}
                                                        className="h-8 rounded-none text-sm font-bold"
                                                    />
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <table className="w-full table-fixed border-collapse rounded-br-md rounded-bl-md border-t bg-sidebar">
                            <tfoot>
                                <th className="w-1/12 p-2 text-center text-sm font-bold text-muted-foreground">
                                    <div className="flex items-center justify-center"></div>
                                </th>
                                <th className="w-8/12 px-2 py-3 text-right text-sm font-bold text-muted-foreground">
                                    Total
                                </th>
                                <th className="w-3/12 p-2 text-left text-sm font-bold text-muted-foreground">
                                    {formatBDTCurrency(totalCredit)}
                                </th>
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
        </div>
    );
}

export default DepositLedgersSection;
