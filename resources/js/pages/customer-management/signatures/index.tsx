import { Head, Link, useForm } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Customer {
    id: number;
    name: string;
    customer_no?: string;
}

interface Signature {
    id: number;
    customer: Customer;
    signature_path: string;
    created_at: string;
}

interface IndexProps {
    signatures: {
        data: Signature[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
    };
}

export default function Index({ signatures, filters }: IndexProps) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: 1,
        perPage: 10,
    });

    const handleSearchChange = (value: string) => {
        setData('search', value);
        setData('page', 1);
        fetchSignatures();
    };

    const fetchSignatures = debounce(() => {
        get('/auth/signatures', { preserveState: true, replace: true });
    }, 400);

    useEffect(() => {
        get('/auth/signatures', { preserveState: true, replace: true });
    }, [data.page, data.perPage]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/auth/signatures' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Signatures" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Customer Signatures"
                        description="Manage all customer signatures."
                    />
                    <Link
                        href="/auth/signatures/create"
                        className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Add Signature
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        value={data.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by customer name..."
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 hidden bg-muted md:table-header-group">
                            <tr>
                                {[
                                    '#',
                                    'Customer',
                                    'Uploaded At',
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
                            {signatures.data.length > 0 ? (
                                signatures.data.map((s, index) => (
                                    <tr
                                        key={s.id}
                                        className="flex flex-col border-b border-border even:bg-muted/30 md:table-row md:flex-row"
                                    >
                                        <td className="px-2 py-1">
                                            {index + 1}
                                        </td>
                                        <td className="px-2 py-1 font-medium">
                                            {s.customer?.name}
                                        </td>

                                        <td className="px-2 py-1">
                                            {new Date(
                                                s.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="flex space-x-2 px-2 py-1">
                                            <Link
                                                href={`/auth/signatures/${s.id}`}
                                                className="text-primary hover:text-primary/80"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/auth/signatures/${s.id}/edit`}
                                                className="text-green-600 hover:text-green-500"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/auth/signatures/${s.id}/delete`}
                                                method="delete"
                                                as="button"
                                                className="text-destructive hover:text-destructive/80"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No signatures found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                    {signatures.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                get(link.url, { preserveState: true })
                            }
                            className={`mx-1 rounded px-3 py-1 ${
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
