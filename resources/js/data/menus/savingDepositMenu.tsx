import { SidebarItem } from '../../types';

export const savingDepositMenu: SidebarItem[] = [
    {
        name: 'Deposit Management',
        icon: <i className="fa-solid fa-piggy-bank" />,
        children_expanded: false,
        permission: ['account.view'],
        children: [
            // ===============================
            // Deposit Product Config
            // ===============================
            {
                name: 'Deposit Product Config',
                icon: <i className="fa-solid fa-cogs" />,
                children_expanded: false,
                permission: ['deposit.product.view'],
                children: [
                    {
                        name: 'Deposit Products',
                        icon: <i className="fa-solid fa-money-bill-wave" />,
                        path: '/deposit-products',
                        match_path: 'deposit-products',
                        permission: ['deposit.product.create'],
                    },
                    {
                        name: 'Product Interest Rules',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/deposit-interest-rules',
                        match_path: 'deposit-interest-rules',
                        permission: ['deposit.interest.view'],
                    },
                    {
                        name: 'Product Fees',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/deposit-fees',
                        match_path: 'deposit-fees',
                        permission: ['deposit.fees.view'],
                    },
                    {
                        name: 'Product Charges',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/deposit-charges',
                        match_path: 'deposit-charges',
                        permission: ['deposit.charges.view'],
                    },
                    {
                        name: 'Product Eligibility',
                        icon: <i className="fa-solid fa-user-check" />,
                        path: '/deposit-eligibility',
                        match_path: 'deposit-eligibility',
                        permission: ['deposit.eligibility.view'],
                    },
                ],
            },

            // ===============================
            // Deposit Accounts
            // ===============================
            {
                name: 'Saving Accounts',
                icon: <i className="fa-solid fa-wallet" />,
                path: '/saving-accounts',
                match_path: 'saving-account',
                permission: ['saving-account.view'],
            },

            // ===============================
            // Member Management
            // ===============================
            {
                name: 'Member Accounts',
                icon: <i className="fa-solid fa-users" />,
                path: '/member-list',
                match_path: 'member-list',
                permission: ['member.list.view'],
            },

            // ===============================
            // Recurring & Term Deposits
            // ===============================
            {
                name: 'RD Accounts',
                icon: <i className="fa-solid fa-wallet" />,
                path: '/rd-accounts',
                match_path: 'rd-accounts',
                permission: ['recurring.deposit.view'],
            },
            {
                name: 'TD Accounts',
                icon: <i className="fa-solid fa-wallet" />,
                path: '/td-accounts',
                match_path: 'td-accounts',
                permission: ['term.deposit.view'],
            },

            // ===============================
            // Deposit Servicing (merged interest posting)
            // ===============================
            {
                name: 'Deposit Servicing',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                children_expanded: false,
                permission: ['deposit.servicing.view'],
                children: [
                    {
                        name: 'Interest Posting',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/deposit-interest-penalty-posting',
                        match_path: 'deposit-interest-penalty-posting',
                        permission: [
                            'deposit.interest.posting',
                            'deposit.penalty.posting',
                        ],
                    },
                    {
                        name: 'Late Payment Penalty',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/late-payment-penalty',
                        match_path: 'late-payment-penalty',
                        permission: ['deposit.penalty.view'],
                    },
                    {
                        name: 'Fees and Charge Posting',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/transaction-fees',
                        match_path: 'transaction-fees',
                        permission: ['deposit.fees.view'],
                    },
                    {
                        name: 'Transfers',
                        icon: <i className="fa-solid fa-exchange-alt" />,
                        path: '/deposit-transfers',
                        match_path: 'deposit-transfers',
                        permission: ['deposit.transfer.view'],
                    },
                    {
                        name: 'Account Closures',
                        icon: <i className="fa-solid fa-door-closed" />,
                        path: '/deposit-closures',
                        match_path: 'deposit-closures',
                        permission: ['deposit.closure.view'],
                    },
                    {
                        name: 'Account Statements',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/deposit-statements',
                        match_path: 'deposit-statements',
                        permission: ['deposit.statement.view'],
                    },
                ],
            },

            // ===============================
            // Cheque Management
            // ===============================
            {
                name: 'Cheque Management',
                icon: <i className="fa-solid fa-file-invoice" />,
                children_expanded: false,
                permission: ['cheque.view'],
                children: [
                    {
                        name: 'Cheque Books',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/cheque-books',
                        match_path: 'cheque-books',
                        permission: ['cheque.book.view'],
                    },
                    {
                        name: 'Cheques',
                        icon: <i className="fa-solid fa-money-check" />,
                        path: '/cheques',
                        match_path: 'cheques',
                        permission: ['cheque.view'],
                    },
                ],
            },

            // ===============================
            // Deposit Reports
            // ===============================
            {
                name: 'Deposit Reports',
                icon: <i className="fa-solid fa-chart-line" />,
                children_expanded: false,
                permission: ['deposit.report.view'],
                children: [
                    {
                        name: 'Portfolio Summary',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/deposit-portfolio-summary',
                        match_path: 'deposit-portfolio-summary',
                        permission: ['deposit.report.view'],
                    },
                    {
                        name: 'Interest Reports',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/deposit-interest-reports',
                        match_path: 'deposit-interest-reports',
                        permission: ['deposit.interest.report.view'],
                    },
                    {
                        name: 'Transaction Reports',
                        icon: <i className="fa-solid fa-exchange-alt" />,
                        path: '/deposit-transaction-reports',
                        match_path: 'deposit-transaction-reports',
                        permission: ['deposit.transaction.report.view'],
                    },
                    {
                        name: 'Dividend Reports',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/deposit-dividend-reports',
                        match_path: 'deposit-dividend-reports',
                        permission: ['deposit.dividend.report.view'],
                    },
                    {
                        name: 'Cheque Reports',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/deposit-cheque-reports',
                        match_path: 'deposit-cheque-reports',
                        permission: ['cheque.report.view'],
                    },
                ],
            },
        ],
    },
];
