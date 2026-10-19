import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    canManageProductDetails: boolean;
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        status?: string;
        name?: string;
        product?: { code?: string; name?: string } | null;
        share_account?: {
            membership_no?: string;
            membership_status?: string;
            member_since?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
export default function ShareAccountEdit() {
    const { account, canManageProductDetails } = usePage<Props>().props;
    const { data, setData, put, transform, processing, errors } = useForm({
        name: account.name ?? '',
        membership_no: account.share_account?.membership_no ?? '',
        member_since: account.share_account?.member_since?.slice(0, 10) ?? '',
        membership_status:
            account.share_account?.membership_status ?? 'PENDING',
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
                        const url = route(
                            'financial-accounts.share.update',
                            account.id,
                        );
                        if (canManageProductDetails) {
                            put(url);
                        } else {
                            transform((formData) => ({
                                name: formData.name,
                            })).put(url);
                        }
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
                                    value={account.account_type ?? 'SHARE'}
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
                    {canManageProductDetails ? (
                        <>
                            <Label>
                                Membership number
                                <Input
                                    value={data.membership_no}
                                    onChange={(event) =>
                                        setData(
                                            'membership_no',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Label>
                            <InputError message={errors.membership_no} />
                            <Label>
                                Member since
                                <AppDatePicker
                                    value={data.member_since}
                                    onChange={(value) =>
                                        setData('member_since', value)
                                    }
                                />
                            </Label>
                            <InputError message={errors.member_since} />
                            <Label>
                                Membership status
                                <Select
                                    value={data.membership_status}
                                    onChange={(value) =>
                                        setData('membership_status', value)
                                    }
                                    options={[
                                        'PENDING',
                                        'ACTIVE',
                                        'SUSPENDED',
                                        'CLOSED',
                                    ].map((value) => ({
                                        value,
                                        label: value,
                                    }))}
                                />
                            </Label>
                            <InputError message={errors.membership_status} />
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Membership details require membership-management
                            permission.
                        </p>
                    )}
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
