import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { Props } from '@/modules/financial-services/types/accounts/fixed/index.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function FixedDepositAccountIndex() {
    const { accounts, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: 1,
    });
    useEffect(() => {
        const delay = setTimeout(
            () =>
                get(route('financial-accounts.fixed.index'), {
                    preserveState: true,
                    replace: true,
                }),
            400,
        );
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        { title: 'Fixed Deposits', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Fixed deposits" />
            <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Fixed deposits"
                        description="Monitor term-deposit principal, maturity dates, and contracted maturity values."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <Button asChild>
                            <Link
                                href={route('financial-accounts.fixed.create')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Open fixed deposit
                            </Link>
                        </Button>
                    </div>
                </div>
                <Input
                    className="w-full bg-card sm:w-96"
                    placeholder="Search account or depositor..."
                    value={data.search}
                    onChange={(event) => {
                        setData('search', event.target.value);
                        setData('page', 1);
                    }}
                />
                <ResourceTableCard className="h-[calc(100vh-320px)] md:h-[calc(100vh-300px)]">
                    <div className="h-full overflow-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Account</th>
                                    <th className="p-3 text-left">Depositor</th>
                                    <th className="p-3 text-right">
                                        Principal
                                    </th>
                                    <th className="p-3 text-left">
                                        Maturity date
                                    </th>
                                    <th className="p-3 text-right">
                                        Maturity value
                                    </th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Actions</th>
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
                                        <td className="p-3 text-right">
                                            {formatBDTCurrency(
                                                account.fixed_deposit
                                                    ?.principal_amount ?? 0,
                                                false,
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {formatDate(
                                                account.fixed_deposit
                                                    ?.maturity_date,
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            {formatBDTCurrency(
                                                account.fixed_deposit
                                                    ?.maturity_amount ?? 0,
                                                false,
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
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
                                        <td className="p-3">
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    title="View account"
                                                    aria-label={`View ${account.account_no}`}
                                                >
                                                    <Link
                                                        href={route(
                                                            'financial-accounts.fixed.show',
                                                            account.id,
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Edit account"
                                                    aria-label={`Edit ${account.account_no}`}
                                                >
                                                    <Link
                                                        href={route(
                                                            'financial-accounts.fixed.edit',
                                                            account.id,
                                                        )}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
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
