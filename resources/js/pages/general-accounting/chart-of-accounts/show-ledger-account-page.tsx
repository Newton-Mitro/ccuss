import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    Check,
    CircleHelp,
    FileText,
    FolderTree,
    Landmark,
    PencilLine,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface RelatedLedger {
    id: number;
    code?: string | null;
    name?: string | null;
}

interface RelatedGroup {
    id: number;
    code?: string | null;
    name?: string | null;
}

interface Ledger {
    id: number;
    code?: string | null;
    name?: string | null;
    type?: string | null;
    account_type?: string | null;
    normal_balance?: string | null;
    account_group_id?: number | null;
    parent_id?: number | null;
    status?: boolean | null;
    is_active?: boolean | null;
    is_group?: boolean | null;
    is_control_account?: boolean | null;
    is_reconcilable?: boolean | null;
    is_cash_account?: boolean | null;
    is_system?: boolean | null;
    subledger_type?: string | null;
    subledger_sub_type?: string | null;
    description?: string | null;
    group?: RelatedGroup | null;
    parent?: RelatedLedger | null;
    children?: RelatedLedger[];
}

interface Props {
    ledger: Ledger;
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-foreground">
                {value || '—'}
            </dd>
        </div>
    );
}

export default function Show({ ledger }: Props) {
    const type = ledger.type ?? ledger.account_type ?? 'Unclassified';
    const isActive = ledger.status ?? ledger.is_active ?? false;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: ledger.code ?? 'Ledger Account', href: '' },
    ];

    const settings = [
        { label: 'Control account', enabled: Boolean(ledger.is_control_account) },
        { label: 'Reconcilable', enabled: Boolean(ledger.is_reconcilable) },
        { label: 'Cash account', enabled: Boolean(ledger.is_cash_account) },
        { label: 'System account', enabled: Boolean(ledger.is_system) },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${ledger.code ?? 'Ledger Account'} · ${ledger.name ?? 'Details'}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title="Ledger Account"
                    description="Review account identity, classification, and hierarchy."
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={route('ledger-accounts.index')}>
                                    <ArrowLeft className="mr-2 size-4" />
                                    All accounts
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link
                                    href={route(
                                        'ledger-accounts.edit',
                                        ledger.id,
                                    )}
                                >
                                    <PencilLine className="mr-2 size-4" />
                                    Edit account
                                </Link>
                            </Button>
                        </div>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Landmark className="size-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Ledger account
                                </p>
                                <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
                                    {ledger.name || 'Unnamed account'}
                                </h2>
                                <p className="mt-1 font-mono text-sm text-muted-foreground">
                                    {ledger.code || 'No account code'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone="info">{type}</StatusBadge>
                            <StatusBadge
                                tone={isActive ? 'success' : 'neutral'}
                            >
                                {isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="grid gap-px bg-border sm:grid-cols-3">
                        {[
                            {
                                label: 'Account type',
                                value: type,
                                icon: FileText,
                            },
                            {
                                label: 'Normal balance',
                                value: ledger.normal_balance ?? 'Not specified',
                                icon:
                                    ledger.normal_balance === 'CREDIT'
                                        ? ArrowUpRight
                                        : ArrowDownLeft,
                            },
                            {
                                label: 'Account structure',
                                value: ledger.is_group
                                    ? 'Group account'
                                    : 'Ledger account',
                                icon: FolderTree,
                            },
                        ].map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 bg-card px-5 py-4"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                                    <Icon className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 truncate text-sm font-semibold">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Account details
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Core account configuration.
                                    </p>
                                </div>
                            </div>
                            <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                                <DetailItem
                                    label="Account code"
                                    value={ledger.code ?? '—'}
                                />
                                <DetailItem
                                    label="Account name"
                                    value={ledger.name ?? '—'}
                                />
                                <DetailItem label="Type" value={type} />
                                <DetailItem
                                    label="Normal balance"
                                    value={ledger.normal_balance ?? '—'}
                                />
                                <DetailItem
                                    label="Subledger type"
                                    value={ledger.subledger_type ?? 'None'}
                                />
                                <DetailItem
                                    label="Subledger subtype"
                                    value={ledger.subledger_sub_type ?? 'None'}
                                />
                            </dl>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FolderTree className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Account hierarchy
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Where this account sits in the chart.
                                    </p>
                                </div>
                            </div>
                            <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                                <DetailItem
                                    label="Account group"
                                    value={
                                        ledger.group
                                            ? `${ledger.group.code ?? ''} ${ledger.group.name ?? ''}`.trim()
                                            : 'No group assigned'
                                    }
                                />
                                <DetailItem
                                    label="Parent account"
                                    value={
                                        ledger.parent
                                            ? `${ledger.parent.code ?? ''} ${ledger.parent.name ?? ''}`.trim()
                                            : 'Top-level account'
                                    }
                                />
                                <DetailItem
                                    label="Child accounts"
                                    value={ledger.children?.length ?? 0}
                                />
                                <DetailItem
                                    label="Account structure"
                                    value={
                                        ledger.is_group
                                            ? 'Group account'
                                            : 'Leaf account'
                                    }
                                />
                            </dl>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <ShieldCheck className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Account settings
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Features enabled for this account.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                                {settings.map(({ label, enabled }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3"
                                    >
                                        <span className="text-sm font-medium">
                                            {label}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                                enabled
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {enabled ? (
                                                <Check className="size-3.5" />
                                            ) : null}
                                            {enabled ? 'Enabled' : 'Off'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Hierarchy summary
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Account relationships
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        Parent
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {ledger.parent?.name ?? 'Top-level'}
                                    </p>
                                    {ledger.parent?.code && (
                                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                            {ledger.parent.code}
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl border border-border/70 bg-background/70 p-3.5">
                                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        Child accounts
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                                        {ledger.children?.length ?? 0}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-2.5">
                                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <h3 className="text-xs font-semibold">
                                        Description
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        {ledger.description ||
                                            'No description has been added for this account.'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
