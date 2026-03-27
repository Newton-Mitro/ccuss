import { SidebarItem } from '../../types';

export const pettyCashMenu: SidebarItem[] = [
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
                name: 'Petty Cash Vouchers',
                icon: <i className="fa-solid fa-file-invoice-dollar" />,
                permission: ['petty_cash.vouchers.view'],
                path: '/petty-cash-vouchers',
                match_path: 'petty-cash-vouchers',
            },
            {
                name: 'Replenishment',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                permission: ['petty_cash.replenishment.view'],
                path: '/petty-cash-replenishment',
                match_path: 'petty-cash-replenishment',
            },
            {
                name: 'Approvals',
                icon: <i className="fa-solid fa-check-circle" />,
                permission: ['petty_cash.approvals.view'],
                path: '/petty-cash-approvals',
                match_path: 'petty-cash-approvals',
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
