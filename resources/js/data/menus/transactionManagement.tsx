import { SidebarItem } from '../../types';

export const transactionManagementMenu: SidebarItem[] = [
    {
        name: 'Transaction Management',
        icon: <i className="fa-solid fa-building-columns" />,
        children_expanded: false,
        permission: ['transaction.view'],
        children: [
            {
                name: 'Customer Deposit/Collection',
                icon: <i className="fa-solid fa-circle-dollar-to-slot" />,
                path: '/deposit',
                match_path: 'deposit',
                permission: ['transaction.deposit.create'],
            },
            {
                name: 'Customer Withdrawal',
                icon: <i className="fa-solid fa-money-bill-transfer" />,
                path: '/withdrawal',
                match_path: 'withdrawal',
                permission: ['transaction.withdraw.create'],
            },
            {
                name: 'Transfer',
                icon: <i className="fa-solid fa-right-left" />,
                path: '/transfer',
                match_path: 'transfer',
                permission: ['transaction.transfer.create'],
            },
            {
                name: 'Journal Entry',
                icon: <i className="fa-solid fa-book" />,
                path: '/journal',
                match_path: 'journal',
                permission: ['transaction.journal.create'],
            },
            {
                name: 'Transaction History',
                icon: <i className="fa-solid fa-clock-rotate-left" />,
                path: '/transaction-history',
                match_path: 'transaction-history',
                permission: ['transaction.history.view'],
            },
        ],
    },
];
