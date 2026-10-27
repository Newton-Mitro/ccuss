import HeadingSmall from '@/components/heading-small';
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
    ArrowLeftRight,
    ArrowRight,
    BadgeCheck,
    Banknote,
    Building2,
    Landmark,
    Pencil,
    ReceiptText,
} from 'lucide-react';
import { route } from 'ziggy-js';

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
            <div className="mx-auto w-full max-w-6xl space-y-5 pb-8">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <HeadingSmall
                            title="Treasury GL mapping"
                            description="Review how this Treasury transaction is posted to the general ledger."
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('treasury-gl-mappings.index')}>
                                <ArrowLeftRight className="size-4" />
                                All mappings
                            </Link>
                        </Button>
                        <Button asChild className="gap-2">
                            <Link
                                href={route(
                                    'treasury-gl-mappings.edit',
                                    mapping.id,
                                )}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <header className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/12 via-card to-card px-5 py-6 sm:px-7 sm:py-7">
                        <div className="pointer-events-none absolute -top-20 right-0 size-64 rounded-full bg-primary/5 blur-3xl" />
                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                                    <ReceiptText className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary uppercase">
                                            {mapping.source_type.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </span>
                                        <StatusBadge
                                            tone={
                                                mapping.status
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {mapping.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </StatusBadge>
                                    </div>
                                    <h2 className="mt-3 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {mapping.source_code}
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Treasury transaction mapping
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/70 px-3.5 py-3 sm:min-w-48">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <Banknote className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Transaction type
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-semibold">
                                        {mapping.transaction_type.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-5 sm:p-7">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Ledger posting
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Double-entry accounts for this transaction
                                </p>
                            </div>
                            <span className="hidden items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                                <BadgeCheck className="size-3.5" />
                                Balanced entry
                            </span>
                        </div>

                        <div className="grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
                            <AccountCard
                                label="Debit"
                                account={mapping.debit_account}
                                variant="debit"
                            />
                            <div className="flex items-center justify-center py-1 md:px-1">
                                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                                    <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                                </div>
                            </div>
                            <AccountCard
                                label="Credit"
                                account={mapping.credit_account}
                                variant="credit"
                            />
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/25 p-3.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                                    <Building2 className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Source category
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-medium">
                                        {mapping.source_type.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/25 p-3.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                                    <Landmark className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Source reference
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-medium">
                                        {mapping.source_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
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
        <div
            className={`flex min-w-0 items-center gap-4 rounded-2xl border p-4 sm:p-5 ${
                debit
                    ? 'border-sky-500/20 bg-linear-to-br from-sky-500/8 to-card'
                    : 'border-violet-500/20 bg-linear-to-br from-violet-500/8 to-card'
            }`}
        >
            <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                    debit
                        ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                        : 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                }`}
            >
                <Landmark className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p
                    className={`text-[11px] font-semibold tracking-wider uppercase ${
                        debit
                            ? 'text-sky-700 dark:text-sky-300'
                            : 'text-violet-700 dark:text-violet-300'
                    }`}
                >
                    {label} account
                </p>
                <p className="mt-1 truncate text-base font-semibold tracking-tight">
                    {account.name}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {account.code}
                </p>
            </div>
            <span
                className={`hidden rounded-md border px-2 py-1 text-[10px] font-bold tracking-wide uppercase sm:inline-flex ${
                    debit
                        ? 'border-sky-500/20 bg-sky-500/5 text-sky-700 dark:text-sky-300'
                        : 'border-violet-500/20 bg-violet-500/5 text-violet-700 dark:text-violet-300'
                }`}
            >
                {debit ? 'DR' : 'CR'}
            </span>
        </div>
    );
}
