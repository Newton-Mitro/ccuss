import { SidebarItem } from '../../types';

export const bankCashModuleMenu: SidebarItem[] = [
    {
        name: 'Bank Cash',
        icon: <i className="fa-solid fa-university" />,
        children_expanded: false,
        permission: ['bank.view'],
        children: [
            {
                name: 'Bank Accounts',
                icon: <i className="fa-solid fa-wallet" />,
                permission: ['bank_accounts.view'],
                path: '/bank-accounts',
                match_path: 'bank-accounts',
            },
            {
                name: 'Bank Transactions',
                icon: <i className="fa-solid fa-exchange-alt" />,
                children_expanded: false,
                permission: [''],
                children: [
                    {
                        name: 'Payments',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        permission: ['bank_transactions.view'],
                        path: '/bank-voucher_entries',
                        match_path: 'bank-voucher_entries',
                    },
                    {
                        name: 'Reconciliation',
                        icon: <i className="fa-solid fa-calculator" />,
                        permission: ['bank_reconciliations.view'],
                        path: '/bank-reconciliations',
                        match_path: 'bank-reconciliations',
                    },
                    {
                        name: 'Approvals',
                        icon: <i className="fa-solid fa-check-circle" />,
                        permission: ['bank.approvals.view'],
                        path: '/bank-approvals',
                        match_path: 'bank-approvals',
                    },
                ],
            },
        ],
    },
];
