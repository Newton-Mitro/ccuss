import TreasuryAccountDetails from '@/components/treasury-account-details';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { BankAccountType } from '@/types/treasury-cash/bank-accounts';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface BankAccountDetails {
    id: number;
    account_name: string;
    account_number: string;
    routing_number?: string | null;
    account_type: BankAccountType;
    balance: string | number;
    opening_balance: string | number;
    is_reconcilable: boolean;
    status: string;
    branch?: { name: string } | null;
    financial_account?: { account_no: string; name: string } | null;
}

export default function Show() {
    const { account } = usePage<SharedData & { account: BankAccountDetails }>()
        .props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Bank Accounts', href: route('bank-accounts.index') },
        {
            title: account.account_name,
            href: route('bank-accounts.show', account.id),
        },
    ];

    return (
        <TreasuryAccountDetails
            title={account.account_name}
            description="Bank account details, linked ledger account, and reconciliation configuration."
            breadcrumbs={breadcrumbs}
            status={account.status}
            indexHref={route('bank-accounts.index')}
            editHref={route('bank-accounts.edit', account.id)}
            editPermission="bank_accounts.update"
            details={[
                {
                    label: 'Bank account number',
                    value: account.account_number,
                    mono: true,
                },
                {
                    label: 'Routing number',
                    value: account.routing_number,
                    mono: true,
                },
                { label: 'Account type', value: account.account_type },
                {
                    label: 'Branch',
                    value: account.branch?.name ?? 'Organization-wide',
                },
                {
                    label: 'Opening balance',
                    value: formatBDTCurrency(account.opening_balance, false),
                },
                {
                    label: 'Current balance',
                    value: formatBDTCurrency(account.balance, false),
                },
                {
                    label: 'Internal financial account',
                    value: account.financial_account?.account_no,
                    mono: true,
                },
                {
                    label: 'Reconciliation enabled',
                    value: account.is_reconcilable ? 'Yes' : 'No',
                },
            ]}
        />
    );
}
