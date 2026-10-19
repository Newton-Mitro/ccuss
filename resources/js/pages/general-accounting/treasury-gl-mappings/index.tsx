import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourceEmptyState,
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftRight, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import {
    MappingDetailsDialog,
    MappingFormDialog,
    type TreasuryGlLedgerAccount,
    type TreasuryGlMapping,
} from './mapping-dialog';

interface Props extends SharedData {
    mappings: {
        data: TreasuryGlMapping[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    accounts: TreasuryGlLedgerAccount[];
    sourceTypes: string[];
    filters: { search?: string; per_page?: string; page?: string };
}

export default function TreasuryGlMappingsPage() {
    const { mappings, accounts, sourceTypes, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });
    const [formOpen, setFormOpen] = useState(false);
    const [editingMapping, setEditingMapping] =
        useState<TreasuryGlMapping | null>(null);
    const [viewingMapping, setViewingMapping] =
        useState<TreasuryGlMapping | null>(null);

    useFlashToastHandler();

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('treasury-gl-mappings.index'), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const remove = (mapping: TreasuryGlMapping) => {
        router.delete(route('treasury-gl-mappings.destroy', mapping.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        {
            title: 'Treasury GL Mappings',
            href: route('treasury-gl-mappings.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Treasury GL Mappings" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Treasury GL Mappings"
                    description="Map Treasury transaction categories to balanced General Ledger entries."
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    setEditingMapping(null);
                                    setFormOpen(true);
                                }}
                                disabled={accounts.length < 2}
                            >
                                <Plus className="h-4 w-4" />
                                Add mapping
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={route('general-accounting.dashboard')}
                                >
                                    <ArrowLeftRight className="mr-1 h-4 w-4" />
                                    Accounting
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="w-full sm:w-60">
                    <Input
                        className="bg-card"
                        placeholder="Search mappings..."
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                    />
                </div>

                {mappings.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No Treasury GL mappings found"
                        description="Try adjusting your search or add a mapping."
                    />
                ) : (
                    <div className="h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card">
                        <table className="w-full min-w-225 border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-muted text-left text-sm text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Source
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Transaction
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Debit
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Credit
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mappings.data.map((mapping) => (
                                    <tr
                                        key={mapping.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                {mapping.source_type.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {mapping.source_code}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {mapping.transaction_type.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {mapping.debit_account.code} -{' '}
                                            {mapping.debit_account.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {mapping.credit_account.code} -{' '}
                                            {mapping.credit_account.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                tone={
                                                    mapping.status
                                                        ? 'success'
                                                        : 'danger'
                                                }
                                            >
                                                {mapping.status
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                title="View mapping"
                                                aria-label="View mapping"
                                                onClick={() =>
                                                    setViewingMapping(mapping)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                title="Edit mapping"
                                                aria-label="Edit mapping"
                                                onClick={() => {
                                                    setEditingMapping(mapping);
                                                    setFormOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                title="Delete mapping"
                                                aria-label="Delete mapping"
                                                onClick={() => remove(mapping)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {mappings.data.length > 0 && (
                    <DataTablePagination
                        perPage={mappings.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            setData('page', 1);
                        }}
                        links={mappings.links}
                    />
                )}
                <MappingFormDialog
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    sourceTypes={sourceTypes}
                    accounts={accounts}
                    mapping={editingMapping}
                />
                <MappingDetailsDialog
                    mapping={viewingMapping}
                    onOpenChange={(open) => {
                        if (!open) setViewingMapping(null);
                    }}
                />
            </div>
        </CustomAuthLayout>
    );
}
