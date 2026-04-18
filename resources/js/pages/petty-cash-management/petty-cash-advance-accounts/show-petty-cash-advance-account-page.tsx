import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { SharedData } from '../../../types';
import { PettyCashAdvanceAccount } from '../../../types/petty_cash_module';

interface Props extends SharedData {
    advance: PettyCashAdvanceAccount;
}

const ShowAdvanceExpensePage = ({ advance }: Props) => {
    useFlashToastHandler();

    console.log(advance);

    return (
        <CustomAuthLayout>
            <Head title={`Advance #${advance.id}`} />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title={`Advance #${advance.id}`}
                    description="Petty cash advance details and lifecycle"
                />

                <div className="flex gap-2">
                    <button
                        onClick={() => window.history.back()}
                        className="btn-muted"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>

                    <Link
                        href={route(
                            'petty-cash-advance-accounts.edit',
                            advance.id,
                        )}
                        className="btn-primary"
                    >
                        <Pencil className="h-4 w-4" /> Edit
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Employee */}
                <div className="card">
                    <div className="text-xs text-muted-foreground">
                        Employee
                    </div>
                    <div>{advance.employee?.name || '-'}</div>
                </div>

                {/* Status */}
                <div className="card">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="capitalize">{advance.status}</div>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Petty Cash Account */}
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Petty Cash Account
                        </div>
                        <div>{advance.petty_cash_account?.name || '-'}</div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default ShowAdvanceExpensePage;
