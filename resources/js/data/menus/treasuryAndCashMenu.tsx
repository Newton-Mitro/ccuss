import { SidebarItem } from '../../types';

export const treasuryAndCashMenu: SidebarItem[] = [
    {
        name: 'Treasury & Cash',
        icon: <i className="fa-solid fa-coins" />,
        children_expanded: false,
        permission: ['treasury.view'],

        children: [
            {
                name: 'Dashboard',
                icon: <i className="fa-solid fa-chart-line" />,
                path: '/treasury-cash',
                match_path: 'treasury-cash',
                permission: ['treasury.view'],
            },
            {
                name: 'Branch Day',
                icon: <i className="fa-solid fa-calendar-day" />,
                children_expanded: false,
                permission: ['branch_days.view'],

                children: [
                    {
                        name: 'Open & Close Branch Day',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/branch-days',
                        match_path: 'branch-days',
                        permission: ['branch_days.view'],
                    },
                ],
            },
            {
                name: 'Vault Management',
                icon: <i className="fa-solid fa-vault" />,
                children_expanded: false,
                permission: ['vaults.view'],

                children: [
                    {
                        name: 'Vaults',
                        icon: <i className="fa-solid fa-vault" />,
                        path: '/vaults',
                        match_path: 'vaults',
                        permission: ['vaults.view'],
                    },

                    {
                        name: 'Vault Sessions',
                        icon: <i className="fa-solid fa-clock" />,
                        path: '/vault-sessions',
                        match_path: 'vault-sessions',
                        permission: ['vault_sessions.view'],
                    },

                    {
                        name: 'Cash Position',
                        icon: <i className="fa-solid fa-money-bill-transfer" />,
                        path: '/vault-cash-position',
                        match_path: 'vault-cash-position',
                        permission: ['vaults.view'],
                    },

                    {
                        name: 'Cash Transfers',
                        icon: <i className="fa-solid fa-right-left" />,
                        children_expanded: false,
                        permission: ['vault_transfers.view'],

                        children: [
                            {
                                name: 'Transfer Queue',
                                icon: (
                                    <i className="fa-solid fa-clipboard-check" />
                                ),
                                path: '/vault-transfers',
                                match_path: 'vault-transfers',
                                permission: ['vault_transfers.view'],
                            },

                            {
                                name: 'Vault to Teller',
                                icon: <i className="fa-solid fa-arrow-down" />,
                                path: '/vault-transfers/vault-to-teller',
                                match_path: 'vault-transfers/vault-to-teller',
                                permission: ['vault_transfers.create'],
                            },

                            {
                                name: 'Teller to Vault',
                                icon: <i className="fa-solid fa-arrow-up" />,
                                path: '/vault-transfers/teller-to-vault',
                                match_path: 'vault-transfers/teller-to-vault',
                                permission: ['vault_transfers.create'],
                            },
                        ],
                    },

                    {
                        name: 'Cash Counts',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/vault-counts',
                        match_path: 'vault-counts',
                        permission: ['vault_counts.view'],
                    },

                    {
                        name: 'Cash Adjustments',
                        icon: <i className="fa-solid fa-sliders" />,
                        children_expanded: false,
                        permission: ['vault_adjustments.view'],

                        children: [
                            {
                                name: 'Adjustment Queue',
                                icon: (
                                    <i className="fa-solid fa-clipboard-check" />
                                ),
                                path: '/vault-adjustments',
                                match_path: 'vault-adjustments',
                                permission: ['vault_adjustments.view'],
                            },

                            {
                                name: 'Cash Adjustment',
                                icon: <i className="fa-solid fa-sliders" />,
                                path: '/vault-adjustments/create',
                                match_path: 'vault-adjustments/create',
                                permission: ['vault_adjustments.create'],
                            },
                        ],
                    },
                ],
            },
            {
                name: 'Teller Management',
                icon: <i className="fa-solid fa-user-tie" />,
                children_expanded: false,
                permission: ['cash_management.view'],

                children: [
                    {
                        name: 'Tellers',
                        icon: <i className="fa-solid fa-user-tie" />,
                        path: '/tellers',
                        match_path: 'tellers',
                        permission: ['cash_management.view'],
                    },

                    {
                        name: 'Teller Sessions',
                        icon: <i className="fa-solid fa-clock" />,
                        path: '/teller-sessions',
                        match_path: 'teller-sessions',
                        permission: ['teller_sessions.view'],
                    },
                ],
            },
            {
                name: 'Cash Transactions',
                icon: <i className="fa-solid fa-cash-register" />,
                children_expanded: false,
                permission: ['cash_transactions.view'],

                children: [
                    {
                        name: 'Transactions',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/teller-transactions',
                        match_path: 'teller-transactions',
                        permission: ['cash_transactions.view'],
                    },

                    {
                        name: 'Cash Deposit',
                        icon: <i className="fa-solid fa-arrow-down" />,
                        path: '/teller-transactions/deposit',
                        match_path: 'teller-transactions/deposit',
                        permission: ['cash_transactions.create'],
                    },

                    {
                        name: 'Cash Withdrawal',
                        icon: <i className="fa-solid fa-arrow-up" />,
                        path: '/teller-transactions/withdrawal',
                        match_path: 'teller-transactions/withdrawal',
                        permission: ['cash_transactions.create'],
                    },

                    {
                        name: 'Customer Deposit',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/teller-transactions/customer-deposit',
                        match_path: 'teller-transactions/customer-deposit',
                        permission: ['cash_transactions.create'],
                    },

                    {
                        name: 'Savings Cheque Withdrawal',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/teller-transactions/savings-cheque-withdrawal',
                        match_path:
                            'teller-transactions/savings-cheque-withdrawal',
                        permission: ['cash_transactions.create'],
                    },
                ],
            },
            {
                name: 'Cash Transfers',
                icon: <i className="fa-solid fa-right-left" />,
                children_expanded: false,
                permission: ['cash_transfers.view'],

                children: [
                    {
                        name: 'Transfer Queue',
                        icon: <i className="fa-solid fa-clipboard-check" />,
                        path: '/cash-movements/transfers',
                        match_path: 'cash-movements/transfers',
                        permission: ['cash_transfers.view'],
                    },

                    {
                        name: 'Teller to Teller Transfer',
                        icon: (
                            <i className="fa-solid fa-arrow-right-arrow-left" />
                        ),
                        path: '/cash-movements/teller-to-teller-transfer',
                        match_path: 'cash-movements',
                        permission: ['cash_transfers.create'],
                    },
                ],
            },
            {
                name: 'Cash Adjustments',
                icon: <i className="fa-solid fa-sliders" />,
                children_expanded: false,
                permission: ['cash_transactions.view'],

                children: [
                    {
                        name: 'Adjustment Queue',
                        icon: <i className="fa-solid fa-clipboard-check" />,
                        path: '/cash-adjustments',
                        match_path: 'cash-adjustments',
                        permission: ['cash_transactions.view'],
                    },

                    {
                        name: 'Cash Adjustment',
                        icon: <i className="fa-solid fa-sliders" />,
                        path: '/cash-adjustments/teller-cash-adjustment',
                        match_path: 'cash-adjustments',
                        permission: ['cash_transactions.create'],
                    },
                ],
            },
            {
                name: 'Cash Control',
                icon: <i className="fa-solid fa-shield-halved" />,
                children_expanded: false,
                permission: ['cash_transactions.view'],

                children: [
                    {
                        name: 'Cash Counts',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/cash-counts',
                        match_path: 'cash-counts',
                        permission: ['cash_transactions.view'],
                    },

                    {
                        name: 'Branch Cash Summary',
                        icon: <i className="fa-solid fa-chart-column" />,
                        path: '/branch-cash-summaries',
                        match_path: 'branch-cash-summaries',
                        permission: ['cash_transactions.view'],
                    },
                ],
            },
            {
                name: 'Petty Cash',
                icon: <i className="fa-solid fa-wallet" />,
                children_expanded: false,
                permission: ['petty_cash.view'],

                children: [
                    {
                        name: 'Petty Cash Accounts',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/petty-cash-accounts',
                        match_path: 'petty-cash-accounts',
                        permission: ['petty_cash.view'],
                    },

                    {
                        name: 'Transactions',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/petty-cash-transactions',
                        match_path: 'petty-cash-transactions',
                        permission: ['petty_cash.view'],
                    },
                ],
            },
            {
                name: 'Banking',
                icon: <i className="fa-solid fa-building-columns" />,
                children_expanded: false,
                permission: ['banking.view'],

                children: [
                    {
                        name: 'Banks',
                        icon: <i className="fa-solid fa-building-columns" />,
                        path: '/banks',
                        match_path: 'banks',
                        permission: ['banks.view'],
                    },

                    {
                        name: 'Bank Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/bank-accounts',
                        match_path: 'bank-accounts',
                        permission: ['bank_accounts.view'],
                    },

                    {
                        name: 'Bank Transactions',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/bank-transactions',
                        match_path: 'bank-transactions',
                        permission: ['bank_transactions.view'],
                    },

                    {
                        name: 'Bank Reconciliations',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/bank-reconciliations',
                        match_path: 'bank-reconciliations',
                        permission: ['bank_transactions.view'],
                    },
                ],
            },
            {
                name: 'Cheque Management',
                icon: <i className="fa-solid fa-money-check" />,
                children_expanded: false,
                permission: ['cheques.view'],

                children: [
                    {
                        name: 'Cheque Books',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/cheque-books',
                        match_path: 'cheque-books',
                        permission: ['cheque_books.view'],
                    },

                    {
                        name: 'Cheques',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/cheques',
                        match_path: 'cheques',
                        permission: ['cheques.view'],
                    },

                    {
                        name: 'Clearing Queue',
                        icon: <i className="fa-solid fa-money-check" />,
                        path: '/cheque-clearings',
                        match_path: 'cheque-clearings',
                        permission: ['cheques.view'],
                    },
                ],
            },
        ],
    },
];
