import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        status?: string;
        name?: string;
        product?: { code?: string; name?: string } | null;
        holder?: { name?: string } | null;
        saving_account?: { minimum_balance?: string | number } | null;
    };
}
export default function SavingsAccountEdit() {
    const { account } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
        minimum_balance: String(account.saving_account?.minimum_balance ?? 0),
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Savings Accounts',
            href: route('financial-accounts.savings.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />
            <div className="max-w-2xl space-y-4">
                <ResourcePageHeader
                    title="Edit savings account"
                    description={`${account.holder?.name ?? 'Account holder'} · minimum balance ${account.saving_account?.minimum_balance ?? '0'}`}
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(
                            route(
                                'financial-accounts.savings.update',
                                account.id,
                            ),
                        );
                    }}
                    className="space-y-4 rounded-lg border bg-card p-5"
                >
                    <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
                        <h2 className="text-sm font-semibold">
                            Protected account details
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Label>
                                Account number
                                <Input value={account.account_no} disabled />
                            </Label>
                            <Label>
                                Product
                                <Input
                                    value={
                                        [
                                            account.product?.code,
                                            account.product?.name,
                                        ]
                                            .filter(Boolean)
                                            .join(' - ') || '-'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account holder
                                <Input
                                    value={account.holder?.name ?? '-'}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account type
                                <Input
                                    value={account.account_type ?? 'SAVINGS'}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Balance
                                <Input
                                    value={formatBDTCurrency(account.balance)}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account status
                                <Input value={account.status ?? '-'} disabled />
                            </Label>
                        </div>
                    </section>
                    <Label>
                        Account display name
                        <Input
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                    </Label>
                    <InputError message={errors.name} />
                    <Label>
                        Minimum balance
                        <Input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={data.minimum_balance}
                            onChange={(event) =>
                                setData('minimum_balance', event.target.value)
                            }
                        />
                    </Label>
                    <InputError message={errors.minimum_balance} />
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route(
                                    'financial-accounts.savings.show',
                                    account.id,
                                )}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save savings details
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
