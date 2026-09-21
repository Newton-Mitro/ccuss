import { Head, useForm, usePage } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../../components/data-table-pagination';
import HeadingSmall from '../../../../components/heading-small';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface BankListItem {
    id: number;
    code: string;
    name: string;
    short_name?: string | null;
    status: boolean;
    accounts_count?: number;
}

interface BankIndexProps extends SharedData {
    banks: {
        data: BankListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { banks, filters } = usePage<BankIndexProps>().props;
    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('banks.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Banks', href: route('banks.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Banks" />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Banks"
                    description="Review banks configured for the active organization and their account coverage."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search bank code or name..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-200 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Bank',
                                    'Code',
                                    'Short Name',
                                    'Status',
                                    'Accounts',
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
                            {banks.data.length > 0 ? (
                                banks.data.map((bank, index) => (
                                    <tr
                                        key={bank.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(banks.current_page - 1) *
                                                banks.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <Landmark className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {bank.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {bank.code}
                                        </td>
                                        <td className="px-2 py-2">
                                            {bank.short_name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {bank.status
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            {bank.accounts_count ?? 0}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No banks found for this organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={banks.per_page}
                    currentPage={banks.current_page}
                    totalItems={banks.total}
                    totalPages={banks.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', banks.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, banks.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
