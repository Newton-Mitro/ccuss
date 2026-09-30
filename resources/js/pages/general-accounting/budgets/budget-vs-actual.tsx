import HeadingSmall from '@/components/heading-small';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function BudgetVsActual() {
    const { rows, budgets, fiscalPeriods, filters } = usePage().props as any;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
        { title: 'Budget vs Actual', href: '' },
    ];

    const update = (key: string, value: string) =>
        router.get(
            route('financial-reports.budget-vs-actual'),
            { ...filters, [key]: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget vs Actual" />

            <div className="space-y-4">
                <HeadingSmall
                    title="Budget vs Actual"
                    description="Compare approved budgets with posted accounting activity."
                />

                {/* Filters */}
                <div className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-2">
                    <Select
                        value={String(filters.budget_id ?? '')}
                        onChange={(value) => update('budget_id', value)}
                        options={[
                            {
                                value: '',
                                label: 'All active and closed budgets',
                            },
                            ...budgets.map((budget: any) => ({
                                value: String(budget.id),
                                label: budget.name,
                            })),
                        ]}
                    />

                    <Select
                        value={String(filters.fiscal_period_id ?? '')}
                        onChange={(value) => update('fiscal_period_id', value)}
                        options={[
                            {
                                value: '',
                                label: 'All fiscal periods',
                            },
                            ...fiscalPeriods.map((period: any) => ({
                                value: String(period.id),
                                label: period.name,
                            })),
                        ]}
                    />
                </div>

                {/* Report Table */}
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-[1100px] table-fixed border-collapse text-sm">
                        <colgroup>
                            <col className="w-[15%]" />
                            <col className="w-[19%]" />
                            <col className="w-[15%]" />
                            <col className="w-[12%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                            <col className="w-[9%]" />
                        </colgroup>

                        <thead className="sticky top-0 z-10 bg-muted text-sm text-muted-foreground">
                            <tr>
                                <th className="border-b border-border px-4 py-3 text-left font-medium">
                                    Budget
                                </th>

                                <th className="border-b border-border px-4 py-3 text-left font-medium">
                                    Account
                                </th>

                                <th className="border-b border-border px-4 py-3 text-left font-medium">
                                    Cost Center
                                </th>

                                <th className="border-b border-border px-4 py-3 text-left font-medium">
                                    Period
                                </th>

                                <th className="border-b border-border px-4 py-3 text-right font-medium">
                                    Budget
                                </th>

                                <th className="border-b border-border px-4 py-3 text-right font-medium">
                                    Actual
                                </th>

                                <th className="border-b border-border px-4 py-3 text-right font-medium">
                                    Variance
                                </th>

                                <th className="border-b border-border px-4 py-3 text-right font-medium">
                                    Utilization
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row: any, index: number) => (
                                <tr
                                    key={`${row.budget_id}-${row.account_id}-${index}`}
                                    className="border-b border-border/80 transition-colors last:border-b-0 even:bg-muted/40 hover:bg-primary/5"
                                >
                                    {/* Budget */}
                                    <td className="px-4 py-3 align-middle font-medium text-foreground">
                                        <span
                                            className="block truncate"
                                            title={row.budget_name}
                                        >
                                            {row.budget_name || '-'}
                                        </span>
                                    </td>

                                    {/* Account */}
                                    <td className="px-4 py-3 align-middle text-foreground">
                                        <span
                                            className="block truncate"
                                            title={`${row.account_code} - ${row.account_name}`}
                                        >
                                            {row.account_code} -{' '}
                                            {row.account_name}
                                        </span>
                                    </td>

                                    {/* Cost Center */}
                                    <td className="px-4 py-3 align-middle text-muted-foreground">
                                        <span
                                            className="block truncate"
                                            title={
                                                row.cost_center_code
                                                    ? `${row.cost_center_code} - ${row.cost_center_name}`
                                                    : 'All cost centers'
                                            }
                                        >
                                            {row.cost_center_code
                                                ? `${row.cost_center_code} - ${row.cost_center_name}`
                                                : 'All'}
                                        </span>
                                    </td>

                                    {/* Period */}
                                    <td className="px-4 py-3 align-middle whitespace-nowrap text-muted-foreground">
                                        {row.fiscal_period_name ?? 'Annual'}
                                    </td>

                                    {/* Budget Amount */}
                                    <td className="px-4 py-3 text-right align-middle font-medium tabular-nums">
                                        {Number(row.budget_amount).toFixed(2)}
                                    </td>

                                    {/* Actual Amount */}
                                    <td className="px-4 py-3 text-right align-middle tabular-nums">
                                        {Number(row.actual_amount).toFixed(2)}
                                    </td>

                                    {/* Variance */}
                                    <td
                                        className={`px-4 py-3 text-right align-middle font-medium tabular-nums ${
                                            Number(row.variance) < 0
                                                ? 'text-destructive'
                                                : 'text-foreground'
                                        }`}
                                    >
                                        {Number(row.variance).toFixed(2)}
                                    </td>

                                    {/* Utilization */}
                                    <td className="px-4 py-3 text-right align-middle font-medium tabular-nums">
                                        {Number(row.utilization).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                            No budget data found.
                        </div>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
