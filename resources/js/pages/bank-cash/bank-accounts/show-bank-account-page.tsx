import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const BankAccountShow = ({ account }) => {
    const handleBack = () => window.history.back();

    return (
        <CustomAuthLayout>
            <Head title={`Bank Account: ${account?.bank_name}`} />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Bank Account Details"
                    description="View bank account configuration and metadata."
                />

                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6 rounded-md border bg-card p-6">
                {/* Bank Info */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                        BANK INFORMATION
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InfoItem label="Bank Name" value={account.bank_name} />
                        <InfoItem
                            label="Branch Name"
                            value={account.branch_name}
                        />
                        <InfoItem
                            label="Account Number"
                            value={account.account_number}
                        />
                        <InfoItem
                            label="SWIFT Code"
                            value={account.swift_code}
                        />
                        <InfoItem
                            label="Routing Number"
                            value={account.routing_number}
                        />
                        <InfoItem label="IBAN" value={account.iban} />

                        <InfoItem
                            label="Link Account"
                            value={account.account?.account_number}
                        />

                        <InfoItem
                            label="Status"
                            value={<StatusBadge status={account.status} />}
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
