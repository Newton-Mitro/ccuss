import { SidebarItem } from '../../types';

export const bankAndChequeMenu: SidebarItem[] = [
    {
        name: 'Bank and Cheques',
        icon: <i className="fa-solid fa-university" />,
        children_expanded: false,
        permission: ['bank.view'],
        children: [
            {
                name: 'Bank & Accounts',
                icon: <i className="fa-solid fa-university" />,
                children_expanded: false,
                permission: ['bank.view'],
                children: [
                    {
                        name: 'Banks',
                        icon: <i className="fa-solid fa-building-columns" />,
                        permission: ['banks.view'],
                        path: '/banks',
                        match_path: 'banks',
                    },
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
                                icon: (
                                    <i className="fa-solid fa-file-invoice-dollar" />
                                ),
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
                                icon: (
                                    <i className="fa-solid fa-check-circle" />
                                ),
                                permission: ['bank.approvals.view'],
                                path: '/bank-approvals',
                                match_path: 'bank-approvals',
                            },
                        ],
                    },

                    {
                        name: 'Reports',
                        icon: <i className="fa-solid fa-chart-line" />,
                        children_expanded: false,
                        permission: ['bank.reports.view'],
                        children: [
                            {
                                name: 'Account Summary',
                                icon: <i className="fa-solid fa-book" />,
                                path: '/bank-account-summary',
                                match_path: 'bank-account-summary',
                                permission: ['bank.reports.view'],
                            },
                            {
                                name: 'Transaction Reports',
                                icon: (
                                    <i className="fa-solid fa-file-invoice" />
                                ),
                                path: '/bank-transaction-reports',
                                match_path: 'bank-transaction-reports',
                                permission: ['bank.reports.view'],
                            },
                            {
                                name: 'Cheque Reports',
                                icon: <i className="fa-solid fa-money-check" />,
                                path: '/bank-cheque-reports',
                                match_path: 'bank-cheque-reports',
                                permission: ['bank.reports.view'],
                            },
                        ],
                    },
                ],
            },

            {
                name: 'Cheque Management',
                icon: <i className="fa-solid fa-file-invoice" />,
                children_expanded: false,
                permission: ['cheque.view'],
                children: [
                    {
                        name: 'Bank Cheque Books',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/bank-cheque-books',
                        match_path: 'cheque-books',
                        permission: ['cheque.book.view'],
                    },
                    {
                        name: 'Bank Cheques',
                        icon: <i className="fa-solid fa-money-check" />,
                        path: '/bank-cheques',
                        match_path: 'bank-cheques',
                        permission: ['cheque.view'],
                    },
                ],
            },
        ],
    },
];
