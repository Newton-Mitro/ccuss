import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const BankAccountShow = ({ bankAccount }) => {
    const handleBack = () => window.history.back();

    return (
        <CustomAuthLayout>
            <Head title={`Bank Account: ${bankAccount?.bank_name}`} />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Bank Account Details"
                    description="View bank account configuration and metadata."
                />

                <div className="">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6 rounded-md border bg-card p-6">
                {/* Bank Info */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                        BANK INFORMATION
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InfoItem
                            label="Bank Name"
                            value={bankAccount.bank_name}
                        />
                        <InfoItem
                            label="Branch Name"
                            value={bankAccount.branch_name}
                        />
                        <InfoItem
                            label="Account Number"
                            value={bankAccount.account_number}
                        />
                        <InfoItem
                            label="SWIFT Code"
                            value={bankAccount.swift_code}
                        />
                        <InfoItem
                            label="Routing Number"
                            value={bankAccount.routing_number}
                        />
                        <InfoItem label="IBAN" value={bankAccount.iban} />

                        <InfoItem
                            label="Subledger Account"
                            value={
                                bankAccount.subledger_account?.account_number
                            }
                        />

                        <InfoItem
                            label="Status"
                            value={<StatusBadge status={bankAccount.status} />}
                        />
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

/**
 * Reusable Info Display Component
 */
const InfoItem = ({ label, value }) => {
    return (
        <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-medium">
                {value || <span className="text-muted-foreground">—</span>}
            </div>
        </div>
    );
};

/**
 * Status Badge (Reusable Across App)
 */
const StatusBadge = ({ status }) => {
    const isActive = status === 'active';

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export default BankAccountShow;
