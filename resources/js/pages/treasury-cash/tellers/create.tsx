import type { TellerCreatePageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, UserRound } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function Create({ teller }: any) {
    const editing = Boolean(teller);
    const { users } = usePage<TellerCreatePageProps>().props;
    const { data, setData, post, put, processing, errors } = useForm({
        user_id: teller?.user_id ?? '',
        code: teller?.code ?? '',
        name: teller?.name ?? '',
        maximum_cash: teller?.maximum_cash ?? '',
        status: teller?.status ?? 'ACTIVE',
    });
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Tellers', href: route('tellers.index') },
        { title: editing ? 'Edit' : 'Create', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (editing) {
            put(route('tellers.update', teller.id));
        } else {
            post(route('tellers.store'));
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Teller' : 'Create Teller'} />
            <div className="max-w-3xl space-y-6 text-foreground">
                <div className="flex items-start gap-4 rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/30">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
                        <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-sky-700 uppercase dark:text-sky-300">
                            Cash operations
                        </p>
                        <h1 className="mt-1 text-xl font-semibold tracking-tight">
                            {editing ? 'Edit teller' : 'Create a teller'}
                        </h1>
                        <p className="mt-1 text-sm text-sky-900/70 dark:text-sky-100/70">
                            Assign a cashier to the branch and define a safe
                            operating limit.
                        </p>
                    </div>
                </div>
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                    <section className="border-b p-5 sm:p-6">
                        <h2 className="font-semibold">Teller identity</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose the assigned user and give the teller a
                            recognizable code.
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="user_id"
                                    className="text-sm font-medium"
                                >
                                    Assigned user
                                </label>
                                <select
                                    id="user_id"
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                    value={data.user_id}
                                    onChange={(event) =>
                                        setData('user_id', event.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select user</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="code"
                                    className="text-sm font-medium"
                                >
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
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
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
                        </div>
                    </section>
                    <section className="p-5 sm:p-6">
                        <h2 className="font-semibold">Operating controls</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set the maximum cash exposure and current
                            availability.
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="maximum_cash"
                                    className="text-sm font-medium"
                                >
                                    Maximum cash
                                </label>
                                <Input
                                    id="maximum_cash"
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={data.maximum_cash}
                                    onChange={(event) =>
                                        setData(
                                            'maximum_cash',
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.maximum_cash && (
                                    <p className="text-sm text-destructive">
                                        {errors.maximum_cash}
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
                            href={route('tellers.index')}
                            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to tellers
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
                                  : 'Create teller'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
