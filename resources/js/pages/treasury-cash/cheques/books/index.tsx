import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BookOpenCheck, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../../components/data-table-pagination';
import HeadingSmall from '../../../../components/heading-small';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface ChequeBookListItem {
    id: number;
    book_no: string;
    prefix?: string | null;
    start_number: number;
    end_number: number;
    current_number?: number | null;
    leaf_count: number;
    issued_date?: string | null;
    status: 'AVAILABLE' | 'IN_USE' | 'EXHAUSTED' | 'CANCELLED';
    bank_account?: {
        account_name: string;
        account_number: string;
        bank?: { name: string } | null;
    } | null;
}

interface ChequeBookIndexProps extends SharedData {
    books: {
        data: ChequeBookListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export default function Index() {
    const { books, filters } = usePage<ChequeBookIndexProps>().props;
    useFlashToastHandler();
    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(
            () =>
                get(route('cheque-books.index'), {
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
        { title: 'Cheque Books', href: route('cheque-books.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Books" />
            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Cheque Books"
                    description="Review cheque books assigned to the active organization bank accounts."
                />
                <Link
                    href={route('cheque-books.create')}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                >
                    <Plus className="h-4 w-4" /> Create cheque book
                </Link>
                <Input
                    className="w-full bg-card sm:w-80"
                    placeholder="Search book, account, or bank..."
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
                                    'Book',
                                    'Bank Account',
                                    'Range',
                                    'Issued',
                                    'Leaves',
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
                            {books.data.length > 0 ? (
                                books.data.map((book, index) => (
                                    <tr
                                        key={book.id}
                                        className="border-b even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(books.current_page - 1) *
                                                books.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {book.book_no}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {book.prefix ?? '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            <div>
                                                {book.bank_account
                                                    ?.account_name ?? '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {book.bank_account?.bank
                                                    ?.name ?? ''}{' '}
                                                {book.bank_account
                                                    ?.account_number ?? ''}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            {book.start_number} -{' '}
                                            {book.end_number}
                                        </td>
                                        <td className="px-2 py-2">
                                            {book.issued_date ?? '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            {book.leaf_count}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="rounded-full border px-2 py-1 text-xs font-medium">
                                                {book.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No cheque books found for this
                                        organization.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DataTablePagination
                    perPage={books.per_page}
                    currentPage={books.current_page}
                    totalItems={books.total}
                    totalPages={books.last_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    onPageChange={(value) => setData('page', value)}
                    onNext={() => setData('page', books.current_page + 1)}
                    onPrevious={() =>
                        setData('page', Math.max(1, books.current_page - 1))
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
