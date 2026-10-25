import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    Pencil,
    Plus,
    ScanEye,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import AccountDetailsDialog from '@/modules/general-accounting/chart-of-accounts/account-details-dialog';

interface AccountGroup {
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

interface Props extends SharedData {
    accountGroups:
        | {
              data?: AccountGroup[];
          }
        | AccountGroup[];
}

export default function AccountGroupIndex() {
    const { accountGroups, auth } = usePage<Props>().props;
    const groups = Array.isArray(accountGroups)
        ? accountGroups
        : (accountGroups.data ?? []);
    const [expanded, setExpanded] = useState<number[]>([]);
    const [viewingGroup, setViewingGroup] = useState<AccountGroup | null>(null);
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);
    const canCreate = permissions.has('accounting.coa.create');
    const canUpdate = permissions.has('accounting.coa.update');
    useFlashToastHandler();

    const childrenByParent = groups.reduce<Record<string, AccountGroup[]>>(
        (result, group) => {
            const key = String(group.parent_id ?? 'root');
            result[key] ??= [];
            result[key].push(group);
            return result;
        },
        {},
    );
    const rootGroups = childrenByParent.root ?? [];

    const toggle = (id: number) => {
        setExpanded((current) =>
            current.includes(id)
                ? current.filter((groupId) => groupId !== id)
                : [...current, id],
        );
    };

    const destroy = (group: AccountGroup) => {
        appSwal
            .fire({
                title: 'Delete account group?',
                text: `${group.code} - ${group.name} will be deleted.`,
                icon: 'warning',
                showCancelButton: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('account-groups.destroy', group.id), {
                        preserveScroll: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: 'Account Groups', href: route('account-groups.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Groups" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account Groups"
                    description="Organize the chart of accounts by reporting category and keep the structure consistent across all ledger views."
                    action={
                        canCreate ? (
                            <Button asChild size="sm" className="gap-1">
                                <Link href={route('account-groups.create')}>
                                    <Plus className="h-4 w-4" /> Add Group
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-muted-foreground">
                        {groups.length} groups
                    </span>
                </div>

                {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No account groups found
                        </p>
                        <p className="text-xs">
                            Create an account group to organize your chart of
                            accounts.
                        </p>
                        {canCreate && (
                            <Button asChild className="mt-4" size="sm">
                                <Link href={route('account-groups.create')}>
                                    Add Group
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <ResourceTableCard className="overflow-auto p-3 md:p-5">
                        <div className="space-y-1">
                            {rootGroups.map((group) => {
                                const renderGroup = (
                                    item: AccountGroup,
                                    depth = 0,
                                ): React.ReactNode => {
                                    const children =
                                        childrenByParent[String(item.id)] ?? [];
                                    const isExpanded = expanded.includes(
                                        item.id,
                                    );
                                    return (
                                        <div key={item.id}>
                                            <div
                                                className="flex items-center gap-2 rounded-md border-b px-2 py-2 hover:bg-accent/20"
                                                style={{
                                                    paddingLeft: `${depth * 1.5 + 0.5}rem`,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 items-center justify-center"
                                                    onClick={() =>
                                                        children.length &&
                                                        toggle(item.id)
                                                    }
                                                    aria-label={
                                                        isExpanded
                                                            ? 'Collapse group'
                                                            : 'Expand group'
                                                    }
                                                >
                                                    {children.length ? (
                                                        isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )
                                                    ) : (
                                                        <span className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs">
                                                            {item.code}
                                                        </span>
                                                        <span className="font-medium">
                                                            {item.name}
                                                        </span>
                                                        <StatusBadge tone="info">
                                                            {item.type}
                                                        </StatusBadge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.normal_balance} ·{' '}
                                                        {item.accounts_count}{' '}
                                                        ledger accounts ·{' '}
                                                        {item.children_count}{' '}
                                                        child groups
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        title="View account group"
                                                        aria-label={`View group ${item.code} ${item.name}`}
                                                        onClick={() =>
                                                            setViewingGroup(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        <ScanEye className="h-4 w-4 text-info" />
                                                    </Button>
                                                    {canUpdate && (
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Edit account group"
                                                            aria-label={`Edit group ${item.code} ${item.name}`}
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'account-groups.edit',
                                                                    item.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-4 w-4 text-emerald-600" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            destroy(item)
                                                        }
                                                        title="Delete account group"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {isExpanded &&
                                                children.map((child) =>
                                                    renderGroup(
                                                        child,
                                                        depth + 1,
                                                    ),
                                                )}
                                        </div>
                                    );
                                };
                                return renderGroup(group);
                            })}
                        </div>
                    </ResourceTableCard>
                )}
                <AccountDetailsDialog
                    open={viewingGroup !== null}
                    onOpenChange={(open) => {
                        if (!open) setViewingGroup(null);
                    }}
                    kind="group"
                    title={viewingGroup?.name ?? ''}
                    description="Account group classification and hierarchy."
                    details={
                        viewingGroup
                            ? [
                                  {
                                      label: 'Code',
                                      value: viewingGroup.code,
                                  },
                                  {
                                      label: 'Name',
                                      value: viewingGroup.name,
                                  },
                                  {
                                      label: 'Type',
                                      value: viewingGroup.type,
                                  },
                                  {
                                      label: 'Normal balance',
                                      value: viewingGroup.normal_balance,
                                  },
                                  {
                                      label: 'Parent group',
                                      value:
                                          groups.find(
                                              (item) =>
                                                  item.id ===
                                                  viewingGroup.parent_id,
                                          )?.name ?? null,
                                  },
                                  {
                                      label: 'Status',
                                      value: viewingGroup.status
                                          ? 'Active'
                                          : 'Inactive',
                                  },
                                  {
                                      label: 'Ledger accounts',
                                      value: viewingGroup.accounts_count,
                                  },
                                  {
                                      label: 'Child groups',
                                      value: viewingGroup.children_count,
                                  },
                                  {
                                      label: 'Level',
                                      value: viewingGroup.level,
                                  },
                              ]
                            : []
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
