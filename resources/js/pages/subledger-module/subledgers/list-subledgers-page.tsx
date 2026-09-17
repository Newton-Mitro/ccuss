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
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import formatUndersoreString from '../../../lib/formatUnderscoreString';
import { Subledger } from '../../../types/subledger_module';

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
        per_page: Number(filters.per_page) || 18,
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
                <ResourcePageHeader
                    title="Subledgers"
                    description="Manage subledger accounts and classifications"
                    action={
                        <Link
                            href={route('subledgers.create')}
                            className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Add Subledger
                            </span>
                        </Link>
                    }
                />

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
                {subledgers.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No subledgers found
                        </p>
                        <p className="text-xs">
                            Try adjusting your search or create a new subledger.
                        </p>
                        <Link
                            href={route('subledgers.create')}
                            className="mt-4 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Add Subledger
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <ResourceTableCard>
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
                                        {subledgers.data.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="border-b even:bg-muted hover:bg-accent/20"
                                            >
                                                <td className="px-2 py-1">
                                                    {s.code}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {s.name}
                                                </td>
                                                <td className="px-2 py-1 capitalize">
                                                    {formatUndersoreString(
                                                        s.subledger_type,
                                                    )}
                                                </td>
                                                <td className="px-2 py-1 capitalize">
                                                    {formatUndersoreString(
                                                        s.subledger_sub_type,
                                                    )}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {s.gl_account?.name}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <StatusBadge
                                                        tone={
                                                            s.is_active
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                    >
                                                        {s.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </StatusBadge>
                                                </td>

                                                <td className="px-2 py-1">
                                                    <TooltipProvider>
                                                        <div className="flex space-x-2">
                                                            {/* View */}
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
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
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
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
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
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
                                        ))}
                                    </tbody>
                                </table>
                            </ResourceTableCard>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {subledgers.data.map((s) => (
                                <div
                                    key={s.id}
                                    className="space-y-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {s.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {s.code} ·{' '}
                                                {formatUndersoreString(
                                                    s.subledger_type,
                                                )}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            tone={
                                                s.is_active
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {s.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </StatusBadge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {s.gl_account?.name ||
                                            'No GL account assigned'}
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={route(
                                                'subledgers.show',
                                                s.id,
                                            )}
                                            className="rounded border px-3 py-1.5 text-xs"
                                        >
                                            <Eye className="mr-1 inline h-4 w-4" />{' '}
                                            View
                                        </Link>
                                        <Link
                                            href={route(
                                                'subledgers.edit',
                                                s.id,
                                            )}
                                            className="rounded border px-3 py-1.5 text-xs"
                                        >
                                            <Pencil className="mr-1 inline h-4 w-4" />{' '}
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(s.id, s.name)
                                            }
                                            className="rounded border px-3 py-1.5 text-xs text-destructive"
                                        >
                                            <Trash2 className="mr-1 inline h-4 w-4" />{' '}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

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
