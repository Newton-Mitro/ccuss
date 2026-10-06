import type { BankAccountCreatePageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../../components/heading-small';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../../types';

export default function Create() {
    const { banks, financial_accounts, branches } =
        usePage<BankAccountCreatePageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        bank_id: '',
        financial_account_id: '',
        branch_id: '',
        account_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'CURRENT',
        opening_balance: '0',
        is_reconcilable: true,
        status: 'ACTIVE',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Bank Accounts', href: route('bank-accounts.index') },
        { title: 'Create', href: route('bank-accounts.create') },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('bank-accounts.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bank Account" />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title="Create Bank Account"
                    description="Link a bank account to an active financial account and branch."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="bank_id"
                                className="text-sm font-medium"
                            >
                                Bank
                            </label>
                            <Select
                                id="bank_id"
                                className="h-9"
                                value={data.bank_id}
                                onChange={(value) => setData('bank_id', value)}
                                placeholder="Select bank"
                                options={[
                                    { value: '', label: 'Select bank' },
                                    ...banks.map((bank) => ({
                                        value: String(bank.id),
                                        label: `${bank.name} (${bank.code})`,
                                    })),
                                ]}
                            />
                            {errors.bank_id && (
                                <p className="text-sm text-destructive">
                                    {errors.bank_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="financial_account_id"
                                className="text-sm font-medium"
                            >
                                Financial account
                            </label>
                            <Select
                                id="financial_account_id"
                                className="h-9"
                                value={data.financial_account_id}
                                onChange={(value) =>
                                    setData('financial_account_id', value)
                                }
                                placeholder="Select financial account"
                                options={[
                                    {
                                        value: '',
                                        label: 'Select financial account',
                                    },
                                    ...financial_accounts.map((account) => ({
                                        value: String(account.id),
                                        label: `${account.name} (${account.account_no})`,
                                    })),
                                ]}
                            />
                            {errors.financial_account_id && (
                                <p className="text-sm text-destructive">
                                    {errors.financial_account_id}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="branch_id"
                            className="text-sm font-medium"
                        >
                            Branch
                        </label>
                        <Select
                            id="branch_id"
                            className="h-9"
                            value={data.branch_id}
                            onChange={(value) => setData('branch_id', value)}
                            placeholder="Organization-wide"
                            options={[
                                {
                                    value: '',
                                    label: 'Organization-wide',
                                },
                                ...branches.map((branch) => ({
                                    value: String(branch.id),
                                    label: `${branch.name} (${branch.code})`,
                                })),
                            ]}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="account_name"
                                className="text-sm font-medium"
                            >
                                Account name
                            </label>
                            <Input
                                id="account_name"
                                value={data.account_name}
                                onChange={(event) =>
                                    setData('account_name', event.target.value)
                                }
                                required
                            />
                            {errors.account_name && (
                                <p className="text-sm text-destructive">
                                    {errors.account_name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="account_number"
                                className="text-sm font-medium"
                            >
                                Account number
                            </label>
                            <Input
                                id="account_number"
                                value={data.account_number}
                                onChange={(event) =>
                                    setData(
                                        'account_number',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            {errors.account_number && (
                                <p className="text-sm text-destructive">
                                    {errors.account_number}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="routing_number"
                                className="text-sm font-medium"
                            >
                                Routing number
                            </label>
                            <Input
                                id="routing_number"
                                value={data.routing_number}
                                onChange={(event) =>
                                    setData(
                                        'routing_number',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="account_type"
                                className="text-sm font-medium"
                            >
                                Account type
                            </label>
                            <Select
                                id="account_type"
                                className="h-9"
                                value={data.account_type}
                                onChange={(value) =>
                                    setData('account_type', value)
                                }
                                options={[
                                    { value: 'CURRENT', label: 'Current' },
                                    { value: 'SAVINGS', label: 'Savings' },
                                    { value: 'FDR', label: 'FDR' },
                                    { value: 'OTHER', label: 'Other' },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="opening_balance"
                                className="text-sm font-medium"
                            >
                                Opening balance
                            </label>
                            <Input
                                id="opening_balance"
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.opening_balance}
                                onChange={(event) =>
                                    setData(
                                        'opening_balance',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            {errors.opening_balance && (
                                <p className="text-sm text-destructive">
                                    {errors.opening_balance}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="status"
                                className="text-sm font-medium"
                            >
                                Status
                            </label>
                            <Select
                                id="status"
                                className="h-9"
                                value={data.status}
                                onChange={(value) => setData('status', value)}
                                options={[
                                    { value: 'ACTIVE', label: 'Active' },
                                    { value: 'INACTIVE', label: 'Inactive' },
                                    { value: 'CLOSED', label: 'Closed' },
                                ]}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_reconcilable}
                            onChange={(event) =>
                                setData('is_reconcilable', event.target.checked)
                            }
                        />
                        Reconcilable account
                    </label>
                    <Button type="submit" disabled={processing}>
                        <Building2 className="h-4 w-4" />
                        Create bank account
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
