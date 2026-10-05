import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { PettyCashAccountCreatePageProps } from '@/types/treasury-cash/forms';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function CreatePettyCashAccount() {
    const {
        branches = [],
        default_branch_id,
        default_custodian_id,
        users = [],
        branch_locked = false,
        fund,
    } = usePage<PettyCashAccountCreatePageProps>().props;
    const editing = Boolean(fund);
    const { data, setData, post, put, processing, errors } = useForm({
        branch_id: String(
            fund?.cash_location?.branch_id ??
                default_branch_id ??
                branches[0]?.id ??
                '',
        ),
        custodian_id: String(fund?.custodian_id ?? default_custodian_id ?? ''),
        code: fund?.code ?? '',
        name: fund?.name ?? '',
        fund_limit: fund?.fund_limit ?? '',
        current_balance: fund?.current_balance ?? '0',
        method: fund?.method ?? 'IMPREST',
        status: fund?.status ?? 'ACTIVE',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing && fund) {
            put(route('petty-cash-accounts.update', fund.id));
            return;
        }

        post(route('petty-cash-accounts.store'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        { title: editing ? 'Edit' : 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing ? 'Edit Petty Cash Fund' : 'Create Petty Cash Fund'
                }
            />
            <div className="max-w-2xl space-y-4">
                <div>
                    <h1 className="text-lg font-semibold">
                        {editing
                            ? 'Edit petty cash fund'
                            : 'Create petty cash fund'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure a petty cash fund and its branch cash
                        location.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div>
                        <Label htmlFor="branch_id">Branch</Label>
                        <select
                            id="branch_id"
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={data.branch_id}
                            disabled={editing && branch_locked}
                            onChange={(event) =>
                                setData('branch_id', event.target.value)
                            }
                            required
                        >
                            <option value="">Select branch</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name} ({branch.code})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.branch_id} />
                        {editing && branch_locked && (
                            <p className="text-xs text-muted-foreground">
                                Branch cannot be changed after transactions
                                exist.
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="custodian_id">Custodian</Label>
                        <select
                            id="custodian_id"
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={data.custodian_id}
                            onChange={(event) =>
                                setData('custodian_id', event.target.value)
                            }
                            required
                        >
                            <option value="">Select custodian</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.custodian_id} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="code">Fund code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(event) =>
                                    setData('code', event.target.value)
                                }
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div>
                            <Label htmlFor="method">Method</Label>
                            <select
                                id="method"
                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                value={data.method}
                                onChange={(event) =>
                                    setData('method', event.target.value)
                                }
                            >
                                <option value="IMPREST">IMPREST</option>
                                <option value="VARIABLE">VARIABLE</option>
                            </select>
                            <InputError message={errors.method} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="name">Fund name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="fund_limit">Fund limit</Label>
                            <Input
                                id="fund_limit"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.fund_limit}
                                onChange={(event) =>
                                    setData('fund_limit', event.target.value)
                                }
                            />
                            <InputError message={errors.fund_limit} />
                        </div>
                        {!editing && (
                            <div>
                                <Label htmlFor="current_balance">
                                    Opening balance
                                </Label>
                                <Input
                                    id="current_balance"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.current_balance}
                                    onChange={(event) =>
                                        setData(
                                            'current_balance',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.current_balance} />
                            </div>
                        )}
                        {editing && (
                            <div>
                                <Label>Current balance</Label>
                                <p className="mt-2 text-sm font-medium">
                                    {fund?.current_balance}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={data.status}
                            onChange={(event) =>
                                setData('status', event.target.value)
                            }
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link href={route('petty-cash-accounts.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || branches.length === 0}
                        >
                            {processing
                                ? 'Saving...'
                                : editing
                                  ? 'Save changes'
                                  : 'Create fund'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
