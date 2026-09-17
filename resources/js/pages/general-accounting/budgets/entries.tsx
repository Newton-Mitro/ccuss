import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { route } from 'ziggy-js';

export default function BudgetEntries() {
    const { entries } = usePage().props as any;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
        { title: 'Budget Entries', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget Entries" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Budget Entries"
                    description="Review planned amounts assigned to accounts, cost centers, and fiscal periods."
                />
                {entries.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No budget entries found
                        </p>
                        <p className="text-xs">
                            Budget entries will appear here when they are
                            created.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <ResourceTableCard>
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                        <tr>
                                            <th className="border-b border-border px-4 py-3">
                                                Budget
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Account
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Cost center
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Period
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Amount
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.data.map((entry: any) => (
                                            <tr
                                                key={entry.id}
                                                className="border-b even:bg-muted hover:bg-accent/20"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {entry.budget?.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {entry.account?.code} -{' '}
                                                    {entry.account?.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {entry.cost_center
                                                        ? `${entry.cost_center.code} - ${entry.cost_center.name}`
                                                        : 'All'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {entry.fiscal_period
                                                        ?.name ?? 'Annual'}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {Number(
                                                        entry.amount,
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={route(
                                                            'budgets.show',
                                                            entry.budget_id,
                                                        )}
                                                        title="View budget"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ResourceTableCard>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {entries.data.map((entry: any) => (
                                <div
                                    key={entry.id}
                                    className="space-y-2 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {entry.budget?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {entry.account?.code} -{' '}
                                                {entry.account?.name}
                                            </p>
                                        </div>
                                        <span className="font-medium">
                                            {Number(entry.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.cost_center
                                            ? `${entry.cost_center.code} - ${entry.cost_center.name}`
                                            : 'All cost centers'}{' '}
                                        ·{' '}
                                        {entry.fiscal_period?.name ?? 'Annual'}
                                    </p>
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'budgets.show',
                                                    entry.budget_id,
                                                )}
                                            >
                                                <Eye className="h-4 w-4" /> View
                                                budget
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <DataTablePagination
                    links={entries.links}
                    perPage={entries.per_page ?? 18}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('budgets.entries'),
                            { per_page: perPage },
                            { preserveScroll: true, preserveState: true },
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
