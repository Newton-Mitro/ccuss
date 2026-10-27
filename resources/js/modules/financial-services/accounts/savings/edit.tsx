import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Check,
    CircleDollarSign,
    CreditCard,
    FileText,
    Landmark,
    LoaderCircle,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/financial-services/types/accounts/savings/edit.interfaces';


function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Wallet;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                <Icon className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
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

    const productName =
        [account.product?.code, account.product?.name]
            .filter(Boolean)
            .join(' - ') || '-';

    const minimumBalance = account.saving_account?.minimum_balance ?? 0;

    const accountStatus = account.status ?? 'Not specified';

    const statusStyles: Record<string, string> = {
        ACTIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        PENDING:
            'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        DORMANT:
            'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
        FROZEN: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
        CLOSED: 'border-muted-foreground/20 bg-muted text-muted-foreground',
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route('financial-accounts.savings.update', account.id));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />

            <div className="w-full max-w-5xl space-y-6 pb-24">
                <ResourcePageHeader variant="account"
                    title="Edit savings account"
                    description="Review account information and update its display name or minimum-balance requirement."
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
                                        SAVINGS ACCOUNT
                                    </span>
                                </div>

                                <p className="truncate text-sm text-muted-foreground">
                                    {account.holder?.name ?? 'Account holder'}
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
                            <CircleDollarSign className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                    Minimum balance
                                </p>
                                <p className="truncate text-sm font-medium tabular-nums">
                                    {formatBDTCurrency(minimumBalance)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t px-4 py-3 sm:border-t-0 sm:border-r">
                            <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                    Account status
                                </p>
                                <span
                                    className={`mt-0.5 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                                        statusStyles[
                                            accountStatus.toUpperCase()
                                        ] ??
                                        'border-muted-foreground/20 bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {accountStatus}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t px-4 py-3 sm:border-t-0">
                            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                    Account type
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {account.account_type ?? 'SAVINGS'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="space-y-5">
                    {/* Protected information */}
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
                                label="Savings product"
                                value={productName}
                                icon={Landmark}
                            />

                            <ReadOnlyField
                                label="Account holder"
                                value={account.holder?.name ?? '-'}
                                icon={UserRound}
                            />

                            <ReadOnlyField
                                label="Account type"
                                value={account.account_type ?? 'SAVINGS'}
                                icon={Wallet}
                            />

                            <ReadOnlyField
                                label="Current balance"
                                value={formatBDTCurrency(account.balance)}
                                icon={CircleDollarSign}
                            />

                            <ReadOnlyField
                                label="Account status"
                                value={accountStatus}
                                icon={BadgeCheck}
                            />
                        </div>
                    </section>

                    {/* Editable details */}
                    <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
                        <SectionHeading
                            icon={FileText}
                            title="Account settings"
                            description="Update the account display name and the minimum balance requirement."
                        />

                        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="account-name">
                                    Account display name
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <div className="relative">
                                    <FileText className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="account-name"
                                        className="pl-9"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Enter account display name"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                </div>

                                <InputError message={errors.name} />

                                <p className="text-xs text-muted-foreground">
                                    A recognizable name for account listings and
                                    related screens.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minimum-balance">
                                    Minimum balance
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <div className="relative">
                                    <CircleDollarSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="minimum-balance"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        className="pl-9 tabular-nums"
                                        value={data.minimum_balance}
                                        onChange={(event) =>
                                            setData(
                                                'minimum_balance',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        aria-invalid={Boolean(
                                            errors.minimum_balance,
                                        )}
                                    />
                                </div>

                                <InputError message={errors.minimum_balance} />

                                <p className="text-xs text-muted-foreground">
                                    The minimum balance requirement configured
                                    for this account.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] p-3.5">
                            <InfoIcon />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Changes to the minimum balance should follow
                                your institution's savings-account policies. The
                                current account balance is displayed for
                                reference and is not editable here.
                            </p>
                        </div>
                    </section>

                    {/* Sticky actions */}
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
                                        'financial-accounts.savings.show',
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
                                {!processing && (
                                    <ArrowRight className="ml-2 size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

function InfoIcon() {
    return (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
        </div>
    );
}
