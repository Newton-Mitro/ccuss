import HeadingSmall from '@/components/heading-small';
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
        budgets: { data: Budget[]; links: any[] };
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Budgets"
                        description="Plan and monitor spending by account, cost center, and period."
                    />
                    <div className="flex gap-2">
                        <Link
                            href={route('financial-reports.budget-vs-actual')}
                        >
                            <Button variant="outline" size="sm">
                                Budget vs Actual
                            </Button>
                        </Link>
                        <Link href={route('budgets.create')}>
                            <Button size="sm">
                                <Plus className="mr-1 h-4 w-4" /> Create Budget
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Fiscal year</th>
                                <th className="p-3">Entries</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.data.map((budget) => (
                                <tr key={budget.id} className="border-t">
                                    <td className="p-3 font-medium">
                                        {budget.name}
                                    </td>
                                    <td className="p-3">
                                        {budget.fiscal_year?.name}
                                    </td>
                                    <td className="p-3">
                                        {budget.entries_count}
                                    </td>
                                    <td className="p-3">
                                        {Number(
                                            budget.entries_sum_amount ?? 0,
                                        ).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={
                                                budget.status === 'ACTIVE'
                                                    ? 'text-green-600'
                                                    : budget.status === 'CLOSED'
                                                      ? 'text-muted-foreground'
                                                      : 'text-amber-600'
                                            }
                                        >
                                            {budget.status}
                                        </span>
                                    </td>
                                    <td className="flex gap-3 p-3">
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
                </div>
            </div>
        </CustomAuthLayout>
    );
}
