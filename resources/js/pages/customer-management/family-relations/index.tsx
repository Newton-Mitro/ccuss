import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface Customer {
    id: number;
    name: string;
    customer_no?: string;
}

interface FamilyRelation {
    id: number;
    relation_type: string;
    reverse_relation_type: string;
    customer: Customer;
    relative: Customer;
}

interface IndexProps {
    relations: any; // Inertia paginated response
    filters: {
        search?: string;
        perPage?: number;
        page?: number;
    };
}

export default function Index({ relations, filters }: IndexProps) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        perPage: filters.perPage || 10,
        page: filters.page || 1,
    });

    // Debounced fetch for live search
    const fetchRelations = debounce(() => {
        get(route('family-relations.index'), {
            preserveState: true,
            replace: true,
        });
    }, 400);

    useEffect(() => {
        get(route('family-relations.index'), {
            preserveState: true,
            replace: true,
        });
    }, [data.perPage, data.page]);

    const handleSearchChange = (value: string) => {
        setData('search', value);
        setData('page', 1);
        fetchRelations();
    };

    return (
        <CustomAuthLayout>
            <Head title="Family Relations" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Family Relations"
                        description="Manage family and relative relationships."
                    />
                    <Link href={route('family-relations.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Relation
                        </Button>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search by customer name..."
                        value={data.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
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
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 hidden bg-muted md:table-header-group">
                            <tr>
                                {[
                                    '#',
                                    'Customer',
                                    'Relative',
                                    'Relation',
                                    'Reverse',
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
                            {relations.data.length > 0 ? (
                                relations.data.map((r, i) => (
                                    <tr
                                        key={r.id}
                                        className="flex flex-col border-b border-border even:bg-muted/30 md:table-row md:flex-row"
                                    >
                                        <td className="px-2 py-1">{i + 1}</td>
                                        <td className="px-2 py-1 font-medium">
                                            {r.customer?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {r.relative?.name}
                                        </td>
                                        <td className="px-2 py-1 text-blue-600 dark:text-blue-400">
                                            {r.relation_type.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-2 py-1 text-indigo-600 dark:text-indigo-400">
                                            {r.reverse_relation_type.replace(
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
                                                                href={route(
                                                                    'family-relations.show',
                                                                    r.id,
                                                                )}
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
                                                                href={route(
                                                                    'family-relations.edit',
                                                                    r.id,
                                                                )}
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
                                                                href={route(
                                                                    'family-relations.destroy',
                                                                    r.id,
                                                                )}
                                                                method="delete"
                                                                as="button"
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
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No family relations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div />
                    <div className="flex gap-1">
                        {relations.links.map((link: any, i: number) => (
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
