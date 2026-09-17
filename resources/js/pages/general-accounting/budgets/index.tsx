import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Eye, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

interface Budget {
    id: number;
    name: string;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    entries_count: number;
    entries_sum_amount: string;
    fiscal_year: { name: string };
}

export default function BudgetIndex() {
    const { budgets } = usePage().props as unknown as {
        budgets: {
            data: Budget[];
            links: { url: string | null; label: string; active: boolean }[];
            per_page?: number;
        };
    };
    useFlashToastHandler();

    const confirmAction = (title: string, url: string, text: string) => {
        appSwal
            .fire({ title, text, icon: 'warning', showCancelButton: true })
            .then((result) => {
                if (result.isConfirmed)
                    router.post(url, {}, { preserveScroll: true });
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Budgets" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Budgets"
                    description="Plan and monitor spending by account, cost center, and period."
                    action={
                        <div className="flex gap-2">
                            <Link
                                href={route(
                                    'financial-reports.budget-vs-actual',
                                )}
                            >
                                <Button variant="outline" size="sm">
                                    Budget vs Actual
                                </Button>
                            </Link>
                            <Link href={route('budgets.create')}>
                                <Button size="sm">
                                    <Plus className="mr-1 h-4 w-4" /> Create
                                    Budget
                                </Button>
                            </Link>
                        </div>
                    }
                />
                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Name',
                                    'Fiscal year',
                                    'Entries',
                                    'Total',
                                    'Status',
                                    'Actions',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="border-b p-2 text-left text-sm font-medium"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.data.map((budget) => (
                                <tr
                                    key={budget.id}
                                    className="border-b even:bg-muted hover:bg-accent/20"
                                >
                                    <td className="px-2 py-1 font-medium">
                                        {budget.name}
                                    </td>
                                    <td className="px-2 py-1">
                                        {budget.fiscal_year?.name}
                                    </td>
                                    <td className="px-2 py-1">
                                        {budget.entries_count}
                                    </td>
                                    <td className="px-2 py-1">
                                        {Number(
                                            budget.entries_sum_amount ?? 0,
                                        ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1">
                                        <StatusBadge
                                            tone={
                                                budget.status === 'ACTIVE'
                                                    ? 'success'
                                                    : budget.status === 'CLOSED'
                                                      ? 'neutral'
                                                      : 'warning'
                                            }
                                        >
                                            {budget.status}
                                        </StatusBadge>
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={route(
                                                    'budgets.show',
                                                    budget.id,
                                                )}
                                                title="View budget"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            {budget.status === 'DRAFT' && (
                                                <>
                                                    <Link
                                                        href={route(
                                                            'budgets.edit',
                                                            budget.id,
                                                        )}
                                                        title="Edit budget"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        title="Activate budget"
                                                        onClick={() =>
                                                            confirmAction(
                                                                'Activate budget?',
                                                                route(
                                                                    'budgets.activate',
                                                                    budget.id,
                                                                ),
                                                                'This budget will become active.',
                                                            )
                                                        }
                                                    >
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    </button>
                                                    <button
                                                        title="Delete budget"
                                                        onClick={() =>
                                                            router.delete(
                                                                route(
                                                                    'budgets.destroy',
                                                                    budget.id,
                                                                ),
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </button>
                                                </>
                                            )}
                                            {budget.status === 'ACTIVE' && (
                                                <button
                                                    title="Close budget"
                                                    onClick={() =>
                                                        confirmAction(
                                                            'Close budget?',
                                                            route(
                                                                'budgets.close',
                                                                budget.id,
                                                            ),
                                                            'Closed budgets cannot be changed.',
                                                        )
                                                    }
                                                >
                                                    <Lock className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {budgets.data.length === 0 && (
                        <p className="p-6 text-center text-muted-foreground">
                            No budgets found.
                        </p>
                    )}
                </ResourceTableCard>
                <DataTablePagination
                    links={budgets.links}
                    perPage={budgets.per_page ?? 18}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('budgets.index'),
                            { per_page: perPage, page: 1 },
                            { preserveScroll: true, preserveState: true },
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
