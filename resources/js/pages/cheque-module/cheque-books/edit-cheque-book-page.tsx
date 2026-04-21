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

const EditChequeBook = ({ cheque_book, subledger_accounts }) => {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        subledger_account_id: cheque_book?.subledger_account_id || '',
        book_no: cheque_book.book_no || '',
        issued_at: cheque_book.issued_at
            ? cheque_book.issued_at.split('T')[0]
            : '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('cheque-books.update', cheque_book.id));
    };

    return (
        <CustomAuthLayout>
            <Head title="Edit Cheque Book" />

            <HeadingSmall title="Edit Cheque Book" />

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
                            options={subledger_accounts.map((account) => ({
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
                </div>

                <Button disabled={processing}>
                    {processing ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <CheckCheck className="mr-2" />
                    )}
                    Update
                </Button>
            </form>
        </CustomAuthLayout>
    );
};

export default EditChequeBook;
