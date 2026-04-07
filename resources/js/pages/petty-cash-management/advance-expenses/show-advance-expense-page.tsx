import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

const ShowAdvanceExpensePage = ({ advance }: any) => {
    useFlashToastHandler();

    return (
        <CustomAuthLayout>
            <Head title={advance.name} />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title={advance.name}
                    description="Advance expense overview and details."
                />

                <div className="flex gap-2">
                    <button
                        onClick={() => history.back()}
                        className="btn-muted"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>

                    <Link
                        href={`/advance-expenses/${advance.id}/edit`}
                        className="btn-primary"
                    >
                        <Pencil className="h-4 w-4" /> Edit
                    </Link>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="card">
                    <div className="text-xs text-muted-foreground">Balance</div>
                    <div className="text-lg font-semibold">
                        {advance.balance.toFixed(2)}
                    </div>
                </div>

                <div className="card">
                    <div className="text-xs text-muted-foreground">
                        Employee
                    </div>
                    <div>{advance.employee?.name}</div>
                </div>

                <div className="card">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div>{advance.is_active ? 'Active' : 'Inactive'}</div>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-md border p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Code
                        </div>
                        <div>{advance.code}</div>
                    </div>

                    <div>
                        <div className="text-xs text-muted-foreground">
                            Petty Cash
                        </div>
                        <div>{advance.petty_cash_account?.name}</div>
                    </div>

                    <div>
                        <div className="text-xs text-muted-foreground">
                            Branch
                        </div>
                        <div>{advance.branch?.name}</div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default ShowAdvanceExpensePage;
