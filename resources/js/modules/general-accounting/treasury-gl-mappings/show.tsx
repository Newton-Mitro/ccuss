import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type {
    Account,
    Mapping,
} from '@/modules/general-accounting/types/treasury-gl-mappings/show.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    ArrowRight,
    BadgeCheck,
    Banknote,
    Building2,
    CheckCircle2,
    Landmark,
    Pencil,
    ReceiptText,
    ShieldCheck,
} from 'lucide-react';
import { route } from 'ziggy-js';

const formatLabel = (value: string) => value.replaceAll('_', ' ');

export default function TreasuryGlMappingShow({
    mapping,
}: {
    mapping: Mapping;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        {
            title: 'Treasury GL Mappings',
            href: route('treasury-gl-mappings.index'),
        },
        { title: mapping.source_code, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Treasury GL Mapping ${mapping.source_code}`} />

            <div className="w-full min-w-0 space-y-5 pb-8 text-foreground">
                {/* Page header */}
                <header className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <ArrowLeftRight className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                                    Treasury GL Mapping
                                </h1>

                                <StatusBadge
                                    tone={mapping.status ? 'success' : 'danger'}
                                >
                                    {mapping.status ? 'Active' : 'Inactive'}
                                </StatusBadge>
                            </div>

                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                Review the transaction source and the ledger
                                accounts used for posting.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            <Link href={route('treasury-gl-mappings.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                All mappings
                            </Link>
                        </Button>

                        <Button asChild className="w-full gap-2 sm:w-auto">
                            <Link
                                href={route(
                                    'treasury-gl-mappings.edit',
                                    mapping.id,
                                )}
                            >
                                <Pencil className="size-4" />
                                Edit mapping
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Mapping overview */}
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-6">
                        <div className="pointer-events-none absolute -top-20 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm sm:size-14">
                                    <ReceiptText className="size-6" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
                                            {formatLabel(mapping.source_type)}
                                        </span>

                                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                                            <ShieldCheck className="size-3" />
                                            GL configuration
                                        </span>
                                    </div>

                                    <h2 className="mt-3 text-xl font-semibold tracking-tight break-words sm:text-2xl">
                                        {mapping.source_code}
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Treasury transaction mapping
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                                <SummaryTile
                                    icon={Banknote}
                                    label="Transaction type"
                                    value={formatLabel(
                                        mapping.transaction_type,
                                    )}
                                />

                                <SummaryTile
                                    icon={Building2}
                                    label="Source category"
                                    value={formatLabel(mapping.source_type)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ledger posting */}
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Ledger posting
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Debit and credit accounts assigned to this
                                    transaction.
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                <BadgeCheck className="size-3.5 text-primary" />
                                Double-entry mapping
                            </div>
                        </div>

                        <div className="grid min-w-0 items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
                            <AccountCard
                                label="Debit account"
                                account={mapping.debit_account}
                                variant="debit"
                            />

                            <div className="flex items-center justify-center py-1 md:px-1">
                                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                                    <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                                </div>
                            </div>

                            <AccountCard
                                label="Credit account"
                                account={mapping.credit_account}
                                variant="credit"
                            />
                        </div>

                        <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailTile
                                icon={Building2}
                                label="Source category"
                                value={formatLabel(mapping.source_type)}
                            />

                            <DetailTile
                                icon={ReceiptText}
                                label="Source reference"
                                value={mapping.source_code}
                            />

                            <DetailTile
                                icon={Banknote}
                                label="Transaction type"
                                value={formatLabel(mapping.transaction_type)}
                            />
                        </div>
                    </div>
                </section>

                {/* Status and guidance */}
                <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                    <section className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {mapping.status ? (
                                <CheckCircle2 className="size-5" />
                            ) : (
                                <ShieldCheck className="size-5" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold">
                                    Mapping status
                                </h3>
                                <StatusBadge
                                    tone={mapping.status ? 'success' : 'danger'}
                                >
                                    {mapping.status ? 'Active' : 'Inactive'}
                                </StatusBadge>
                            </div>

                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                {mapping.status
                                    ? 'This mapping is marked active and is configured for use according to your transaction posting rules.'
                                    : 'This mapping is marked inactive. Review its status before relying on it for transaction posting.'}
                            </p>
                        </div>
                    </section>

                    <section className="flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                            <Landmark className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold">
                                Accounting review
                            </h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                Confirm that the debit and credit accounts match
                                the intended transaction flow and that any
                                Treasury cash-control requirements are
                                satisfied.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

function SummaryTile({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Banknote;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-background/70 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-1 text-sm font-semibold break-words">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

function DetailTile({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Banknote;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 text-sm font-medium break-words">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

function AccountCard({
    label,
    account,
    variant,
}: {
    label: string;
    account: Account;
    variant: 'debit' | 'credit';
}) {
    const debit = variant === 'debit';

    return (
        <section className="flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:p-5">
            <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                    debit
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-border bg-muted text-foreground'
                }`}
            >
                <Landmark className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        {label}
                    </p>

                    <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground">
                        {debit ? 'DR' : 'CR'}
                    </span>
                </div>

                <p className="mt-2 text-base font-semibold tracking-tight break-words">
                    {account.name}
                </p>

                <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1">
                    <span className="text-[10px] text-muted-foreground">
                        Account code
                    </span>
                    <span className="font-mono text-xs font-semibold break-all">
                        {account.code}
                    </span>
                </div>
            </div>
        </section>
    );
}
