import { SidebarItem } from '../../types';

export const financialServicesMenu: SidebarItem[] = [
    {
        name: 'Financial Services',
        icon: <i className="fa-solid fa-piggy-bank" />,
        children_expanded: false,
        permission: ['financial.view'],
        children: [
            {
                name: 'Dashboard',
                icon: <i className="fa-solid fa-gauge-high" />,
                path: '/financial-services',
                match_path: 'financial-services',
                permission: ['financial.view'],
            },
            {
                name: 'Product Configuration',
                icon: <i className="fa-solid fa-boxes-stacked" />,
                permission: ['financial.products.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Product Catalog',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-products',
                        match_path: 'financial-products',
                        permission: ['financial.products.view'],
                    },
                    {
                        name: 'Policy Management',
                        icon: <i className="fa-solid fa-file-shield" />,
                        path: '/financial-product-policies',
                        match_path: 'financial-product-policies',
                        permission: ['financial.policies.view'],
                    },
                    {
                        name: 'Account Mappings',
                        icon: <i className="fa-solid fa-diagram-project" />,
                        path: '/financial-products',
                        match_path: 'financial-products',
                        permission: ['financial.products.mappings.manage'],
                    },
                    {
                        name: 'Default Rules',
                        icon: (
                            <i className="fa-solid fa-triangle-exclamation" />
                        ),
                        path: '/account-default-rules',
                        match_path: 'account-default-rules',
                        permission: ['financial.products.view'],
                    },
                    {
                        name: 'Fine Queue',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/account-fines',
                        match_path: 'account-fines',
                        permission: ['financial.accounts.view'],
                    },
                ],
            },
            {
                name: 'Deposit Operations',
                icon: <i className="fa-solid fa-piggy-bank" />,
                permission: ['financial.accounts.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'All Deposit Accounts',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-accounts',
                        match_path: 'financial-accounts',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Savings Accounts',
                        icon: <i className="fa-solid fa-piggy-bank" />,
                        path: '/financial-accounts/category/SAVINGS',
                        match_path: 'financial-accounts/category/SAVINGS',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Shares & Memberships',
                        icon: <i className="fa-solid fa-chart-pie" />,
                        path: '/financial-accounts/category/SHARE',
                        match_path: 'financial-accounts/category/SHARE',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Fixed Deposits',
                        icon: <i className="fa-solid fa-lock" />,
                        path: '/financial-accounts/category/FIXED_DEPOSIT',
                        match_path: 'financial-accounts/category/FIXED_DEPOSIT',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Recurring Deposits',
                        icon: <i className="fa-solid fa-rotate" />,
                        path: '/financial-accounts/category/RECURRING_DEPOSIT',
                        match_path:
                            'financial-accounts/category/RECURRING_DEPOSIT',
                        permission: ['financial.accounts.view'],
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
                name: 'Lending',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                permission: ['financial.loan-applications.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Loan Applications',
                        icon: <i className="fa-solid fa-file-signature" />,
                        path: '/loan-applications',
                        match_path: 'loan-applications',
                        permission: ['financial.loan-applications.view'],
                    },
                    {
                        name: 'Loan Accounts',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/financial-accounts/category/LOAN',
                        match_path: 'financial-accounts/category/LOAN',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Loan Disbursement',
                        icon: <i className="fa-solid fa-arrow-up-right-dots" />,
                        path: '/financial-transactions/loan-disbursement/create',
                        match_path: 'financial-transactions/loan-disbursement',
                        permission: ['financial.transactions.create'],
                    },
                ],
            },
            {
                name: 'Transaction Operations',
                icon: <i className="fa-solid fa-money-bill-transfer" />,
                permission: ['financial.transactions.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Posting Queue',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-transactions',
                        match_path: 'financial-transactions',
                        permission: ['financial.transactions.view'],
                    },
                    {
                        name: 'Transfers',
                        icon: <i className="fa-solid fa-right-left" />,
                        path: '/financial-transactions/transfer/create',
                        match_path: 'financial-transactions/transfer',
                        permission: ['financial.transactions.create'],
                    },
                ],
            },
            {
                name: 'Financial Reports',
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
