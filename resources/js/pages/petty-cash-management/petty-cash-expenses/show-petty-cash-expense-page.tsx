import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { PettyCashExpense } from '../../../types/petty_cash_module';

interface ShowPettyCashExpensePageProps extends SharedData {
    pettyCash: PettyCashExpense;
}

const ShowPettyCashExpensePage = ({
    pettyCash,
}: ShowPettyCashExpensePageProps) => {
    const handleBack = () => window.history.back();

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Petty Cash Expenses', href: '/petty-cash-expenses' },
        { title: pettyCash.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Petty Cash Expense - ${pettyCash.name}`} />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={pettyCash.name}
                    description="Petty cash expense overview and details."
                />

                <div className="flex gap-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <Link
                        href={`/petty-cash-expenses/${pettyCash.id}/edit`}
                        className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Balance */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                        Current Balance
                    </div>
                    <div className="text-xl font-semibold">
                        {pettyCash.balance}
                    </div>
                </div>

                {/* Imprest */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                        Imprest Amount
                    </div>
                    <div className="text-xl font-semibold">
                        {pettyCash.imprest_amount}
                    </div>
                </div>

                {/* Status */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div
                        className={`text-sm font-medium ${
                            pettyCash.is_active
                                ? 'text-green-600'
                                : 'text-red-600'
                        }`}
                    >
                        {pettyCash.is_active ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-md border bg-card p-4">
                <div className="mb-4 text-sm font-medium">Account Details</div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Name
                        </div>
                        <div className="text-sm">{pettyCash.name}</div>
                    </div>

                    <div>
                        <div className="text-xs text-muted-foreground">
                            Code
                        </div>
                        <div className="text-sm">{pettyCash.code}</div>
                    </div>

                    <div>
                        <div className="text-xs text-muted-foreground">
                            Branch
                        </div>
                        <div className="text-sm">{pettyCash.branch?.name}</div>
                    </div>

                    <div>
                        <div className="text-xs text-muted-foreground">
                            Custodian
                        </div>
                        <div className="text-sm">
                            {pettyCash.custodian?.name || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default ShowPettyCashExpensePage;
