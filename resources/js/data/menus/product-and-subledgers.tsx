import { SidebarItem } from '../../types';

export const financialServices: SidebarItem[] = [
    {
        name: 'Financial Services',
        icon: <i className="fa-solid fa-building-columns" />,
        permission: ['financial.view'],
        children_expanded: false,

        children: [
            // ─────────────────────────────────────────────
            // Overview & Accounts
            // ─────────────────────────────────────────────
            {
                name: 'Overview',
                icon: <i className="fa-solid fa-gauge-high" />,
                path: '/financial-services',
                match_path: 'financial-services',
                permission: ['financial.view'],
            },
            {
                name: 'Subledger Accounts',
                icon: <i className="fa-solid fa-list" />,
                path: '/all-financial-accounts',
                match_path: 'all-financial-accounts',
                permission: ['financial.accounts.view'],
            },

            // ─────────────────────────────────────────────
            // Products & Configuration
            // ─────────────────────────────────────────────
            {
                name: 'Products & Configuration',
                icon: <i className="fa-solid fa-layer-group" />,
                permission: ['financial.products.view'],
                children_expanded: false,

                children: [
                    {
                        name: 'Deposit Products',
                        icon: <i className="fa-solid fa-piggy-bank" />,
                        permission: ['financial.products.view'],
                        children_expanded: false,

                        children: [
                            {
                                name: 'Product Catalog',
                                icon: <i className="fa-solid fa-list" />,
                                path: '/deposit-products',
                                match_path: 'deposit-products',
                                permission: ['financial.products.view'],
                            },
                            {
                                name: 'Policies',
                                icon: <i className="fa-solid fa-file-shield" />,
                                path: '/deposit-product-policies',
                                match_path: 'deposit-product-policies',
                                permission: ['financial.policies.view'],
                            },
                            {
                                name: 'Account Mappings',
                                icon: (
                                    <i className="fa-solid fa-diagram-project" />
                                ),
                                path: '/deposit-product-account-mappings',
                                match_path: 'deposit-product-account-mappings',
                                permission: [
                                    'financial.products.mappings.manage',
                                ],
                            },
                        ],
                    },

                    {
                        name: 'Loan Products',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        permission: ['financial.products.view'],
                        children_expanded: false,

                        children: [
                            {
                                name: 'Product Catalog',
                                icon: <i className="fa-solid fa-list" />,
                                path: '/loan-products',
                                match_path: 'loan-products',
                                permission: ['financial.products.view'],
                            },
                            {
                                name: 'Policies',
                                icon: <i className="fa-solid fa-file-shield" />,
                                path: '/loan-product-policies',
                                match_path: 'loan-product-policies',
                                permission: ['financial.policies.view'],
                            },
                            {
                                name: 'Account Mappings',
                                icon: (
                                    <i className="fa-solid fa-diagram-project" />
                                ),
                                path: '/loan-product-account-mappings',
                                match_path: 'loan-product-account-mappings',
                                permission: [
                                    'financial.products.mappings.manage',
                                ],
                            },
                        ],
                    },
                ],
            },

            // ─────────────────────────────────────────────
            // Deposits & Member Shares
            // ─────────────────────────────────────────────
            {
                name: "Deposits & Member's Share",
                icon: <i className="fa-solid fa-piggy-bank" />,
                permission: ['financial.accounts.view'],
                children_expanded: false,

                children: [
                    {
                        name: 'Savings Accounts',
                        icon: <i className="fa-solid fa-piggy-bank" />,
                        path: '/financial-accounts/savings',
                        match_path: 'financial-accounts/savings',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Shares & Memberships',
                        icon: <i className="fa-solid fa-chart-pie" />,
                        path: '/financial-accounts/share',
                        match_path: 'financial-accounts/share',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Fixed Deposits',
                        icon: <i className="fa-solid fa-lock" />,
                        path: '/financial-accounts/fixed',
                        match_path: 'financial-accounts/fixed',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Recurring Deposits',
                        icon: <i className="fa-solid fa-rotate" />,
                        path: '/financial-accounts/recurring',
                        match_path: 'financial-accounts/recurring',
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

            // ─────────────────────────────────────────────
            // Credit & Recovery
            // ─────────────────────────────────────────────
            {
                name: 'Credit & Recovery',
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
                        path: '/loan-accounts',
                        match_path: 'loan-accounts',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Disbursement Entry',
                        icon: <i className="fa-solid fa-arrow-up-right-dots" />,
                        path: '/financial-transactions/loan-disbursement/create',
                        match_path: 'financial-transactions/loan-disbursement',
                        permission: ['financial.transactions.create'],
                    },
                ],
            },

            // ─────────────────────────────────────────────
            // Transaction Desk
            // ─────────────────────────────────────────────
            {
                name: 'Transaction Desk',
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

            // ─────────────────────────────────────────────
            // Controls & Returns
            // ─────────────────────────────────────────────
            {
                name: 'Controls & Returns',
                icon: <i className="fa-solid fa-shield-halved" />,
                permission: ['financial.accounts.view'],
                children_expanded: false,

                children: [
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
                    {
                        name: 'Interest Provisions',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/interest-provisions',
                        match_path: 'interest-provisions',
                        permission: ['financial.accounts.view'],
                    },
                    {
                        name: 'Share Dividends',
                        icon: <i className="fa-solid fa-chart-line" />,
                        path: '/dividends',
                        match_path: 'dividends',
                        permission: ['financial.accounts.view'],
                    },
                ],
            },

            // ─────────────────────────────────────────────
            // Reports
            // ─────────────────────────────────────────────
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
