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
                name: 'Product & Policy Setup',
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
                ],
            },
            {
                name: 'Deposit, Share & Loan Accounts',
                icon: <i className="fa-solid fa-piggy-bank" />,
                permission: ['financial.accounts.view'],
                children_expanded: false,
                children: [
                    {
                        name: 'Savings Management',
                        icon: <i className="fa-solid fa-piggy-bank" />,
                        path: '/financial-accounts/category/SAVINGS',
                        match_path: 'financial-accounts/category/SAVINGS',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Share Management',
                        icon: <i className="fa-solid fa-chart-pie" />,
                        path: '/financial-accounts/category/SHARE',
                        match_path: 'financial-accounts/category/SHARE',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Fixed Deposit Management',
                        icon: <i className="fa-solid fa-lock" />,
                        path: '/financial-accounts/category/FIXED_DEPOSIT',
                        match_path: 'financial-accounts/category/FIXED_DEPOSIT',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Recurring Deposit Management',
                        icon: <i className="fa-solid fa-rotate" />,
                        path: '/financial-accounts/category/RECURRING_DEPOSIT',
                        match_path:
                            'financial-accounts/category/RECURRING_DEPOSIT',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Loan Management',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/financial-accounts/category/LOAN',
                        match_path: 'financial-accounts/category/LOAN',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'All Accounts',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/financial-accounts',
                        match_path: 'financial-accounts',
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
                name: 'Accounting Posting',
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
