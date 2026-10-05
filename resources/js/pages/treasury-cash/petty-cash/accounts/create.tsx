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
    const { branches = [], default_branch_id } =
        usePage<PettyCashAccountCreatePageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        branch_id: String(default_branch_id ?? branches[0]?.id ?? ''),
        code: '',
        name: '',
        fund_limit: '',
        current_balance: '0',
        method: 'IMPREST',
        status: 'ACTIVE',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        { title: 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Petty Cash Fund" />
            <div className="max-w-2xl space-y-4">
                <div>
                    <h1 className="text-lg font-semibold">
                        Create petty cash fund
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure a petty cash fund and its branch cash
                        location.
                    </p>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('petty-cash-accounts.store'), {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div>
                        <Label htmlFor="branch_id">Branch</Label>
                        <select
                            id="branch_id"
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={data.branch_id}
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
                            {processing ? 'Saving...' : 'Create fund'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
