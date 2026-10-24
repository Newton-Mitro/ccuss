import FinancialAccountActivation from '@/components/financial-account-activation';
import FinancialAccountPeopleManagement from '@/components/financial-account-people-management';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    Landmark,
    LockKeyhole,
    UserRound,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        balance: string | number;
        status: string;
        account_type?: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        fixed_deposit?: {
            principal_amount?: string | number;
            contractual_rate?: string | number;
            term_value?: number;
            term_unit?: string;
            started_at?: string;
            maturity_date?: string;
            maturity_amount?: string | number;
            maturity_instruction?: string;
        } | null;
    };
}

function SummaryMetric({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: typeof Wallet;
    label: string;
    value: string;
    description?: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight break-words tabular-nums sm:text-xl">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>
            </div>
        </div>
    );
}

function ContractDetail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof CalendarDays;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-background p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium break-words">
                    {value}
                </dd>
            </div>
        </div>
    );
}

function formatInstruction(value?: string) {
    if (!value) return 'Not specified';

    switch (value) {
        case 'PAYOUT':
            return 'Pay out at maturity';
        case 'RENEW_PRINCIPAL':
            return 'Renew principal only';
        case 'RENEW_PRINCIPAL_AND_INTEREST':
            return 'Renew principal and interest';
        default:
            return value.replaceAll('_', ' ');
    }
}

export default function FixedDepositAccountShow() {
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

    const deposit = account.fixed_deposit;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Fixed Deposits',
            href: route('financial-accounts.fixed.index'),
        },
        { title: account.account_no, href: '' },
    ];

    const maturityDate = deposit?.maturity_date;
    const startedAt = deposit?.started_at;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Fixed Deposit - ${account.account_no}`} />

            <div className="space-y-5 pb-6">
                <ResourcePageHeader variant="account"
                    title={account.account_no}
                    description={`${account.holder?.name ?? 'Unassigned'} · Fixed deposit contract`}
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            <FinancialAccountActivation
                                accountId={account.id}
                                status={account.status}
                            />
                            <Button asChild size="sm">
                                <Link
                                    href={route(
                                        'financial-accounts.fixed.edit',
                                        account.id,
                                    )}
                                >
                                    Edit account
                                    <ArrowUpRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </div>
                    }
                />

                {/* Account overview */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Landmark className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Fixed deposit account
                                </p>
                                <h2 className="mt-0.5 truncate text-base font-semibold">
                                    {account.product?.name ?? 'Fixed Deposit'}
                                </h2>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    Account No. {account.account_no}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                tone={
                                    account.status === 'ACTIVE'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {account.status}
                            </StatusBadge>
                            <StatusBadge tone="neutral">
                                {account.account_type ?? 'FIXED_DEPOSIT'}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="grid gap-x-6 gap-y-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        <div className="flex items-start gap-3">
                            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Depositor
                                </p>
                                <p className="mt-1 text-sm font-medium break-words">
                                    {account.holder?.name ?? 'Unassigned'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Wallet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Current account balance
                                </p>
                                <p className="mt-1 text-sm font-semibold break-words tabular-nums">
                                    {formatBDTCurrency(account.balance, false)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Account reference
                                </p>
                                <p className="mt-1 text-sm font-medium break-all">
                                    {account.account_no}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Financial summary */}
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryMetric
                        icon={CircleDollarSign}
                        label="Principal amount"
                        value={formatBDTCurrency(
                            deposit?.principal_amount ?? 0,
                            false,
                        )}
                        description="Contracted deposit principal"
                    />
                    <SummaryMetric
                        icon={ArrowUpRight}
                        label="Contractual annual rate"
                        value={`${deposit?.contractual_rate ?? '0'}%`}
                        description="Annual interest rate"
                    />
                    <SummaryMetric
                        icon={Wallet}
                        label="Maturity amount"
                        value={formatBDTCurrency(
                            deposit?.maturity_amount ?? 0,
                            false,
                        )}
                        description="Projected or recorded maturity value"
                    />
                </section>

                {/* Contract details */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-center gap-3 border-b p-4 sm:p-5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-4" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Term contract</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Contract duration, dates, and maturity
                                instructions
                            </p>
                        </div>
                    </div>

                    <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        <ContractDetail
                            icon={CalendarClock}
                            label="Tenure"
                            value={
                                deposit?.term_value != null
                                    ? `${deposit.term_value} ${deposit.term_unit?.toLowerCase() ?? ''}${deposit.term_value === 1 ? '' : ''}`.trim()
                                    : 'Not specified'
                            }
                        />

                        <ContractDetail
                            icon={CalendarDays}
                            label="Start date"
                            value={
                                startedAt
                                    ? formatDate(startedAt)
                                    : 'Not specified'
                            }
                        />

                        <ContractDetail
                            icon={CalendarDays}
                            label="Maturity date"
                            value={
                                maturityDate
                                    ? formatDate(maturityDate)
                                    : 'Not specified'
                            }
                        />

                        <ContractDetail
                            icon={CheckCircle2}
                            label="Maturity instruction"
                            value={formatInstruction(
                                deposit?.maturity_instruction,
                            )}
                        />

                        <ContractDetail
                            icon={Wallet}
                            label="Principal amount"
                            value={formatBDTCurrency(
                                deposit?.principal_amount ?? 0,
                                false,
                            )}
                        />

                        <ContractDetail
                            icon={CircleDollarSign}
                            label="Annual interest rate"
                            value={`${deposit?.contractual_rate ?? '0'}%`}
                        />
                    </dl>

                    <div className="border-t bg-muted/20 p-4 sm:px-5">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Maturity value and maturity dates are based on
                                the account data returned by the system. Verify
                                the contract and applicable interest rules
                                before processing maturity instructions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Depositor and nominee management */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <UserRound className="size-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">
                            Account relationships
                        </h2>
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
