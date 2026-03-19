import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import AppDatePicker from '../../../../components/ui/app_date_picker';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { formatBDTCurrency } from '../../../../lib/bdtCurrencyFormatter';
import { takaToText } from '../../../../lib/taka_to_text';
import { VoucherLine } from '../../../../types/accounting';
import { Customer } from '../../../../types/customer_kyc_module';
import { CustomerSearchBox } from '../../../customer-kyc/customers/customer-search-box';

interface WithdrawalLedgersSectionProps {
    errors: any;
    lines: VoucherLine[];
    processing: boolean;
    onCustomerSelect: (customer: Customer) => void;
    handleDebitLineChange: (
        index: number,
        field: keyof VoucherLine,
        value: any,
    ) => void;
    onSubmit: () => void;
}

function WithdrawalLedgerSection({
    errors,
    lines,
    processing,
    onCustomerSelect,
    handleDebitLineChange,
    onSubmit,
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
        <div className="bg-destructive/5 flex flex-col gap-5 rounded-xl border p-4">
            {/* Header */}
            <div className="space-y-3">
                <h2 className="text-base font-semibold text-muted-foreground">
                    Cash Payment
                </h2>
                <CustomerSearchBox onSelect={onCustomerSelect} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* Left Card */}
                <div className="space-y-2 rounded-lg border bg-card p-4 md:col-span-4">
                    {/* Withdrawable Accounts */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">
                            Withdrawable Accounts
                        </Label>
                        <Select
                            value={selectedAccount}
                            onChange={(value) => setSelectedAccount(value)}
                            options={accounts.map((acc) => ({
                                value: acc.value,
                                label: acc.value,
                            }))}
                        />
                    </div>

                    {/* Account Details */}
                    {selectedAccount && accountDetails ? (
                        <div className="bg-muted/5 mt-3 flex flex-col gap-2 rounded-md border px-2 py-2 text-xs">
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
                        <div className="bg-muted/5 mt-3 flex flex-col gap-2 rounded-md border px-2 py-2 text-xs">
                            {/* Skeleton placeholders */}
                            {[...Array(4)].map((_, idx) => (
                                <div
                                    key={idx}
                                    className="bg-muted/30 h-4 w-full animate-pulse rounded"
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <div className="">
                            <Label className="text-xs font-medium">
                                Instrument Reference
                            </Label>
                            <Select
                                value={selectedAccount}
                                onChange={(value) => setSelectedAccount(value)}
                                options={accounts.map((acc) => ({
                                    value: acc.value,
                                    label: acc.value,
                                }))}
                            />
                        </div>
                        <div className="">
                            <Label className="text-xs font-medium">
                                Instrument Date
                            </Label>
                            <AppDatePicker
                                value={'2023-01-01'}
                                onChange={(value) => setSelectedAccount(value)}
                            />
                        </div>
                        {/* <div className="">
                            <Label className="text-xs font-medium">
                                Paid To
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
                        </div> */}
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

                        <div className="bg-muted/30 mt-2 rounded-md p-2">
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

                {/* Right Card */}
                <div className="flex flex-col gap-4 md:col-span-8">
                    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                        {/* Account Holders Scrollable */}
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                Account Holders
                            </Label>

                            <div className="bg-accent/10 grid max-h-[110px] grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
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
                                        relation: 'Signatory',
                                        account: 'AC-102347',
                                    },
                                ].map((holder, index) => (
                                    <div
                                        key={holder.id}
                                        className={`hover:bg-muted/30 flex cursor-pointer items-center justify-between rounded-md border bg-background px-2 py-1.5 text-xs transition`}
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

                        <div className="w-full">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Signature Verification
                            </h3>

                            <div className="mt-2 flex w-full items-center justify-center rounded-md border border-dashed border-muted text-xs text-muted-foreground">
                                <div className="relative h-64 w-full overflow-hidden rounded-md">
                                    <ReactPanZoom
                                        image={
                                            'https://a.storyblok.com/f/191576/1176x882/0707bde47c/make_signature_hero_after.webp'
                                        }
                                        alt="Signature Preview"
                                    />
                                </div>
                            </div>
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
                    className="min-w-40"
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
