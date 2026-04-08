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

const EditChequeBook = ({ chequeBook, accounts }) => {
    useFlashToastHandler();

    const { data, setData, put, processing, errors } = useForm({
        deposit_account_id: chequeBook?.deposit_account_id || '',
        book_no: chequeBook.book_no || '',
        issued_at: chequeBook.issued_at || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('bank-cheque-books.update', chequeBook.id));
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
                        <select
                            value={data.deposit_account_id}
                            onChange={(e) =>
                                setData('deposit_account_id', e.target.value)
                            }
                            className="h-9 w-full rounded border"
                        >
                            <option value="">Select</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.deposit_account_id} />
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
