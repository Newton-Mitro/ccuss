import { SidebarItem } from '../../types';

export const pettyCashMenu: SidebarItem[] = [
    {
        name: 'Petty Cash Management',
        icon: <i className="fa-solid fa-wallet" />,
        children_expanded: false,
        permission: ['cash.branch.view'],
        children: [
            {
                name: 'Petty Cash Accounts',
                icon: <i className="fa-solid fa-piggy-bank" />,
                permission: ['petty_cash.accounts.view'],
                path: '/petty-cash-accounts',
                match_path: 'petty-cash-accounts',
            },
            {
                name: 'Petty Cash Advance Accounts',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                permission: ['petty_cash.accounts.view'],
                path: '/petty-cash-advance-accounts',
                match_path: 'petty-cash-advance-accounts',
            },
            {
                name: 'Petty Cash Transactions',
                icon: <i className="fa-solid fa-arrows-rotate" />,
                children_expanded: false,
                permission: ['cash.branch.view'],
                children: [
                    {
                        name: 'Replenishment Entry',
                        icon: (
                            <i className="fa-solid fa-arrow-down-up-across-line" />
                        ),
                        permission: ['petty_cash.replenishment.view'],
                        path: '/petty-cash-replenishment',
                        match_path: 'petty-cash-replenishment',
                    },
                    {
                        name: 'Expense Entry',
                        icon: <i className="fa-solid fa-receipt" />,
                        permission: ['petty_cash.voucher_entries.view'],
                        path: '/petty-cash-voucher_entries',
                        match_path: 'petty-cash-voucher_entries',
                    },
                    {
                        name: 'Advance Payment Entry',
                        icon: (
                            <i className="fa-solid fa-arrow-up-right-from-square" />
                        ),
                        permission: ['petty_cash.replenishment.view'],
                        path: '/petty-cash-replenishment',
                        match_path: 'petty-cash-replenishment',
                    },
                    {
                        name: 'Advance Return Entry',
                        icon: <i className="fa-solid fa-arrow-rotate-left" />,
                        permission: ['petty_cash.replenishment.view'],
                        path: '/petty-cash-replenishment',
                        match_path: 'petty-cash-replenishment',
                    },
                    {
                        name: 'Transaction Approvals',
                        icon: <i className="fa-solid fa-list-check" />,
                        permission: ['petty_cash.approvals.view'],
                        path: '/petty-cash-approvals',
                        match_path: 'petty-cash-approvals',
                    },
                ],
            },

            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-pie" />,
                children_expanded: false,
                permission: ['petty_cash.reports.view'],
                children: [
                    {
                        name: 'Account Summary',
                        icon: <i className="fa-solid fa-book-open" />,
                        path: '/petty-cash-account-summary',
                        match_path: 'petty-cash-account-summary',
                        permission: ['petty_cash.reports.view'],
                    },
                    {
                        name: 'Expense Reports',
                        icon: <i className="fa-solid fa-file-lines" />,
                        path: '/petty-cash-expense-reports',
                        match_path: 'petty-cash-expense-reports',
                        permission: ['petty_cash.reports.view'],
                    },
                    {
                        name: 'Voucher Reports',
                        icon: <i className="fa-solid fa-file-circle-check" />,
                        path: '/petty-cash-voucher-reports',
                        match_path: 'petty-cash-voucher-reports',
                        permission: ['petty_cash.reports.view'],
                    },
                ],
            },
        ],
    },
];
