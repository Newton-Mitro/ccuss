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
            balance: string | number;
            status: string;
            holder?: { name?: string } | null;
            recurring_deposit?: {
                installment_amount?: string | number;
                installment_frequency?: string;
                total_installments?: number;
                paid_installments?: number;
                maturity_date?: string;
            } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
export default function RecurringDepositAccountIndex() {
    const { accounts, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: 1,
    });
    useEffect(() => {
        const delay = setTimeout(
            () =>
                get(route('financial-accounts.recurring.index'), {
                    preserveState: true,
                    replace: true,
                }),
            400,
        );
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Recurring Deposits', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Recurring deposits" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Recurring deposits"
                    description="Follow installment commitments, paid progress, and maturity dates."
                    action={
                        <Button asChild>
                            <Link
                                href={route(
                                    'financial-accounts.recurring.create',
                                )}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Open recurring deposit
                            </Link>
                        </Button>
                    }
                />
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
                            <thead className="sticky top-0 z-10 bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Account</th>
                                    <th className="p-3 text-left">Depositor</th>
                                    <th className="p-3 text-right">
                                        Installment
                                    </th>
                                    <th className="p-3 text-center">
                                        Progress
                                    </th>
                                    <th className="p-3 text-left">Maturity</th>
                                    <th className="p-3 text-center">Status</th>
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
                                        <td className="p-3 text-right">
                                            {Number(
                                                account.recurring_deposit
                                                    ?.installment_amount ?? 0,
                                            ).toFixed(4)}{' '}
                                            {account.recurring_deposit
                                                ?.installment_frequency ?? ''}
                                        </td>
                                        <td className="p-3 text-center">
                                            {account.recurring_deposit
                                                ?.paid_installments ?? 0}{' '}
                                            /{' '}
                                            {account.recurring_deposit
                                                ?.total_installments ?? 0}
                                        </td>
                                        <td className="p-3">
                                            {account.recurring_deposit
                                                ? formatDate(
                                                      account.recurring_deposit
                                                          .maturity_date,
                                                  )
                                                : '—'}
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
                                        <td className="p-3 text-right">
                                            <Link
                                                className="text-primary underline"
                                                href={route(
                                                    'financial-accounts.recurring.show',
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
