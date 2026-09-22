import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { ChequeBookCreatePageProps } from '@/types/treasury-cash/forms';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function CreateChequeBook() {
    const { bank_accounts } = usePage<ChequeBookCreatePageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        bank_account_id: '',
        book_no: '',
        prefix: '',
        start_number: '',
        end_number: '',
        issued_date: new Date().toISOString().slice(0, 10),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cheque Management', href: '' },
        { title: 'Cheque Books', href: route('cheque-books.index') },
        { title: 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Cheque Book" />
            <div className="mx-auto max-w-2xl space-y-4">
                <div>
                    <h1 className="text-lg font-semibold">
                        Create cheque book
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Generate the numbered cheque leaves for an active bank
                        account.
                    </p>
                </div>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('cheque-books.store'));
                    }}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div>
                        <Label htmlFor="bank_account_id">Bank account</Label>
                        <select
                            id="bank_account_id"
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={data.bank_account_id}
                            onChange={(event) =>
                                setData('bank_account_id', event.target.value)
                            }
                        >
                            <option value="">Select bank account</option>
                            {bank_accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.bank?.name ?? 'Bank'} ·{' '}
                                    {account.account_name} ·{' '}
                                    {account.account_number}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.bank_account_id} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="book_no">Book number</Label>
                            <Input
                                id="book_no"
                                value={data.book_no}
                                onChange={(event) =>
                                    setData('book_no', event.target.value)
                                }
                            />
                            <InputError message={errors.book_no} />
                        </div>
                        <div>
                            <Label htmlFor="prefix">Cheque prefix</Label>
                            <Input
                                id="prefix"
                                value={data.prefix}
                                onChange={(event) =>
                                    setData('prefix', event.target.value)
                                }
                                placeholder="Optional"
                            />
                            <InputError message={errors.prefix} />
                        </div>
                        <div>
                            <Label htmlFor="start_number">Start number</Label>
                            <Input
                                id="start_number"
                                type="number"
                                min="1"
                                value={data.start_number}
                                onChange={(event) =>
                                    setData('start_number', event.target.value)
                                }
                            />
                            <InputError message={errors.start_number} />
                        </div>
                        <div>
                            <Label htmlFor="end_number">End number</Label>
                            <Input
                                id="end_number"
                                type="number"
                                min="1"
                                value={data.end_number}
                                onChange={(event) =>
                                    setData('end_number', event.target.value)
                                }
                            />
                            <InputError message={errors.end_number} />
                        </div>
                        <div>
                            <Label htmlFor="issued_date">Issued date</Label>
                            <Input
                                id="issued_date"
                                type="date"
                                value={data.issued_date}
                                onChange={(event) =>
                                    setData('issued_date', event.target.value)
                                }
                            />
                            <InputError message={errors.issued_date} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link href={route('cheque-books.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || bank_accounts.length === 0}
                        >
                            Create cheque book
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
