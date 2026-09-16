import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Cost Centers"
                        description="Track expenses by department, branch, project, or activity."
                    />
                    <Link href={route('cost-centers.create')}>
                        <Button size="sm">
                            <Plus className="mr-1 h-4 w-4" /> Add Cost Center
                        </Button>
                    </Link>
                </div>

                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search code or name..."
                    className="w-full bg-card sm:w-80"
                />

                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Parent</th>
                                <th className="p-3">Level</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costCenters.data.map((costCenter) => (
                                <tr key={costCenter.id} className="border-t">
                                    <td className="p-3 font-mono">
                                        {costCenter.code}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            style={{
                                                paddingLeft: `${costCenter.level * 16}px`,
                                            }}
                                        >
                                            {costCenter.name}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {costCenter.parent
                                            ? `${costCenter.parent.code} - ${costCenter.parent.name}`
                                            : '-'}
                                    </td>
                                    <td className="p-3">{costCenter.level}</td>
                                    <td className="p-3">
                                        <span
                                            className={
                                                costCenter.status
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }
                                        >
                                            {costCenter.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="flex gap-3 p-3">
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
                                            onClick={() => destroy(costCenter)}
                                            title="Delete cost center"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {costCenters.data.length === 0 && (
                        <p className="p-6 text-center text-muted-foreground">
                            No cost centers found.
                        </p>
                    )}
                </div>

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
