// resources/js/Pages/BankBranch/Index.tsx
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';

interface BankBranchPageProps extends SharedData {
    branches: {
        data: {
            id: number;
            name: string;
            routing_number?: string;
            address?: string;
            bank: { id: number; name: string };
        }[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    banks: { id: number; name: string }[];
    filters: Record<string, string>;
}

export default function Index() {
    const { branches, banks, filters } = usePage<BankBranchPageProps>().props;

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        bank_id: filters.bank_id || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('bank-branches.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.bank_id, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Bank Branch "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('bank-branches.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Bank Branch "${name}" deleted successfully!`,
                            ),
                        onError: () => toast.error('Failed to delete branch.'),
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bank Branches', href: '/bank-branches' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Branches" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Bank Branches"
                        description="Manage branches of banks"
                    />
                    <Link
                        href={route('bank-branches.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Branch
                    </Link>
                </div>

                {/* Search & Bank Filter */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search branches..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                    <div className="w-44">
                        <Select
                            value={data.bank_id}
                            onChange={(value) => {
                                setData('bank_id', value);
                                setData('page', 1);
                            }}
                            options={banks.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Branch Name',
                                    'Bank',
                                    'Routing Number',
                                    'Address',
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
                            {branches.data.length > 0 ? (
                                branches.data.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{b.name}</td>
                                        <td className="px-2 py-1">
                                            {b.bank?.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {b.routing_number || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {b.address || '-'}
                                        </td>
                                        <td className="flex space-x-2 px-2 py-1">
                                            <Link
                                                href={route(
                                                    'bank-branches.edit',
                                                    b.id,
                                                )}
                                                className="text-success"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Link>
                                            <button
                                                disabled={processing}
                                                onClick={() =>
                                                    handleDelete(b.id, b.name)
                                                }
                                                className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No branches found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
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
