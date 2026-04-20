import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDateTime } from '../../../lib/date_util';
import { SharedData } from '../../../types';
import { PettyCashAdvanceAccount } from '../../../types/petty_cash_module';

interface Props extends SharedData {
    account: PettyCashAdvanceAccount;
}

const ShowAdvanceExpensePage = ({ account }: Props) => {
    console.log('Advance Account Data:', account);
    useFlashToastHandler();

    const statusClasses: Record<string, string> = {
        active: 'text-green-600',
        inactive: 'text-gray-500',
    };

    const handleBack = () => window.history.back();

    return (
        <CustomAuthLayout>
            <Head title={`Advance Account #${account.id}`} />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={`Advance Account #${account.id}`}
                    description="Employee petty cash advance account details"
                />

                <div className="flex gap-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href={route(
                            'petty-cash-advance-accounts.edit',
                            account.id,
                        )}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Employee */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                        Employee
                    </div>
                    <div className="text-sm font-medium">
                        {account.employee?.name || '-'}
                    </div>
                </div>

                {/* Status */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div
                        className={`text-sm font-medium capitalize ${
                            statusClasses[account.status] ||
                            'text-muted-foreground'
                        }`}
                    >
                        {account.status}
                    </div>
                </div>

                {/* Created At */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                        Created At
                    </div>
                    <div className="text-sm font-medium">
                        {formatDateTime(account.created_at)}
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="mt-6 rounded-md border bg-card p-4">
                <div className="mb-4 text-sm font-semibold">
                    Account Details
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Petty Cash Account */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Petty Cash Account
                        </div>
                        <div className="text-sm font-medium">
                            {account.petty_cash_account?.name || '-'}
                        </div>
                    </div>

                    {/* Ledger Account */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Ledger Account
                        </div>
                        <div className="text-sm font-medium">
                            {account.ledger_account?.name || '-'}
                        </div>
                    </div>

                    {/* Employee ID (optional debug/info) */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Employee ID
                        </div>
                        <div className="text-sm font-medium">
                            {account.employee.name || '-'}
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default ShowAdvanceExpensePage;
