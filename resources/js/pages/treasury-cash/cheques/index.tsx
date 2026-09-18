import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckSquare } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../../components/data-table-pagination';
import HeadingSmall from '../../../../components/heading-small';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface ChequeListItem {
    id: number;
    cheque_no: string;
    status:
        | 'UNUSED'
        | 'ISSUED'
        | 'PRESENTED'
        | 'CLEARED'
        | 'BOUNCED'
        | 'STOPPED'
        | 'CANCELLED'
        | 'EXPIRED';
    cheque_date?: string | null;
    amount?: string | number | null;
    payee?: string | null;
    cheque_book?: {
        book_no: string;
        bank_account?: {
            account_name: string;
            bank?: { name: string } | null;
        } | null;
    } | null;
}

interface ChequeIndexProps extends SharedData {
    cheques: {
        data: ChequeListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { cheques, filters } = usePage<ChequeIndexProps>().props;
    useFlashToastHandler();
    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(
            () =>
                get(route('cheques.index'), {
                    preserveState: true,
                    replace: true,
                }),
            400,
        );
        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cheque Management', href: '' },
        { title: 'Cheques', href: route('cheques.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheques" />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Cheques"
                    description="Track cheque status, dates, payees, and linked bank accounts."
                />
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search cheque, book, or payee..."
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
                                    'Cheque',
                                    'Book',
                                    'Bank Account',
                                    'Cheque Date',
                                    'Payee',
                                    'Amount',
                                    'Status',
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
                            {cheques.data.length > 0 ? (
                                cheques.data.map((cheque, index) => (
                                    <tr
                                        key={cheque.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(cheques.current_page - 1) *
                                                cheques.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {cheque.cheque_no}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {cheque.cheque_book?.book_no ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {cheque.cheque_book?.bank_account
                                                ?.account_name ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {cheque.cheque_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {cheque.payee ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {cheque.amount ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {cheque.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No cheques found for this organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={cheques.per_page}
                    currentPage={cheques.current_page}
                    totalItems={cheques.total}
                    totalPages={cheques.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', cheques.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, cheques.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
