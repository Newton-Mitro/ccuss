import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../types';

export default function Index() {
    // ✅ Mock branches data
    const allBranches = [
        {
            id: 1,
            code: 'BR001',
            name: 'Head Office',
            address: '12/A Gulshan Avenue, Dhaka',
            latitude: 23.7925,
            longitude: 90.4078,
            manager: 'Mahmud Hasan',
        },
        {
            id: 2,
            code: 'BR002',
            name: 'Uttara Branch',
            address: 'Sector 4, Uttara, Dhaka',
            latitude: 23.8759,
            longitude: 90.3795,
            manager: 'Sadia Rahman',
        },
        {
            id: 3,
            code: 'BR003',
            name: 'Chittagong Branch',
            address: 'Agrabad, Chittagong',
            latitude: 22.3364,
            longitude: 91.8317,
            manager: 'Imran Chowdhury',
        },
        {
            id: 4,
            code: 'BR004',
            name: 'Sylhet Branch',
            address: 'Zindabazar, Sylhet',
            latitude: 24.8949,
            longitude: 91.8687,
            manager: 'Rafiul Karim',
        },
        {
            id: 5,
            code: 'BR005',
            name: 'Rajshahi Branch',
            address: 'Shaheb Bazar, Rajshahi',
            latitude: 24.3745,
            longitude: 88.6042,
            manager: 'Nusrat Jahan',
        },
    ];

    const paginationLinks = [
        { label: '1', url: '#', active: true },
        { label: '2', url: '#', active: false },
        { label: 'Next', url: '#', active: false },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [recordsPerPage, setRecordsPerPage] = useState(5);

    const filteredBranches = allBranches.filter((b) => {
        return (
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.manager.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const paginatedBranches = filteredBranches.slice(0, recordsPerPage);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/auth/branches' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Branches"
                        description="Manage all organization branches and their details"
                    />
                    <Link
                        href="/auth/branches/create"
                        className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Add Branch
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search branches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 hidden bg-muted md:table-header-group">
                            <tr>
                                {[
                                    'Code',
                                    'Name',
                                    'Address',
                                    'Manager',
                                    'Latitude',
                                    'Longitude',
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
                        <tbody className="flex flex-col md:table-row-group">
                            {paginatedBranches.length > 0 ? (
                                paginatedBranches.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="flex flex-col border-b border-border even:bg-muted/30 md:table-row md:flex-row"
                                    >
                                        <td className="px-2 py-1">{b.code}</td>
                                        <td className="px-2 py-1">{b.name}</td>
                                        <td className="px-2 py-1">
                                            {b.address}
                                        </td>
                                        <td className="px-2 py-1">
                                            {b.manager}
                                        </td>
                                        <td className="px-2 py-1">
                                            {b.latitude}
                                        </td>
                                        <td className="px-2 py-1">
                                            {b.longitude}
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/auth/branches/${b.id}`}
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
                                                                href={`/auth/branches/${b.id}/edit`}
                                                                className="text-green-600 hover:text-green-500 dark:text-green-400"
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
                                                                href={`/auth/branches/${b.id}/delete`}
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
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No branches found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Show Records */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={recordsPerPage}
                            onChange={(e) =>
                                setRecordsPerPage(Number(e.target.value))
                            }
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                        <span className="text-sm text-muted-foreground">
                            records
                        </span>
                    </div>

                    <div className="flex gap-1">
                        {paginationLinks.map((link, i) => (
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
