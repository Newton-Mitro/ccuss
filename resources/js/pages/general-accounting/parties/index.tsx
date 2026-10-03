import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
    phone: string | null;
    email: string | null;
    status: boolean;
}

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
    const [search, setSearch] = useState(filters.search ?? '');
    useFlashToastHandler();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('parties.index'),
                { search, per_page: filters.per_page },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

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
                        <Button asChild size="sm">
                            <Link href={route('parties.create')}>
                                <Plus className="mr-1 h-4 w-4" /> Add Party
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search code, name, email, or phone..."
                        className="w-full bg-card sm:w-96"
                    />
                    <span className="text-sm text-muted-foreground">
                        {parties.total} records
                    </span>
                </div>

                {parties.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">No parties found</p>
                        <p className="text-xs">
                            Try adjusting your search or create a party.
                        </p>
                        <Button asChild size="sm" className="mt-4">
                            <Link href={route('parties.create')}>
                                <Plus className="mr-1 h-4 w-4" /> Create Party
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-md border bg-card">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Code</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Contact</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.data.map((party) => (
                                        <tr key={party.id} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                {party.code}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{party.name}</td>
                                            <td className="px-4 py-3">{party.party_type.replaceAll('_', ' ')}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div>{party.email || '-'}</div>
                                                {party.phone && <div className="text-xs">{party.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge tone={party.status ? 'success' : 'danger'}>
                                                    {party.status ? 'Active' : 'Inactive'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild variant="outline" size="icon" title="Edit party">
                                                        <Link href={route('parties.edit', party.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        title="Delete party"
                                                        onClick={() => destroy(party)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {parties.last_page > 1 && (
                            <nav className="flex flex-wrap justify-end gap-1" aria-label="Pagination">
                                {parties.links.map((link, index) => (
                                    <Button
                                        key={`${index}-${link.label}`}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </nav>
                        )}
                    </>
                )}
            </div>
        </CustomAuthLayout>
    );
}