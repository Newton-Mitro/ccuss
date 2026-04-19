import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';

const BankAccountForm = ({ account }) => {
    useFlashToastHandler();

    const isEdit = !!account;

    const handleBack = () => window.history.back();

    const { data, setData, post, put, processing, errors } = useForm({
        bank_name: account?.bank_name || '',
        branch_name: account?.branch_name || '',
        account_number: account?.account_number || '',
        iban: account?.iban || '',
        swift_code: account?.swift_code || '',
        routing_number: account?.routing_number || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/bank-accounts/${account.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/bank-accounts', {
                preserveScroll: true,
            });
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
                            ? `Edit: ${account?.bank_name}`
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
                {/* ---------------- BANK INFO ---------------- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <Label className="text-xs">Bank Name</Label>
                        <Input
                            value={data.bank_name}
                            onChange={(e) =>
                                setData('bank_name', e.target.value)
                            }
                        />
                        <InputError message={errors.bank_name} />
                    </div>

                    <div>
                        <Label className="text-xs">Branch Name</Label>
                        <Input
                            value={data.branch_name}
                            onChange={(e) =>
                                setData('branch_name', e.target.value)
                            }
                        />
                        <InputError message={errors.branch_name} />
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
                        <Label className="text-xs">SWIFT Code</Label>
                        <Input
                            value={data.swift_code}
                            onChange={(e) =>
                                setData('swift_code', e.target.value)
                            }
                        />
                        <InputError message={errors.swift_code} />
                    </div>

                    <div>
                        <Label className="text-xs">Routing Number</Label>
                        <Input
                            value={data.routing_number}
                            onChange={(e) =>
                                setData('routing_number', e.target.value)
                            }
                        />
                        <InputError message={errors.routing_number} />
                    </div>
                </div>

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
