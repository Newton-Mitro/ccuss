import TreasuryAccountDetails from '@/modules/treasury-cash/components/treasury-account-details';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VaultDetails } from '@/modules/treasury-cash/types/vaults/show.interfaces';


export default function Show() {
    const { vault } = usePage<SharedData & { vault: VaultDetails }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Vaults', href: route('vaults.index') },
        { title: vault.name, href: route('vaults.show', vault.id) },
    ];

    return (
        <TreasuryAccountDetails
            title={vault.name}
            description="Vault location, linked financial account, and balance limits."
            breadcrumbs={breadcrumbs}
            status={vault.status}
            indexHref={route('vaults.index')}
            editHref={route('vaults.edit', vault.id)}
            editPermission="cash_management.update"
            details={[
                { label: 'Vault code', value: vault.code, mono: true },
                { label: 'Branch', value: vault.cash_location?.branch?.name },
                {
                    label: 'Financial account number',
                    value: vault.cash_location?.financial_account?.account_no,
                    mono: true,
                },
                {
                    label: 'Account balance',
                    value:
                        vault.cash_location?.financial_account?.balance != null
                            ? formatBDTCurrency(
                                  vault.cash_location.financial_account.balance,
                                  false,
                              )
                            : undefined,
                },
                {
                    label: 'Maximum balance',
                    value:
                        vault.maximum_balance != null
                            ? formatBDTCurrency(vault.maximum_balance, false)
                            : undefined,
                },
            ]}
        />
    );
}
