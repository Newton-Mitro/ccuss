import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
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
                <HeadingSmall
                    title="Budget Entries"
                    description="Review planned amounts assigned to accounts, cost centers, and fiscal periods."
                />
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-3">Budget</th>
                                <th className="p-3">Account</th>
                                <th className="p-3">Cost center</th>
                                <th className="p-3">Period</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.data.map((entry: any) => (
                                <tr key={entry.id} className="border-t">
                                    <td className="p-3">
                                        {entry.budget?.name}
                                    </td>
                                    <td className="p-3">
                                        {entry.account?.code} -{' '}
                                        {entry.account?.name}
                                    </td>
                                    <td className="p-3">
                                        {entry.cost_center
                                            ? `${entry.cost_center.code} - ${entry.cost_center.name}`
                                            : 'All'}
                                    </td>
                                    <td className="p-3">
                                        {entry.fiscal_period?.name ?? 'Annual'}
                                    </td>
                                    <td className="p-3">
                                        {Number(entry.amount).toFixed(2)}
                                    </td>
                                    <td className="p-3">
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
                    {entries.data.length === 0 && (
                        <p className="p-6 text-center text-muted-foreground">
                            No budget entries found.
                        </p>
                    )}
                </div>
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
