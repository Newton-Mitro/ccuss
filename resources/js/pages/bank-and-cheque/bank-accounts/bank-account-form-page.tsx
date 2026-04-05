import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Select } from '../../../components/ui/select';

const BankAccountForm = ({ account, banks, branches, flash }) => {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const isEdit = !!account;
    const handleBack = () => window.history.back();

    const { data, setData, post, put, processing, errors } = useForm({
        bank_id: account?.bank_id || '',
        bank_branch_id: account?.bank_branch_id || '',
        account_name: account?.account_name || '',
        account_number: account?.account_number || '',
        iban: account?.iban || '',
        balance: account?.balance || 0,
        currency: account?.currency || 'BDT',
        status: account?.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/bank-accounts/${account.id}`, { preserveScroll: true });
        } else {
            post('/bank-accounts', { preserveScroll: true });
        }
    };

    return (
        <CustomAuthLayout>
            <Head
                title={isEdit ? 'Edit Bank Account' : 'Create Bank Account'}
            />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title={
                        isEdit
                            ? `Edit: ${account?.account_name}`
                            : 'Create Bank Account'
                    }
                    description="Manage bank account configuration."
                />

                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-md border bg-card p-6"
            >
                {/* ---------------- ACCOUNT INFO ---------------- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Account Name</Label>
                        <Input
                            value={data.account_name}
                            onChange={(e) =>
                                setData('account_name', e.target.value)
                            }
                        />
                        <InputError message={errors.account_name} />
                    </div>

                    <div>
                        <Label className="text-xs">Account Number</Label>
                        <Input
                            value={data.account_number}
                            onChange={(e) =>
                                setData('account_number', e.target.value)
                            }
                        />
                        <InputError message={errors.account_number} />
                    </div>

                    <div>
                        <Label className="text-xs">IBAN</Label>
                        <Input
                            value={data.iban}
                            onChange={(e) => setData('iban', e.target.value)}
                        />
                    </div>
                </div>

                {/* ---------------- BANK SELECTION ---------------- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Bank</Label>
                        <Select
                            value={data.bank_id?.toString()}
                            onChange={(val) => setData('bank_id', val)}
                            options={banks.map((bank) => ({
                                value: bank.id.toString(),
                                label: bank.name,
                            }))}
                        />

                        <InputError message={errors.bank_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Branch</Label>
                        <Select
                            value={data.bank_branch_id?.toString()}
                            onChange={(val) => setData('bank_branch_id', val)}
                            options={branches.map((branch) => ({
                                value: branch.id.toString(),
                                label: branch.name,
                            }))}
                        />
                    </div>
                </div>

                {/* ---------------- FINANCIAL ---------------- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Opening Balance</Label>
                        <Input
                            type="number"
                            value={data.balance}
                            onChange={(e) => setData('balance', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Currency</Label>
                        <Select
                            value={data.currency}
                            onChange={(val) => setData('currency', val)}
                            options={[
                                { value: 'BDT', label: 'BDT' },
                                { value: 'USD', label: 'USD' },
                            ]}
                        />
                    </div>
                </div>

                {/* ---------------- STATUS ---------------- */}
                <ToggleGroup
                    type="single"
                    value={data.status}
                    onValueChange={(val) => val && setData('status', val)}
                >
                    <ToggleGroupItem value="active">Active</ToggleGroupItem>
                    <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
                    <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
                </ToggleGroup>

                {/* ---------------- SUBMIT ---------------- */}
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

export default BankAccountForm;
