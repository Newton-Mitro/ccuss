import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { Badge } from '@/lib/statusConfig';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';

const statuses = [
    { value: '', label: 'All' },
    { value: 'issued', label: 'Issued' },
    { value: 'presented', label: 'Presented' },
    { value: 'cleared', label: 'Cleared' },
    { value: 'bounced', label: 'Bounced' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function Index() {
    const { paginated_data, filters } = usePage<any>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('cheques.index'), {
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, no: string) => {
        appSwal
            .fire({
                title: 'Delete Cheque?',
                text: `Cheque #${no} will be permanently removed.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete',
            })
            .then((r) => {
                if (r.isConfirmed) {
                    router.delete(route('cheques.destroy', id));
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cheques', href: '#' }];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheques" />

            <div className="space-y-4">
                <HeadingSmall
                    title="Cheque Management"
                    description="Track issuance, clearing & lifecycle status"
                />

                {/* FILTER BAR */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <div className="w-64">
                        <Input
                            placeholder="Search cheque / payee / book..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>

                    <div className="w-48">
                        <Select
                            value={data.status}
                            onChange={(v) => {
                                setData('status', v);
                                setData('page', 1);
                            }}
                            options={statuses}
                        />
                    </div>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted/10 text-sm text-muted">
                            <tr>
                                {[
                                    'Cheque No',
                                    'Book',
                                    'Amount',
                                    'Status',
                                    'Payee',
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
                            {paginated_data.data.map((c: any) => (
                                <tr
                                    key={c.id}
                                    className="border-b even:bg-muted/10"
                                >
                                    <td className="px-2 py-1 font-medium">
                                        {c.cheque_number}
                                    </td>

                                    <td className="px-2 py-1">
                                        {c.cheque_book?.book_no ?? '-'}
                                    </td>

                                    <td className="px-2 py-1">
                                        {formatBDTCurrency(c.amount)}
                                    </td>

                                    <td className="px-2 py-1 capitalize">
                                        <Badge text={c.status} />
                                    </td>

                                    <td className="px-2 py-1">
                                        {c.payee_name || '-'}
                                    </td>

                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route(
                                                                'cheques.show',
                                                                c.id,
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
                                                                'cheques.edit',
                                                                c.id,
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
                                                                    c.id,
                                                                    c.cheque_number,
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
                    {paginated_data.data.map((c: any) => (
                        <div
                            key={c.id}
                            className="rounded-md border bg-card p-3"
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">
                                    #{c.cheque_number}
                                </p>
                                <Badge text={c.status} />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Book: {c.cheque_book?.book_no ?? '-'}
                            </p>

                            <p className="text-sm">
                                Amount: {formatBDTCurrency(c.amount)}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Payee: {c.payee_name || '-'}
                            </p>

                            <div className="flex justify-end gap-4 pt-3">
                                <Link href={route('cheques.show', c.id)}>
                                    <Eye className="h-5 w-5" />
                                </Link>

                                <Link href={route('cheques.edit', c.id)}>
                                    <Pencil className="h-5 w-5" />
                                </Link>

                                <button
                                    onClick={() =>
                                        handleDelete(c.id, c.cheque_number)
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
