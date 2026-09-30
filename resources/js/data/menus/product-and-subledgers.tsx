import { SidebarItem } from '../../types';

export const productAndSubledgers: SidebarItem[] = [
    {
        name: 'Products & Subledgers',
        icon: <i className="fa-solid fa-layer-group" />,
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
                name: 'Subledger Accounts',
                icon: <i className="fa-solid fa-list" />,
                path: '/all-financial-accounts',
                match_path: 'all-financial-accounts',
                permission: ['financial.accounts.view'],
            },
            {
                name: 'Product Setup',
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
                        path: '/financial-product-account-mappings',
                        match_path: 'financial-product-account-mappings',
                        permission: ['financial.products.mappings.manage'],
                    },
                ],
            },

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
                    {
                        name: 'Loan Repayments',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/financial-transactions/loan-repayment/create',
                        match_path: 'financial-transactions/loan-repayment',
                        permission: ['financial.transactions.create'],
                    },
                    {
                        name: 'Fine Payments',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/financial-transactions/fine-payment/create',
                        match_path: 'financial-transactions/fine-payment',
                        permission: ['financial.transactions.create'],
                    },
                ],
            },
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
