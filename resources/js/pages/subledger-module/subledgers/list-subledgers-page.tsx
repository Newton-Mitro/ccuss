import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';

interface Subledger {
    id: number;
    code: string;
    name: string;
    short_name?: string;
    type: string;
    sub_type: string;
    is_active: boolean;
    gl_account?: {
        id: number;
        name: string;
    };
}

interface SubledgerPageProps extends SharedData {
    subledgers: {
        data: Subledger[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { subledgers, filters } = usePage<SubledgerPageProps>().props;

    useFlashToastHandler();

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('subledgers.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Subledger "${name}" will be deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('subledgers.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subledger Management', href: '' },
        { title: 'Subledgers', href: route('subledgers.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Subledgers" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Subledgers"
                        description="Manage subledger accounts and classifications"
                    />

                    <Link
                        href={route('subledgers.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Subledger
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-64">
                        <Input
                            className="bg-card"
                            type="text"
                            placeholder="Search subledgers..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted text-sm">
                            <tr>
                                {[
                                    'Code',
                                    'Name',
                                    'Type',
                                    'Sub Type',
                                    'GL Account',
                                    'Status',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {subledgers.data.length > 0 ? (
                                subledgers.data.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b transition-colors even:bg-muted hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-1">{s.code}</td>
                                        <td className="px-2 py-1">{s.name}</td>
                                        <td className="px-2 py-1 capitalize">
                                            {s.type}
                                        </td>
                                        <td className="px-2 py-1 capitalize">
                                            {s.sub_type}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.gl_account?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {s.is_active ? (
                                                <span className="text-green-600">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="text-destructive">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    {/* View */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'subledgers.show',
                                                                    s.id,
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

                                                    {/* Edit */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    'subledgers.edit',
                                                                    s.id,
                                                                )}
                                                                className="text-success"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Delete */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        s.id,
                                                                        s.name,
                                                                    )
                                                                }
                                                                className="text-destructive hover:text-destructive/80 disabled:opacity-50"
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No subledgers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={(value: number) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={subledgers.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
