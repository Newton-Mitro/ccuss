import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface CostCenter {
    id: number;
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
    useFlashToastHandler();

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
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <ResourceTableCard>
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                        <tr>
                                            <th className="border-b border-border px-4 py-3">
                                                Code
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Name
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Parent
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Level
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Status
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {costCenters.data.map((costCenter) => (
                                            <tr
                                                key={costCenter.id}
                                                className="border-b border-border/80 even:bg-muted/40 hover:bg-primary/5"
                                            >
                                                <td className="px-4 py-3 font-mono">
                                                    {costCenter.code}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    <span
                                                        style={{
                                                            paddingLeft: `${costCenter.level * 16}px`,
                                                        }}
                                                    >
                                                        {costCenter.name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {costCenter.parent
                                                        ? `${costCenter.parent.code} - ${costCenter.parent.name}`
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {costCenter.level}
                                                </td>
                                                <td className="px-4 py-3">
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
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            href={route(
                                                                'cost-centers.edit',
                                                                costCenter.id,
                                                            )}
                                                            title="Edit cost center"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                destroy(
                                                                    costCenter,
                                                                )
                                                            }
                                                            title="Delete cost center"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ResourceTableCard>
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

                <DataTablePagination
                    links={costCenters.links}
                    perPage={costCenters.per_page ?? 18}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('cost-centers.index'),
                            { search, per_page: perPage },
                            { preserveScroll: true, preserveState: true },
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
