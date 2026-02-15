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
import Swal from 'sweetalert2';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Customer } from '../../../types/customer';

export default function Index() {
    const { props } = usePage<
        SharedData & {
            customers: any;
            filters: Record<string, string>;
        }
    >();

    const { customers, filters } = props;

    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get('/customers', { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        const isDark = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: 'Are you sure?',
            text: `Customer "${name}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/customers/${id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () =>
                        toast.success(
                            `Customer "${name}" deleted successfully!`,
                        ),
                    onError: () =>
                        toast.error('Failed to delete the customer.'),
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/customers' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="space-y-4 p-2">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Customers"
                        description="Manage your customers."
                    />
                    <div className="flex gap-2">
                        <Link
                            href="/customers/create"
                            className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Create Customer
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    <select
                        value={data.status}
                        onChange={(e) => {
                            setData('status', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none sm:max-w-xs"
                    >
                        <option value="all">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                {/* ===================== */}
                {/* Desktop Table */}
                {/* ===================== */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border border-border md:block">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Customer Id',
                                    'Customer No',
                                    'Name',
                                    'Type',
                                    'Phone',
                                    'Email',
                                    'Status',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((c: Customer) => (
                                <tr
                                    key={c.id}
                                    className="border-b border-border even:bg-muted/30"
                                >
                                    <td className="px-2 py-1">{c.id}</td>
                                    <td className="px-2 py-1">
                                        {c.customer_no}
                                    </td>
                                    <td className="px-2 py-1">{c.name}</td>
                                    <td className="px-2 py-1">{c.type}</td>
                                    <td className="px-2 py-1">{c.phone}</td>
                                    <td className="px-2 py-1">{c.email}</td>
                                    <td className="px-2 py-1">{c.status}</td>
                                    <td className="px-2 py-1 whitespace-nowrap">
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`/customers/${c.id}`}
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
                                                            href={`/customers/${c.id}/edit`}
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
                                                                    c.id,
                                                                    c.name,
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

                {/* ===================== */}
                {/* Mobile Cards */}
                {/* ===================== */}
                <div className="space-y-3 md:hidden">
                    {customers.data.map((c: Customer) => (
                        <div
                            key={c.id}
                            className="space-y-2 rounded-md border border-border bg-card p-3"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {c.customer_no} · {c.type}
                                    </p>
                                </div>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    {c.status}
                                </span>
                            </div>

                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>📞 {c.phone || '—'}</p>
                                <p>✉️ {c.email || '—'}</p>
                            </div>

                            <div className="flex justify-end gap-4 pt-2">
                                <Link
                                    href={`/customers/${c.id}`}
                                    className="text-primary"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                <Link
                                    href={`/customers/${c.id}/edit`}
                                    className="text-green-600 dark:text-green-400"
                                >
                                    <Pencil className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(c.id, c.name)}
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
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {customers.links.map((link: any, i: number) => (
                            <a
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
