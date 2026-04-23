import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
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
}

const VaultForm = ({ vault, branches }: VaultFormPageProps) => {
    useFlashToastHandler();

    const isEdit = !!vault;

    const handleBack = () => window.history.back();

    const { data, setData, post, put, processing, errors } = useForm({
        name: vault?.name || '',
        branch_id: vault?.branch_id || '',
        subledger_account_id: vault?.subledger_account_id || '',
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
        { title: 'Treasury & Cash', href: '' },
        { title: 'Vaults', href: route('vaults.index') },
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

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        isEdit ? `Edit Vault: ${vault?.name}` : 'Create Vault'
                    }
                    description="Manage vault configuration with branch & account mapping."
                />

                <div className="">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-md border bg-card p-4 sm:p-6"
            >
                {/* Core Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                    {/* Account */}
                    <div>
                        <Label className="text-xs">Subledger Account</Label>
                        <Input
                            value={vault?.subledger_account?.name}
                            disabled
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.subledger_account_id} />
                    </div>

                    {/* Vault Name */}
                    <div>
                        <Label className="text-xs">Vault Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                    <Label className="text-xs">Status</Label>

                    <ToggleGroup
                        type="single"
                        value={data.is_active ? 'true' : 'false'}
                        onValueChange={(val) =>
                            setData('is_active', val === 'true')
                        }
                        size="sm"
                        variant="outline"
                    >
                        <ToggleGroupItem
                            value="true"
                            className={`${
                                data.is_active
                                    ? 'bg-primary text-primary-foreground'
                                    : ''
                            } border-2 border-border`}
                        >
                            Active
                        </ToggleGroupItem>

                        <ToggleGroupItem
                            value="false"
                            className={`${
                                !data.is_active
                                    ? 'bg-destructive text-destructive-foreground'
                                    : ''
                            } border-2 border-border`}
                        >
                            Inactive
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="h-4 w-4" />
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
