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

const CreateChequeBook = ({ accounts }) => {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        subledger_account_id: '',
        book_no: '',
        start_number: '',
        end_number: '',
        issued_at: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cheque-books.store'));
    };

    return (
        <CustomAuthLayout>
            <Head title="Create Cheque Book" />

            <HeadingSmall title="Create Cheque Book" />

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-md border bg-card p-6"
            >
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                    <div>
                        <Label>Account</Label>
                        <Select
                            value={data.subledger_account_id}
                            onChange={(value) =>
                                setData('subledger_account_id', value)
                            }
                            options={accounts.map((account) => ({
                                value: account.id,
                                label: account.name,
                            }))}
                        />

                        <InputError message={errors.subledger_account_id} />
                    </div>

                    <div>
                        <Label>Book No</Label>
                        <Input
                            value={data.book_no}
                            onChange={(e) => setData('book_no', e.target.value)}
                        />
                        <InputError message={errors.book_no} />
                    </div>

                    <div>
                        <Label>Issued Date</Label>
                        <AppDatePicker
                            value={data.issued_at}
                            onChange={(val) => setData('issued_at', val)}
                        />
                        <InputError message={errors.issued_at} />
                    </div>

                    <div>
                        <Label>Start Number</Label>
                        <Input
                            value={data.start_number}
                            onChange={(e) =>
                                setData('start_number', e.target.value)
                            }
                        />
                        <InputError message={errors.start_number} />
                    </div>

                    <div>
                        <Label>End Number</Label>
                        <Input
                            value={data.end_number}
                            onChange={(e) =>
                                setData('end_number', e.target.value)
                            }
                        />
                        <InputError message={errors.end_number} />
                    </div>
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

export default CreateChequeBook;
