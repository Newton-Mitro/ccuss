import TreasuryAccountDetails from '@/components/treasury-account-details';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface TellerDetails {
    id: number;
    code: string;
    name: string;
    status: string;
    maximum_cash: string | number | null;
    user?: { name: string; email: string } | null;
    cash_location?: {
        branch?: { name: string } | null;
        financial_account?: {
            account_no: string;
            balance: string | number;
        } | null;
    } | null;
}

export default function Show() {
    const { teller } = usePage<SharedData & { teller: TellerDetails }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Tellers', href: route('tellers.index') },
        { title: teller.name, href: route('tellers.show', teller.id) },
    ];

    return (
        <TreasuryAccountDetails
            title={teller.name}
            description="Teller assignment, linked financial account, and cash operating limits."
            breadcrumbs={breadcrumbs}
            status={teller.status}
            indexHref={route('tellers.index')}
            editHref={route('tellers.edit', teller.id)}
            editPermission="cash_management.update"
            details={[
                { label: 'Teller code', value: teller.code, mono: true },
                { label: 'Assigned user', value: teller.user?.name },
                { label: 'User email', value: teller.user?.email },
                { label: 'Branch', value: teller.cash_location?.branch?.name },
                {
                    label: 'Financial account number',
                    value: teller.cash_location?.financial_account?.account_no,
                    mono: true,
                },
                {
                    label: 'Account balance',
                    value:
                        teller.cash_location?.financial_account?.balance != null
                            ? formatBDTCurrency(
                                  teller.cash_location.financial_account
                                      .balance,
                                  false,
                              )
                            : undefined,
                },
                {
                    label: 'Maximum cash',
                    value:
                        teller.maximum_cash != null
                            ? formatBDTCurrency(teller.maximum_cash, false)
                            : undefined,
                },
            ]}
        />
    );
}
