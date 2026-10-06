import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../../components/heading-small';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface Props extends SharedData {
    bank_accounts: {
        id: number;
        account_name: string;
        account_number: string;
    }[];
}

export default function Create() {
    const { bank_accounts } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        bank_account_id: '',
        type: 'DEPOSIT',
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        reference: '',
        description: '',
    });
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Bank Transactions', href: route('bank-transactions.index') },
        { title: 'Create', href: route('bank-transactions.create') },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('bank-transactions.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bank Transaction" />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title="Create Bank Transaction"
                    description="Record a pending transaction for an active bank account."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="bank_account_id"
                            className="text-sm font-medium"
                        >
                            Bank account
                        </label>
                        <Select
                            id="bank_account_id"
                            className="h-9"
                            value={data.bank_account_id}
                            onChange={(value) =>
                                setData('bank_account_id', value)
                            }
                            placeholder="Select account"
                            options={[
                                { value: '', label: 'Select account' },
                                ...bank_accounts.map((account) => ({
                                    value: String(account.id),
                                    label: `${account.account_name} (${account.account_number})`,
                                })),
                            ]}
                        />
                        {errors.bank_account_id && (
                            <p className="text-sm text-destructive">
                                {errors.bank_account_id}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="type"
                                className="text-sm font-medium"
                            >
                                Type
                            </label>
                            <Select
                                id="type"
                                className="h-9"
                                value={data.type}
                                onChange={(value) => setData('type', value)}
                                options={[
                                    { value: 'DEPOSIT', label: 'Deposit' },
                                    {
                                        value: 'WITHDRAWAL',
                                        label: 'Withdrawal',
                                    },
                                    {
                                        value: 'TRANSFER_IN',
                                        label: 'Transfer in',
                                    },
                                    {
                                        value: 'TRANSFER_OUT',
                                        label: 'Transfer out',
                                    },
                                    { value: 'CHARGE', label: 'Charge' },
                                    { value: 'INTEREST', label: 'Interest' },
                                    {
                                        value: 'ADJUSTMENT',
                                        label: 'Adjustment',
                                    },
                                ]}
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="amount"
                                className="text-sm font-medium"
                            >
                                Amount
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.0001"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                                required
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="transaction_date"
                                className="text-sm font-medium"
                            >
                                Transaction date
                            </label>
                            <Input
                                id="transaction_date"
                                type="date"
                                value={data.transaction_date}
                                onChange={(event) =>
                                    setData(
                                        'transaction_date',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="reference"
                                className="text-sm font-medium"
                            >
                                Reference
                            </label>
                            <Input
                                id="reference"
                                value={data.reference}
                                onChange={(event) =>
                                    setData('reference', event.target.value)
                                }
                                maxLength={255}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium"
                        >
                            Description
                        </label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            maxLength={2000}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={processing || bank_accounts.length === 0}
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        Create pending transaction
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
