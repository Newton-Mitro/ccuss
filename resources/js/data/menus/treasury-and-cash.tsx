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

            {
                name: 'Cash Denominations',
                icon: <i className="fa-solid fa-coins" />,
                path: '/cash-denominations',
                match_path: 'cash-denominations',
                permission: ['cash_transactions.view'],
            },

            {
                name: 'Cash Movements',
                icon: <i className="fa-solid fa-money-bill-transfer" />,
                path: '/cash-movements/transfers',
                match_path: 'cash-movements',
                permission: ['cash_transfers.view'],
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
                        name: 'Bank Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/bank-accounts',
                        match_path: 'bank-accounts',
                        permission: ['bank_accounts.view'],
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

            // Reports
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-file-lines" />,
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
        ],
    },
];
