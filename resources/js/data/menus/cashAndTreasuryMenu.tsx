import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';

export const cashAndTreasuryMenu: SidebarItem[] = [
    {
        name: 'Treasury & Cash',
        icon: <i className="fa-solid fa-money-bill-transfer" />,
        children_expanded: false,
        permission: ['cash.branch.view'],
        children: [
            {
                name: 'Vaults',
                icon: <i className="fa-solid fa-vault" />,
                path: '/vaults',
                match_path: 'vaults',
                permission: ['vault.list.view'],
            },
            {
                name: 'Tellers',
                icon: <i className="fa-solid fa-users" />,
                path: '/tellers',
                match_path: 'tellers',
                permission: ['teller.list.view'],
            },
            {
                name: 'Branch Days',
                icon: <i className="fa-solid fa-calendar-day" />,
                path: '/branch-days',
                match_path: 'branch-days',
                permission: ['branch_day.view'],
            },
            {
                name: 'Teller Sessions',
                icon: <i className="fa-solid fa-user-clock" />,
                path: '/teller-sessions',
                match_path: 'teller-sessions',
                permission: ['teller_session.view'],
            },
            {
                name: 'Cash Transactions',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Cash Deposit',
                        icon: (
                            <i className="fa-solid fa-circle-dollar-to-slot" />
                        ),
                        path: route('teller-transactions.deposit'),
                        match_path: 'teller-transactions/deposit',
                        permission: ['transaction.deposit.create'],
                    },
                    {
                        name: 'Cheque Withdrawal',
                        icon: <i className="fa-solid fa-money-bill-transfer" />,
                        path: route('teller-transactions.withdrawal'),
                        match_path: 'teller-transactions/withdrawal',
                        permission: ['transaction.withdraw.create'],
                    },
                ],
            },
            {
                name: 'Cash Adjustments',
                icon: <i className="fa-solid fa-pen-to-square" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Record Adjustment',
                        icon: <i className="fa-solid fa-plus" />,
                        path: '/cash-adjustments/create',
                        match_path: 'cash-adjustments/create',
                        permission: ['cash_adjustment.create'],
                    },
                    {
                        name: 'Adjustment Approval',
                        icon: <i className="fa-solid fa-check" />,
                        path: '/cash-adjustments/approve',
                        match_path: 'cash-adjustments/approve',
                        permission: ['cash_adjustment.approve'],
                    },
                    {
                        name: 'Adjustment History',
                        icon: <i className="fa-solid fa-clock-rotate-left" />,
                        path: '/cash-adjustments/history',
                        match_path: 'cash-adjustments/history',
                        permission: ['cash_adjustment.history.view'],
                    },
                ],
            },
            {
                name: 'Cash Movements',
                icon: <i className="fa-solid fa-right-left" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Vault to Vault Transfer',
                        icon: <i className="fa-solid fa-vault" />,
                        path: route(
                            'teller-transactions.vault-to-vault-transfer',
                        ),
                        match_path:
                            'teller-transactions/vault-to-vault-transfer',
                        permission: ['cash_transfer.approve'],
                    },
                    {
                        name: 'Vault to Bank Transfer',
                        icon: <i className="fa-solid fa-vault" />,
                        path: '/cash-transactions/approve',
                        match_path: 'cash-transactions/approve',
                        permission: ['cash_transfer.approve'],
                    },
                    {
                        name: 'Bank to Vault Transfer',
                        icon: <i className="fa-solid fa-vault" />,
                        path: '/cash-transactions/approve',
                        match_path: 'cash-transactions/approve',
                        permission: ['cash_transfer.approve'],
                    },
                    {
                        name: 'Vault to Teller Transfer',
                        icon: <i className="fa-solid fa-vault" />,
                        path: route(
                            'teller-transactions.vault-to-teller-transfer',
                        ),
                        match_path:
                            'teller-transactions/vault-to-teller-transfer',
                        permission: ['vault_to_teller.create'],
                    },
                    {
                        name: 'Teller to Teller Transfer',
                        icon: <i className="fa-solid fa-cash-register" />,
                        path: route(
                            'teller-transactions.teller-to-teller-transfer',
                        ),
                        match_path:
                            'teller-transactions/teller-to-teller-transfer',
                        permission: ['teller_to_vault.create'],
                    },
                    {
                        name: 'Teller to Vault Transfer',
                        icon: <i className="fa-solid fa-cash-register" />,
                        path: route(
                            'teller-transactions.teller-to-vault-transfer',
                        ),
                        match_path:
                            'teller-transactions/teller-to-vault-transfer',
                        permission: ['teller_to_vault.create'],
                    },
                ],
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-column" />,
                children_expanded: false,
                permission: ['cash_reports.view'],
                children: [
                    {
                        name: 'Daily Cash Report',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/reports/daily-cash',
                        match_path: 'reports/daily-cash',
                        permission: ['report.daily_cash.view'],
                    },
                    {
                        name: 'Teller Cash Summary',
                        icon: <i className="fa-solid fa-user-tie" />,
                        path: '/reports/teller-cash-summary',
                        match_path: 'reports/teller-cash-summary',
                        permission: ['report.teller_cash_summary.view'],
                    },
                    {
                        name: 'Vault Balance Report',
                        icon: <i className="fa-solid fa-vault" />,
                        path: '/reports/vault-balance',
                        match_path: 'reports/vault-balance',
                        permission: ['report.vault_balance.view'],
                    },
                    {
                        name: 'Cash Transfer Report',
                        icon: (
                            <i className="fa-solid fa-arrow-right-arrow-left" />
                        ),
                        path: '/reports/cash-transfers',
                        match_path: 'reports/cash-transfers',
                        permission: ['report.cash_transfer.view'],
                    },
                    {
                        name: 'Adjustment Report',
                        icon: <i className="fa-solid fa-pen-to-square" />,
                        path: '/reports/cash-adjustments',
                        match_path: 'reports/cash-adjustments',
                        permission: ['report.cash_adjustment.view'],
                    },
                ],
            },
        ],
    },
];
