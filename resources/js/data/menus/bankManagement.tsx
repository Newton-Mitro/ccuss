import { SidebarItem } from '../../types';

export const bankManagementMenu: SidebarItem[] = [
    {
        name: 'Bank Management',
        icon: <i className="fa-solid fa-university" />,
        children_expanded: false,
        permission: ['bank.view'],
        children: [
            {
                name: 'Banks',
                icon: <i className="fa-solid fa-building-columns" />,
                permission: ['banks.view'],
                children: [
                    {
                        name: 'Add Bank',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['banks.create'],
                    },
                    {
                        name: 'Bank List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['banks.view'],
                    },
                ],
            },
            {
                name: 'Bank Branches',
                icon: <i className="fa-solid fa-code-branch" />,
                permission: ['bank_branches.view'],
                children: [
                    {
                        name: 'Add Branch',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['bank_branches.create'],
                    },
                    {
                        name: 'Branch List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['bank_branches.view'],
                    },
                ],
            },
            {
                name: 'Bank Accounts',
                icon: <i className="fa-solid fa-wallet" />,
                permission: ['bank_accounts.view'],
                children: [
                    {
                        name: 'Open Account',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['bank_accounts.create'],
                    },
                    {
                        name: 'Account List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['bank_accounts.view'],
                    },
                ],
            },
            {
                name: 'Transactions',
                icon: <i className="fa-solid fa-exchange-alt" />,
                permission: ['bank_transactions.view'],
                children: [
                    {
                        name: 'Add Transaction',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['bank_transactions.create'],
                    },
                    {
                        name: 'Transaction List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['bank_transactions.view'],
                    },
                ],
            },
            {
                name: 'Cheques',
                icon: <i className="fa-solid fa-money-check" />,
                permission: ['bank_cheques.view'],
                children: [
                    {
                        name: 'Issue / Receive Cheque',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['bank_cheques.create'],
                    },
                    {
                        name: 'Cheque List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['bank_cheques.view'],
                    },
                ],
            },
            {
                name: 'Reconciliation',
                icon: <i className="fa-solid fa-calculator" />,
                permission: ['bank_reconciliations.view'],
                children: [
                    {
                        name: 'Add Reconciliation',
                        icon: <i className="fa-solid fa-plus" />,
                        permission: ['bank_reconciliations.create'],
                    },
                    {
                        name: 'Reconciliation List',
                        icon: <i className="fa-solid fa-list" />,
                        permission: ['bank_reconciliations.view'],
                    },
                ],
            },
        ],
    },
];
