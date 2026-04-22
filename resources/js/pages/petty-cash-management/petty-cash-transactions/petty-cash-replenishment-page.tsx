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
    fundingAccounts: LedgerAccount[]; // bank / cash
}

export default function Replenishment({
    pettyCashAccounts,
    fundingAccounts,
}: Props) {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        petty_cash_account_id: '',
        amount: '',
        funding_account_id: '',
        remarks: '',
    });

    const selectedAccount = useMemo(() => {
        return pettyCashAccounts.find(
            (a) => a.id.toString() === data.petty_cash_account_id,
        );
    }, [data.petty_cash_account_id, pettyCashAccounts]);

    const remainingCapacity = useMemo(() => {
        if (!selectedAccount) return 0;

        return (
            Number(selectedAccount.upper_limit) -
            Number(selectedAccount.current_balance || 0)
        );
    }, [selectedAccount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('petty-cash-replenishments.store'), {
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
            title: 'Replenishment',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Replenishment" />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Petty Cash Replenishment"
                    description="Top-up petty cash account securely"
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

            {/* Form */}
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

                    {/* Funding Source */}
                    <div>
                        <label className="text-xs">Funding Source</label>
                        <Select
                            value={data.funding_account_id}
                            onChange={(v) => setData('funding_account_id', v)}
                            options={fundingAccounts.map((f) => ({
                                value: f.id.toString(),
                                label: f.name,
                            }))}
                        />
                        <InputError message={errors.funding_account_id} />
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

                    {/* Remarks */}
                    <div>
                        <label className="text-xs">Remarks</label>
                        <Input
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                    </div>
                </div>

                {/* INFO PANEL */}
                {selectedAccount && (
                    <div className="space-y-1 rounded-md border bg-muted/20 p-4 text-sm">
                        <p>
                            <strong>Current Balance:</strong>{' '}
                            {selectedAccount.current_balance}
                        </p>
                        <p>
                            <strong>Upper Limit:</strong>{' '}
                            {selectedAccount.upper_limit}
                        </p>
                        <p>
                            <strong>Remaining Capacity:</strong>{' '}
                            {remainingCapacity}
                        </p>
                    </div>
                )}

                {/* Submit */}
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
                                Replenish
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
