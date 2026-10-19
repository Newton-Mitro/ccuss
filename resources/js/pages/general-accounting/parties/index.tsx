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
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import {
    PartyDetailsDialog,
    PartyFormDialog,
    type Party,
} from './party-dialog';

interface Props extends SharedData {
    parties: {
        data: Party[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { search?: string; per_page?: string; page?: string };
}

export default function PartyIndex() {
    const { parties, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });
    const [partyDialogOpen, setPartyDialogOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<Party | null>(null);
    const [viewingParty, setViewingParty] = useState<Party | null>(null);
    useFlashToastHandler();

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('parties.index'), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const destroy = (party: Party) => {
        appSwal
            .fire({
                title: 'Delete party?',
                text: `${party.code} - ${party.name} will be deleted.`,
                icon: 'warning',
                showCancelButton: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('parties.destroy', party.id), {
                        preserveScroll: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Parties', href: route('parties.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Parties" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Parties"
                    description="Manage customers, suppliers, employees, and other accounting parties."
                    action={
                        <Button
                            type="button"
                            onClick={() => {
                                setEditingParty(null);
                                setPartyDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Party</span>
                        </Button>
                    }
                />

                <div className="w-full sm:w-60">
                    <Input
                        className="bg-card"
                        value={data.search}
                        onChange={(event) => {
                            setData('search', event.target.value);
                            setData('page', 1);
                        }}
                        placeholder="Search parties..."
                    />
                </div>

                {parties.data.length === 0 ? (
                    <ResourceEmptyState
                        title="No parties found"
                        description="Try adjusting your search or create a party."
                    />
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Code',
                                            'Name',
                                            'Type',
                                            'Phone',
                                            'Email',
                                            'Status',
                                            'Actions',
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="border-b p-2 text-left text-sm font-medium"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.data.map((party) => (
                                        <tr
                                            key={party.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1 font-mono text-xs">
                                                {party.code}
                                            </td>
                                            <td className="px-2 py-1 font-medium">
                                                {party.name}
                                            </td>
                                            <td className="px-2 py-1 capitalize">
                                                {party.party_type.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="px-2 py-1">
                                                {party.phone || '—'}
                                            </td>
                                            <td className="px-2 py-1">
                                                {party.email || '—'}
                                            </td>
                                            <td className="px-2 py-1">
                                                <StatusBadge
                                                    tone={
                                                        party.status
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                >
                                                    {party.status
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-2 py-1">
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        title="View party"
                                                        aria-label="View party"
                                                        onClick={() =>
                                                            setViewingParty(
                                                                party,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit party"
                                                        aria-label="Edit party"
                                                        onClick={() => {
                                                            setEditingParty(
                                                                party,
                                                            );
                                                            setPartyDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Delete party"
                                                        aria-label="Delete party"
                                                        onClick={() =>
                                                            destroy(party)
                                                        }
                                                    >
                                                        <Trash2 className="h-5 w-5 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {parties.data.map((party) => (
                                <div
                                    key={party.id}
                                    className="space-y-2 rounded-md border bg-card p-3"
                                >
                                    <div className="flex justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {party.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {party.code} ·{' '}
                                                {party.party_type.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            tone={
                                                party.status
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {party.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </StatusBadge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {party.phone || '—'} <br />
                                        {party.email || '—'}
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title="View party"
                                            aria-label="View party"
                                            onClick={() =>
                                                setViewingParty(party)
                                            }
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title="Edit party"
                                            aria-label="Edit party"
                                            onClick={() => {
                                                setEditingParty(party);
                                                setPartyDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title="Delete party"
                                            aria-label="Delete party"
                                            onClick={() => destroy(party)}
                                        >
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {parties.data.length > 0 && (
                    <DataTablePagination
                        perPage={parties.per_page}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            setData('page', 1);
                        }}
                        links={parties.links}
                    />
                )}
                <PartyFormDialog
                    open={partyDialogOpen}
                    onOpenChange={setPartyDialogOpen}
                    party={editingParty}
                />
                <PartyDetailsDialog
                    party={viewingParty}
                    onOpenChange={(open) => {
                        if (!open) setViewingParty(null);
                    }}
                />
            </div>
        </CustomAuthLayout>
    );
}
