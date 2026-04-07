import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { User } from '../../../types/user';

export default function Index() {
    const { props } = usePage<
        SharedData & {
            users: any;
            filters: Record<string, string>;
        }
    >();

    const { users, filters, flash } = props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get('/users', { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `User "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(`/users/${id}`, {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Users"
                        description="Manage all organization users and their permissions"
                    />
                    <div className="flex gap-2">
                        <Link
                            href="/users/create"
                            className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Create User
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                </div>

                {/* ===================== */}
                {/* Desktop Table */}
                {/* ===================== */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Name',
                                    'Email',
                                    'Organization',
                                    'Branch',
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
                            {users.data.length ? (
                                users.data.map((u: User) => (
                                    <tr
                                        key={u.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{u.name}</td>
                                        <td className="px-2 py-1">{u.email}</td>
                                        <td className="px-2 py-1">
                                            {u.organization?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {u.branch?.name}
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                            <TooltipProvider>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/users/${u.id}`}
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
                                                            <Link
                                                                href={`/users/${u.id}/edit`}
                                                                className="text-success"
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
                                                                        u.id,
                                                                        u.name,
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ===================== */}
                {/* Mobile Cards */}
                {/* ===================== */}
                <div className="space-y-3 md:hidden">
                    {users.data.map((u: User) => (
                        <div
                            key={u.id}
                            className="space-y-2 rounded-md border bg-card p-3"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {u.email} · {u.organization?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-2">
                                <Link
                                    href={`/users/${u.id}`}
                                    className="text-primary"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                <Link
                                    href={`/users/${u.id}/edit`}
                                    className="text-success"
                                >
                                    <Pencil className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(u.id, u.name)}
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
                    links={users.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
