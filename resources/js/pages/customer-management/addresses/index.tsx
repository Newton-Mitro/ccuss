import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { AddressWithCustomer } from '../../../types/address'; // make sure you have this type

export default function Index() {
    const { props } = usePage<
        SharedData & {
            addresses: {
                data: AddressWithCustomer[];
                links: { url: string | null; label: string; active: boolean }[];
            };
            filters: Record<string, string | number>;
        }
    >();

    const { addresses, filters } = props;

    console.log('addresses', addresses);

    const { data, setData, get } = useForm({
        search: filters.search || '',
        type: filters.type || 'all',
        per_page: Number(filters.per_page) || 5,
        page: Number(filters.page) || 1,
    });

    // Debounced search — fires get() only after typing stops for 400ms
    const handleSearch = () => {
        get('/auth/addresses', {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.type, data.per_page, data.page]);

    // Delete confirmation
    const handleDelete = (id: number, name: string) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: `Address of "${name}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/auth/addresses/${id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () =>
                        toast.success('Address deleted successfully!'),
                    onError: () => toast.error('Failed to delete address.'),
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/auth/addresses' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Addresses" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Customer Addresses"
                        description="Manage all customer addresses."
                    />
                    <Link
                        href="/auth/addresses/create"
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Address
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by customer name, address, or district..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />

                    {/* Type filter */}
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="CURRENT">Current</option>
                        <option value="PERMANENT">Permanent</option>
                        <option value="MAILING">Mailing</option>
                        <option value="WORK">Work</option>
                        <option value="REGISTERED">Registered</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    '#',
                                    'Customer No',
                                    'Customer Name',
                                    'Address',
                                    'District',
                                    'Type',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {addresses.data.length > 0 ? (
                                addresses.data.map((a, i) => (
                                    <tr
                                        key={a.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{i + 1}</td>
                                        <td className="px-2 py-1 font-medium">
                                            {a.customer?.customer_no}
                                        </td>
                                        <td className="px-2 py-1 font-medium">
                                            {a.customer?.name}
                                        </td>
                                        <td className="px-2 py-1">{a.line1}</td>
                                        <td className="px-2 py-1">
                                            {a.district}
                                        </td>
                                        <td className="px-2 py-1">{a.type}</td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a
                                                                href={`/auth/addresses/${a.id}`}
                                                                className="text-primary hover:text-primary/80"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a
                                                                href={`/auth/addresses/${a.id}/edit`}
                                                                className="text-green-600 hover:text-green-500"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        a.id,
                                                                        a
                                                                            .customer
                                                                            ?.name ||
                                                                            '',
                                                                    )
                                                                }
                                                                className="text-destructive hover:text-destructive/80"
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
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No addresses found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    {/* Per page */}
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
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-muted-foreground">
                            records
                        </span>
                    </div>

                    {/* Pagination links */}
                    <div className="flex gap-1">
                        {addresses.links.map((link, i) => (
                            <a
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
