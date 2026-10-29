import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import AccountEditPreview from '@/modules/financial-services/accounts/account-edit-preview';
import type { Props } from '@/modules/financial-services/types/accounts/recurring/edit.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    FileText,
    Landmark,
    LockKeyhole,
    Pencil,
    Repeat2,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function RecurringDepositAccountEdit() {
    const { account, canManageProductDetails } = usePage<Props>().props;
    const deposit = account.recurring_deposit;

    const { data, setData, put, transform, processing, errors } = useForm({
        name: account.name ?? '',
        installment_amount: String(deposit?.installment_amount ?? ''),
        installment_frequency: deposit?.installment_frequency ?? 'MONTHLY',
        total_installments: String(deposit?.total_installments ?? ''),
        started_at: deposit?.started_at?.slice(0, 10) ?? '',
        maturity_extension_days: String(deposit?.maturity_extension_days ?? 0),
        grace_days: String(deposit?.grace_days ?? 0),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        {
            title: 'Recurring Deposits',
            href: route('financial-accounts.recurring.index'),
        },
        {
            title: account.account_no,
            href: route('financial-accounts.recurring.show', account.id),
        },
        { title: 'Edit', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const url = route('financial-accounts.recurring.update', account.id);

        if (canManageProductDetails) {
            put(url, { preserveScroll: true });
        } else {
            transform((formData) => ({ name: formData.name }));
            put(url, { preserveScroll: true });
        }
    };

    const metrics = [
        {
            label: 'Installment amount',
            value: formatBDTCurrency(deposit?.installment_amount ?? 0),
            icon: Wallet,
        },
        {
            label: 'Payment frequency',
            value: (deposit?.installment_frequency ?? 'MONTHLY')
                .replaceAll('_', ' ')
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            icon: Repeat2,
        },
        {
            label: 'Total installments',
            value: String(deposit?.total_installments ?? 0),
            icon: CalendarDays,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />

            <div className="w-full max-w-screen-xl space-y-5 pb-6">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Edit recurring deposit account"
                        description={`${account.holder?.name ?? 'Depositor'} · ${account.product?.name ?? 'Recurring deposit'}`}
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <Button variant="outline" asChild>
                            <Link
                                href={route(
                                    'financial-accounts.recurring.show',
                                    account.id,
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                <span className="hidden sm:inline">
                                    Back to account
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Account summary */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                <Landmark className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Account overview
                                </h2>
                                <p className="mt-0.5 text-xs break-all text-muted-foreground">
                                    {account.account_no}
                                </p>
                            </div>
                        </div>

                        <StatusBadge
                            tone={
                                account.status === 'ACTIVE'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {account.status ?? 'UNKNOWN'}
                        </StatusBadge>
                    </div>

                    <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;

                            return (
                                <div
                                    key={metric.label}
                                    className="flex min-w-0 items-start gap-3 p-4 transition-colors hover:bg-muted/20 sm:p-5"
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                                        <Icon className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {metric.label}
                                        </p>
                                        <p className="mt-1 text-base font-semibold break-words tabular-nums">
                                            {metric.value}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-5">
                            {/* Protected account details */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                                            <LockKeyhole className="size-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">
                                                Protected account details
                                            </h2>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Read-only information for
                                                verification.
                                            </p>
                                        </div>
                                    </div>

                                    <ShieldCheck className="hidden size-4 text-muted-foreground sm:block" />
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Account number</Label>
                                        <Input
                                            value={account.account_no}
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Deposit product</Label>
                                        <Input
                                            value={
                                                [
                                                    account.product?.code,
                                                    account.product?.name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' — ') ||
                                                'Not specified'
                                            }
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Depositor</Label>
                                        <Input
                                            value={
                                                account.holder?.name ??
                                                'Not assigned'
                                            }
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Account type</Label>
                                        <Input
                                            value={
                                                account.account_type ??
                                                'RECURRING_DEPOSIT'
                                            }
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Current balance</Label>
                                        <Input
                                            value={formatBDTCurrency(
                                                account.balance ?? 0,
                                            )}
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Account status</Label>
                                        <div className="flex h-10 items-center rounded-md border bg-muted/20 px-3">
                                            <StatusBadge
                                                tone={
                                                    account.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {account.status ?? 'UNKNOWN'}
                                            </StatusBadge>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Editable account information */}
                            <section className="overflow-hidden rounded-xl border bg-card">
                                <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                                        <Pencil className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Account settings
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Update the account name and, if
                                            authorized, its deposit terms.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 p-4 sm:p-5">
                                    <div className="max-w-xl space-y-2">
                                        <Label htmlFor="name">
                                            Account display name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            placeholder="e.g. Monthly savings plan"
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError message={errors.name} />
                                        <p className="text-xs text-muted-foreground">
                                            An optional name to help identify
                                            this recurring deposit account.
                                        </p>
                                    </div>

                                    {canManageProductDetails ? (
                                        <>
                                            <div className="border-t pt-5">
                                                <div className="mb-4 flex items-center gap-2">
                                                    <Repeat2 className="size-4 text-muted-foreground" />
                                                    <div>
                                                        <h3 className="text-sm font-semibold">
                                                            Deposit terms
                                                        </h3>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            Changes may affect
                                                            pending installments
                                                            and maturity.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="installment_amount">
                                                            Installment amount
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                                                                ৳
                                                            </span>
                                                            <Input
                                                                id="installment_amount"
                                                                type="number"
                                                                min="0.0001"
                                                                step="0.0001"
                                                                className="pl-8 tabular-nums"
                                                                value={
                                                                    data.installment_amount
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setData(
                                                                        'installment_amount',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.installment_amount
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="installment_frequency">
                                                            Payment frequency
                                                        </Label>
                                                        <Select
                                                            value={
                                                                data.installment_frequency
                                                            }
                                                            onChange={(value) =>
                                                                setData(
                                                                    'installment_frequency',
                                                                    value,
                                                                )
                                                            }
                                                            options={[
                                                                {
                                                                    value: 'WEEKLY',
                                                                    label: 'Weekly',
                                                                },
                                                                {
                                                                    value: 'MONTHLY',
                                                                    label: 'Monthly',
                                                                },
                                                                {
                                                                    value: 'QUARTERLY',
                                                                    label: 'Quarterly',
                                                                },
                                                            ]}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.installment_frequency
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="total_installments">
                                                            Total installments
                                                        </Label>
                                                        <Input
                                                            id="total_installments"
                                                            type="number"
                                                            min="1"
                                                            max="600"
                                                            value={
                                                                data.total_installments
                                                            }
                                                            onChange={(event) =>
                                                                setData(
                                                                    'total_installments',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.total_installments
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="started_at">
                                                            Start date
                                                        </Label>
                                                        <AppDatePicker
                                                            value={
                                                                data.started_at
                                                            }
                                                            onChange={(value) =>
                                                                setData(
                                                                    'started_at',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.started_at
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="grace_days">
                                                            Grace period (days)
                                                        </Label>
                                                        <Input
                                                            id="grace_days"
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                data.grace_days
                                                            }
                                                            onChange={(event) =>
                                                                setData(
                                                                    'grace_days',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.grace_days
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="maturity_extension_days">
                                                            Maturity extension
                                                            (days)
                                                        </Label>
                                                        <Input
                                                            id="maturity_extension_days"
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                data.maturity_extension_days
                                                            }
                                                            onChange={(event) =>
                                                                setData(
                                                                    'maturity_extension_days',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.maturity_extension_days
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
                                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Schedule recalculation
                                                    </p>
                                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                        Maturity date and
                                                        pending installment
                                                        schedules may be
                                                        recalculated when
                                                        contract terms change.
                                                        Review the resulting
                                                        schedule after saving.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
                                            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Contract terms are protected
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Your current permissions
                                                    allow you to update the
                                                    display name only. Recurring
                                                    deposit terms require
                                                    additional management
                                                    permission.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                            <AccountEditPreview
                                accountType={
                                    account.account_type ?? 'RECURRING_DEPOSIT'
                                }
                                accountNumber={account.account_no}
                                accountName={data.name}
                                productName={
                                    [
                                        account.product?.code,
                                        account.product?.name,
                                    ]
                                        .filter(Boolean)
                                        .join(' — ') || 'Not specified'
                                }
                                accountStatus={account.status ?? 'UNKNOWN'}
                                featuredLabel="Installment amount"
                                featuredValue={formatBDTCurrency(
                                    data.installment_amount || 0,
                                )}
                                details={[
                                    {
                                        label: 'Depositor',
                                        value:
                                            account.holder?.name ??
                                            'Unassigned',
                                    },
                                    {
                                        label: 'Payment frequency',
                                        value: data.installment_frequency
                                            .replaceAll('_', ' ')
                                            .toLowerCase()
                                            .replace(/\b\w/g, (char) =>
                                                char.toUpperCase(),
                                            ),
                                    },
                                    {
                                        label: 'Total installments',
                                        value:
                                            data.total_installments ||
                                            'Not set',
                                    },
                                    {
                                        label: 'Start date',
                                        value: formatDate(data.started_at),
                                    },
                                    {
                                        label: 'Grace period',
                                        value: `${data.grace_days || '0'} days`,
                                    },
                                    {
                                        label: 'Maturity extension',
                                        value: `${data.maturity_extension_days || '0'} days`,
                                    },
                                    {
                                        label: 'Maturity date',
                                        value: formatDate(
                                            deposit?.maturity_date,
                                        ),
                                    },
                                    {
                                        label: 'Current balance',
                                        value: formatBDTCurrency(
                                            account.balance ?? 0,
                                        ),
                                    },
                                ]}
                            />
                        </aside>
                    </div>

                    {/* Save actions */}
                    <div className="border-t bg-background/95 py-3">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                                <FileText className="size-3.5" />
                                Protected fields cannot be changed here.
                            </p>

                            <div className="flex justify-end gap-2">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    <Link
                                        href={route(
                                            'financial-accounts.recurring.show',
                                            account.id,
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                            Saving changes...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            Save recurring details
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
