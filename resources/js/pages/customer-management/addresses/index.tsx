import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, useForm } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface IndexProps {
    addresses: any; // Inertia paginated response
    filters: {
        search?: string;
        type?: string;
        perPage?: number;
        page?: number;
    };
}

export default function Index({ addresses, filters }: IndexProps) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        type: filters.type || 'all',
        perPage: filters.perPage || 5,
        page: filters.page || 1,
    });

    // Debounced fetch for search input
    const fetchAddresses = debounce(() => {
        get('/auth/addresses', { preserveState: true, replace: true });
    }, 400);

    useEffect(() => {
        // Trigger fetch when type or perPage changes
        get('/auth/addresses', { preserveState: true, replace: true });
    }, [data.type, data.perPage, data.page]);

    const handleSearchChange = (value: string) => {
        setData('search', value);
        setData('page', 1);
        fetchAddresses();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/auth/addresses' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Addresses" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Customer Addresses"
                        description="Manage all customer addresses."
                    />
                    <Link
                        href="/auth/addresses/create"
                        className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Add Address
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search ..."
                        value={data.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                    <select
                        value={data.type}
                        onChange={(e) => {
                            setData('page', 1);
                            setData('type', e.target.value);
                        }}
                        className="h-9 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
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
                        <thead className="sticky top-0 hidden bg-muted md:table-header-group">
                            <tr>
                                {[
                                    'Customer',
                                    'Line 1',
                                    'Line 2',
                                    'Division',
                                    'District',
                                    'Upazila',
                                    'Type',
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
                        <tbody className="flex flex-col md:table-row-group">
                            {addresses.data.length > 0 ? (
                                addresses.data.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="flex flex-col border-b border-border even:bg-muted/30 md:table-row md:flex-row"
                                    >
                                        <td className="px-2 py-1">
                                            {a.customer.name}
                                        </td>
                                        <td className="px-2 py-1">{a.line1}</td>
                                        <td className="px-2 py-1">
                                            {a.line2 ?? '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.division}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.district}
                                        </td>
                                        <td className="px-2 py-1">
                                            {a.upazila ?? '-'}
                                        </td>
                                        <td className="px-2 py-1">{a.type}</td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/auth/addresses/${a.id}`}
                                                                className="text-primary hover:text-primary/80"
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
                                                                href={`/auth/addresses/${a.id}/edit`}
                                                                className="text-green-600 hover:text-green-500"
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
                                                            <Link
                                                                href={`/auth/addresses/${a.id}/delete`}
                                                                className="text-destructive hover:text-destructive/80"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Link>
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
                                        colSpan={8}
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={data.perPage}
                            onChange={(e) => {
                                setData('perPage', Number(e.target.value));
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

                    <div className="flex gap-1">
                        {addresses.links.map((link: any, i: number) => (
                            <Link
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
