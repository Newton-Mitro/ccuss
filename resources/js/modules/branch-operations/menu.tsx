import { SidebarItem } from '@/types';

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
                name: 'Branch Days',
                icon: <i className="fa-solid fa-calendar-check" />,
                path: '/branch-days',
                match_path: 'branch-days',
                permission: ['branch_days.view'],
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

            {
                name: 'Cash Adjustments',
                icon: <i className="fa-solid fa-sliders" />,
                path: '/cash-adjustments',
                match_path: 'cash-adjustments',
                permission: ['cash_transactions.view'],
            },

            // Reports
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-file-lines" />,
                children_expanded: false,
                permission: ['cash_transactions.view'],
                children: [
                    {
                        name: 'Branch Cash Summary',
                        icon: <i className="fa-solid fa-chart-column" />,
                        path: '/branch-cash-summaries',
                        match_path: 'branch-cash-summaries',
                        permission: ['cash_transactions.view'],
                    },
                    {
                        name: 'Teller Transactions',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/teller-transactions',
                        match_path: 'teller-transactions',
                        permission: ['cash_transactions.view'],
                    },
                ],
            },
        ],
    },
];
