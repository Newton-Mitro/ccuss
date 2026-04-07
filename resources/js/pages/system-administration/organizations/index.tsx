import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Organization } from '../../../types/organization';

export default function Index() {
    const { props } = usePage<
        SharedData & {
            organizations: {
                data: Organization[];
                links: { url: string | null; label: string; active: boolean }[];
                current_page: number;
                per_page: number;
            };
            filters: Record<string, string | number>;
        }
    >();

    const { organizations, filters } = props;

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // Debounced search
    const handleSearch = () => {
        get('/organizations', {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    // Delete action
    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Organization "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(`/organizations/${id}`, {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organizations', href: '/organizations' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Organizations" />
            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Organizations"
                        description="Manage all organizations and their details."
                    />
                    <Link
                        href="/organizations/create"
                        className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Add Organization
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search by name, code, email, or phone..."
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
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    '#',
                                    'Code',
                                    'Name',
                                    'Email',
                                    'Phone',
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
                            {organizations.data.length > 0 ? (
                                organizations.data.map((organization, i) => (
                                    <tr
                                        key={organization.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">
                                            {(organizations.current_page - 1) *
                                                organizations.per_page +
                                                i +
                                                1}
                                        </td>
                                        <td className="px-2 py-1 font-medium">
                                            {organization.code}
                                        </td>
                                        <td className="px-2 py-1">
                                            {organization.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {organization.email || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {organization.phone || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/organizations/${organization.id}`}
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
                                                                href={`/organizations/${organization.id}/edit`}
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
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        organization.id,
                                                                        organization.name,
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
                                        No organizations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={organizations.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
