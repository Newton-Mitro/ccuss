import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import {
    ToggleGroup,
    ToggleGroupItem,
} from '../../../components/ui/toggle-group';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import {
    AdvanceExpense,
    PettyCashExpense,
} from '../../../types/petty_cash_module';
import { User } from '../../../types/user';

interface AdvanceExpenseFormProps extends SharedData {
    advance?: AdvanceExpense;
    employees: User[];
    pettyCashAccounts: PettyCashExpense[];
}

const AdvanceExpenseForm = ({
    advance,
    employees,
    pettyCashAccounts,
}: AdvanceExpenseFormProps) => {
    useFlashToastHandler();

    const isEdit = !!advance;

    const { data, setData, post, put, processing, errors } = useForm({
        name: advance?.name || '',
        code: advance?.code || '',
        petty_cash_account_id: advance?.petty_cash_account_id || '',
        employee_id: advance?.employee_id || '',
        is_active: advance?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(`/advance-expenses/${advance.id}`);
        } else {
            post('/advance-expenses');
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Advance Expenses', href: '/advance-expenses' },
        { title: isEdit ? 'Edit' : 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Advance Expenses" />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title={isEdit ? 'Edit Advance' : 'Create Advance'}
                    description="Assign advance to employee."
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
                    {/* Name */}
                    <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Code */}
                    <div>
                        <Label className="text-xs">Code</Label>
                        <Input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        <InputError message={errors.code} />
                    </div>

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
                </div>

                {/* Status */}
                <ToggleGroup
                    type="single"
                    value={data.is_active ? 'true' : 'false'}
                    onValueChange={(val) =>
                        setData('is_active', val === 'true')
                    }
                >
                    <ToggleGroupItem value="true">Active</ToggleGroupItem>
                    <ToggleGroupItem value="false">Inactive</ToggleGroupItem>
                </ToggleGroup>

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
