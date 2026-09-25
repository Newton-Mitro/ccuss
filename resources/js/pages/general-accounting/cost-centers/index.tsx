import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

interface CostCenter {
    id: number;
    parent_id?: number | null;
    code: string;
    name: string;
    level: number;
    status: boolean;
    parent?: { code: string; name: string } | null;
}

interface Props extends SharedData {
    costCenters: {
        data: CostCenter[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page?: number;
    };
    filters: { search?: string; per_page?: string; page?: string };
}

export default function CostCenterIndex() {
    const { costCenters, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [expanded, setExpanded] = useState<number[]>([]);
    useFlashToastHandler();

    const childrenByParent = useMemo(() => {
        const map = new Map<number, CostCenter[]>();

        costCenters.data.forEach((costCenter) => {
            if (costCenter.parent_id) {
                const parentId = Number(costCenter.parent_id);
                const children = map.get(parentId) ?? [];
                children.push(costCenter);
                map.set(parentId, children);
            }
        });

        return map;
    }, [costCenters.data]);

    const rootNodes = useMemo(() => {
        const visibleIds = new Set(
            costCenters.data.map((costCenter) => costCenter.id),
        );

        return costCenters.data.filter(
            (costCenter) =>
                !costCenter.parent_id ||
                !visibleIds.has(Number(costCenter.parent_id)),
        );
    }, [costCenters.data]);

    const toggleExpanded = (id: number) => {
        setExpanded((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const renderCostCenterNode = (
        costCenter: CostCenter,
        depth = 0,
    ): React.ReactNode => {
        const children = childrenByParent.get(costCenter.id) ?? [];
        const hasChildren = children.length > 0;
        const isExpanded = expanded.includes(costCenter.id);

        return (
            <div
                key={costCenter.id}
                className="border-b border-border/80 last:border-b-0"
            >
                <div
                    className="flex items-center gap-3 px-3 py-2 hover:bg-primary/5"
                    style={{ paddingLeft: `${depth * 1.1 + 0.75}rem` }}
                >
                    <div className="flex w-5 items-center justify-center">
                        {hasChildren ? (
                            <button
                                type="button"
                                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                                onClick={() => toggleExpanded(costCenter.id)}
                                aria-label={
                                    isExpanded
                                        ? `Collapse ${costCenter.name}`
                                        : `Expand ${costCenter.name}`
                                }
                                title={
                                    isExpanded
                                        ? `Collapse ${costCenter.name}`
                                        : `Expand ${costCenter.name}`
                                }
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <span className="h-4 w-4" />
                        )}
                    </div>

                    <div className="grid min-w-0 flex-1 grid-cols-[1.15fr_1.7fr_1.2fr_0.5fr_0.9fr_0.7fr] items-center gap-3">
                        <div className="min-w-0 font-mono text-xs text-muted-foreground">
                            {costCenter.code}
                        </div>
                        <div className="min-w-0">
                            <span className="font-medium">
                                {costCenter.name}
                            </span>
                        </div>
                        <div className="min-w-0 truncate text-muted-foreground">
                            {costCenter.parent
                                ? `${costCenter.parent.code} - ${costCenter.parent.name}`
                                : '-'}
                        </div>
                        <div className="min-w-0">{costCenter.level}</div>
                        <div className="min-w-0">
                            <StatusBadge
                                tone={costCenter.status ? 'success' : 'danger'}
                            >
                                {costCenter.status ? 'Active' : 'Inactive'}
                            </StatusBadge>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                            <Link
                                href={route('cost-centers.edit', costCenter.id)}
                                title="Edit cost center"
                            >
                                <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => destroy(costCenter)}
                                title="Delete cost center"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                        </div>
                    </div>
                </div>

                {hasChildren &&
                    isExpanded &&
                    children.map((child) =>
                        renderCostCenterNode(child, depth + 1),
                    )}
            </div>
        );
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('cost-centers.index'),
                { search, per_page: filters.per_page },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    const destroy = (costCenter: CostCenter) => {
        appSwal
            .fire({
                title: 'Delete cost center?',
                text: `${costCenter.code} - ${costCenter.name} will be deleted.`,
                icon: 'warning',
                showCancelButton: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(
                        route('cost-centers.destroy', costCenter.id),
                        {
                            preserveScroll: true,
                        },
                    );
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Cost Centers', href: route('cost-centers.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cost Centers" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Cost Centers"
                    description="Track expenses by department, branch, project, or activity."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('cost-centers.create')}>
                                <Plus className="mr-1 h-4 w-4" /> Add Cost
                                Center
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search code or name..."
                        className="w-full bg-card sm:w-80"
                    />
                    <span className="text-sm text-muted-foreground">
                        {costCenters.data.length} records
                    </span>
                </div>

                {costCenters.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No cost centers found
                        </p>
                        <p className="text-xs">
                            Try adjusting your search or create a new cost
                            center
                        </p>
                        <Link
                            href={route('cost-centers.create')}
                            className="mt-4 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Create Cost Center
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto rounded-md border bg-card">
                            <div className="space-y-1 p-2">
                                {rootNodes.map((costCenter) =>
                                    renderCostCenterNode(costCenter),
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {costCenters.data.map((costCenter) => (
                                <div
                                    key={costCenter.id}
                                    className="space-y-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {costCenter.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {costCenter.code} · Level{' '}
                                                {costCenter.level}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            tone={
                                                costCenter.status
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {costCenter.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </StatusBadge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {costCenter.parent
                                            ? `${costCenter.parent.code} - ${costCenter.parent.name}`
                                            : 'No parent cost center'}
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'cost-centers.edit',
                                                    costCenter.id,
                                                )}
                                            >
                                                <Pencil className="h-4 w-4" />{' '}
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => destroy(costCenter)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />{' '}
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}
