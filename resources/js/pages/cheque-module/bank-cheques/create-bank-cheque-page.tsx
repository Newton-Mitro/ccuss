import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';

const chequeStatuses = [
    { label: 'Issued', value: 'issued' },
    { label: 'Presented', value: 'presented' },
    { label: 'Cleared', value: 'cleared' },
    { label: 'Bounced', value: 'bounced' },
    { label: 'Cancelled', value: 'cancelled' },
];

const CreateCheque = ({ chequeBooks }) => {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        union_cheque_book_id: '',
        cheque_number: '',
        cheque_date: '',
        amount: '',
        payee_name: '',
        remarks: '',
        status: 'issued',
        stop_payment: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('union-cheques.store'));
    };

    return (
        <CustomAuthLayout>
            <Head title="Create Cheque" />

            <HeadingSmall title="Create Cheque" />

            <form
                className="space-y-6 rounded-md border bg-card p-6"
                onSubmit={handleSubmit}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <Label>Cheque Book</Label>
                        <select
                            value={data.union_cheque_book_id}
                            onChange={(e) =>
                                setData('union_cheque_book_id', e.target.value)
                            }
                            className="h-9 w-full rounded border"
                        >
                            <option value="">Select</option>
                            {chequeBooks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.book_no}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.union_cheque_book_id} />
                    </div>

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

                    <div>
                        <Label>Cheque Date</Label>
                        <AppDatePicker
                            value={data.cheque_date}
                            onChange={(val) => setData('cheque_date', val)}
                        />
                        <InputError message={errors.cheque_date} />
                    </div>

                    <div>
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        <InputError message={errors.amount} />
                    </div>

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

                    <div>
                        <Label>Status</Label>
                        <Select
                            value={data.status}
                            onChange={(val) => setData('status', val)}
                            options={chequeStatuses}
                        />
                        <InputError message={errors.status} />
                    </div>
                </div>

                <div>
                    <Label>Remarks</Label>
                    <textarea
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                </div>

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

                <Button disabled={processing}>
                    {processing ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <CheckCheck className="mr-2" />
                    )}
                    Save
                </Button>
            </form>
        </CustomAuthLayout>
    );
};

export default CreateCheque;
