import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { LedgerAccount } from '../../../types/finance_and_accounting';
import { PettyCashAccount } from '../../../types/petty_cash_module';

interface PettyCashAccountFormPageProps extends SharedData {
    pettyCash?: PettyCashAccount;
    branches: Branch[];
    ledgerAccounts: LedgerAccount[];
}

const PettyCashAccountForm = ({
    pettyCash,
    branches,
    ledgerAccounts,
}: PettyCashAccountFormPageProps) => {
    useFlashToastHandler();

    const handleBack = () => window.history.back();
    const isEdit = !!pettyCash;

    const { data, setData, post, put, processing, errors } = useForm({
        name: pettyCash?.name || '',
        branch_id: pettyCash?.branch_id?.toString() || '',
        ledger_account_id: pettyCash?.ledger_account_id?.toString() || '',
        upper_limit: pettyCash?.upper_limit || '',
        status: pettyCash?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(route('petty-cash-accounts.update', pettyCash!.id), {
                preserveScroll: true,
            });
        } else {
            post(route('petty-cash-accounts.store'), {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        {
            title: isEdit ? `Edit: ${pettyCash?.name}` : 'Create Account',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    isEdit
                        ? `Edit Petty Cash Account - ${pettyCash?.name}`
                        : 'Create Petty Cash Account'
                }
            />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        isEdit
                            ? `Edit: ${pettyCash?.name}`
                            : 'Create Petty Cash Account'
                    }
                    description="Manage petty cash account details."
                />
                <div className="">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Branch */}
                    <div>
                        <label className="text-xs">Branch</label>
                        <Select
                            value={data.branch_id}
                            onChange={(val) => {
                                setData('branch_id', val);

                                const branchName =
                                    branches.find(
                                        (b) => b.id.toString() === val,
                                    )?.name || '';

                                // Smart auto naming
                                if (!isEdit) {
                                    setData('name', `${branchName} Petty Cash`);
                                }
                            }}
                            options={branches.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            placeholder="Select Branch"
                        />
                        <InputError message={errors.branch_id} />
                    </div>

                    {/* Ledger Account */}
                    <div>
                        <label className="text-xs">Ledger Account</label>
                        <Select
                            value={data.ledger_account_id}
                            onChange={(val) =>
                                setData('ledger_account_id', val)
                            }
                            options={ledgerAccounts.map((l) => ({
                                value: l.id.toString(),
                                label: l.name,
                            }))}
                            placeholder="Select Ledger"
                        />
                        <InputError message={errors.ledger_account_id} />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-xs">Account Name</label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 w-full border px-2 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Upper Limit */}
                    <div>
                        <label className="text-xs">Upper Limit</label>
                        <Input
                            type="number"
                            value={data.upper_limit}
                            onChange={(e) =>
                                setData('upper_limit', e.target.value)
                            }
                            className="h-8 w-full border px-2 text-sm"
                            placeholder="0.00"
                        />
                        <InputError message={errors.upper_limit} />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-xs">Status</label>
                        <Select
                            value={data.status}
                            onChange={(val) =>
                                setData('status', val as 'active' | 'inactive')
                            }
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                        <InputError message={errors.status} />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                {isEdit ? 'Update' : 'Create'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default PettyCashAccountForm;
