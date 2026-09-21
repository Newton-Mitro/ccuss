import { Head, useForm, usePage } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface TellerCreateProps extends SharedData {
    users: { id: number; name: string; email: string }[];
}

export default function Create() {
    const { users } = usePage<TellerCreateProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        code: '',
        name: '',
        maximum_cash: '',
        status: 'ACTIVE',
    });
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Tellers', href: route('tellers.index') },
        { title: 'Create', href: route('tellers.create') },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('tellers.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Teller" />
            <div className="max-w-xl space-y-6 text-foreground">
                <HeadingSmall
                    title="Create Teller"
                    description="Assign a teller to a user in the active branch."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
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
                                setData('maximum_cash', event.target.value)
                            }
                        />
                        {errors.maximum_cash && (
                            <p className="text-sm text-destructive">
                                {errors.maximum_cash}
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
                        <UserRound className="h-4 w-4" />
                        Create teller
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
