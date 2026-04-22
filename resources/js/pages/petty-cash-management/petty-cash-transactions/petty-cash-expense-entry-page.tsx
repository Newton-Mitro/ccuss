import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';

import { BreadcrumbItem, SharedData } from '@/types';
import { LedgerAccount } from '@/types/finance_and_accounting';
import { PettyCashAccount } from '@/types/petty_cash_module';

interface Props extends SharedData {
    pettyCashAccounts: PettyCashAccount[];
    expenseLedgers: LedgerAccount[]; // expense accounts
}

export default function ExpenseEntry({
    pettyCashAccounts,
    expenseLedgers,
}: Props) {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        petty_cash_account_id: '',
        ledger_account_id: '',
        amount: '',
        reference_no: '',
        remarks: '',
    });

    const selectedAccount = useMemo(() => {
        return pettyCashAccounts.find(
            (a) => a.id.toString() === data.petty_cash_account_id,
        );
    }, [data.petty_cash_account_id, pettyCashAccounts]);

    const currentBalance = Number(selectedAccount?.current_balance || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('petty-cash-expenses.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Petty Cash', href: '' },
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        {
            title: 'Expense Entry',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Expense Entry" />

            {/* HEADER */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Expense Entry"
                    description="Record petty cash expenses"
                />

                <div className="">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Petty Cash Account */}
                    <div>
                        <label className="text-xs">Petty Cash Account</label>
                        <Select
                            value={data.petty_cash_account_id}
                            onChange={(v) =>
                                setData('petty_cash_account_id', v)
                            }
                            options={pettyCashAccounts.map((a) => ({
                                value: a.id.toString(),
                                label: a.name,
                            }))}
                        />
                        <InputError message={errors.petty_cash_account_id} />
                    </div>

                    {/* Expense Ledger */}
                    <div>
                        <label className="text-xs">Expense Account</label>
                        <Select
                            value={data.ledger_account_id}
                            onChange={(v) => setData('ledger_account_id', v)}
                            options={expenseLedgers.map((l) => ({
                                value: l.id.toString(),
                                label: l.name,
                            }))}
                        />
                        <InputError message={errors.ledger_account_id} />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-xs">Amount</label>
                        <Input
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0.00"
                        />
                        <InputError message={errors.amount} />
                    </div>

                    {/* Reference */}
                    <div>
                        <label className="text-xs">
                            Reference No (Optional)
                        </label>
                        <Input
                            value={data.reference_no}
                            onChange={(e) =>
                                setData('reference_no', e.target.value)
                            }
                        />
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2">
                        <label className="text-xs">Remarks</label>
                        <Input
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                    </div>
                </div>

                {/* BALANCE INFO */}
                {selectedAccount && (
                    <div className="space-y-1 rounded-md border bg-muted/20 p-4 text-sm">
                        <p>
                            <strong>Current Balance:</strong> {currentBalance}
                        </p>

                        <p>
                            <strong>After Expense:</strong>{' '}
                            {currentBalance - Number(data.amount || 0)}
                        </p>
                    </div>
                )}

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Save Expense
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
