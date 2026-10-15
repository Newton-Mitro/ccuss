import TreasuryAccountDetails from '@/components/treasury-account-details';
import type { BreadcrumbItem, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface PettyCashFundDetails {
    id: number;
    code: string;
    name: string;
    method: string;
    status: string;
    current_balance: string | number;
    fund_limit: string | number;
    custodian?: { name: string; email: string } | null;
    cash_location?: {
        branch?: { name: string } | null;
        financial_account?: {
            account_no: string;
            balance: string | number;
        } | null;
    } | null;
}

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
                { label: 'Current balance', value: fund.current_balance },
                { label: 'Fund limit', value: fund.fund_limit },
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
