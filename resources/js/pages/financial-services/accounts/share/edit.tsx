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
        share_account?: {
            membership_no?: string;
            membership_status?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
export default function ShareAccountEdit() {
    const { account } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Share Accounts',
            href: route('financial-accounts.share.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />
            <div className="max-w-2xl space-y-4">
                <ResourcePageHeader
                    title="Edit share account"
                    description={`${account.holder?.name ?? 'Member'} · membership ${account.share_account?.membership_no ?? '-'}`}
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(
                            route(
                                'financial-accounts.share.update',
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
                    <p className="text-sm text-muted-foreground">
                        Membership status:{' '}
                        {account.share_account?.membership_status ?? 'PENDING'}
                    </p>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route(
                                    'financial-accounts.share.show',
                                    account.id,
                                )}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save share details
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
