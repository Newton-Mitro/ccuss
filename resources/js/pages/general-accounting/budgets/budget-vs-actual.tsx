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
            { preserveState: true, preserveScroll: true },
        );

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget vs Actual" />
            <div className="space-y-4">
                <HeadingSmall
                    title="Budget vs Actual"
                    description="Compare approved budgets with posted accounting activity."
                />
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
                            { value: '', label: 'All fiscal periods' },
                            ...fiscalPeriods.map((period: any) => ({
                                value: String(period.id),
                                label: period.name,
                            })),
                        ]}
                    />
                </div>
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-3">Budget</th>
                                <th className="p-3">Account</th>
                                <th className="p-3">Cost center</th>
                                <th className="p-3">Period</th>
                                <th className="p-3">Budget</th>
                                <th className="p-3">Actual</th>
                                <th className="p-3">Variance</th>
                                <th className="p-3">Utilization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row: any, index: number) => (
                                <tr
                                    key={`${row.budget_id}-${row.account_id}-${index}`}
                                    className="border-t"
                                >
                                    <td className="p-3">{row.budget_name}</td>
                                    <td className="p-3">
                                        {row.account_code} - {row.account_name}
                                    </td>
                                    <td className="p-3">
                                        {row.cost_center_code
                                            ? `${row.cost_center_code} - ${row.cost_center_name}`
                                            : 'All'}
                                    </td>
                                    <td className="p-3">
                                        {row.fiscal_period_name ?? 'Annual'}
                                    </td>
                                    <td className="p-3">
                                        {Number(row.budget_amount).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        {Number(row.actual_amount).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        {Number(row.variance).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        {Number(row.utilization).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <p className="p-6 text-center text-muted-foreground">
                            No budget data found.
                        </p>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
