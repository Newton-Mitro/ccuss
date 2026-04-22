import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import { formatDateTime } from '../../../lib/date_util';

interface Props extends SharedData {
    paginated_data: any;
    filters: Record<string, string>;
}

export default function Index() {
    const { paginated_data, filters } = usePage<Props>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('cheque-books.index'), {
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleDelete = (id: number, bookNo: string) => {
        appSwal
            .fire({
                title: 'Delete Cheque Book?',
                text: `Book "${bookNo}" and all related cheques will be removed.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it',
            })
            .then((res) => {
                if (res.isConfirmed) {
                    router.delete(route('cheque-books.destroy', id));
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cheque Management', href: '' },
        { title: 'Cheque Books', href: route('cheque-books.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Books" />

            <div className="space-y-4">
                {/* HEADER */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Cheque Books"
                        description="Manage cheque book issuance & lifecycle"
                    />

                    <Link
                        href={route('cheque-books.create')}
                        className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        New Book
                    </Link>
                </div>

                {/* FILTER */}
                <div className="w-64">
                    <Input
                        className="bg-card"
                        placeholder="Search by book number..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                    />
                </div>

                {/* TABLE (DESKTOP) */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    'Book No',
                                    'Start No',
                                    'End No',
                                    'Total Cheques',
                                    'Issued At',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {paginated_data.data.map((b: any) => (
                                <tr
                                    key={b.id}
                                    className="border-b transition-all even:bg-muted hover:scale-[1.01] hover:opacity-50"
                                >
                                    <td className="px-2 py-1 font-medium">
                                        {b.book_no}
                                    </td>

                                    <td className="px-2 py-1">
                                        {b.start_number}
                                    </td>

                                    <td className="px-2 py-1">
                                        {b.end_number}
                                    </td>

                                    <td className="px-2 py-1">
                                        <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                                            {b.cheques?.length ?? 0}
                                        </span>
                                    </td>

                                    <td className="px-2 py-1">
                                        {formatDateTime(b.issued_at)}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex gap-3">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route(
                                                                'cheque-books.show',
                                                                b.id,
                                                            )}
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        View
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route(
                                                                'cheque-books.edit',
                                                                b.id,
                                                            )}
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    b.id,
                                                                    b.book_no,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-5 w-5 text-destructive" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Delete
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE */}
                <div className="space-y-3 md:hidden">
                    {paginated_data.data.map((b: any) => (
                        <div
                            key={b.id}
                            className="rounded-md border bg-card p-3"
                        >
                            <p className="font-semibold">{b.book_no}</p>

                            <p className="text-xs text-muted-foreground">
                                Range: {b.start_number} → {b.end_number}
                            </p>

                            <p className="text-xs">
                                Cheques: {b.cheques?.length ?? 0}
                            </p>

                            <div className="flex justify-end gap-4 pt-3">
                                <Link href={route('cheque-books.show', b.id)}>
                                    <Eye className="h-5 w-5" />
                                </Link>

                                <Link href={route('cheque-books.edit', b.id)}>
                                    <Pencil className="h-5 w-5" />
                                </Link>

                                <button
                                    onClick={() =>
                                        handleDelete(b.id, b.book_no)
                                    }
                                >
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINATION */}
                <DataTablePagination
                    perPage={paginated_data.per_page}
                    onPerPageChange={(v) => {
                        setData('per_page', v);
                        setData('page', 1);
                    }}
                    links={paginated_data.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
