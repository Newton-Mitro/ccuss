import { SidebarItem } from '../../types';

export const financialServicesMenu: SidebarItem[] = [
    {
        name: 'Financial Services',
        icon: <i className="fa-solid fa-piggy-bank" />,
        children_expanded: false,
        permission: ['financial.view'],
        children: [
            {
                name: 'Products',
                icon: <i className="fa-solid fa-boxes-stacked" />,
                permission: ['financial.products.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Product List',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-products',
                        match_path: 'financial-products',
                        permission: ['financial.products.view'],
                    },
                    {
                        name: 'Create Product',
                        icon: <i className="fa-solid fa-plus" />,
                        path: '/financial-products/create',
                        match_path: 'financial-products/create',
                        permission: ['financial.products.create'],
                    },
                    {
                        name: 'Product Policies',
                        icon: <i className="fa-solid fa-file-shield" />,
                        path: '/financial-product-policies',
                        match_path: 'financial-product-policies',
                        permission: ['financial.policies.view'],
                    },
                ],
            },
            {
                name: 'Financial Accounts',
                icon: <i className="fa-solid fa-piggy-bank" />,
                permission: ['financial.accounts.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Account List',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-accounts',
                        match_path: 'financial-accounts',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Open Account',
                        icon: <i className="fa-solid fa-plus" />,
                        path: '/financial-accounts/create',
                        match_path: 'financial-accounts/create',
                        permission: ['financial.accounts.create'],
                    },
                    {
                        name: 'Account Statements',
                        icon: <i className="fa-solid fa-file-lines" />,
                        path: '/financial-account-statements',
                        match_path: 'financial-account-statements',
                        permission: ['financial.accounts.view'],
                    },
                ],
            },
            {
                name: 'Transactions',
                icon: <i className="fa-solid fa-money-bill-transfer" />,
                permission: ['financial.transactions.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Transaction List',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-transactions',
                        match_path: 'financial-transactions',
                        permission: ['financial.transactions.view'],
                    },
                    {
                        name: 'Deposit',
                        icon: <i className="fa-solid fa-arrow-down" />,
                        path: '/financial-transactions/create?type=DEPOSIT',
                        match_path: 'financial-transactions/create',
                        permission: ['financial.transactions.create'],
                    },
                    {
                        name: 'Withdrawal',
                        icon: <i className="fa-solid fa-arrow-up" />,
                        path: '/financial-transactions/create?type=WITHDRAWAL',
                        match_path: 'financial-transactions/create',
                        permission: ['financial.transactions.create'],
                    },
                    {
                        name: 'Transfer',
                        icon: <i className="fa-solid fa-right-left" />,
                        path: '/financial-transactions/transfer/create',
                        match_path: 'financial-transactions/transfer',
                        permission: ['financial.transactions.create'],
                    },
                    {
                        name: 'Loan Disbursement',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/financial-transactions/loan-disbursement/create',
                        match_path: 'financial-transactions/loan-disbursement',
                        permission: ['financial.transactions.create'],
                    },
                    {
                        name: 'Loan Repayment',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/financial-transactions/loan-repayment/create',
                        match_path: 'financial-transactions/loan-repayment',
                        permission: ['financial.transactions.create'],
                    },
                ],
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-line" />,
                permission: ['financial.reports.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Product Summary',
                        icon: <i className="fa-solid fa-chart-pie" />,
                        path: '/financial-reports/product-summary',
                        match_path: 'financial-reports/product-summary',
                        permission: ['financial.reports.view'],
                    },
                    {
                        name: 'Account Balances',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/financial-reports/account-balances',
                        match_path: 'financial-reports/account-balances',
                        permission: ['financial.reports.view'],
                    },
                    {
                        name: 'Transaction Report',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/financial-reports/transactions',
                        match_path: 'financial-reports/transactions',
                        permission: ['financial.reports.view'],
                    },
                ],
            },
        ],
    },
];
