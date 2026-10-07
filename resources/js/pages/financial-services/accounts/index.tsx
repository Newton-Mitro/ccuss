import {
    ResourcePageHeader,
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';

interface Account {
    id: number;
    account_no: string;
    name?: string;
    account_type: string;
    status: string;
    balance: string | number;
    holder?: { name?: string } | null;
    product?: { name?: string } | null;
}

interface Props extends SharedData {
    accounts: {
        data: Account[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string };
    category?: string | null;
}

export default function FinancialAccountIndex() {
    const { accounts, filters, category } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const categoryLabel = category?.replaceAll('_', ' ') ?? 'All';
    const indexRoute = getIndexRoute(category);
    const createRoute = category ? getCreateRoute(category) : undefined;

    useEffect(() => {
        const timeout = setTimeout(
            () =>
                router.get(
                    indexRoute,
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                ),
            300,
        );
        return () => clearTimeout(timeout);
    }, [search, indexRoute]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: category
                ? `${categoryLabel} Management`
                : 'Subledger Accounts',
            href: indexRoute,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${categoryLabel} Account Management`} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={
                        category
                            ? `${categoryLabel} Management`
                            : 'Subledger Accounts'
                    }
                    description={
                        category
                            ? `Manage ${categoryLabel.toLowerCase()} accounts and member activity.`
                            : 'Manage member, deposit, loan, cash, and bank accounts.'
                    }
                    action={
                        createRoute ? (
                            <Button asChild>
                                <Link href={createRoute}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New account
                                </Link>
                            </Button>
                        ) : null
                    }
                />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search account number or holder..."
                    className="w-full bg-card sm:w-96"
                />
                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <div className="h-full overflow-auto">
                        <table className="w-full min-w-[900px] table-fixed text-sm">
                            <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                                <tr className="border-b">
                                    <th className="w-[15%] px-3 py-2.5 text-left font-medium">
                                        Account
                                    </th>
                                    <th className="w-[20%] px-3 py-2.5 text-left font-medium">
                                        Holder
                                    </th>
                                    <th className="w-[17%] px-3 py-2.5 text-left font-medium">
                                        Product
                                    </th>
                                    <th className="w-[15%] px-3 py-2.5 text-left font-medium">
                                        Type
                                    </th>
                                    <th className="w-[13%] px-3 py-2.5 text-right font-medium">
                                        Balance
                                    </th>
                                    <th className="w-[10%] px-3 py-2.5 text-center font-medium">
                                        Status
                                    </th>
                                    <th className="w-[10%] px-3 py-2.5 text-center font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {accounts.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-sm text-muted-foreground"
                                        >
                                            No financial accounts found. Try a
                                            different search or open a new
                                            account.
                                        </td>
                                    </tr>
                                ) : (
                                    accounts.data.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="border-b even:bg-muted/40 hover:bg-accent/20"
                                        >
                                            <td className="px-3 py-2.5 align-middle font-mono text-xs">
                                                {account.account_no}
                                            </td>

                                            <td className="truncate px-3 py-2.5 align-middle">
                                                {account.holder?.name ??
                                                    account.name ??
                                                    '-'}
                                            </td>

                                            <td className="truncate px-3 py-2.5 align-middle">
                                                {account.product?.name ?? '-'}
                                            </td>

                                            <td className="px-3 py-2.5 align-middle capitalize">
                                                {account.account_type
                                                    .replaceAll('_', ' ')
                                                    .toLowerCase()}
                                            </td>

                                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">
                                                {Number(
                                                    account.balance,
                                                ).toFixed(4)}
                                            </td>

                                            <td className="px-3 py-2.5 text-center align-middle">
                                                <StatusBadge
                                                    tone={
                                                        account.status ===
                                                        'ACTIVE'
                                                            ? 'success'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {account.status}
                                                </StatusBadge>
                                            </td>

                                            <td className="px-3 py-2.5 text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <Link
                                                        href={getShowRoute(
                                                            account,
                                                        )}
                                                        title="View account"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
                <DataTablePagination
                    perPage={accounts.per_page}
                    onPerPageChange={(perPage) =>
                        router.get(
                            indexRoute,
                            { search, per_page: perPage, page: 1 },
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                    links={accounts.links}
                />
            </div>
        </CustomAuthLayout>
    );
}

function getIndexRoute(category?: string | null): string {
    switch (category) {
        case 'SAVINGS':
            return route('financial-accounts.savings.index');
        case 'SHARE':
            return route('financial-accounts.share.index');
        case 'FIXED_DEPOSIT':
            return route('financial-accounts.fixed.index');
        case 'RECURRING_DEPOSIT':
            return route('financial-accounts.recurring.index');
        case 'LOAN':
            return route('loan-accounts.index');
        default:
            return route('financial-accounts.index');
    }
}

function getCreateRoute(category: string): string {
    switch (category) {
        case 'SAVINGS':
            return route('financial-accounts.savings.create');
        case 'SHARE':
            return route('financial-accounts.share.create');
        case 'FIXED_DEPOSIT':
            return route('financial-accounts.fixed.create');
        case 'RECURRING_DEPOSIT':
            return route('financial-accounts.recurring.create');
        case 'LOAN':
            return route('loan-accounts.create');
        default:
            throw new Error(
                `No account creation route exists for ${category}.`,
            );
    }
}

function getShowRoute(account: Account): string {
    switch (account.account_type) {
        case 'SAVINGS':
            return route('financial-accounts.savings.show', account.id);
        case 'SHARE':
            return route('financial-accounts.share.show', account.id);
        case 'FIXED_DEPOSIT':
            return route('financial-accounts.fixed.show', account.id);
        case 'RECURRING_DEPOSIT':
            return route('financial-accounts.recurring.show', account.id);
        case 'LOAN':
            return route('loan-accounts.show', account.id);
        default:
            return route('financial-accounts.show', account.id);
    }
}
