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
import type { Props } from '@/modules/financial-services/types/accounts/loan/index.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export default function LoanAccountIndex() {
    const { accounts, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        per_page: Number(filters.per_page) || 18,
        page: 1,
    });
    useEffect(() => {
        const delay = setTimeout(
            () =>
                get(route('loan-accounts.index'), {
                    preserveState: true,
                    replace: true,
                }),
            400,
        );
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Accounts', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan accounts" />
            <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Loan accounts"
                        description="Monitor approved loan contracts, disbursement, outstanding balance, and repayment lifecycle."
                    />
                </div>
                <Input
                    className="w-full bg-card sm:w-96"
                    placeholder="Search loan or borrower..."
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
                                    <th className="p-3 text-left">Loan no.</th>
                                    <th className="p-3 text-left">Borrower</th>
                                    <th className="p-3 text-right">
                                        Principal
                                    </th>
                                    <th className="p-3 text-right">
                                        Disbursed
                                    </th>
                                    <th className="p-3 text-left">Maturity</th>
                                    <th className="p-3 text-center">
                                        Loan status
                                    </th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.data.map((account) => (
                                    <tr key={account.id} className="border-t">
                                        <td className="p-3 font-mono text-xs">
                                            {account.loan_account?.loan_no ??
                                                account.account_no}
                                        </td>
                                        <td className="p-3">
                                            {account.holder?.name ?? '-'}
                                        </td>
                                        <td className="p-3 text-right">
                                            {formatBDTCurrency(
                                                account.loan_account
                                                    ?.principal_amount ?? 0,
                                                false,
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            {formatBDTCurrency(
                                                account.loan_account
                                                    ?.disbursed_amount ?? 0,
                                                false,
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {formatDate(
                                                account.loan_account
                                                    ?.maturity_date,
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <StatusBadge
                                                tone={
                                                    account.loan_account
                                                        ?.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {account.loan_account?.status ??
                                                    account.status}
                                            </StatusBadge>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    title="View loan account"
                                                    aria-label={`View ${account.loan_account?.loan_no ?? account.account_no}`}
                                                >
                                                    <Link
                                                        href={route(
                                                            'loan-accounts.show',
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
                                                    title="Edit loan account"
                                                    aria-label={`Edit ${account.loan_account?.loan_no ?? account.account_no}`}
                                                >
                                                    <Link
                                                        href={route(
                                                            'loan-accounts.edit',
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
