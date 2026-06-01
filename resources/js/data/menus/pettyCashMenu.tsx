import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';

export const pettyCashMenu: SidebarItem[] = [
    {
        name: 'Petty Cash',
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
                        path: route('petty-cash-accounts.replenishment'),
                        match_path: 'replenishment/create',
                    },
                    {
                        name: 'Expense Entry',
                        icon: <i className="fa-solid fa-receipt" />,
                        permission: ['petty_cash.voucher_entries.view'],
                        path: route('petty-cash-accounts.expense'),
                        match_path: 'expense/create',
                    },
                    {
                        name: 'Advance Payment Entry',
                        icon: (
                            <i className="fa-solid fa-arrow-up-right-from-square" />
                        ),
                        permission: ['petty_cash.replenishment.view'],
                        path: route(
                            'petty-cash-advance-accounts.advance-entry',
                        ),
                        match_path: 'advance-entry/create',
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
        ],
    },
];
