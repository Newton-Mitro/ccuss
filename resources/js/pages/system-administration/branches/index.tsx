import type { BranchIndexPageProps } from '@/types/system-administration';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem } from '../../../types';
import type { Branch } from '../../../types/branch';

export default function Index() {
    const { branches, filters } = usePage<BranchIndexPageProps>().props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        page: Number(filters.page) || 1,
        per_page: Number(filters.per_page) || 18,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route('branches.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [data.search, data.page, data.per_page, get]);

    const handleDelete = (branch: Branch) => {
        appSwal
            .fire({
                title: 'Delete branch?',
                text: `This will remove "${branch.name}" from the organization.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('branches.destroy', branch.id), {
                        preserveScroll: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Branches', href: route('branches.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches" />

            <div className="space-y-4 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Branches"
                        description="Manage branches belonging to the active organization."
                    />
                    <Button asChild>
                        <Link href={route('branches.create')}>
                            <Plus className="h-4 w-4" />
                            Add branch
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        className="w-full bg-card sm:w-72"
                        placeholder="Search by branch name or code..."
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                    />
                </div>

                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full min-w-190 border-collapse text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Code',
                                    'Name',
                                    'Address',
                                    'Manager',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left font-medium"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {branches.data.length > 0 ? (
                                branches.data.map((branch, index) => (
                                    <tr
                                        key={branch.id}
                                        className="border-b transition-colors even:bg-muted/40 hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-2">
                                            {(branches.current_page - 1) *
                                                branches.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-2 py-2 font-medium">
                                            {branch.code}
                                        </td>
                                        <td className="px-2 py-2">
                                            {branch.name}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {branch.address || '-'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            {branch.manager?.name || '-'}
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Link
                                                        href={route(
                                                            'branches.show',
                                                            branch.id,
                                                        )}
                                                        aria-label={`View ${branch.name}`}
                                                    >
                                                        <Eye className="h-4 w-4 text-info" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Link
                                                        href={route(
                                                            'branches.edit',
                                                            branch.id,
                                                        )}
                                                        aria-label={`Edit ${branch.name}`}
                                                    >
                                                        <Pencil className="h-4 w-4 text-success" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleDelete(branch)
                                                    }
                                                    aria-label={`Delete ${branch.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No branches found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <DataTablePagination
                    perPage={branches.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={branches.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
