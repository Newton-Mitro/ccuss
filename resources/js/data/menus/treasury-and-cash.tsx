import { SidebarItem } from '../../types';

export const treasuryAndCash: SidebarItem[] = [
    {
        name: 'Treasury & Cash',
        icon: <i className="fa-solid fa-coins" />,
        children_expanded: false,
        permission: ['treasury.view'],
        children: [
            {
                name: 'Overview',
                icon: <i className="fa-solid fa-chart-line" />,
                path: '/treasury-cash',
                match_path: 'treasury-cash',
                permission: ['treasury.view'],
            },

            // Vault Management
            {
                name: 'Vault Management',
                icon: <i className="fa-solid fa-vault" />,
                children_expanded: false,
                permission: ['cash_management.view'],
                children: [
                    {
                        name: 'Vaults',
                        icon: <i className="fa-solid fa-vault" />,
                        path: '/vaults',
                        match_path: 'vaults',
                        permission: ['cash_management.view'],
                    },
                    {
                        name: 'Vault Sessions',
                        icon: <i className="fa-solid fa-door-open" />,
                        path: '/vault-sessions',
                        match_path: 'vault-sessions',
                        permission: ['vault_sessions.view'],
                    },
                    {
                        name: 'Cash Position',
                        icon: <i className="fa-solid fa-money-bill-transfer" />,
                        path: '/vault-cash-position',
                        match_path: 'vault-cash-position',
                        permission: ['cash_transactions.view'],
                    },
                    {
                        name: 'Cash Transfers',
                        icon: <i className="fa-solid fa-right-left" />,
                        children_expanded: false,
                        permission: ['cash_transfers.view'],
                        children: [
                            {
                                name: 'Transfer Queue',
                                icon: (
                                    <i className="fa-solid fa-clipboard-check" />
                                ),
                                path: '/vault-transfers',
                                match_path: 'vault-transfers',
                                permission: ['cash_transfers.view'],
                            },
                            {
                                name: 'Vault to Teller',
                                icon: <i className="fa-solid fa-arrow-down" />,
                                path: '/vault-transfers/vault-to-teller',
                                match_path: 'vault-transfers/vault-to-teller',
                                permission: ['cash_transfers.create'],
                            },
                            {
                                name: 'Teller to Vault',
                                icon: <i className="fa-solid fa-arrow-up" />,
                                path: '/vault-transfers/teller-to-vault',
                                match_path: 'vault-transfers/teller-to-vault',
                                permission: ['cash_transfers.create'],
                            },
                            {
                                name: 'Vault to Vault',
                                icon: <i className="fa-solid fa-right-left" />,
                                path: '/vault-transfers/vault-to-vault',
                                match_path: 'vault-transfers/vault-to-vault',
                                permission: ['cash_transfers.create'],
                            },
                            {
                                name: 'Bank to Vault',
                                icon: (
                                    <i className="fa-solid fa-building-columns" />
                                ),
                                path: '/vault-transfers/bank-to-vault',
                                match_path: 'vault-transfers/bank-to-vault',
                                permission: ['cash_transfers.create'],
                            },
                            {
                                name: 'Vault to Bank',
                                icon: (
                                    <i className="fa-solid fa-building-columns" />
                                ),
                                path: '/vault-transfers/vault-to-bank',
                                match_path: 'vault-transfers/vault-to-bank',
                                permission: ['cash_transfers.create'],
                            },
                        ],
                    },
                    {
                        name: 'Cash Counts',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/vault-counts',
                        match_path: 'vault-counts',
                        permission: ['cash_transactions.view'],
                    },
                    {
                        name: 'Cash Adjustments',
                        icon: <i className="fa-solid fa-sliders" />,
                        children_expanded: false,
                        permission: ['cash_transactions.view'],
                        children: [
                            {
                                name: 'Adjustment Queue',
                                icon: (
                                    <i className="fa-solid fa-clipboard-check" />
                                ),
                                path: '/vault-adjustments',
                                match_path: 'vault-adjustments',
                                permission: ['cash_transactions.view'],
                            },
                            {
                                name: 'Cash Adjustment',
                                icon: <i className="fa-solid fa-sliders" />,
                                path: '/vault-adjustments/create',
                                match_path: 'vault-adjustments/create',
                                permission: ['cash_transactions.create'],
                            },
                        ],
                    },
                ],
            },

            // Cash Control
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

            // Petty Cash
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

            // Banking
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

            // Cheque Management
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
                    {
                        name: 'Cheque Payment Review',
                        icon: <i className="fa-solid fa-list-check" />,
                        path: '/cheque-payments',
                        match_path: 'cheque-payments',
                        permission: ['cheque_payments.view'],
                    },
                ],
            },
        ],
    },
];
