import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { Select } from '../../../components/ui/select';

const CreateCheque = ({ chequeBooks, accounts }) => {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        cheque_book_id: '',
        issuer_account_id: '',

        issuer_bank_name: '',
        issuer_branch: '',

        cheque_number: '',
        cheque_date: '',
        amount: '',
        payee_name: '',
        remarks: '',

        stop_payment: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cheques.store'));
    };

    return (
        <CustomAuthLayout>
            <Head title="Create Cheque" />

            <HeadingSmall
                title="Create Cheque"
                description="Issue a new financial cheque entry"
            />

            <form
                className="space-y-6 rounded-md border bg-card p-6"
                onSubmit={handleSubmit}
            >
                {/* GRID */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Cheque Book */}
                    <div>
                        <Label>Cheque Book</Label>
                        <Select
                            value={data.cheque_book_id}
                            onChange={(value) =>
                                setData('cheque_book_id', value)
                            }
                            options={chequeBooks.map((chequeBook) => ({
                                value: chequeBook.id,
                                label: chequeBook.book_no,
                            }))}
                        />

                        <InputError message={errors.cheque_book_id} />
                    </div>

                    {/* Issuer Account */}
                    <div>
                        <Label>Issuer Account</Label>
                        <Select
                            value={data.issuer_account_id}
                            onChange={(value) =>
                                setData('issuer_account_id', value)
                            }
                            options={accounts.map((account) => ({
                                value: account.id,
                                label: account.name,
                            }))}
                        />

                        <InputError message={errors.issuer_account_id} />
                    </div>

                    {/* Cheque Number */}
                    <div>
                        <Label>Cheque Number</Label>
                        <Input
                            value={data.cheque_number}
                            onChange={(e) =>
                                setData('cheque_number', e.target.value)
                            }
                        />
                        <InputError message={errors.cheque_number} />
                    </div>

                    {/* Date */}
                    <div>
                        <Label>Cheque Date</Label>
                        <AppDatePicker
                            value={data.cheque_date}
                            onChange={(val) => setData('cheque_date', val)}
                        />
                        <InputError message={errors.cheque_date} />
                    </div>

                    {/* Amount */}
                    <div>
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        <InputError message={errors.amount} />
                    </div>

                    {/* Payee */}
                    <div>
                        <Label>Payee Name</Label>
                        <Input
                            value={data.payee_name}
                            onChange={(e) =>
                                setData('payee_name', e.target.value)
                            }
                        />
                        <InputError message={errors.payee_name} />
                    </div>

                    {/* Bank Name */}
                    <div>
                        <Label>Issuer Bank Name</Label>
                        <Input
                            value={data.issuer_bank_name}
                            onChange={(e) =>
                                setData('issuer_bank_name', e.target.value)
                            }
                        />
                        <InputError message={errors.issuer_bank_name} />
                    </div>

                    {/* Branch */}
                    <div>
                        <Label>Issuer Branch</Label>
                        <Input
                            value={data.issuer_branch}
                            onChange={(e) =>
                                setData('issuer_branch', e.target.value)
                            }
                        />
                        <InputError message={errors.issuer_branch} />
                    </div>
                </div>

                {/* Remarks */}
                <div>
                    <Label>Remarks</Label>
                    <textarea
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                </div>

                {/* Stop Payment */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={data.stop_payment}
                        onChange={(e) =>
                            setData('stop_payment', e.target.checked)
                        }
                    />
                    <Label>Stop Payment</Label>
                </div>

                {/* Submit */}
                <Button disabled={processing}>
                    {processing ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <CheckCheck className="mr-2" />
                    )}
                    Save Cheque
                </Button>
            </form>
        </CustomAuthLayout>
    );
};

export default CreateCheque;
