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
import { Teller } from '../../../types/cash_treasury_module';
import { User } from '../../../types/user';

interface TellerFormPageProps extends SharedData {
    teller?: Teller;
    users: User[];
    branch: Branch;
}

const TellerForm = ({ teller, branch, users }: TellerFormPageProps) => {
    useFlashToastHandler();

    const isEdit = !!teller;

    const { data, setData, post, put, processing, errors } = useForm({
        name: teller?.name || '',
        code: teller?.code || '',
        user_id: teller?.user_id || '',
        branch_id: teller?.branch_id || '',
        max_cash_limit: teller?.max_cash_limit || 0,
        max_transaction_limit: teller?.max_transaction_limit || 0,
        is_active: teller?.is_active ?? true,
    });

    const handleBack = () => window.history.back();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            payload.append(key, value as any);
        });

        if (isEdit) {
            put(`/tellers/${teller!.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/tellers', { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tellers', href: '/tellers' },
        {
            title: isEdit ? `Edit Teller: ${teller?.name}` : 'Create Teller',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    isEdit ? `Edit Teller - ${teller?.name}` : 'Create Teller'
                }
            />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        isEdit
                            ? `Edit Teller: ${teller?.name}`
                            : 'Create Teller'
                    }
                    description="Manage teller details and limits."
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
                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                        <Label className="text-xs">Teller Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label className="text-xs">Code</Label>
                        <Input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.code} />
                    </div>
                    <div>
                        <Label className="text-xs">User</Label>
                        <Select
                            value={data.user_id.toString()}
                            onChange={(val) => setData('user_id', Number(val))}
                            options={users.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            placeholder="Select User"
                        />
                        <InputError message={errors.user_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Branch</Label>
                        <Input value={branch?.name} disabled />
                        <InputError message={errors.branch_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Max Cash Limit</Label>
                        <Input
                            type="number"
                            value={data.max_cash_limit}
                            onChange={(e) =>
                                setData(
                                    'max_cash_limit',
                                    Number(e.target.value),
                                )
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.max_cash_limit} />
                    </div>

                    <div>
                        <Label className="text-xs">Max Transaction Limit</Label>
                        <Input
                            type="number"
                            value={data.max_transaction_limit}
                            onChange={(e) =>
                                setData(
                                    'max_transaction_limit',
                                    Number(e.target.value),
                                )
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.max_transaction_limit} />
                    </div>

                    <div className="mt-4">
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
                            <ToggleGroupItem value="true">
                                Active
                            </ToggleGroupItem>
                            <ToggleGroupItem value="false">
                                Inactive
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-4 flex justify-end">
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
                                {isEdit ? 'Update Teller' : 'Create Teller'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default TellerForm;
