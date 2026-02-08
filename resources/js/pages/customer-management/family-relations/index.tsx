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
import { CustomerFamilyRelation } from '../../../types/customer';

export default function Index() {
    const { props } = usePage<
        SharedData & {
            familyRelations: {
                data: CustomerFamilyRelation[];
                links: { url: string | null; label: string; active: boolean }[];
            };
            filters: Record<string, string | number>;
        }
    >();

    const { familyRelations, filters } = props;
    console.log('familyRelations', familyRelations);
    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // Debounced search
    useEffect(() => {
        const delay = setTimeout(() => {
            get('/auth/family-relations', {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    // Delete confirmation
    const handleDelete = (id: number, customerName: string) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: `Relation of "${customerName}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/auth/family-relations/${id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () =>
                        toast.success('Relation deleted successfully!'),
                    onError: () => toast.error('Failed to delete relation.'),
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/auth/family-relations' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Family Relations" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Family Relations"
                        description="Manage family and relative familyRelationships."
                    />
                    <Link
                        href="/auth/family-relations/create"
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Relation
                    </Link>
                </div>

                {/* Search & Per Page */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search by customer or relative name..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    '#',
                                    'Relative Name',
                                    'Relation',
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
                            {familyRelations.data.length > 0 ? (
                                familyRelations.data.map((family, i) => (
                                    <tr
                                        key={family.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{i + 1}</td>
                                        <td className="px-2 py-1">
                                            {family.name}
                                        </td>
                                        <td className="px-2 py-1 text-blue-600 dark:text-blue-400">
                                            {family.relation_type.replace(
                                                /_/g,
                                                ' ',
                                            )}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/auth/family-relations/${family.id}`}
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
                                                                href={`/auth/family-relations/${family.id}/edit`}
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
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        family.id,
                                                                        family
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
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No family familyRelations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Records Info */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    {/* Records info */}
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
                        {familyRelations.links.map((link, i) => (
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
