import { Head, useForm, usePage } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface TellerSessionListItem {
    id: number;
    status: 'OPEN' | 'CLOSING' | 'CLOSED';
    opening_cash: string | number;
    closing_cash?: string | number | null;
    expected_cash?: string | number | null;
    cash_difference?: string | number | null;
    opened_at?: string | null;
    closed_at?: string | null;
    teller?: { code: string; name: string } | null;
    branch_day?: {
        business_date: string;
        branch?: { name: string; code: string } | null;
    } | null;
    opened_by?: { name: string } | null;
    closed_by?: { name: string } | null;
}

interface TellerSessionIndexProps extends SharedData {
    teller_sessions: {
        data: TellerSessionListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { teller_sessions, filters } =
        usePage<TellerSessionIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('teller-sessions.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller Sessions" />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Teller Sessions"
                    description="Review teller session status and cash position for each business day."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search teller, branch, date, or status..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-240 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Teller',
                                    'Branch',
                                    'Business Date',
                                    'Status',
                                    'Opening Cash',
                                    'Closing Cash',
                                    'Difference',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left font-medium"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teller_sessions.data.length > 0 ? (
                                teller_sessions.data.map((session, index) => (
                                    <tr
                                        key={session.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(teller_sessions.current_page -
                                                1) *
                                                teller_sessions.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {session.teller?.name ??
                                                            '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {session.teller?.code ??
                                                            '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.branch_day?.branch?.name ??
                                                '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.branch_day
                                                ?.business_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.opening_cash}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.closing_cash ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {session.cash_difference ?? '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No teller sessions found for this
                                        organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={teller_sessions.per_page}
                    currentPage={teller_sessions.current_page}
                    totalItems={teller_sessions.total}
                    totalPages={teller_sessions.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() =>
                        setData('page', teller_sessions.current_page + 1)
                    }
                    onPrevious={() =>
                        setData(
                            'page',
                            Math.max(1, teller_sessions.current_page - 1),
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
