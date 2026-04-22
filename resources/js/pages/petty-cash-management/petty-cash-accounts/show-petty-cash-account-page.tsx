import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { PettyCashAccount } from '../../../types/petty_cash_module';

interface ShowPettyCashExpensePageProps extends SharedData {
    pettyCash: PettyCashAccount;
}

const ShowPettyCashExpensePage = ({
    pettyCash,
}: ShowPettyCashExpensePageProps) => {
    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        { title: pettyCash.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Petty Cash Account - ${pettyCash.name}`} />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={pettyCash.name}
                    description="Petty cash account overview and financial controls."
                />

                <div className="flex gap-2">
                    <div className="">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>

                    <Link
                        href={route('petty-cash-accounts.edit', pettyCash.id)}
                        className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* Top Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Status */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${
                            pettyCash.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        {pettyCash.status}
                    </div>
                </div>

                {/* Branch */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">Branch</div>
                    <div className="text-sm font-medium">
                        {pettyCash.branch?.name || 'N/A'}
                    </div>
                </div>

                {/* Upper Limit */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                        Upper Limit
                    </div>
                    <div className="text-sm font-medium">
                        {formatBDTCurrency(pettyCash.upper_limit)}
                    </div>
                </div>

                {/* Balance (future-ready) */}
                <div className="rounded-md border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                        Current Balance
                    </div>
                    <div className="text-sm font-medium text-primary">
                        {formatBDTCurrency(pettyCash?.balance)}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-md border bg-card p-4">
                <div className="mb-4 text-sm font-medium">Account Details</div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Name
                        </div>
                        <div className="text-sm">{pettyCash.name}</div>
                    </div>

                    {/* Ledger */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Ledger Account
                        </div>
                        <div className="text-sm">
                            {pettyCash.ledger_account?.name || 'N/A'}
                        </div>
                    </div>

                    {/* Created At */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Created At
                        </div>
                        <div className="text-sm">
                            {formatDateTime(pettyCash.created_at)}
                        </div>
                    </div>

                    {/* Updated At */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Updated At
                        </div>
                        <div className="text-sm">
                            {formatDateTime(pettyCash.updated_at)}
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default ShowPettyCashExpensePage;
