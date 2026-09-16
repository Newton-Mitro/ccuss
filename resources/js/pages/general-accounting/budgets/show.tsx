import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { route } from 'ziggy-js';

export default function BudgetShow() {
    const { budget } = usePage().props as any;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Budgets', href: route('budgets.index') },
        { title: budget.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={budget.name} />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title={budget.name}
                        description={`${budget.fiscal_year?.name ?? ''} budget details`}
                    />
                    {budget.status === 'DRAFT' && (
                        <Link href={route('budgets.edit', budget.id)}>
                            <Button size="sm">
                                <Pencil className="mr-1 h-4 w-4" /> Edit Budget
                            </Button>
                        </Link>
                    )}
                </div>
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-3">Account</th>
                                <th className="p-3">Cost center</th>
                                <th className="p-3">Fiscal period</th>
                                <th className="p-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budget.entries.map((entry: any) => (
                                <tr key={entry.id} className="border-t">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {budget.entries.length === 0 && (
                        <p className="p-6 text-center text-muted-foreground">
                            No budget entries found.
                        </p>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
