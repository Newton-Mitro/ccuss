import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import {
    PettyCashAccount,
    PettyCashAdvanceAccount,
} from '../../../types/petty_cash_module';
import { User } from '../../../types/user';

interface AdvanceFormProps extends SharedData {
    advance?: PettyCashAdvanceAccount;
    employees: User[];
    pettyCashAccounts: PettyCashAccount[];
}

const AdvanceExpenseForm = ({
    advance,
    employees,
    pettyCashAccounts,
}: AdvanceFormProps) => {
    useFlashToastHandler();

    const isEdit = !!advance;

    const { data, setData, post, put, processing, errors } = useForm({
        petty_cash_account_id: advance?.petty_cash_account_id || '',
        employee_id: advance?.employee_id || '',
        status: advance?.status || 'pending',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(route('petty-cash-advance-accounts.update', advance!.id));
        } else {
            post(route('petty-cash-advance-accounts.store'));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Petty Cash Advance Accounts',
            href: route('petty-cash-advance-accounts.index'),
        },
        { title: isEdit ? 'Edit' : 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Advance" />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title={isEdit ? 'Edit Advance' : 'Create Advance'}
                    description="Manage petty cash advance for employee"
                />
                <button
                    onClick={() => window.history.back()}
                    className="btn-muted"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-md border bg-card p-4"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Petty Cash Account */}
                    <div>
                        <Label className="text-xs">Petty Cash Account</Label>
                        <Select
                            value={data.petty_cash_account_id.toString()}
                            onChange={(val) =>
                                setData('petty_cash_account_id', Number(val))
                            }
                            options={pettyCashAccounts.map((p) => ({
                                value: p.id.toString(),
                                label: p.name,
                            }))}
                        />
                        <InputError message={errors.petty_cash_account_id} />
                    </div>

                    {/* Employee */}
                    <div>
                        <Label className="text-xs">Employee</Label>
                        <Select
                            value={data.employee_id.toString()}
                            onChange={(val) =>
                                setData('employee_id', Number(val))
                            }
                            options={employees.map((u) => ({
                                value: u.id.toString(),
                                label: u.name,
                            }))}
                        />
                        <InputError message={errors.employee_id} />
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                            value={data.status}
                            onChange={(val) =>
                                setData(
                                    'status',
                                    val as
                                        | 'pending'
                                        | 'approved'
                                        | 'settled'
                                        | 'rejected',
                                )
                            }
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'settled', label: 'Settled' },
                                { value: 'rejected', label: 'Rejected' },
                            ]}
                        />
                        <InputError message={errors.status} />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                {isEdit ? 'Update' : 'Create'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default AdvanceExpenseForm;
