import type { BankAccountCreatePageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../../components/heading-small';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
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
                            <select
                                id="bank_id"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.bank_id}
                                onChange={(event) =>
                                    setData('bank_id', event.target.value)
                                }
                                required
                            >
                                <option value="">Select bank</option>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name} ({bank.code})
                                    </option>
                                ))}
                            </select>
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
                            <select
                                id="financial_account_id"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.financial_account_id}
                                onChange={(event) =>
                                    setData(
                                        'financial_account_id',
                                        event.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Select financial account
                                </option>
                                {financial_accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.account_no})
                                    </option>
                                ))}
                            </select>
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
                        <select
                            id="branch_id"
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                            value={data.branch_id}
                            onChange={(event) =>
                                setData('branch_id', event.target.value)
                            }
                        >
                            <option value="">Organization-wide</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name} ({branch.code})
                                </option>
                            ))}
                        </select>
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
                            <select
                                id="account_type"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.account_type}
                                onChange={(event) =>
                                    setData('account_type', event.target.value)
                                }
                            >
                                <option value="CURRENT">Current</option>
                                <option value="SAVINGS">Savings</option>
                                <option value="FDR">FDR</option>
                                <option value="OTHER">Other</option>
                            </select>
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
                            <select
                                id="status"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.status}
                                onChange={(event) =>
                                    setData('status', event.target.value)
                                }
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="CLOSED">Closed</option>
                            </select>
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
