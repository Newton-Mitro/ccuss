import { SidebarItem } from '../../types';

export const branchOperations: SidebarItem[] = [
    {
        name: 'Branch Operations',
        icon: <i className="fa-solid fa-store" />,
        children_expanded: false,
        permission: ['treasury.view'],
        children: [
            {
                name: 'Overview',
                icon: <i className="fa-solid fa-chart-line" />,
                path: '/branch-operations',
                match_path: 'branch-operations',
                permission: ['treasury.view'],
            },

            // Branch Day
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

            // Teller Management
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

            // Cash Transactions
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
                ],
            },

            // Teller-to-Teller
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

            // Teller Cash Adjustment
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
        ],
    },
];
