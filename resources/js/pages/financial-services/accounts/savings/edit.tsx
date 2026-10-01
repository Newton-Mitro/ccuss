import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        name?: string;
        holder?: { name?: string } | null;
        saving_account?: { minimum_balance?: string | number } | null;
    };
}
export default function SavingsAccountEdit() {
    const { account } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
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
