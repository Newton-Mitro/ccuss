import { SidebarItem } from '../../types';

export const branchTreasuryManagementMenu: SidebarItem[] = [
    {
        name: 'Branch Treasury Management',
        icon: <i className="fa-solid fa-money-bill-transfer" />,
        children_expanded: false,
        permission: ['cash.branch.view'],
        children: [
            {
                name: 'Operating Procedures',
                icon: <i className="fa-solid fa-list" />,
                path: '/sop',
                match_path: 'sop',
                permission: ['vault.list.view'],
            },
            {
                name: 'Vault Management',
                icon: <i className="fa-solid fa-vault" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Vaults',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/vaults',
                        match_path: 'vaults',
                        permission: ['vault.list.view'],
                    },
                    {
                        name: 'Vault Transactions',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/vaults/transactions',
                        match_path: 'vaults/transactions',
                        permission: ['vault.transactions.view'],
                    },
                ],
            },
            {
                name: 'Branch Day Management',
                icon: <i className="fa-solid fa-calendar-day" />,
                children_expanded: false,
                permission: ['branch_day.view'],
                children: [
                    {
                        name: 'Branch Day Status',
                        icon: <i className="fa-solid fa-eye" />,
                        path: '/branch-cash/branch-day/status',
                        match_path: 'branch-day/status',
                        permission: ['branch_day.view'],
                    },
                    {
                        name: 'Open Branch Day',
                        icon: <i className="fa-solid fa-circle-play" />,
                        path: '/branch-cash/branch-day/open',
                        match_path: 'branch-day/open',
                        permission: ['branch_day.open'],
                    },
                    {
                        name: 'Branch Day History',
                        icon: <i className="fa-solid fa-clock-rotate-left" />,
                        path: '/branch-cash/branch-day/history',
                        match_path: 'branch-day/history',
                        permission: ['branch_day.history.view'],
                    },
                ],
            },
            {
                name: 'Teller & Session',
                icon: <i className="fa-solid fa-user-clock" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Tellers',
                        icon: <i className="fa-solid fa-users" />,
                        path: '/tellers',
                        match_path: 'tellers',
                        permission: ['teller.list.view'],
                    },
                    {
                        name: 'Teller Sessions',
                        icon: <i className="fa-solid fa-eye" />,
                        path: '/teller-sessions',
                        match_path: 'teller-sessions',
                        permission: ['teller_session.view'],
                    },
                ],
            },
            {
                name: 'Teller Cash Assignment',
                icon: <i className="fa-solid fa-circle-right"></i>,
                path: '/cash-transfers/vault-to-teller',
                match_path: 'cash-transfers/vault-to-teller',
                permission: ['vault_to_teller.create'],
            },
            {
                name: 'Teller Transactions',
                icon: <i className="fa-solid fa-receipt" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Customer Deposit',
                        icon: (
                            <i className="fa-solid fa-circle-dollar-to-slot" />
                        ),
                        path: '/deposit',
                        match_path: 'deposit',
                        permission: ['transaction.deposit.create'],
                    },
                    {
                        name: 'Customer Withdrawal',
                        icon: <i className="fa-solid fa-money-bill-transfer" />,
                        path: '/withdrawal',
                        match_path: 'withdrawal',
                        permission: ['transaction.withdraw.create'],
                    },
                    {
                        name: 'Transaction History',
                        icon: <i className="fa-solid fa-clock-rotate-left" />,
                        path: '/cash-transactions/history',
                        match_path: 'cash-transactions/history',
                        permission: ['cash_transaction.history.view'],
                    },
                ],
            },
            {
                name: 'Teller Cash Return',
                icon: <i className="fa-solid fa-circle-left"></i>,
                path: '/cash-transfers/teller-to-vault',
                match_path: 'cash-transfers/teller-to-vault',
                permission: ['teller_to_vault.create'],
            },
            {
                name: 'Cash Balancing',
                icon: <i className="fa-solid fa-scale-balanced" />,
                children_expanded: false,
                children: [
                    {
                        name: 'Balance Drawer',
                        icon: <i className="fa-solid fa-calculator" />,
                        path: '/cash-balancing/drawer',
                        match_path: 'cash-balancing/drawer',
                        permission: ['cash_balancing.drawer.view'],
                    },
                    {
                        name: 'Balancing History',
                        icon: <i className="fa-solid fa-clock-rotate-left" />,
                        path: '/cash-balancing/history',
                        match_path: 'cash-balancing/history',
                        permission: ['cash_balancing.history.view'],
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
                name: 'Vault to Vault Transfers',
                icon: <i className="fa-solid fa-right-left" />,
                children_expanded: false,
                permission: ['cash_transfer.view'],
                children: [
                    {
                        name: 'Vault to Vault Cash Transfer',
                        icon: <i className="fa-solid fa-check" />,
                        path: '/cash-transfers/approve',
                        match_path: 'cash-transfers/approve',
                        permission: ['cash_transfer.approve'],
                    },
                    {
                        name: 'Transfer History',
                        icon: <i className="fa-solid fa-clock-rotate-left" />,
                        path: '/cash-transfers/history',
                        match_path: 'cash-transfers/history',
                        permission: ['cash_transfer.history.view'],
                    },
                ],
            },
            {
                name: 'Audit Logs',
                icon: <i className="fa-solid fa-clipboard-list" />,
                path: '/audit-logs',
                match_path: 'audit-logs',
                permission: ['audit_logs.view'],
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
