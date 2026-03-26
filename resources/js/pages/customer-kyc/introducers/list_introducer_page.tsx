import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerIntroducer } from '../../../types/customer_kyc_module';

export default function IntroducersIndex() {
    const { props } = usePage<
        SharedData & {
            introducers: {
                data: CustomerIntroducer[];
                links: any[];
            };
            filters: Record<string, string>;
        }
    >();

    const { introducers, filters } = props;

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
                        onSuccess: () =>
                            toast.success('Introducer deleted successfully'),
                        onError: () =>
                            toast.error('Failed to delete introducer'),
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
                    <input
                        type="text"
                        placeholder="Search customer…"
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
                    />

                    <select
                        value={data.verification_status}
                        onChange={(e) => {
                            setData('verification_status', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:max-w-xs"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* ================= Desktop Table ================= */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted">
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
                            {introducers.data.map((i) => (
                                <tr
                                    key={i.id}
                                    className="border-b even:bg-muted/30"
                                >
                                    <td className="px-2 py-1">{i.id}</td>
                                    <td className="px-2 py-1">
                                        {i.introduced_customer?.name ?? '—'}
                                    </td>
                                    <td className="px-2 py-1">
                                        {i.introducer?.name ?? '—'}
                                    </td>
                                    <td className="px-2 py-1">
                                        {i.relationship_type}
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
                    {introducers.data.map((i) => (
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
                    links={introducers.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
