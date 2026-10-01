import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Vault } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CreateVaultSessionPage() {
    const { vaults } = usePage<{
        vaults: { id: number; code: string; name: string }[];
    }>().props;
    const { data, setData, post, processing, errors } = useForm({
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
            <div className="mx-auto max-w-2xl space-y-6">
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
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-lg border bg-card p-6"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Vault</label>
                        <select
                            value={data.vault_id}
                            onChange={(event) =>
                                setData('vault_id', event.target.value)
                            }
                            className="w-full rounded-md border bg-background p-2"
                        >
                            <option value="">Select vault</option>
                            {vaults.map((vault) => (
                                <option key={vault.id} value={vault.id}>
                                    {vault.name} ({vault.code})
                                </option>
                            ))}
                        </select>
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
