import { SidebarItem } from '../../types';

export const pettyCashManagementMenu: SidebarItem[] = [
    {
        name: 'Petty Cash Management',
        icon: <i className="fa-solid fa-money-bill-transfer" />,
        children_expanded: false,
        permission: ['cash.branch.view'],
        children: [
            {
                name: 'Petty Cash Accounts',
                icon: <i className="fa-solid fa-sack-dollar" />,
                permission: ['petty_cash.accounts.view'],
                path: '/petty-cash-accounts',
                match_path: 'petty-cash-accounts',
            },
            {
                name: 'Expense Categories',
                icon: <i className="fa-solid fa-tags" />,
                permission: ['expense_categories.view'],
                path: '/expense-categories',
                match_path: 'expense-categories',
            },
            {
                name: 'Petty Cash Vouchers',
                icon: <i className="fa-solid fa-file-invoice-dollar" />,
                permission: ['petty_cash.vouchers.view'],
                path: '/petty-cash-vouchers',
                match_path: 'petty-cash-vouchers',
            },
            {
                name: 'Replenishments',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                permission: ['petty_cash.replenishments.view'],
                path: '/petty-cash-replenishments',
                match_path: 'petty-cash-replenishments',
            },
            {
                name: 'Approvals',
                icon: <i className="fa-solid fa-check-circle" />,
                permission: ['petty_cash.approvals.view'],
                path: '/petty-cash-approvals',
                match_path: 'petty-cash-approvals',
            },
            {
                name: 'Transactions Log',
                icon: <i className="fa-solid fa-book" />,
                permission: ['petty_cash.transactions.view'],
                path: '/petty-cash-transactions',
                match_path: 'petty-cash-transactions',
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-line" />,
                children_expanded: false,
                permission: ['petty_cash.reports.view'],
                children: [
                    {
                        name: 'Account Summary',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/petty-cash-account-summary',
                        match_path: 'petty-cash-account-summary',
                        permission: ['petty_cash.reports.view'],
                    },
                    {
                        name: 'Expense Reports',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/petty-cash-expense-reports',
                        match_path: 'petty-cash-expense-reports',
                        permission: ['petty_cash.reports.view'],
                    },
                    {
                        name: 'Voucher Reports',
                        icon: <i className="fa-solid fa-file-check" />,
                        path: '/petty-cash-voucher-reports',
                        match_path: 'petty-cash-voucher-reports',
                        permission: ['petty_cash.reports.view'],
                    },
                ],
            },
        ],
    },
];
