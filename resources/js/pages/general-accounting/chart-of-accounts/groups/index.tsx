import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

interface AccountGroup {
    id: number;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    status: boolean;
    parent?: { name: string } | null;
}

interface Props extends SharedData {
    accountGroups: {
        data: AccountGroup[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page?: number;
    };
}

export default function AccountGroupIndex() {
    const { accountGroups } = usePage<Props>().props;
    useFlashToastHandler();

    const destroy = (group: AccountGroup) => {
        appSwal
            .fire({
                title: 'Delete account group?',
                text: `${group.code} - ${group.name} will be deleted.`,
                icon: 'warning',
                showCancelButton: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('account-groups.destroy', group.id), {
                        preserveScroll: true,
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Chart of Accounts', href: route('ledger-accounts.index') },
        { title: 'Account Groups', href: route('account-groups.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Groups" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Account Groups"
                    description="Organize the chart of accounts by reporting category and keep the structure consistent across all ledger views."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('account-groups.create')}>
                                <Plus className="mr-1 h-4 w-4" /> Add Group
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-muted-foreground">
                        {accountGroups.data.length} groups
                    </span>
                </div>

                {accountGroups.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No account groups found
                        </p>
                        <p className="text-xs">
                            Create an account group to organize your chart of
                            accounts.
                        </p>
                        <Link
                            href={route('account-groups.create')}
                            className="mt-4 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Add Group
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <ResourceTableCard>
                                <table className="w-full border-collapse text-sm">
                                    <thead className="bg-muted/80 text-left text-muted-foreground backdrop-blur-sm">
                                        <tr>
                                            <th className="border-b border-border px-4 py-3">
                                                Code
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Name
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Type
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Normal balance
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Parent
                                            </th>
                                            <th className="border-b border-border px-4 py-3">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accountGroups.data.map((group) => (
                                            <tr
                                                key={group.id}
                                                className="border-b even:bg-muted hover:bg-accent/20"
                                            >
                                                <td className="px-2 py-1 font-mono text-foreground">
                                                    {group.code}
                                                </td>
                                                <td className="px-2 py-1 font-medium text-foreground">
                                                    {group.name}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <StatusBadge tone="info">
                                                        {group.type}
                                                    </StatusBadge>
                                                </td>
                                                <td className="px-2 py-1 text-muted-foreground">
                                                    {group.normal_balance}
                                                </td>
                                                <td className="px-2 py-1 text-muted-foreground">
                                                    {group.parent?.name ?? '-'}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Edit account group"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'account-groups.edit',
                                                                    group.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-4 w-4 text-emerald-600" />
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                destroy(group)
                                                            }
                                                            title="Delete account group"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ResourceTableCard>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {accountGroups.data.map((group) => (
                                <div
                                    key={group.id}
                                    className="space-y-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {group.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {group.code} ·{' '}
                                                {group.normal_balance}
                                            </p>
                                        </div>
                                        <StatusBadge tone="info">
                                            {group.type}
                                        </StatusBadge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Parent: {group.parent?.name ?? 'None'}
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'account-groups.edit',
                                                    group.id,
                                                )}
                                            >
                                                <Pencil className="h-4 w-4" />{' '}
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => destroy(group)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />{' '}
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <DataTablePagination
                    links={accountGroups.links}
                    perPage={accountGroups.per_page ?? 18}
                    onPerPageChange={(perPage) =>
                        router.get(
                            route('account-groups.index'),
                            { per_page: perPage },
                            { preserveScroll: true, preserveState: true },
                        )
                    }
                />
            </div>
        </CustomAuthLayout>
    );
}
