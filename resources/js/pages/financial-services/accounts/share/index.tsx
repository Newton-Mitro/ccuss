import DataTablePagination from '@/components/data-table-pagination';
import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    accounts: {
        data: Array<{
            id: number;
            account_no: string;
            status: string;
            holder?: { name?: string } | null;
            share_account?: {
                membership_no?: string;
                membership_status?: string;
                member_since?: string | null;
            } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
export default function ShareAccountIndex() {
    const { accounts, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: 1,
    });
    useEffect(() => {
        const delay = setTimeout(
            () =>
                get(route('financial-accounts.share.index'), {
                    preserveState: true,
                    replace: true,
                }),
            400,
        );
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Share Accounts', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Share accounts" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Share accounts"
                    description="Track cooperative membership, membership numbers, and share-account lifecycle."
                    action={
                        <Button asChild>
                            <Link
                                href={route('financial-accounts.share.create')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Register member
                            </Link>
                        </Button>
                    }
                />
                <Input
                    className="w-full bg-card sm:w-96"
                    placeholder="Search account or member..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <div className="h-full overflow-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead className="sticky top-0 z-10 bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Account</th>
                                    <th className="p-3 text-left">Member</th>
                                    <th className="p-3 text-left">
                                        Membership no.
                                    </th>
                                    <th className="p-3 text-left">
                                        Member since
                                    </th>
                                    <th className="p-3 text-center">
                                        Membership
                                    </th>
                                    <th className="p-3 text-center">Account</th>
                                    <th className="p-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.data.map((account) => (
                                    <tr key={account.id} className="border-t">
                                        <td className="p-3 font-mono text-xs">
                                            {account.account_no}
                                        </td>
                                        <td className="p-3">
                                            {account.holder?.name ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {account.share_account
                                                ?.membership_no ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {formatDate(
                                                account.share_account
                                                    ?.member_since,
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <StatusBadge
                                                tone={
                                                    account.share_account
                                                        ?.membership_status ===
                                                    'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {account.share_account
                                                    ?.membership_status ??
                                                    'PENDING'}
                                            </StatusBadge>
                                        </td>
                                        <td className="p-3 text-center">
                                            {account.status}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Link
                                                className="text-primary underline"
                                                href={route(
                                                    'financial-accounts.share.show',
                                                    account.id,
                                                )}
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={accounts.per_page}
                    onPerPageChange={(value) => {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={accounts.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
