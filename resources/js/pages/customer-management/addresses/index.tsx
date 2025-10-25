import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface CustomerAddress {
    id: number;
    customer_id: number;
    customer_name: string;
    line1: string;
    line2?: string;
    division: string;
    district: string;
    upazila?: string;
    union_ward?: string;
    village_locality?: string;
    postal_code?: string;
    country_code: string;
    type: 'CURRENT' | 'PERMANENT' | 'MAILING' | 'WORK' | 'REGISTERED' | 'OTHER';
    created_at: string;
    updated_at: string;
}

interface IndexProps {
    addresses: CustomerAddress[];
}

export default function Index({ addresses }: IndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [recordsPerPage, setRecordsPerPage] = useState(5);

    const filteredAddresses = addresses.filter((a) => {
        const matchesSearch =
            a.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.district.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesType;
    });

    const paginatedAddresses = filteredAddresses.slice(0, recordsPerPage);

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Addresses', href: '' }];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Addresses" />

            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Customer Addresses"
                        description="Manage customer addresses."
                    />
                    <Link
                        href="/auth/addresses/create"
                        className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Add Address
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search addresses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
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
                                    'Address Line 1',
                                    'Line 2',
                                    'Division',
                                    'District',
                                    'Upazila',
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
                        <tbody className="flex flex-col md:table-row-group">
                            {paginatedAddresses.length > 0 ? (
                                paginatedAddresses.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="flex flex-col border-b border-border even:bg-muted/30 md:table-row md:flex-row"
                                    >
                                        <td className="px-2 py-1">
                                            {a.customer_name}
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
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/auth/customers/addresses/${a.id}`}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/auth/customers/addresses/${a.id}/edit`}
                                                    className="text-green-600 hover:text-green-500"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/auth/customers/addresses/${a.id}/delete`}
                                                    className="text-destructive hover:text-destructive/80"
                                                >
                                                    Delete
                                                </Link>
                                            </div>
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

                {/* Pagination & Records */}
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
                </div>
            </div>
        </CustomAuthLayout>
    );
}
