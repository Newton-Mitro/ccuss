// resources/js/Pages/Bank/Index.tsx
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Bank } from '../../../types/bank_and_cheques_module';
import { bankStatuses } from './data/bankStatuses';

interface BankPageProps extends SharedData {
    banks: {
        data: Bank[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Record<string, string>;
}

export default function Index() {
    const { banks, filters } = usePage<BankPageProps>().props;

    const {
        data,
        setData,
        get,
        delete: destroy,
        processing,
    } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    const handleSearch = () => {
        get(route('banks.index'), { preserveState: true });
    };

    useEffect(() => {
        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.status, data.per_page, data.page]);

    const handleDelete = (id: number, name: string) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Bank "${name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    destroy(route('banks.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Banks', href: '/banks' }];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Banks" />
            <div className="space-y-4 text-foreground">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Banks"
                        description="Manage banks in the system"
                    />
                    <Link
                        href={route('banks.create')}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Bank
                    </Link>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            type="text"
                            placeholder="Search banks..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                    <div className="w-36">
                        <Select
                            value={data.status}
                            onChange={(value) => {
                                setData('status', value);
                                setData('page', 1);
                            }}
                            options={bankStatuses}
                        />
                    </div>
                </div>

                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'Name',
                                    'Short Name',
                                    'Status',
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
                            {banks.data.length > 0 ? (
                                banks.data.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="px-2 py-1">{b.name}</td>
                                        <td className="px-2 py-1">
                                            {b.short_name || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {b.status}
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center gap-2">
                                                {/* View */}
                                                <Link
                                                    href={route(
                                                        'banks.show',
                                                        b.id,
                                                    )}
                                                    className="text-muted-foreground transition-colors hover:text-primary"
                                                    title="View"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>

                                                {/* Edit */}
                                                <Link
                                                    href={route(
                                                        'banks.edit',
                                                        b.id,
                                                    )}
                                                    className="text-success transition hover:opacity-80"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    disabled={processing}
                                                    onClick={() =>
                                                        handleDelete(
                                                            b.id,
                                                            b.name,
                                                        )
                                                    }
                                                    className="text-destructive transition hover:text-destructive/80 disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No banks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={banks.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
