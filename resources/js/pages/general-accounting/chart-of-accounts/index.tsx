import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import AccountDetailsDialog from './account-details-dialog';
import AccountGroupDialog, {
    type AccountGroupDialogItem,
} from './account-group-dialog';
import { accountTypes } from './data/account-type';
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
    const { glAccounts, accountGroups, parents, filters, auth } =
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
    const ledgerForm = useForm({
        code: '',
        name: '',
        type: '',
        normal_balance: 'DEBIT',
        account_group_id: '',
        parent_id: '',
        is_control_account: false,
        is_reconcilable: false,
        is_cash_account: false,
        is_system: false,
        status: true,
    });

    useFlashToastHandler();

    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canCreateLedger = permissions.has('accounting.coa.create');
    const canUpdateLedger = permissions.has('accounting.coa.update');
    const canCreateGroup = permissions.has('accounting.coa.create');
    const canUpdateGroup = permissions.has('accounting.coa.update');
    const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
    const [editingLedgerId, setEditingLedgerId] = useState<number | null>(null);
    const [groupDialogOpen, setGroupDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] =
        useState<AccountGroupDialogItem | null>(null);
    const [accountDetails, setAccountDetails] = useState<{
        kind: 'ledger' | 'group';
        title: string;
        description: string;
        details: { label: string; value: string | number | boolean | null }[];
    } | null>(null);

    const resetLedgerForm = () => {
        ledgerForm.setData({
            code: '',
            name: '',
            type: '',
            normal_balance: 'DEBIT',
            account_group_id: '',
            parent_id: '',
            is_control_account: false,
            is_reconcilable: false,
            is_cash_account: false,
            is_system: false,
            status: true,
        });
        ledgerForm.clearErrors();
        setEditingLedgerId(null);
    };

    const openCreateLedger = () => {
        resetLedgerForm();
        setLedgerDialogOpen(true);
    };

    const openCreateGroup = () => {
        setEditingGroup(null);
        setGroupDialogOpen(true);
    };

    const openEditGroup = (group: AccountGroupTreeItem) => {
        setEditingGroup(group);
        setGroupDialogOpen(true);
    };

    const openAccountDetails = (account: (typeof accountRows)[number]) => {
        setAccountDetails({
            kind: 'ledger',
            title: account.name,
            description: 'Ledger account configuration and hierarchy.',
            details: [
                { label: 'Code', value: account.code },
                { label: 'Name', value: account.name },
                { label: 'Type', value: account.type },
                { label: 'Normal balance', value: account.normal_balance },
                { label: 'Account group', value: account.group?.name ?? null },
                {
                    label: 'Parent account',
                    value: account.parent?.name ?? null,
                },
                { label: 'Control account', value: account.is_control_account },
                { label: 'Reconcilable', value: account.is_reconcilable },
                {
                    label: 'Cash account',
                    value: account.is_cash_account ?? false,
                },
                { label: 'System account', value: account.is_system },
                {
                    label: 'Status',
                    value: account.status ? 'Active' : 'Inactive',
                },
                { label: 'Children', value: account.children?.length ?? 0 },
            ],
        });
    };

    const openGroupDetails = (group: AccountGroupTreeItem) => {
        const parent = groups.find((item) => item.id === group.parent_id);
        setAccountDetails({
            kind: 'group',
            title: group.name,
            description: 'Account group classification and hierarchy.',
            details: [
                { label: 'Code', value: group.code },
                { label: 'Name', value: group.name },
                { label: 'Type', value: group.type },
                { label: 'Normal balance', value: group.normal_balance },
                { label: 'Parent group', value: parent?.name ?? null },
                {
                    label: 'Status',
                    value: group.status ? 'Active' : 'Inactive',
                },
                { label: 'Ledger accounts', value: group.accounts_count },
                { label: 'Child groups', value: group.children_count },
                { label: 'Level', value: group.level },
            ],
        });
    };

    const openEditLedger = (
        account: GeneralLedgerAccountsPageProps['glAccounts']['data'][number],
    ) => {
        ledgerForm.setData({
            code: account.code,
            name: account.name,
            type: account.type,
            normal_balance: account.normal_balance,
            account_group_id: String(account.account_group_id ?? ''),
            parent_id: String(account.parent_id ?? ''),
            is_control_account: account.is_control_account,
            is_reconcilable: account.is_reconcilable,
            is_cash_account: account.is_cash_account ?? false,
            is_system: account.is_system,
            status: account.status,
        });
        ledgerForm.clearErrors();
        setEditingLedgerId(account.id);
        setLedgerDialogOpen(true);
    };

    const submitLedgerForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setLedgerDialogOpen(false);
                resetLedgerForm();
            },
        };

        if (editingLedgerId) {
            ledgerForm.put(
                route('ledger-accounts.update', editingLedgerId),
                options,
            );
        } else {
            ledgerForm.post(route('ledger-accounts.store'), options);
        }
    };

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
                    <button
                        type="button"
                        onClick={() => openAccountDetails(account)}
                        className="text-info"
                        aria-label={`View ${account.code} ${account.name}`}
                        title="View account"
                    >
                        <ScanEye className="h-4 w-4" />
                    </button>
                    {canUpdateLedger && (
                        <button
                            type="button"
                            onClick={() => openEditLedger(account)}
                            className="text-warning"
                            aria-label={`Edit ${account.code} ${account.name}`}
                            title="Edit account"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )}
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
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="View account group"
                            aria-label={`View group ${group.code} ${group.name}`}
                            onClick={() => openGroupDetails(group)}
                        >
                            <ScanEye className="h-4 w-4 text-info" />
                        </Button>
                        {canUpdateGroup && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Edit account group"
                                aria-label={`Edit group ${group.code} ${group.name}`}
                                onClick={() => openEditGroup(group)}
                            >
                                <Pencil className="h-4 w-4 text-emerald-600" />
                            </Button>
                        )}
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
                            {canCreateGroup && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={openCreateGroup}
                                >
                                    <Plus className="h-4 w-4" /> Add Group
                                </Button>
                            )}
                            {canCreateLedger && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={openCreateLedger}
                                >
                                    <Plus className="h-4 w-4" /> Add Ledger
                                </Button>
                            )}
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
                            {canCreateGroup && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={openCreateGroup}
                                >
                                    Add Group
                                </Button>
                            )}
                            {canCreateLedger && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={openCreateLedger}
                                >
                                    Add Ledger
                                </Button>
                            )}
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
                <Dialog
                    open={ledgerDialogOpen}
                    onOpenChange={(open) => {
                        setLedgerDialogOpen(open);
                        if (!open && !ledgerForm.processing) {
                            resetLedgerForm();
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingLedgerId
                                    ? 'Edit ledger account'
                                    : 'Create ledger account'}
                            </DialogTitle>
                            <DialogDescription>
                                Set the account classification, hierarchy, and
                                reconciliation behavior.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(event) => submitLedgerForm(event)}
                            className="space-y-5"
                        >
                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">
                                    Basic information
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ledger-code">
                                            Code
                                        </Label>
                                        <Input
                                            id="ledger-code"
                                            value={ledgerForm.data.code}
                                            onChange={(event) =>
                                                ledgerForm.setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="1100"
                                        />
                                        <InputError
                                            message={ledgerForm.errors.code}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ledger-name">
                                            Name
                                        </Label>
                                        <Input
                                            id="ledger-name"
                                            value={ledgerForm.data.name}
                                            onChange={(event) =>
                                                ledgerForm.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Cash on hand"
                                        />
                                        <InputError
                                            message={ledgerForm.errors.name}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Account type</Label>
                                        <Select
                                            value={ledgerForm.data.type}
                                            onChange={(value) =>
                                                ledgerForm.setData(
                                                    'type',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select type',
                                                },
                                                ...accountTypes,
                                            ]}
                                        />
                                        <InputError
                                            message={ledgerForm.errors.type}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Account group</Label>
                                        <Select
                                            value={
                                                ledgerForm.data.account_group_id
                                            }
                                            onChange={(value) =>
                                                ledgerForm.setData(
                                                    'account_group_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select group',
                                                },
                                                ...groups.map((group) => ({
                                                    value: String(group.id),
                                                    label: `${group.code} - ${group.name}`,
                                                })),
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                ledgerForm.errors
                                                    .account_group_id
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Normal balance</Label>
                                        <Select
                                            value={
                                                ledgerForm.data.normal_balance
                                            }
                                            onChange={(value) =>
                                                ledgerForm.setData(
                                                    'normal_balance',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: 'DEBIT',
                                                    label: 'Debit',
                                                },
                                                {
                                                    value: 'CREDIT',
                                                    label: 'Credit',
                                                },
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                ledgerForm.errors.normal_balance
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Parent account</Label>
                                        <Select
                                            value={ledgerForm.data.parent_id}
                                            onChange={(value) =>
                                                ledgerForm.setData(
                                                    'parent_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'None',
                                                },
                                                ...parents
                                                    .filter(
                                                        (parent) =>
                                                            parent.id !==
                                                            editingLedgerId,
                                                    )
                                                    .map((parent) => ({
                                                        value: String(
                                                            parent.id,
                                                        ),
                                                        label: `${parent.code} - ${parent.name}`,
                                                    })),
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                ledgerForm.errors.parent_id
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">
                                    Account settings
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        {
                                            key: 'is_control_account' as const,
                                            label: 'Control account',
                                        },
                                        {
                                            key: 'is_reconcilable' as const,
                                            label: 'Reconcilable',
                                        },
                                        {
                                            key: 'is_cash_account' as const,
                                            label: 'Cash account',
                                        },
                                        {
                                            key: 'is_system' as const,
                                            label: 'System account',
                                        },
                                        {
                                            key: 'status' as const,
                                            label: 'Active',
                                        },
                                    ].map(({ key, label }) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-2 rounded-md border p-3 text-sm"
                                        >
                                            <Input
                                                type="checkbox"
                                                checked={ledgerForm.data[key]}
                                                onChange={(event) =>
                                                    ledgerForm.setData(
                                                        key,
                                                        event.target.checked,
                                                    )
                                                }
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={ledgerForm.processing}
                                    onClick={() => setLedgerDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={ledgerForm.processing}
                                >
                                    {ledgerForm.processing
                                        ? 'Saving...'
                                        : editingLedgerId
                                          ? 'Save changes'
                                          : 'Create ledger account'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <AccountGroupDialog
                    open={groupDialogOpen}
                    onOpenChange={setGroupDialogOpen}
                    groups={groups}
                    group={editingGroup}
                />
                <AccountDetailsDialog
                    open={accountDetails !== null}
                    onOpenChange={(open) => {
                        if (!open) setAccountDetails(null);
                    }}
                    kind={accountDetails?.kind ?? 'ledger'}
                    title={accountDetails?.title ?? ''}
                    description={accountDetails?.description ?? ''}
                    details={accountDetails?.details ?? []}
                />
            </div>
        </CustomAuthLayout>
    );
}
