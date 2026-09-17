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
    accounts: { data: Account[] };
    filters: { search?: string };
}

export default function FinancialAccountIndex() {
    const { accounts, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(
            () =>
                router.get(
                    route('financial-accounts.index'),
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
    }, [search]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Financial Accounts',
            href: route('financial-accounts.index'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Accounts" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Financial Accounts"
                    description="Manage member, deposit, loan, cash, and bank accounts."
                    action={
                        <Button asChild size="sm">
                            <Link href={route('financial-accounts.create')}>
                                <Plus className="mr-1 h-4 w-4" /> Open account
                            </Link>
                        </Button>
                    }
                />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search account number or holder..."
                    className="w-full bg-background sm:w-96"
                />
                <ResourceTableCard>
                    <div className="overflow-auto">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="bg-muted/80 text-left text-xs text-muted-foreground">
                                <tr>
                                    {[
                                        'Account',
                                        'Holder',
                                        'Product',
                                        'Type',
                                        'Balance',
                                        'Status',
                                        '',
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="border-b px-3 py-2"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.data.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="border-b even:bg-muted/30 hover:bg-primary/5"
                                    >
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {account.account_no}
                                        </td>
                                        <td className="px-3 py-2">
                                            {account.holder?.name ??
                                                account.name ??
                                                '-'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {account.product?.name ?? '-'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {account.account_type.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {Number(account.balance).toFixed(4)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <StatusBadge
                                                tone={
                                                    account.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {account.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <Link
                                                href={route(
                                                    'financial-accounts.show',
                                                    account.id,
                                                )}
                                                title="View account"
                                            >
                                                <Eye className="ml-auto h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
            </div>
        </CustomAuthLayout>
    );
}
