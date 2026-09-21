import { Head, useForm } from '@inertiajs/react';
import { Vault } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        maximum_balance: '',
        status: 'ACTIVE',
    });
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Vaults', href: route('vaults.index') },
        { title: 'Create', href: route('vaults.create') },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('vaults.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Vault" />
            <div className="max-w-xl space-y-6 text-foreground">
                <HeadingSmall
                    title="Create Vault"
                    description="Add a vault for the active branch."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="space-y-2">
                        <label htmlFor="code" className="text-sm font-medium">
                            Code
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
                        <label htmlFor="name" className="text-sm font-medium">
                            Name
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
                                setData('maximum_balance', event.target.value)
                            }
                        />
                        {errors.maximum_balance && (
                            <p className="text-sm text-destructive">
                                {errors.maximum_balance}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">
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
                    <Button type="submit" disabled={processing}>
                        <Vault className="h-4 w-4" />
                        Create vault
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
