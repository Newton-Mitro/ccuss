import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Vault } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CreateVaultSessionPage() {
    const {
        branch_day,
        branch_days = [],
        vaults = [],
    } = usePage<{
        branch_day?: { id: number; business_date: string };
        branch_days?: {
            id: number;
            business_date: string;
            branch_name?: string;
        }[];
        vaults?: { id: number; code: string; name: string }[];
    }>().props;
    const { data, setData, post, processing, errors } = useForm({
        branch_day_id: branch_day?.id ? String(branch_day.id) : '',
        vault_id: '',
        opening_cash: '',
        opening_note: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Vault Sessions', href: route('vault-sessions.index') },
        { title: 'Open session', href: route('vault-sessions.create') },
    ];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('vault-sessions.open'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Vault Session" />
            <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Open Vault Session
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Record the beginning cash balance for a vault for
                            the active branch day.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-lg border bg-card p-6"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="branch_day_id"
                            className="text-sm font-medium"
                        >
                            Branch day
                        </label>
                        <Select
                            id="branch_day_id"
                            className="h-9 p-2"
                            value={data.branch_day_id}
                            onChange={(value) =>
                                setData('branch_day_id', value)
                            }
                            placeholder="Select branch day"
                            options={[
                                { value: '', label: 'Select branch day' },
                                ...branch_days.map((item) => ({
                                    value: String(item.id),
                                    label: `${item.branch_name ?? 'Branch'} — ${item.business_date}`,
                                })),
                            ]}
                        />
                        {errors.branch_day_id && (
                            <p className="text-sm text-red-500">
                                {errors.branch_day_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="vault_id"
                            className="text-sm font-medium"
                        >
                            Vault
                        </label>
                        <Select
                            id="vault_id"
                            className="h-9 p-2"
                            value={data.vault_id}
                            onChange={(value) => setData('vault_id', value)}
                            placeholder="Select vault"
                            options={[
                                { value: '', label: 'Select vault' },
                                ...vaults.map((vault) => ({
                                    value: String(vault.id),
                                    label: `${vault.name} (${vault.code})`,
                                })),
                            ]}
                        />
                        {errors.vault_id && (
                            <p className="text-sm text-red-500">
                                {errors.vault_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Opening cash
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.opening_cash}
                            onChange={(event) =>
                                setData('opening_cash', event.target.value)
                            }
                        />
                        {errors.opening_cash && (
                            <p className="text-sm text-red-500">
                                {errors.opening_cash}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Opening note
                        </label>
                        <Input
                            value={data.opening_note}
                            onChange={(event) =>
                                setData('opening_note', event.target.value)
                            }
                        />
                        {errors.opening_note && (
                            <p className="text-sm text-red-500">
                                {errors.opening_note}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        <Vault className="mr-2 h-4 w-4" />
                        Open vault session
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
