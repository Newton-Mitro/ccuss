import TreasuryAccountDetails from '@/modules/treasury-cash/components/treasury-account-details';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { PettyCashFundDetails } from '@/modules/treasury-cash/types/petty-cash/accounts/show.interfaces';


export default function Show() {
    const { fund } = usePage<SharedData & { fund: PettyCashFundDetails }>()
        .props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        { title: fund.name, href: route('petty-cash-accounts.show', fund.id) },
    ];

    return (
        <TreasuryAccountDetails
            title={fund.name}
            description="Petty cash fund, custodian, linked financial account, and available limit."
            breadcrumbs={breadcrumbs}
            status={fund.status}
            indexHref={route('petty-cash-accounts.index')}
            editHref={route('petty-cash-accounts.edit', fund.id)}
            editPermission="petty_cash.update"
            details={[
                { label: 'Fund code', value: fund.code, mono: true },
                { label: 'Branch', value: fund.cash_location?.branch?.name },
                { label: 'Custodian', value: fund.custodian?.name },
                { label: 'Custodian email', value: fund.custodian?.email },
                { label: 'Funding method', value: fund.method },
                {
                    label: 'Current balance',
                    value: formatBDTCurrency(fund.current_balance, false),
                },
                {
                    label: 'Fund limit',
                    value: formatBDTCurrency(fund.fund_limit, false),
                },
                {
                    label: 'Financial account number',
                    value: fund.cash_location?.financial_account?.account_no,
                    mono: true,
                },
                {
                    label: 'Financial account balance',
                    value: fund.cash_location?.financial_account?.balance,
                },
            ]}
        />
    );
}
