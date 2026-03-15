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
                children: [
                    {
                        name: 'Create Account',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['petty_cash.accounts.create'],
                    },
                    {
                        name: 'Account List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['petty_cash.accounts.view'],
                    },
                ],
            },
            {
                name: 'Expense Categories',
                icon: <i className="fa-solid fa-tags" />,
                permission: ['expense_categories.view'],
                children: [
                    {
                        name: 'Add Category',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['expense_categories.create'],
                    },
                    {
                        name: 'Category List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['expense_categories.view'],
                    },
                ],
            },
            {
                name: 'Petty Cash Vouchers',
                icon: <i className="fa-solid fa-file-invoice-dollar" />,
                permission: ['petty_cash.vouchers.view'],
                children: [
                    {
                        name: 'Create Voucher',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['petty_cash.vouchers.create'],
                    },
                    {
                        name: 'Voucher List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['petty_cash.vouchers.view'],
                    },
                ],
            },
            {
                name: 'Replenishments',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                permission: ['petty_cash.replenishments.view'],
                children: [
                    {
                        name: 'Request Replenishment',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['petty_cash.replenishments.create'],
                    },
                    {
                        name: 'Replenishment List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['petty_cash.replenishments.view'],
                    },
                ],
            },
            {
                name: 'Transactions Log',
                icon: <i className="fa-solid fa-book" />,
                permission: ['petty_cash.transactions.view'],
            },
        ],
    },
];
