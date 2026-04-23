import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    FileIcon,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { appSwal } from '../../../lib/appSwal';
import { SharedData } from '../../../types';
import { TYPE_COLORS } from './utils';

/* ---------------------------------------------
| Types
--------------------------------------------- */
interface GlAccountsIndexProps extends SharedData {
    glAccounts: any[];
    fiscalYears: any[];
    fiscalPeriods: any[];
    fiscal_year_id: number | null;
    fiscal_period_id: number | null;
}

/* ---------------------------------------------
| Component
--------------------------------------------- */
export default function GlAccountsIndex() {
    const {
        glAccounts,
        fiscalYears,
        fiscalPeriods,
        fiscal_year_id,
        fiscal_period_id,
    } = usePage<GlAccountsIndexProps>().props;

    useFlashToastHandler();

    /* ---------------------------------------------
    | Form state
    --------------------------------------------- */
    const { data, setData, errors } = useForm({
        fiscal_year_id: fiscal_year_id ?? null,
        fiscal_period_id: fiscal_period_id ?? null,
    });

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
        return glAccounts?.length ? collectExpandableIds(glAccounts) : [];
    }, [glAccounts]);

    /* ---------------------------------------------
    | Expansion state
    --------------------------------------------- */
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    /* Initialize when data loads */
    useEffect(() => {
        setExpandedIds(allExpandableIds);
    }, [allExpandableIds]);

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

                router.delete(route('ledger_accounts.destroy', id), {
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
                    const children = acc.children_recursive || [];
                    const isExpanded = expandedIds.includes(acc.id);
                    const hasChildren = children.length > 0;

                    return (
                        <li key={acc.id}>
                            <div
                                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-1 hover:bg-accent/10"
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
                                        className={`ml-2 rounded px-2 py-0.5 text-xs ${
                                            TYPE_COLORS[acc.type]
                                        }`}
                                    >
                                        {acc.type}
                                    </span>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className="flex items-center gap-2">
                                    {!hasChildren && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(acc.id, acc.name);
                                            }}
                                            className="text-destructive"
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
                <HeadingSmall
                    title="Chart of Accounts"
                    description="Manage your ledger hierarchy"
                />

                {/* FILTER BAR */}
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <div className="w-60">
                            <Select
                                className="bg-card"
                                error={errors.fiscal_year_id}
                                value={data.fiscal_year_id?.toString() || ''}
                                options={fiscalYears.map((fy) => ({
                                    value: fy.id.toString(),
                                    label: fy.code,
                                }))}
                                onChange={(value) => {
                                    setData('fiscal_year_id', Number(value));
                                    setData('fiscal_period_id', null);
                                }}
                            />
                        </div>

                        <div className="w-60">
                            <Select
                                className="bg-card"
                                error={errors.fiscal_period_id}
                                value={data.fiscal_period_id?.toString() || ''}
                                options={fiscalPeriods
                                    .filter(
                                        (fp) =>
                                            fp.fiscal_year_id ==
                                            data.fiscal_year_id,
                                    )
                                    .map((fp) => ({
                                        value: fp.id.toString(),
                                        label: fp.period_name,
                                    }))}
                                onChange={(value) =>
                                    setData('fiscal_period_id', Number(value))
                                }
                            />
                        </div>

                        <Button size="sm" variant="outline" onClick={expandAll}>
                            <ChevronDownIcon className="h-4 w-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={collapseAll}
                        >
                            <ChevronUpIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* TREE */}
                <Card className="h-[calc(100vh-300px)] overflow-y-auto p-6">
                    {renderTree(glAccounts)}
                </Card>
            </div>
        </CustomAuthLayout>
    );
}
