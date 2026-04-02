import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import {
    ToggleGroup,
    ToggleGroupItem,
} from '../../../components/ui/toggle-group';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { PettyCashAccount } from '../../../types/petty_cash_module';
import { User } from '../../../types/user';

interface PettyCashFormPageProps extends SharedData {
    pettyCash?: PettyCashAccount;
    branches: Branch[];
    users: User[];
}

const PettyCashForm = ({
    pettyCash,
    branches,
    users,
    flash,
}: PettyCashFormPageProps) => {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();
    const isEdit = !!pettyCash;

    const { data, setData, post, put, processing, errors } = useForm({
        name: pettyCash?.name || '',
        code: pettyCash?.code || '',
        branch_id: pettyCash?.branch_id || '',
        custodian_id: pettyCash?.custodian_id || '',
        imprest_amount: pettyCash?.imprest_amount || 0,
        is_active: pettyCash?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(`/petty-cash-accounts/${pettyCash.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/petty-cash-accounts', { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Petty Cash Accounts', href: '/petty-cash-accounts' },
        {
            title: isEdit ? `Edit: ${pettyCash?.name}` : 'Create Petty Cash',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    isEdit
                        ? `Edit Petty Cash - ${pettyCash?.name}`
                        : 'Create Petty Cash'
                }
            />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        isEdit
                            ? `Edit: ${pettyCash?.name}`
                            : 'Create Petty Cash'
                    }
                    description="Manage petty cash account details."
                />
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6 lg:w-3xl"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                        <Label className="text-xs">Account Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Code */}
                    <div>
                        <Label className="text-xs">Code</Label>
                        <Input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.code} />
                    </div>

                    {/* Branch */}
                    <div>
                        <Label className="text-xs">Branch</Label>
                        <Select
                            value={data.branch_id.toString()}
                            onChange={(val) =>
                                setData('branch_id', Number(val))
                            }
                            options={branches.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            placeholder="Select Branch"
                        />
                        <InputError message={errors.branch_id} />
                    </div>

                    {/* Custodian */}
                    <div>
                        <Label className="text-xs">Custodian (User)</Label>
                        <Select
                            value={data.custodian_id?.toString()}
                            onChange={(val) =>
                                setData('custodian_id', Number(val))
                            }
                            options={users.map((u) => ({
                                value: u.id.toString(),
                                label: u.name,
                            }))}
                            placeholder="Select Custodian"
                        />
                        <InputError message={errors.custodian_id} />
                    </div>

                    {/* Imprest Amount */}
                    <div>
                        <Label className="text-xs">Imprest Amount</Label>
                        <Input
                            type="number"
                            value={data.imprest_amount}
                            onChange={(e) =>
                                setData(
                                    'imprest_amount',
                                    Number(e.target.value),
                                )
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.imprest_amount} />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <ToggleGroup
                        type="single"
                        value={data.is_active ? 'true' : 'false'}
                        onValueChange={(val) =>
                            setData('is_active', val === 'true')
                        }
                        size="sm"
                        variant="outline"
                    >
                        <ToggleGroupItem value="true">Active</ToggleGroupItem>
                        <ToggleGroupItem value="false">
                            Inactive
                        </ToggleGroupItem>
                    </ToggleGroup>
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

export default PettyCashForm;
