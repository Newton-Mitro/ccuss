import FinancialAccountActivation from '@/modules/financial-services/components/financial-account-activation';
import FinancialAccountPeopleManagement from '@/modules/financial-services/components/financial-account-people-management';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Fingerprint,
    Landmark,
    Pencil,
    ShieldCheck,
    Users,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
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
    useFlashToastHandler();

    const { account, customers, auth } = usePage<
        Props & {
            customers: Array<{
                id: number;
                customer_no: string;
                name: string;
            }>;
        }
    >().props;

    const share = account.share_account;

    const canManageMembership = (auth.user.permissions ?? []).some(
        (permission) =>
            permission.slug === 'financial.accounts.membership.manage',
    );

    const {
        data: membershipData,
        setData: setMembershipData,
        put: updateMembership,
        processing: membershipProcessing,
    } = useForm({
        membership_status: share?.membership_status ?? 'PENDING',
    });

    const submitMembership = (event: FormEvent<HTMLFormElement>) => {
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Share Accounts',
            href: route('financial-accounts.share.index'),
        },
        { title: account.account_no, href: '' },
    ];

    const metrics = [
        {
            label: 'Membership number',
            value: share?.membership_no ?? 'Not assigned',
            description: 'Registered membership ID',
            icon: Fingerprint,
        },
        {
            label: 'Member since',
            value: share?.member_since
                ? formatDate(share.member_since)
                : 'Not recorded',
            description: 'Membership registration date',
            icon: CalendarDays,
        },
        {
            label: 'Total shares',
            value: Number(share?.total_shares ?? 0).toLocaleString('en-US'),
            description: 'Registered share units',
            icon: Landmark,
        },
        {
            label: 'Share value',
            value: formatBDTCurrency(share?.share_value ?? 0, false),
            description: 'Total recorded share value',
            icon: Wallet,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Share Account ${account.account_no}`} />

            <div className="w-full max-w-screen space-y-5 pb-6">
                <ResourcePageHeader variant="account"
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned account'} · ${account.product?.name ?? 'Share membership'}`}
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            <FinancialAccountActivation
                                accountId={account.id}
                                status={account.status}
                            />

                            <Button variant="outline" asChild>
                                <Link
                                    href={route(
                                        'financial-accounts.share.index',
                                    )}
                                >
                                    <ArrowLeft className="size-4" />
                                    <span className="hidden sm:inline">
                                        Back
                                    </span>
                                </Link>
                            </Button>

                            <Button asChild>
                                <Link
                                    href={route(
                                        'financial-accounts.share.edit',
                                        account.id,
                                    )}
                                >
                                    <Pencil className="size-4" />
                                    Edit account
                                </Link>
                            </Button>
                        </div>
                    }
                />

                {/* Account summary */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                <Landmark className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Share account overview
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Membership details and shareholding summary
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                Account
                            </span>
                            <StatusBadge
                                tone={
                                    account.status === 'ACTIVE'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {account.status}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;

                            return (
                                <div
                                    key={metric.label}
                                    className="flex min-w-0 items-start gap-3 p-4 transition-colors hover:bg-muted/20 sm:p-5"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                                        <Icon className="size-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {metric.label}
                                        </p>
                                        <p className="mt-1 text-base font-semibold tracking-tight break-words tabular-nums sm:text-lg">
                                            {metric.value}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {metric.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Membership management */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                            <BadgeCheck className="size-4" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold">
                                Membership management
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Review membership status and update
                                authorization where permitted.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                        {/* Current status */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Current membership status
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <StatusBadge
                                        tone={
                                            share?.membership_status ===
                                            'ACTIVE'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {share?.membership_status ?? 'PENDING'}
                                    </StatusBadge>

                                    {share?.membership_status === 'ACTIVE' && (
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <CheckCircle2 className="size-3.5" />
                                            Membership active
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/20 p-3">
                                <div className="flex items-start gap-2.5">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                    <div>
                                        <p className="text-sm font-medium">
                                            Account status
                                        </p>
                                        <div className="mt-1">
                                            <StatusBadge
                                                tone={
                                                    account.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {account.status}
                                            </StatusBadge>
                                        </div>
                                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                            Account activation and membership
                                            approval are managed separately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status update form */}
                        {canManageMembership && share ? (
                            <form
                                onSubmit={submitMembership}
                                className="space-y-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
                                        <CreditCard className="size-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Update membership
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Change the member's current status
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="share-membership-status">
                                        Membership status
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
                                            {
                                                value: 'PENDING',
                                                label: 'Pending',
                                            },
                                            {
                                                value: 'ACTIVE',
                                                label: 'Active',
                                            },
                                            {
                                                value: 'SUSPENDED',
                                                label: 'Suspended',
                                            },
                                            {
                                                value: 'CLOSED',
                                                label: 'Closed',
                                            },
                                        ]}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Select the appropriate membership status
                                        before saving.
                                    </p>
                                </div>

                                <div className="flex justify-end border-t pt-3">
                                    <Button
                                        type="submit"
                                        disabled={
                                            membershipProcessing ||
                                            membershipData.membership_status ===
                                                (share.membership_status ??
                                                    'PENDING')
                                        }
                                    >
                                        {membershipProcessing
                                            ? 'Updating...'
                                            : 'Update membership'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
                                <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div>
                                    <p className="text-sm font-medium">
                                        Membership information
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        {!share
                                            ? 'Membership details are not available for this account.'
                                            : 'You can view membership information, but you do not have permission to update its status.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Account relationships */}
                <section className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                            <Users className="size-4" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Account relationships
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Manage account holders and associated customer
                                information.
                            </p>
                        </div>
                    </div>

                    <FinancialAccountPeopleManagement
                        account={account}
                        customers={customers}
                        nomineesEnabled={false}
                    />
                </section>
            </div>
        </CustomAuthLayout>
    );
}
