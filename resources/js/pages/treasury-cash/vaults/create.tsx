import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import { ResourcePageHeader } from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function Create({ vault }: any) {
    const editing = Boolean(vault);
    const { data, setData, post, put, processing, errors } = useForm({
        code: vault?.code ?? '',
        name: vault?.name ?? '',
        maximum_balance: vault?.maximum_balance ?? '',
        status: vault?.status ?? 'ACTIVE',
    });
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Vaults', href: route('vaults.index') },
        { title: editing ? 'Edit' : 'Create', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (editing) {
            put(route('vaults.update', vault.id));
        } else {
            post(route('vaults.store'));
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Vault' : 'Create Vault'} />
            <div className="max-w-3xl space-y-6 text-foreground">
                <ResourcePageHeader
                    title={editing ? 'Edit Vault' : 'Create Vault'}
                    description="Configure a secure branch cash location and its operating ceiling."
                />
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                    <section className="border-b p-5 sm:p-6">
                        <h2 className="font-semibold">Vault identity</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Use a stable code that branch staff can recognize
                            quickly.
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="code"
                                    className="text-sm font-medium"
                                >
                                    Vault code
                                </label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    required
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">
                                        {errors.code}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Display name
                                </label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                    <section className="p-5 sm:p-6">
                        <h2 className="font-semibold">Operating controls</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set the holding limit and whether this vault can
                            receive cash.
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="maximum_balance"
                                    className="text-sm font-medium"
                                >
                                    Maximum balance
                                </label>
                                <Input
                                    id="maximum_balance"
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={data.maximum_balance}
                                    onChange={(event) =>
                                        setData(
                                            'maximum_balance',
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.maximum_balance && (
                                    <p className="text-sm text-destructive">
                                        {errors.maximum_balance}
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
                    </section>
                    <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <a
                            href={route('vaults.index')}
                            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to vaults
                        </a>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-w-40"
                        >
                            <Check className="h-4 w-4" />
                            {processing
                                ? 'Saving...'
                                : editing
                                  ? 'Save changes'
                                  : 'Create vault'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
