import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import { BorderInfoBox } from '../../../components/border-info-box';
import { BreadcrumbItem } from '../../../types';

const BankAccountShow = ({ bankAccount }) => {
    const handleBack = () => window.history.back();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bank Cash', href: '' },
        { title: 'Bank Accounts', href: route('bank-accounts.index') },
        {
            title: `View: ${bankAccount?.bank_name || 'Bank Account'}`,
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
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
                        <BorderInfoBox
                            label="Bank Name"
                            value={bankAccount.bank_name}
                            className="bg-muted/30"
                        />
                        <BorderInfoBox
                            label="Branch Name"
                            value={bankAccount.branch_name}
                            className="bg-muted/30"
                        />
                        <BorderInfoBox
                            label="Account Number"
                            value={bankAccount.account_number}
                            className="bg-muted/30"
                        />
                        <BorderInfoBox
                            label="SWIFT Code"
                            value={bankAccount.swift_code}
                            className="bg-muted/30"
                        />
                        <BorderInfoBox
                            label="Routing Number"
                            value={bankAccount.routing_number}
                            className="bg-muted/30"
                        />
                        <BorderInfoBox
                            label="IBAN"
                            value={bankAccount.iban}
                            className="bg-muted/30"
                        />

                        <BorderInfoBox
                            label="Subledger Account"
                            value={
                                bankAccount.subledger_account?.account_number
                            }
                            className="bg-muted/30"
                        />

                        <BorderInfoBox
                            label="Status"
                            value={bankAccount.status}
                            className="bg-muted/30"
                        />
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default BankAccountShow;
