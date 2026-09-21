import { SidebarItem } from '../../types';

export const treasuryAndCashMenu: SidebarItem[] = [
    {
        name: 'Treasury & Cash',
        icon: <i className="fa-solid fa-coins" />,
        children_expanded: false,
        permission: ['treasury.view'],
        children: [
            {
                name: 'Branch Operations',
                icon: <i className="fa-solid fa-calendar-day" />,
                children_expanded: false,
                permission: ['branch_days.view'],
                children: [
                    {
                        name: 'Open & Close Branch Day',
                        icon: <i className="fa-solid fa-calendar-day" />,
                        path: '/branch-days',
                        match_path: 'branch-days',
                        permission: ['branch_days.view'],
                    },
                ],
            },
            {
                name: 'Cash Management',
                icon: <i className="fa-solid fa-cash-register" />,
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
                        name: 'Cash Transfers',
                        icon: <i className="fa-solid fa-right-left" />,
                        path: '/cash-movements/teller-to-teller-transfer',
                        match_path: 'cash-movements',
                        permission: ['cash_transfers.create'],
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
                        name: 'Advance Accounts',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/petty-cash-advance-accounts',
                        match_path: 'petty-cash-advance-accounts',
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
                        icon: <i className="fa-solid fa-bank" />,
                        path: '/banks',
                        match_path: 'banks',
                        permission: ['banks.view'],
                    },
                    {
                        name: 'Bank Accounts',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/bank-accounts',
                        match_path: 'bank-accounts',
                        permission: ['bank_accounts.view'],
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
                ],
            },
        ],
    },
];
