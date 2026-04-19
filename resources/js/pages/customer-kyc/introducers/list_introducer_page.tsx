import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerIntroducer } from '../../../types/customer_kyc_module';
import { PaginatedResponse } from '../../../types/paginated_response';
import { introducerStatuses } from './data/introducer_status';

interface Props extends SharedData {
    paginated_data: PaginatedResponse<CustomerIntroducer>;
    filters: Record<string, string>;
}

export default function IntroducersIndex() {
    const { paginated_data, filters } = usePage<Props>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        verification_status: filters.verification_status || 'all',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('introducers.index'), { preserveState: true });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.verification_status, data.per_page, data.page]);

    const handleDelete = (id: number) => {
        appSwal
            .fire({
                title: 'Delete introducer?',
                text: 'This introducer will be permanently removed.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((res) => {
                if (res.isConfirmed) {
                    router.delete(route('introducers.destroy', id), {
                        preserveScroll: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Introducers', href: '#' }];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Introducers" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Introducers"
                        description="Manage customer introducers."
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        {' '}
                        <Input
                            type="text"
                            placeholder="Search customer…"
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                    <div className="w-48">
                        <Select
                            value={data.verification_status}
                            onChange={(value) => {
                                setData('verification_status', value);
                                setData('page', 1);
                            }}
                            options={introducerStatuses}
                        />
                    </div>
                </div>

                {/* ================= Desktop Table ================= */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted/10 text-sm text-muted">
                            <tr>
                                {[
                                    'ID',
                                    'Introduced Customer',
                                    'Introducer',
                                    'Relationship',
                                    'Status',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b p-2 text-left text-sm text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated_data.data.map((i) => (
                                <tr
                                    key={i.id}
                                    className="border-b even:bg-muted/10"
                                >
                                    <td className="px-2 py-1">{i.id}</td>
                                    <td className="px-2 py-1">
                                        {i.introduced_customer?.name ?? '—'}
                                    </td>
                                    <td className="px-2 py-1">
                                        {i.introducer?.name ?? '—'}
                                    </td>
                                    <td className="px-2 py-1 capitalize">
                                        {i.relationship_type.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-2 py-1">
                                        <Badge text={i.verification_status} />
                                    </td>
                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route(
                                                                'introducers.show',
                                                                i.id,
                                                            )}
                                                            className="text-info"
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
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    i.id,
                                                                )
                                                            }
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
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

                {/* ================= Mobile Cards ================= */}
                <div className="space-y-3 md:hidden">
                    {paginated_data.data.map((i) => (
                        <div
                            key={i.id}
                            className="space-y-2 rounded-md border bg-card p-3"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">
                                        {i.introduced_customer?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Introducer: {i.introducer?.name}
                                    </p>
                                </div>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    <Badge text={i.verification_status} />
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                {i.relationship_type}
                            </p>

                            <div className="flex justify-end gap-4">
                                <Link
                                    href={route('introducers.show', i.id)}
                                    className="text-info"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(i.id)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={paginated_data.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
