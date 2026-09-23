import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { GeneralLedgerAccountsPageProps } from '@/types/general-accounting';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    FileIcon,
    PenSquare,
    Plus,
    ScanEye,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { appSwal } from '../../../lib/appSwal';
import { TYPE_COLORS } from './utils';

/* ---------------------------------------------
| Component
--------------------------------------------- */
export default function GlAccountsIndex() {
    const { glAccounts, filters } =
        usePage<GeneralLedgerAccountsPageProps>().props;
    const accountRows = glAccounts?.data ?? [];

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 50,
        page: Number(filters.page) || 1,
    });

    useFlashToastHandler();

    /* ---------------------------------------------
    | Collect expandable (control) nodes
    | (only nodes that actually have children)
    --------------------------------------------- */
    const collectExpandableIds = (nodes: any[]): number[] => {
        const ids: number[] = [];

        const walk = (items: any[]) => {
            items.forEach((n) => {
                if (n.children_recursive?.length > 0) {
                    ids.push(n.id);
                    walk(n.children_recursive);
                }
            });
        };

        walk(nodes);
        return ids;
    };

    /* ---------------------------------------------
    | Full tree expansion baseline
    --------------------------------------------- */
    const allExpandableIds = useMemo(() => {
        return accountRows.length ? collectExpandableIds(accountRows) : [];
    }, [accountRows]);

    /* ---------------------------------------------
    | Expansion state
    --------------------------------------------- */
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    /* Initialize when data loads */
    useEffect(() => {
        setExpandedIds(allExpandableIds);
    }, [allExpandableIds]);

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('ledger-accounts.index'), {
                preserveScroll: true,
                preserveState: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    /* ---------------------------------------------
    | Actions
    --------------------------------------------- */
    const toggleExpand = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const expandAll = () => {
        setExpandedIds(allExpandableIds);
    };

    const collapseAll = () => {
        setExpandedIds([]);
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

    /* ---------------------------------------------
    | Recursive Tree Renderer
    --------------------------------------------- */
    const renderTree = (nodes: any[], level = 0) => {
        return (
            <ul className="space-y-1">
                {nodes.map((acc) => {
                    const children =
                        acc.children_recursive || acc.children || [];
                    const isExpanded = expandedIds.includes(acc.id);
                    const hasChildren = children.length > 0;

                    return (
                        <li
                            key={acc.id}
                            className={`${acc.is_control_account && 'text-warning'} ${acc.is_group ? 'font-bold text-info' : 'text-card-foreground'}`}
                        >
                            <div
                                className="account-tree-row flex cursor-pointer items-center justify-between rounded-lg px-3 py-1"
                                style={{ marginLeft: `${level * 1.5}rem` }}
                                onClick={() =>
                                    hasChildren && toggleExpand(acc.id)
                                }
                            >
                                {/* LEFT SIDE */}
                                <div className="flex items-center gap-2">
                                    {hasChildren ? (
                                        isExpanded ? (
                                            <ChevronDownIcon className="h-4 w-4" />
                                        ) : (
                                            <ChevronRightIcon className="h-4 w-4" />
                                        )
                                    ) : (
                                        <FileIcon className="h-4 w-4" />
                                    )}

                                    <span className="text-sm">
                                        {acc.code} — {acc.name}
                                    </span>

                                    <span
                                        className={`ml-2 rounded px-2 py-0.5 text-xs capitalize ${
                                            TYPE_COLORS[acc.type]
                                        }`}
                                    >
                                        {acc.type}
                                    </span>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route(
                                            'ledger-accounts.show',
                                            acc.id,
                                        )}
                                        className="text-info"
                                        aria-label={`View ${acc.code} ${acc.name}`}
                                        title="View account"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ScanEye className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={route(
                                            'ledger-accounts.edit',
                                            acc.id,
                                        )}
                                        className="text-warning"
                                        aria-label={`Edit ${acc.code} ${acc.name}`}
                                        title="Edit account"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <PenSquare className="h-4 w-4" />
                                    </Link>

                                    {!hasChildren && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(acc.id, acc.name);
                                            }}
                                            className="text-destructive"
                                            aria-label={`Delete ${acc.code} ${acc.name}`}
                                            title="Delete account"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* CHILDREN */}
                            {isExpanded &&
                                hasChildren &&
                                renderTree(children, level + 1)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    /* ---------------------------------------------
    | UI
    --------------------------------------------- */
    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'General Accounting', href: '' },
                { title: 'General Ledger', href: '' },
                { title: 'Chart of Accounts', href: '' },
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="space-y-4">
                <ResourcePageHeader
                    title="Chart of Accounts"
                    description="Manage your ledger hierarchy"
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={expandAll}
                                className="bg-card"
                                aria-label="Expand all account groups"
                                title="Expand all account groups"
                            >
                                <ChevronDownIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Expand all
                                </span>
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={collapseAll}
                                className="bg-card"
                                aria-label="Collapse all account groups"
                                title="Collapse all account groups"
                            >
                                <ChevronUpIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Collapse all
                                </span>
                            </Button>

                            <Link
                                href={route('ledger-accounts.create')}
                                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" /> Add Ledger
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

                {accountRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No ledger accounts found
                        </p>
                        <p className="text-xs">
                            {data.search
                                ? 'Try a different code or account name.'
                                : 'Create a ledger account to build your chart of accounts.'}
                        </p>
                        <Link
                            href={route('ledger-accounts.create')}
                            className="mt-4 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Add Ledger Account
                        </Link>
                    </div>
                ) : (
                    <>
                        <Card className="h-[calc(100vh-320px)] overflow-y-auto rounded-md border bg-card p-3 md:p-6">
                            {renderTree(accountRows)}
                        </Card>
                        <DataTablePagination
                            links={glAccounts.links}
                            perPage={glAccounts.per_page ?? 18}
                            onPerPageChange={(perPage) =>
                                router.get(
                                    route('ledger-accounts.index'),
                                    {
                                        search: data.search,
                                        per_page: perPage,
                                        page: 1,
                                    },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                    },
                                )
                            }
                        />
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
