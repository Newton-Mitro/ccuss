import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { ResourceEmptyState } from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { formatDate } from '@/lib/date_util';
import type {
    FiscalPeriod,
    Props,
} from '@/modules/general-accounting/types/period-end/period-action.interfaces';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Lock, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function PeriodActionPage() {
    const { operation, fiscalPeriods, filters } = usePage<Props>().props;
    const isClosing = operation === 'close';
    const actionRoute = isClosing
        ? 'fiscal-periods.close'
        : 'fiscal-periods.reopen';
    const indexRoute = isClosing ? 'period-end.close' : 'period-end.reopen';

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            get(route(indexRoute), {
                preserveState: true,
                preserveScroll: true,
            });
        }, 400);

        return () => clearTimeout(timeout);
    }, [data.search, data.per_page, data.page, get, indexRoute]);

    const handleAction = async (period: FiscalPeriod) => {
        if (period.draft_vouchers_count > 0) return;
        const action = isClosing ? 'Close' : 'Reopen';
        const confirmation = await appSwal.fire({
            title: `${action} fiscal period?`,
            text: `${action} fiscal period "${period.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `${action} period`,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });
        if (!confirmation.isConfirmed) return;

        router.post(
            route(actionRoute, period.id),
            {},
            {
                preserveScroll: true,
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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isClosing ? 'Close Period' : 'Reopen Period'} />
            <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
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
                </div>
                <div className="w-60">
                    <Input
                        className="bg-card"
                        placeholder="Search periods..."
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                    />
                </div>
                {fiscalPeriods.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No eligible periods found"
                        description="Try a different search term."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 bg-muted text-muted-foreground">
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
                                {fiscalPeriods.data.map((period) => {
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
                                                {formatDate(period.start_date)}
                                            </td>
                                            <td className="px-3 py-2">
                                                {formatDate(period.end_date)}
                                            </td>
                                            <td className="px-3 py-2">
                                                {period.draft_vouchers_count}
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    type="button"
                                                    aria-label={`${isClosing ? 'Close' : 'Reopen'} ${period.name}`}
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
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {fiscalPeriods.data.length > 0 && (
                    <DataTablePagination
                        perPage={fiscalPeriods.per_page}
                        onPerPageChange={(perPage) => {
                            setData('per_page', perPage);
                            setData('page', 1);
                        }}
                        links={fiscalPeriods.links}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}
