import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React from 'react';
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
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { Vault } from '../../../types/cash_treasury_module';

interface VaultFormPageProps extends SharedData {
    vault?: Vault;
    branches: Branch[];
    accounts: any[];
    branch: Branch;
}

const VaultForm = ({
    vault,
    branches,
    accounts,
    branch,
}: VaultFormPageProps) => {
    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const isEdit = !!vault;

    const { data, setData, post, put, processing, errors } = useForm({
        name: vault?.name || '',
        branch_id: branch.id || '',
        account_id: vault?.account_id || '',
        is_active: vault?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(`/vaults/${vault.id}`, { preserveScroll: true });
        } else {
            post('/vaults', { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vaults', href: '/vaults' },
        {
            title: isEdit ? `Edit Vault: ${vault?.name}` : 'Create Vault',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={isEdit ? `Edit Vault - ${vault?.name}` : 'Create Vault'}
            />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        isEdit ? `Edit Vault: ${vault?.name}` : 'Create Vault'
                    }
                    description="Manage vault details."
                />
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6"
            >
                {/* Vault Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Account</Label>

                        <Select
                            value={data.account_id.toString()}
                            onChange={(val) => {
                                setData('account_id', Number(val));
                            }}
                            options={accounts.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            placeholder="Select Account"
                        />
                        <InputError message={errors.account_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Branch</Label>

                        <Select
                            value={data.branch_id.toString()}
                            onChange={(val) => {
                                setData('branch_id', Number(val));
                                const selectedBranch = branches.find(
                                    (b) => b.id === Number(val),
                                );
                                setData(
                                    'name',
                                    `${selectedBranch?.name} Vault`,
                                );
                            }}
                            options={branches.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            placeholder="Select Branch"
                        />
                        <InputError message={errors.branch_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Vault Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">Status</Label>
                        <div className="">
                            <ToggleGroup
                                type="single" // single or multiple
                                value={data.is_active ? 'true' : 'false'}
                                onValueChange={(val) =>
                                    setData('is_active', val === 'true')
                                }
                                size="sm" // size variant: default, sm, lg
                                variant="outline" // style variant: default, outline, etc.
                            >
                                <ToggleGroupItem value="true">
                                    Active
                                </ToggleGroupItem>
                                <ToggleGroupItem value="false">
                                    Inactive
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                {isEdit ? 'Update Vault' : 'Create Vault'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default VaultForm;
