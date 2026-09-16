import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
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
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Account Groups"
                        description="Organize the chart of accounts by reporting category."
                    />
                    <Link href={route('account-groups.create')}>
                        <Button size="sm">
                            <Plus className="mr-1 h-4 w-4" /> Add Group
                        </Button>
                    </Link>
                </div>
                <div className="overflow-auto rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Normal balance</th>
                                <th className="p-3">Parent</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountGroups.data.map((group) => (
                                <tr key={group.id} className="border-t">
                                    <td className="p-3 font-mono">
                                        {group.code}
                                    </td>
                                    <td className="p-3">{group.name}</td>
                                    <td className="p-3">{group.type}</td>
                                    <td className="p-3">
                                        {group.normal_balance}
                                    </td>
                                    <td className="p-3">
                                        {group.parent?.name ?? '-'}
                                    </td>
                                    <td className="flex gap-3 p-3">
                                        <Link
                                            href={route(
                                                'account-groups.edit',
                                                group.id,
                                            )}
                                            title="Edit account group"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => destroy(group)}
                                            title="Delete account group"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {accountGroups.data.length === 0 && (
                        <p className="p-6 text-center text-muted-foreground">
                            No account groups found.
                        </p>
                    )}
                </div>
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
