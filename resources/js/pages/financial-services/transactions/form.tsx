import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialTransactionFormPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function FinancialTransactionForm() {
    const { accounts, transactionType } =
        usePage<FinancialTransactionFormPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        idempotency_key: crypto.randomUUID(),
        financial_account_id: '',
        transaction_type: transactionType ?? 'DEPOSIT',
        transaction_date: new Date().toISOString().slice(0, 10),
        amount: '',
        currency: 'BDT',
        reference: '',
        description: '',
    });
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-transactions.store'));
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transactions', href: route('financial-transactions.index') },
        { title: 'New Transaction', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${data.transaction_type === 'WITHDRAWAL' ? 'Withdrawal' : 'Deposit'} Transaction`}
            />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title={`${data.transaction_type === 'WITHDRAWAL' ? 'Withdrawal' : 'Deposit'} transaction`}
                    description="Create an operational transaction draft for an active account."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label>Account</Label>
                            <Select
                                value={data.financial_account_id}
                                onChange={(value) =>
                                    setData('financial_account_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select account' },
                                    ...accounts.map((account) => ({
                                        value: String(account.id),
                                        label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.financial_account_id} />
                        </div>
                        <div>
                            <Label>Transaction type</Label>
                            <Select
                                value={data.transaction_type}
                                onChange={(value) =>
                                    setData('transaction_type', value)
                                }
                                options={[
                                    { value: 'DEPOSIT', label: 'Deposit' },
                                    {
                                        value: 'WITHDRAWAL',
                                        label: 'Withdrawal',
                                    },
                                ]}
                            />
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={data.transaction_date}
                                onChange={(event) =>
                                    setData(
                                        'transaction_date',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.transaction_date} />
                        </div>
                        <div>
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div>
                            <Label>Reference</Label>
                            <Input
                                value={data.reference}
                                onChange={(event) =>
                                    setData('reference', event.target.value)
                                }
                                placeholder="Receipt or instrument number"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                        <Button asChild type="button" variant="outline">
                            <Link href={route('financial-transactions.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create draft
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
