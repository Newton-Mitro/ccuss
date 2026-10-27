import FinancialAccountActivation from '@/modules/financial-services/components/financial-account-activation';
import FinancialAccountPeopleManagement from '@/modules/financial-services/components/financial-account-people-management';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    CreditCard,
    Landmark,
    Pencil,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/financial-services/types/accounts/savings/show.interfaces';


export default function SavingsAccountShow() {
    useFlashToastHandler();

    const { account, customers } = usePage<
        Props & {
            customers: Array<{
                id: number;
                customer_no: string;
                name: string;
            }>;
        }
    >().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Savings Accounts',
            href: route('financial-accounts.savings.index'),
        },
        { title: account.account_no, href: '' },
    ];

    const metrics = [
        {
            label: 'Current balance',
            value: formatBDTCurrency(account.balance, false),
            description: 'Total account balance',
            icon: Wallet,
            emphasis: true,
        },
        {
            label: 'Available balance',
            value: formatBDTCurrency(account.available_balance, false),
            description: 'Available for transactions',
            icon: CircleDollarSign,
        },
        {
            label: 'Minimum balance',
            value: formatBDTCurrency(
                account.saving_account?.minimum_balance ?? 0,
                false,
            ),
            description: 'Required account minimum',
            icon: ShieldCheck,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Savings Account ${account.account_no}`} />

            <div className="w-full max-w-screen space-y-5 pb-6">
                <ResourcePageHeader variant="account"
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned account'} · ${account.product?.name ?? 'Savings account'}`}
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            <FinancialAccountActivation
                                accountId={account.id}
                                status={account.status}
                            />

                            <Button variant="outline" asChild>
                                <Link
                                    href={route(
                                        'financial-accounts.savings.index',
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
                                        'financial-accounts.savings.edit',
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

                {/* Account overview */}
                <section
                    aria-label="Account overview"
                    className="overflow-hidden rounded-xl border bg-card"
                >
                    <div className="flex flex-col gap-4 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                <Landmark className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                    Savings account overview
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Account details and financial summary
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start rounded-lg border bg-background px-3 py-2 sm:self-center">
                            <span
                                className={`size-2 rounded-full ${
                                    account.status === 'ACTIVE'
                                        ? 'bg-emerald-500'
                                        : 'bg-muted-foreground/50'
                                }`}
                            />
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

                    <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;

                            return (
                                <div
                                    key={metric.label}
                                    className="group flex min-w-0 items-start gap-3 p-4 transition-colors hover:bg-muted/20 sm:p-5"
                                >
                                    <div
                                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${
                                            metric.emphasis
                                                ? 'border-primary/15 bg-primary/5 text-primary'
                                                : 'bg-muted/40 text-muted-foreground'
                                        }`}
                                    >
                                        <Icon className="size-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {metric.label}
                                        </p>
                                        <p className="mt-1 text-lg font-semibold tracking-tight break-words tabular-nums sm:text-xl">
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

                {/* Account details */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                            <CreditCard className="size-4" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Account details
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Savings product and account information
                            </p>
                        </div>
                    </div>

                    <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="border-b px-4 py-4 sm:px-5">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Wallet className="size-3.5" />
                                Account number
                            </dt>
                            <dd className="mt-1.5 text-sm font-semibold break-all">
                                {account.account_no}
                            </dd>
                        </div>

                        <div className="border-b px-4 py-4 sm:px-5">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <CreditCard className="size-3.5" />
                                Account holder
                            </dt>
                            <dd className="mt-1.5 text-sm font-medium break-words">
                                {account.holder?.name ?? 'Not assigned'}
                            </dd>
                        </div>

                        <div className="border-b px-4 py-4 sm:px-5">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Landmark className="size-3.5" />
                                Savings product
                            </dt>
                            <dd className="mt-1.5 text-sm font-medium break-words">
                                {account.product?.name ?? 'Not specified'}
                            </dd>
                        </div>

                        <div className="border-b px-4 py-4 sm:px-5 lg:border-b-0">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <CalendarDays className="size-3.5" />
                                Opening date
                            </dt>
                            <dd className="mt-1.5 text-sm font-medium">
                                {account.opened_at
                                    ? formatDate(account.opened_at)
                                    : 'Not recorded'}
                            </dd>
                        </div>

                        <div className="border-b px-4 py-4 sm:border-b-0 sm:px-5">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <ShieldCheck className="size-3.5" />
                                Account status
                            </dt>
                            <dd className="mt-2">
                                <StatusBadge
                                    tone={
                                        account.status === 'ACTIVE'
                                            ? 'success'
                                            : 'neutral'
                                    }
                                >
                                    {account.status}
                                </StatusBadge>
                            </dd>
                        </div>

                        <div className="px-4 py-4 sm:px-5">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <ArrowDownToLine className="size-3.5" />
                                Minimum required balance
                            </dt>
                            <dd className="mt-1.5 text-sm font-semibold tabular-nums">
                                {formatBDTCurrency(
                                    account.saving_account?.minimum_balance ??
                                        0,
                                    false,
                                )}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Account holders, nominees and related people */}
                <section className="space-y-3">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Account relationships
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Manage account holders, nominees and associated
                            customer information.
                        </p>
                    </div>

                    <FinancialAccountPeopleManagement
                        account={account}
                        customers={customers}
                        nomineesEnabled
                    />
                </section>
            </div>
        </CustomAuthLayout>
    );
}
