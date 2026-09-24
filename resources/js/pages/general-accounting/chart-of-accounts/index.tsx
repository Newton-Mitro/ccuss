import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import type { GeneralLedgerAccountsPageProps } from '@/types/general-accounting';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    FolderTree,
    Landmark,
    Pencil,
    Plus,
    ScanEye,
    ShieldAlert,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { TYPE_COLORS } from './utils';

const ledgerTypeIcons: Record<string, any> = {
    ASSET: Landmark,
    LIABILITY: Wallet,
    EQUITY: BriefcaseBusiness,
    INCOME: TrendingUp,
    EXPENSE: TrendingDown,
};

interface AccountGroupTreeItem {
    id: number;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    status: boolean;
    parent_id?: number | null;
    level: number;
    children_count: number;
    accounts_count: number;
}

export default function GlAccountsIndex() {
    const { glAccounts, accountGroups, filters } =
        usePage<GeneralLedgerAccountsPageProps>().props;
    const accountRows = useMemo(() => glAccounts?.data ?? [], [glAccounts]);
    const groups = useMemo(
        () =>
            Array.isArray(accountGroups)
                ? accountGroups
                : (accountGroups?.data ?? []),
        [accountGroups],
    );

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 50,
        page: Number(filters.page) || 1,
    });

    useFlashToastHandler();

    const accountsByGroup = useMemo(() => {
        const map = new Map<number, any[]>();

        accountRows.forEach((account) => {
            if (!account.account_group_id) return;
            const bucket = map.get(account.account_group_id) ?? [];
            bucket.push(account);
            map.set(account.account_group_id, bucket);
        });

        return map;
    }, [accountRows]);

    const childrenByParent = useMemo(
        () =>
            groups.reduce<Record<string, AccountGroupTreeItem[]>>(
                (result, group) => {
                    const key = String(group.parent_id ?? 'root');
                    result[key] ??= [];
                    result[key].push(group);
                    return result;
                },
                {},
            ),
        [groups],
    );

    const rootGroups = childrenByParent.root ?? [];
    const [expanded, setExpanded] = useState<number[]>([]);
    const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('ledger-accounts.index'), {
                preserveScroll: true,
                preserveState: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.page, data.per_page, data.search, get]);

    const toggle = (id: number) => {
        setExpanded((current) =>
            current.includes(id)
                ? current.filter((groupId) => groupId !== id)
                : [...current, id],
        );
    };

    const expandAll = () => {
        if (groups.length === 0) return;
        setExpanded(groups.map((group) => group.id));
    };

    const collapseAll = () => {
        setExpanded([]);
    };

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `"${name}" will be permanently deleted`,
                icon: 'warning',
                showCancelButton: true,
            })
            .then((res) => {
                if (!res.isConfirmed) return;

                router.delete(route('ledger-accounts.destroy', id), {
                    preserveScroll: true,
                });
            });
    };

    const handleGroupDrop = (targetGroupId: number, sourceGroupId: number) => {
        if (targetGroupId === sourceGroupId) return;

        const sourceGroup = groups.find((group) => group.id === sourceGroupId);
        if (!sourceGroup) return;

        router.put(
            route('account-groups.reorder', sourceGroupId),
            {
                parent_id: targetGroupId,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleAccountDrop = (
        sourceAccountId: number,
        targetGroupId?: number,
        targetParentId?: number | null,
    ) => {
        const sourceAccount = accountRows.find(
            (account) => account.id === sourceAccountId,
        );
        if (!sourceAccount) return;

        const payload: Record<string, any> = {
            account_group_id: targetGroupId ?? sourceAccount.account_group_id,
            parent_id: targetParentId ?? null,
        };

        if (
            payload.account_group_id === undefined ||
            payload.account_group_id === null
        ) {
            return;
        }

        router.put(route('ledger-accounts.reorder', sourceAccountId), payload, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearDragOverTarget = () => setDragOverTarget(null);

    const renderAccountRow = (account: any) => {
        const TypeIcon = ledgerTypeIcons[account.type] ?? Landmark;
        const isControl = !!account.is_control_account;

        return (
            <div
                key={account.id}
                draggable
                onDragStart={(event) => {
                    event.dataTransfer.setData(
                        'application/x-coa-type',
                        'account',
                    );
                    event.dataTransfer.setData(
                        'application/x-coa-id',
                        String(account.id),
                    );
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    clearDragOverTarget();
                    const sourceType = event.dataTransfer.getData(
                        'application/x-coa-type',
                    );
                    const sourceId = Number(
                        event.dataTransfer.getData('application/x-coa-id'),
                    );

                    if (sourceType === 'account' && sourceId !== account.id) {
                        handleAccountDrop(
                            sourceId,
                            account.account_group_id,
                            account.id,
                        );
                    }

                    if (sourceType === 'group') {
                        const sourceGroupId = Number(
                            event.dataTransfer.getData('application/x-coa-id'),
                        );
                        handleGroupDrop(
                            account.account_group_id,
                            sourceGroupId,
                        );
                    }
                }}
                className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                    isControl
                        ? 'border-amber-300 bg-amber-50/60 dark:bg-amber-950/20'
                        : 'border-border bg-muted/20'
                }`}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <TypeIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                        {account.code}
                    </span>
                    <span className="truncate text-sm font-medium">
                        {account.name}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                            TYPE_COLORS[account.type] ??
                            'bg-secondary text-secondary-foreground'
                        }`}
                    >
                        <TypeIcon className="h-2.5 w-2.5" />
                        {account.type}
                    </span>
                    {isControl && (
                        <span className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-800 uppercase dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                            <ShieldAlert className="h-2.5 w-2.5" />
                            Control
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Link
                        href={route('ledger-accounts.show', account.id)}
                        className="text-info"
                        aria-label={`View ${account.code} ${account.name}`}
                        title="View account"
                    >
                        <ScanEye className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('ledger-accounts.edit', account.id)}
                        className="text-warning"
                        aria-label={`Edit ${account.code} ${account.name}`}
                        title="Edit account"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(account.id, account.name)}
                        className="text-destructive"
                        aria-label={`Delete ${account.code} ${account.name}`}
                        title="Delete account"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    const renderGroup = (
        group: AccountGroupTreeItem,
        depth = 0,
    ): React.ReactNode => {
        const children = childrenByParent[String(group.id)] ?? [];
        const isExpanded = expanded.includes(group.id);
        const groupAccounts = accountsByGroup.get(group.id) ?? [];
        const hasTreeContent = children.length > 0 || groupAccounts.length > 0;
        const targetKey = `group-${group.id}`;

        return (
            <div
                key={group.id}
                className={`rounded-md transition-colors ${
                    dragOverTarget === targetKey
                        ? 'bg-primary/5 ring-2 ring-primary/40'
                        : ''
                }`}
                onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setDragOverTarget(targetKey);
                }}
                onDragLeave={(event) => {
                    if (
                        !event.currentTarget.contains(
                            event.relatedTarget as Node,
                        )
                    ) {
                        clearDragOverTarget();
                    }
                }}
            >
                <div
                    draggable
                    onDragStart={(event) => {
                        event.dataTransfer.setData(
                            'application/x-coa-type',
                            'group',
                        );
                        event.dataTransfer.setData(
                            'application/x-coa-id',
                            String(group.id),
                        );
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverTarget(targetKey);
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        clearDragOverTarget();
                        const sourceType = event.dataTransfer.getData(
                            'application/x-coa-type',
                        );
                        const sourceId = Number(
                            event.dataTransfer.getData('application/x-coa-id'),
                        );

                        if (sourceType === 'group' && sourceId !== group.id) {
                            handleGroupDrop(group.id, sourceId);
                        }

                        if (sourceType === 'account') {
                            handleAccountDrop(sourceId, group.id, null);
                        }
                    }}
                    className={`flex items-center gap-2 rounded-md border-b px-2 py-2 hover:bg-accent/20 ${
                        dragOverTarget === targetKey
                            ? 'bg-primary/10 ring-2 ring-primary/40 ring-inset'
                            : ''
                    }`}
                    onDragLeave={(event) => {
                        if (
                            !event.currentTarget.contains(
                                event.relatedTarget as Node,
                            )
                        ) {
                            clearDragOverTarget();
                        }
                    }}
                    style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
                >
                    <button
                        type="button"
                        className={`flex h-7 w-7 items-center justify-center rounded-md ${
                            hasTreeContent
                                ? 'bg-muted text-foreground'
                                : 'bg-muted/40 text-muted-foreground opacity-60'
                        }`}
                        onClick={() => hasTreeContent && toggle(group.id)}
                        aria-label={
                            isExpanded ? 'Collapse group' : 'Expand group'
                        }
                    >
                        {hasTreeContent ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FolderTree className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs">
                                {group.code}
                            </span>
                            <span className="font-medium">{group.name}</span>
                            <StatusBadge tone="info">{group.type}</StatusBadge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {group.normal_balance} · {group.accounts_count}{' '}
                            ledger accounts · {group.children_count} child
                            groups
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Edit account group"
                        >
                            <Link href={route('account-groups.edit', group.id)}>
                                <Pencil className="h-4 w-4 text-emerald-600" />
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                appSwal
                                    .fire({
                                        title: 'Delete account group?',
                                        text: `${group.code} - ${group.name} will be deleted.`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                    })
                                    .then((result) => {
                                        if (result.isConfirmed) {
                                            router.delete(
                                                route(
                                                    'account-groups.destroy',
                                                    group.id,
                                                ),
                                                {
                                                    preserveScroll: true,
                                                },
                                            );
                                        }
                                    })
                            }
                            title="Delete account group"
                        >
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                </div>

                {isExpanded &&
                    children.length > 0 &&
                    children.map((child) => renderGroup(child, depth + 1))}

                {isExpanded && groupAccounts.length > 0 && (
                    <div
                        className="space-y-1 py-2"
                        style={{
                            paddingLeft: `${(depth + 1) * 1.5 + 0.75}rem`,
                        }}
                    >
                        {groupAccounts.map((account) =>
                            renderAccountRow(account),
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'General Accounting', href: '' },
                {
                    title: 'Chart of Accounts',
                    href: route('ledger-accounts.index'),
                },
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="space-y-4">
                <ResourcePageHeader
                    title="Chart of Accounts"
                    description="Manage your ledger hierarchy and account groups."
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={expandAll}
                            >
                                <ChevronDown className="mr-1 h-4 w-4" />
                                Expand all
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={collapseAll}
                            >
                                <ChevronUp className="mr-1 h-4 w-4" />
                                Collapse all
                            </Button>
                            <Link
                                href={route('account-groups.create')}
                                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" /> Add Group
                            </Link>
                            <Link
                                href={route('ledger-accounts.create')}
                                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" /> Add Ledger
                            </Link>
                            <Link
                                href={route('opening-balances.create')}
                                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" /> Apply balances
                            </Link>
                        </div>
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        type="search"
                        placeholder="Search by account code or name..."
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                        className="w-full bg-card sm:w-96"
                    />
                    <span className="text-sm text-muted-foreground">
                        {glAccounts.total ?? accountRows.length} accounts
                    </span>
                </div>

                {groups.length === 0 && accountRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No chart data found
                        </p>
                        <p className="text-xs">
                            {data.search
                                ? 'Try a different code or account name.'
                                : 'Create an account group or ledger account to start building your chart of accounts.'}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <Link
                                href={route('account-groups.create')}
                                className="rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                            >
                                Add Group
                            </Link>
                            <Link
                                href={route('ledger-accounts.create')}
                                className="rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                            >
                                Add Ledger
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <ResourceTableCard className="overflow-auto p-3 md:p-5">
                            <div className="space-y-1">
                                {rootGroups.length > 0 ? (
                                    rootGroups.map((group) =>
                                        renderGroup(group),
                                    )
                                ) : (
                                    <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                                        No account groups found.
                                    </div>
                                )}
                                {rootGroups.length === 0 &&
                                    accountRows.length > 0 &&
                                    accountRows.map((account) =>
                                        renderAccountRow(account),
                                    )}
                            </div>
                        </ResourceTableCard>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
