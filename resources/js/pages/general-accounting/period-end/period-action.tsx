import { Head, router, usePage } from '@inertiajs/react';
import { Lock, RotateCcw } from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface FiscalPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'OPEN' | 'CLOSED';
    draft_vouchers_count: number;
    fiscal_year?: { name: string };
}

interface Props extends SharedData {
    operation: 'close' | 'reopen';
    fiscalPeriods: FiscalPeriod[];
}

export default function PeriodActionPage() {
    const { operation, fiscalPeriods } = usePage<Props>().props;
    const isClosing = operation === 'close';
    const actionRoute = isClosing
        ? 'fiscal-periods.close'
        : 'fiscal-periods.reopen';

    useFlashToastHandler();

    const handleAction = (period: FiscalPeriod) => {
        if (period.draft_vouchers_count > 0) return;
        if (
            !window.confirm(
                `${isClosing ? 'Close' : 'Reopen'} fiscal period "${period.name}"?`,
            )
        )
            return;

        router.post(
            route(actionRoute, period.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['fiscalPeriods'] }),
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Period-End Operations', href: '' },
        {
            title: isClosing ? 'Close Period' : 'Reopen Period',
            href: isClosing ? '/period-end/close' : '/period-end/reopen',
        },
    ];

    const periods = fiscalPeriods.filter((period) =>
        isClosing ? period.status === 'OPEN' : period.status === 'CLOSED',
    );

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isClosing ? 'Close Period' : 'Reopen Period'} />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title={
                        isClosing
                            ? 'Close Fiscal Period'
                            : 'Reopen Fiscal Period'
                    }
                    description={
                        isClosing
                            ? 'Close periods after all draft vouchers are resolved.'
                            : 'Reopen a previously closed fiscal period.'
                    }
                />
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    'Period',
                                    'Fiscal Year',
                                    'Start Date',
                                    'End Date',
                                    'Draft Vouchers',
                                    'Action',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="border-b px-3 py-2 text-left font-medium"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.length > 0 ? (
                                periods.map((period) => {
                                    const blocked =
                                        isClosing &&
                                        period.draft_vouchers_count > 0;
                                    return (
                                        <tr
                                            key={period.id}
                                            className="border-b even:bg-muted/50"
                                        >
                                            <td className="px-3 py-2">
                                                {period.name}
                                            </td>
                                            <td className="px-3 py-2">
                                                {period.fiscal_year?.name ||
                                                    '-'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {new Date(
                                                    period.start_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-2">
                                                {new Date(
                                                    period.end_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-2">
                                                {period.draft_vouchers_count}
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    type="button"
                                                    disabled={blocked}
                                                    onClick={() =>
                                                        handleAction(period)
                                                    }
                                                    title={
                                                        blocked
                                                            ? 'Resolve draft vouchers first'
                                                            : undefined
                                                    }
                                                    className="text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {isClosing ? (
                                                        <Lock className="h-5 w-5" />
                                                    ) : (
                                                        <RotateCcw className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-8 text-center text-muted-foreground"
                                    >
                                        No eligible periods found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
