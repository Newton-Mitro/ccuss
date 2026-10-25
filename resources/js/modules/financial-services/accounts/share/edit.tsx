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
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    Check,
    CircleUserRound,
    CreditCard,
    FileText,
    Hash,
    LoaderCircle,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
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

const membershipStatuses = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'CLOSED', label: 'Closed' },
];

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof ShieldCheck;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
                <h2 className="text-sm font-semibold tracking-tight">
                    {title}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ReadOnlyField({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof CreditCard;
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
                {label}
            </Label>
            <div className="flex min-h-10 items-center gap-2 rounded-md border bg-muted/30 px-3">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium">{value}</span>
            </div>
        </div>
    );
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

    const productName =
        [account.product?.code, account.product?.name]
            .filter(Boolean)
            .join(' - ') || '-';

    const membershipNumber =
        account.share_account?.membership_no || 'Not assigned';

    const statusStyles: Record<string, string> = {
        ACTIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        PENDING:
            'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        SUSPENDED:
            'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
        CLOSED: 'border-muted-foreground/20 bg-muted text-muted-foreground',
    };

    const membershipStatus =
        account.share_account?.membership_status ?? 'PENDING';

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const url = route('financial-accounts.share.update', account.id);

        if (canManageProductDetails) {
            put(url);
        } else {
            transform((formData) => ({
                name: formData.name,
            })).put(url);
        }
    }

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />

            <div className="w-full max-w-5xl space-y-6 pb-24">
                <ResourcePageHeader variant="account"
                    title="Edit share account"
                    description="Update the account display name and manage membership information."
                />

                {/* Account summary */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                                <Wallet className="size-6 text-muted-foreground" />
                            </div>

                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="truncate text-base font-semibold tracking-tight">
                                        {account.account_no}
                                    </h2>
                                    <span className="rounded-md border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
                                        SHARE ACCOUNT
                                    </span>
                                </div>

                                <p className="truncate text-sm text-muted-foreground">
                                    {account.holder?.name ?? 'Member'}
                                    <span className="mx-1.5">·</span>
                                    {productName}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 sm:items-end">
                            <span className="text-xs text-muted-foreground">
                                Current balance
                            </span>
                            <span className="text-xl font-semibold tracking-tight tabular-nums">
                                {formatBDTCurrency(account.balance)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 border-t bg-muted/20 sm:grid-cols-3">
                        <div className="flex items-center gap-3 px-4 py-3 sm:border-r">
                            <CircleUserRound className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                    Membership number
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {membershipNumber}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t px-4 py-3 sm:border-t-0 sm:border-r">
                            <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                    Membership status
                                </p>
                                <span
                                    className={`mt-0.5 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                                        statusStyles[membershipStatus] ??
                                        statusStyles.PENDING
                                    }`}
                                >
                                    {membershipStatus}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t px-4 py-3 sm:border-t-0">
                            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                    Account status
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {account.status ?? 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Protected account information */}
                    <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
                        <SectionHeading
                            icon={ShieldCheck}
                            title="Account information"
                            description="These details are read-only and cannot be changed from this form."
                        />

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <ReadOnlyField
                                label="Account number"
                                value={account.account_no}
                                icon={CreditCard}
                            />
                            <ReadOnlyField
                                label="Financial product"
                                value={productName}
                                icon={FileText}
                            />
                            <ReadOnlyField
                                label="Account holder"
                                value={account.holder?.name ?? '-'}
                                icon={CircleUserRound}
                            />
                            <ReadOnlyField
                                label="Account type"
                                value={account.account_type ?? 'SHARE'}
                                icon={Wallet}
                            />
                            <ReadOnlyField
                                label="Current balance"
                                value={formatBDTCurrency(account.balance)}
                                icon={CreditCard}
                            />
                            <ReadOnlyField
                                label="Account status"
                                value={account.status ?? '-'}
                                icon={BadgeCheck}
                            />
                        </div>
                    </section>

                    {/* Editable account details */}
                    <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
                        <SectionHeading
                            icon={FileText}
                            title="Account display details"
                            description="Choose a meaningful name to help identify this account throughout the system."
                        />

                        <div className="space-y-2">
                            <Label htmlFor="account-name">
                                Account display name
                            </Label>
                            <Input
                                id="account-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Enter account display name"
                                aria-invalid={Boolean(errors.name)}
                            />
                            <InputError message={errors.name} />
                            <p className="text-xs text-muted-foreground">
                                This name is used to identify the account in
                                account listings and related screens.
                            </p>
                        </div>
                    </section>

                    {/* Membership details */}
                    <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <SectionHeading
                                icon={CircleUserRound}
                                title="Membership details"
                                description="Manage the member's registration information and current membership status."
                            />

                            <span
                                className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    canManageProductDetails
                                        ? 'border-primary/20 bg-primary/5 text-primary'
                                        : 'border-muted bg-muted text-muted-foreground'
                                }`}
                            >
                                {canManageProductDetails ? (
                                    <Check className="size-3.5" />
                                ) : (
                                    <ShieldCheck className="size-3.5" />
                                )}
                                {canManageProductDetails
                                    ? 'Editable'
                                    : 'Read-only'}
                            </span>
                        </div>

                        {canManageProductDetails ? (
                            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="membership-no">
                                        Membership number
                                    </Label>
                                    <div className="relative">
                                        <Hash className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="membership-no"
                                            className="pl-9"
                                            value={data.membership_no}
                                            onChange={(event) =>
                                                setData(
                                                    'membership_no',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Enter membership number"
                                            aria-invalid={Boolean(
                                                errors.membership_no,
                                            )}
                                        />
                                    </div>
                                    <InputError
                                        message={errors.membership_no}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="member-since">
                                        Member since
                                    </Label>
                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <div className="[&_button]:pl-9 [&>*]:w-full">
                                            <AppDatePicker
                                                value={data.member_since}
                                                onChange={(value) =>
                                                    setData(
                                                        'member_since',
                                                        value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <InputError message={errors.member_since} />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="membership-status">
                                        Membership status
                                    </Label>
                                    <Select
                                        value={data.membership_status}
                                        onChange={(value) =>
                                            setData('membership_status', value)
                                        }
                                        options={membershipStatuses}
                                    />
                                    <InputError
                                        message={errors.membership_status}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Changing membership status may affect
                                        how this membership is treated in
                                        operational workflows.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 p-4">
                                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Membership management permission
                                        required
                                    </p>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        You can update the account display name,
                                        but membership number, member since
                                        date, and membership status require
                                        membership-management permission.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Sticky form actions */}
                    <div className="sticky bottom-0 z-20 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                disabled={processing}
                            >
                                <Link
                                    href={route(
                                        'financial-accounts.share.show',
                                        account.id,
                                    )}
                                >
                                    <ArrowLeft className="mr-2 size-4" />
                                    Cancel
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing ? (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 size-4" />
                                )}
                                {processing
                                    ? 'Saving changes...'
                                    : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
