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
import HeadingSmall from '../../../components/heading-small';
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

    const { users, filters } = props;

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
                        onSuccess: () =>
                            toast.success(
                                `User "${name}" deleted successfully!`,
                            ),
                        onError: () =>
                            toast.error('Failed to delete the user.'),
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-4 p-2">
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
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>

                {/* ===================== */}
                {/* Desktop Table */}
                {/* ===================== */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border md:block">
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
                                                                className="text-primary"
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
                                                                className="text-green-600 dark:text-green-400"
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
                                    className="text-green-600 dark:text-green-400"
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
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={data.per_page}
                            onChange={(e) => {
                                setData('per_page', Number(e.target.value));
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {users.links.map((link: any, i: number) => (
                            <a
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
