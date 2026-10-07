import FinancialAccountPeopleManagement from '@/components/financial-account-people-management';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        balance: string | number;
        status: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        share_account?: {
            id: number;
            membership_no?: string;
            member_since?: string;
            membership_status?: string;
            total_shares?: string | number;
            share_value?: string | number;
        } | null;
    };
}
export default function ShareAccountShow() {
    const { account, customers, auth } = usePage<
        Props & {
            customers: Array<{ id: number; customer_no: string; name: string }>;
        }
    >().props;
    const share = account.share_account;
    const canManageMembership = (auth.user.permissions ?? []).some(
        (permission) =>
            permission.slug === 'financial.accounts.membership.manage',
    );
    const canActivateAccount = (auth.user.permissions ?? []).some(
        (permission) => permission.slug === 'financial.accounts.update',
    );
    const {
        data: membershipData,
        setData: setMembershipData,
        put: updateMembership,
        processing: membershipProcessing,
    } = useForm({
        membership_status: share?.membership_status ?? 'PENDING',
    });

    const submitMembership = (event: React.FormEvent) => {
        event.preventDefault();
        if (!share) return;

        updateMembership(
            route('financial-accounts.membership.update', [
                account.id,
                share.id,
            ]),
            { preserveScroll: true },
        );
    };

    const activateAccount = () => {
        router.post(
            route('financial-accounts.activate', account.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };
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
            <Head title={account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · ${account.product?.name ?? 'Share membership'}`}
                    action={
                        <Button asChild>
                            <Link
                                href={route(
                                    'financial-accounts.share.edit',
                                    account.id,
                                )}
                            >
                                Edit account
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-4">
                    {[
                        ['Membership', share?.membership_no ?? '-'],
                        ['Member since', formatDate(share?.member_since)],
                        ['Shares', share?.total_shares ?? '0'],
                        ['Share value', share?.share_value ?? '0'],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-card p-4"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 font-semibold tabular-nums">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
                <section className="rounded-lg border bg-card p-5">
                    <h2 className="font-semibold">Membership status</h2>
                    <div className="mt-3 flex items-center gap-3">
                        <StatusBadge
                            tone={
                                share?.membership_status === 'ACTIVE'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {share?.membership_status ?? 'PENDING'}
                        </StatusBadge>
                        <span className="text-sm text-muted-foreground">
                            Account status: {account.status}
                        </span>
                    </div>
                    {canManageMembership && share && (
                        <form
                            onSubmit={submitMembership}
                            className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4"
                        >
                            <div className="w-full max-w-xs space-y-2">
                                <Label htmlFor="share-membership-status">
                                    Update membership status
                                </Label>
                                <Select
                                    value={membershipData.membership_status}
                                    onChange={(value) =>
                                        setMembershipData(
                                            'membership_status',
                                            value,
                                        )
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
                            </div>
                            <Button
                                type="submit"
                                disabled={membershipProcessing}
                            >
                                {membershipProcessing
                                    ? 'Updating...'
                                    : 'Update membership'}
                            </Button>
                        </form>
                    )}
                    {account.status === 'PENDING' && canActivateAccount && (
                        <div className="mt-4 border-t pt-4">
                            <Button type="button" onClick={activateAccount}>
                                Activate account
                            </Button>
                        </div>
                    )}
                </section>
                <FinancialAccountPeopleManagement
                    account={account}
                    customers={customers}
                    nomineesEnabled={false}
                />
            </div>
        </CustomAuthLayout>
    );
}
