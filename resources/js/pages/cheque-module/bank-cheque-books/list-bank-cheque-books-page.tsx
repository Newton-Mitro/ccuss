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
            get(route('bank-cheque-books.index'), { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Cheque Book "${name}" will be deleted!`,
                icon: 'warning',
                showCancelButton: true,
            })
            .then((r) => {
                if (r.isConfirmed) {
                    router.delete(route('bank-cheque-books.destroy', id));
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cheque Books', href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Books" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <HeadingSmall
                        title="Cheque Books"
                        description="Manage cheque book issuance"
                    />
                    <Link
                        href={route('bank-cheque-books.create')}
                        className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" />
                        Add Book
                    </Link>
                </div>

                {/* Filters */}
                <div className="w-60">
                    <Input
                        placeholder="Search book..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                    />
                </div>

                {/* Desktop Table */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Book No',
                                    'Account',
                                    'Start',
                                    'End',
                                    'Issued At',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="p-2 text-left text-sm"
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
                                    className="border-b even:bg-muted/30"
                                >
                                    <td className="px-2 py-1">{b.book_no}</td>
                                    <td className="px-2 py-1">
                                        {b.deposit_account?.name}
                                    </td>
                                    <td className="px-2 py-1">
                                        {b.start_number}
                                    </td>
                                    <td className="px-2 py-1">
                                        {b.end_number}
                                    </td>
                                    <td className="px-2 py-1">{b.issued_at}</td>
                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route(
                                                                'bank-cheque-books.show',
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
                                                                'bank-cheque-books.edit',
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

                {/* Mobile */}
                <div className="space-y-3 md:hidden">
                    {paginated_data.data.map((b: any) => (
                        <div
                            key={b.id}
                            className="rounded-md border bg-card p-3"
                        >
                            <p className="font-medium">{b.book_no}</p>
                            <p className="text-xs text-muted-foreground">
                                {b.deposit_account?.name}
                            </p>
                            <p className="text-xs">
                                {b.start_number} → {b.end_number}
                            </p>

                            <div className="flex justify-end gap-3 pt-2">
                                <Eye />
                                <Pencil />
                                <Trash2
                                    className="text-destructive"
                                    onClick={() =>
                                        handleDelete(b.id, b.book_no)
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>

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
