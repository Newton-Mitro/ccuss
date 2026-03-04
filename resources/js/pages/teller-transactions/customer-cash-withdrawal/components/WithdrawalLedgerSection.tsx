import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { formatBDTCurrency } from '../../../../lib/bdtCurrencyFormatter';
import { takaToText } from '../../../../lib/taka_to_text';
import { Customer } from '../../../../types/customer';
import { CustomerSearchBox } from '../../../customer-mgmt/customers/customer-search-box';

interface CollectionLine {
    id: number | string;
    credit?: number;
    particulars?: string;
}

interface WithdrawalLedgersSectionProps {
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

function WithdrawalLedgerSection({
    lines,
    processing,
    onCustomerSelect,
    handleLineChange,
    onSubmit,
    onCollectLater,
}: WithdrawalLedgersSectionProps) {
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);

    // Account data mapping
    const accounts = [
        {
            value: 'AC-102345',
            name: 'Savings Account',
            balance: 25000,
            status: 'Active',
        },
        {
            value: 'AC-102346',
            name: 'Current Account',
            balance: 10500,
            status: 'Inactive',
        },
        {
            value: 'AC-102347',
            name: 'Joint Account',
            balance: 5000,
            status: 'Active',
        },
        {
            value: 'AC-102348',
            name: 'Fixed Deposit',
            balance: 100000,
            status: 'Active',
        },
        {
            value: 'AC-102349',
            name: 'Salary Account',
            balance: 12000,
            status: 'Active',
        },
    ];

    const accountDetails = accounts.find((a) => a.value === selectedAccount);

    return (
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-destructive/5 p-4">
            {/* Header */}
            <div className="space-y-3">
                <h2 className="text-base font-semibold text-muted-foreground">
                    Customer Cash Withdrawal
                </h2>
                <CustomerSearchBox onSelect={onCustomerSelect} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* Left Card */}
                <div className="space-y-4 rounded-lg border border-border bg-card p-4 md:col-span-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                        Account Details
                    </h3>

                    {/* Withdrawable Accounts */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">
                            Withdrawable Accounts
                        </Label>
                        <Select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            options={accounts.map((acc) => ({
                                value: acc.value,
                                label: acc.value,
                            }))}
                        />
                    </div>

                    {/* Account Details */}
                    {selectedAccount && accountDetails ? (
                        <div className="mt-3 flex flex-col gap-2 rounded-md border bg-muted/5 px-2 py-2 text-xs">
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Account Name:
                                </span>
                                <span>{accountDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Account Number:
                                </span>
                                <span>{accountDetails.value}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Balance:</span>
                                <span>
                                    {formatBDTCurrency(accountDetails.balance)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <span
                                    className={
                                        accountDetails.status === 'Active'
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                    }
                                >
                                    {accountDetails.status}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3 flex flex-col gap-2 rounded-md border bg-muted/5 px-2 py-2 text-xs">
                            {/* Skeleton placeholders */}
                            {[...Array(4)].map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-4 w-full animate-pulse rounded bg-muted/30"
                                />
                            ))}
                        </div>
                    )}

                    {/* Account Holders Scrollable */}
                    <div className="mt-4 space-y-1">
                        <Label className="text-xs font-medium">
                            Account Holders
                        </Label>

                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-accent/10 p-2">
                            {[
                                {
                                    id: 1,
                                    name: 'Abdul Karim',
                                    relation: 'Primary',
                                    account: 'AC-102345',
                                },
                                {
                                    id: 2,
                                    name: 'Nusrat Jahan',
                                    relation: 'Joint',
                                    account: 'AC-102345',
                                },
                                {
                                    id: 3,
                                    name: 'Md. Rahim',
                                    relation: 'Joint',
                                    account: 'AC-102346',
                                },
                                {
                                    id: 4,
                                    name: 'Fatima Akter',
                                    relation: 'Primary',
                                    account: 'AC-102347',
                                },
                                {
                                    id: 5,
                                    name: 'Ali Khan',
                                    relation: 'Joint',
                                    account: 'AC-102348',
                                },
                                {
                                    id: 6,
                                    name: 'Sara Ahmed',
                                    relation: 'Joint',
                                    account: 'AC-102349',
                                },
                                {
                                    id: 7,
                                    name: 'John Doe',
                                    relation: 'Primary',
                                    account: 'AC-102350',
                                },
                            ].map((holder, index) => (
                                <div
                                    key={holder.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border bg-background px-2 py-1.5 text-xs transition hover:bg-muted/30`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                                            {holder.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .slice(0, 2)}
                                        </div>

                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium">
                                                {holder.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {holder.relation}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="text-[10px] text-muted-foreground">
                                        {holder.account}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Card */}
                <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 md:col-span-8">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Signature Verification
                        </h3>

                        <div className="mt-3 flex h-60 items-center justify-center rounded-md border border-dashed border-muted text-xs text-muted-foreground">
                            <div
                                style={{
                                    height: 240,
                                    borderRadius: 10,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <ReactPanZoom
                                    image={
                                        'https://a.storyblok.com/f/191576/1176x882/0707bde47c/make_signature_hero_after.webp'
                                    }
                                    alt="Signature Preview"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-x-2">
                        <div className="">
                            <Label className="text-xs font-medium">
                                Instrument Type
                            </Label>
                            <Select
                                value={selectedAccount}
                                onChange={(e) =>
                                    setSelectedAccount(e.target.value)
                                }
                                options={accounts.map((acc) => ({
                                    value: acc.value,
                                    label: acc.value,
                                }))}
                            />
                        </div>
                        <div className="">
                            <Label className="text-xs font-medium">
                                Instrument Number
                            </Label>
                            <Select
                                value={selectedAccount}
                                onChange={(e) =>
                                    setSelectedAccount(e.target.value)
                                }
                                options={accounts.map((acc) => ({
                                    value: acc.value,
                                    label: acc.value,
                                }))}
                            />
                        </div>
                        <div className="">
                            <Label className="text-xs font-medium">
                                Withdrawal Amount
                            </Label>
                            <Input
                                type="number"
                                value={withdrawalAmount}
                                className="h-8 text-sm"
                                onChange={(e) =>
                                    setWithdrawalAmount(Number(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div className="rounded-md bg-muted/30 p-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                In Words:
                            </span>
                            <span className="font-semibold text-red-600">
                                {takaToText(withdrawalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col-reverse items-center justify-end gap-4 sm:flex-row">
                <Button
                    type="button"
                    disabled={processing}
                    onClick={onSubmit}
                    className="min-w-[140px]"
                >
                    {processing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Confirm Withdrawal
                </Button>
            </div>
        </div>
    );
}

export default WithdrawalLedgerSection;
