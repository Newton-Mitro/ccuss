import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2, UserCheck2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerFamilyRelation } from '../../../types/customer';

export default function FamilyRelationIndex() {
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

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // Debounced search
    useEffect(() => {
        const delay = setTimeout(() => {
            get('/family-relations', {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

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
                router.delete(`/family-relations/${id}`, {
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
        { title: 'Family Relations', href: '/family-relations' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Family Relations" />

            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Family Relations"
                        description="Manage family and relative relationships."
                    />
                    <Link
                        href="/family-relations/customer"
                        className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                    >
                        <UserCheck2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Customer Family Relations
                        </span>
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

                {/* ===================== */}
                {/* Desktop Table */}
                {/* ===================== */}
                <div className="hidden h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:block">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    '#',
                                    'Customer',
                                    'Relative Name',
                                    'Phone',
                                    'Email',
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
                                familyRelations.data.map((f, i) => (
                                    <tr
                                        key={f.id}
                                        className="border-b border-border even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{i + 1}</td>
                                        <td className="px-2 py-1">
                                            {f.customer?.name || '—'}
                                        </td>
                                        <td className="px-2 py-1">{f.name}</td>
                                        <td className="px-2 py-1">
                                            {f.phone || '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {f.email || '—'}
                                        </td>

                                        <td className="px-2 py-1 text-blue-600 dark:text-blue-400">
                                            {f.relation_type.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/family-relations/${f.id}`}
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
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        f.id,
                                                                        f
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
                                        colSpan={12}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No family relations found.
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
                    {familyRelations.data.map((f) => (
                        <div
                            key={f.id}
                            className="rounded-md border border-border bg-card p-3 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{f.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {f.customer?.name || '—'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    {f.relation_type.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>📞 {f.phone || '—'}</p>
                                <p>✉️ {f.email || '—'}</p>
                                <p>🎂 {f.dob || '—'}</p>
                                <p>⚧ {f.gender || '—'}</p>
                                <p>⛪ {f.religion || '—'}</p>
                                <p>ID Type: {f.identification_type}</p>
                                <p>ID #: {f.identification_number}</p>
                            </div>

                            <div className="mt-2 flex justify-end gap-3">
                                <Link
                                    href={`/family-relations/${f.id}`}
                                    className="text-primary"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                <Link
                                    href={`/family-relations/${f.id}/edit`}
                                    className="text-green-600 hover:text-green-500"
                                >
                                    <Pencil className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            f.id,
                                            f.customer?.name || '',
                                        )
                                    }
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
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
