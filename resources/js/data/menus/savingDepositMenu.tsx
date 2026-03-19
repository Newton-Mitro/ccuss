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
                name: 'Deposit Accounts',
                icon: <i className="fa-solid fa-wallet" />,
                children_expanded: false,
                permission: ['deposit.account.view'],
                children: [
                    {
                        name: 'Deposit Accounts',
                        icon: <i className="fa-solid fa-piggy-bank" />,
                        path: '/deposit-accounts',
                        match_path: 'deposit-accounts',
                        permission: ['deposit.account.view'],
                    },
                    {
                        name: 'Account Nominees',
                        icon: <i className="fa-solid fa-user-tag" />,
                        path: '/account-nominees',
                        match_path: 'account-nominees',
                        permission: ['deposit.nominee.view'],
                    },
                    {
                        name: 'Account Holders',
                        icon: <i className="fa-solid fa-users" />,
                        path: '/account-holders',
                        match_path: 'account-holders',
                        permission: ['deposit.holder.view'],
                    },
                ],
            },

            // ===============================
            // Member Management
            // ===============================
            {
                name: 'Member Management',
                icon: <i className="fa-solid fa-users" />,
                children_expanded: false,
                permission: ['member.view'],
                children: [
                    {
                        name: 'Member Registration',
                        icon: <i className="fa-solid fa-user-plus" />,
                        path: '/member-registration',
                        match_path: 'member-registration',
                        permission: ['member.registration.create'],
                    },
                    {
                        name: 'Member List',
                        icon: <i className="fa-solid fa-list" />,
                        path: '/member-list',
                        match_path: 'member-list',
                        permission: ['member.list.view'],
                    },
                    {
                        name: 'Dividends',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/member-dividends',
                        match_path: 'member-dividends',
                        permission: ['member.dividend.view'],
                    },
                ],
            },

            // ===============================
            // Recurring & Term Deposits
            // ===============================
            {
                name: 'Recurring Deposit',
                icon: <i className="fa-solid fa-calendar-plus" />,
                children_expanded: false,
                permission: ['recurring.deposit.view'],
                children: [
                    {
                        name: 'RD Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/rd-accounts',
                        match_path: 'rd-accounts',
                        permission: ['recurring.deposit.view'],
                    },
                ],
            },
            {
                name: 'Term Deposit',
                icon: <i className="fa-solid fa-hourglass-end" />,
                children_expanded: false,
                permission: ['term.deposit.view'],
                children: [
                    {
                        name: 'TD Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/td-accounts',
                        match_path: 'td-accounts',
                        permission: ['term.deposit.view'],
                    },
                ],
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
                        name: 'Active Deposit Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/deposit-active-accounts',
                        match_path: 'deposit-active-accounts',
                        permission: ['deposit.account.view'],
                    },
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
                        name: 'Deposits / Withdrawals',
                        icon: <i className="fa-solid fa-arrow-up-right-dots" />,
                        path: '/deposit-transactions',
                        match_path: 'deposit-transactions',
                        permission: ['deposit.transaction.view'],
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
                    {
                        name: 'Cheque Deposits',
                        icon: <i className="fa-solid fa-arrow-down" />,
                        path: '/cheque-deposits',
                        match_path: 'cheque-deposits',
                        permission: ['cheque.deposit.view'],
                    },
                    {
                        name: 'Cheque Withdrawals',
                        icon: <i className="fa-solid fa-arrow-up" />,
                        path: '/cheque-withdrawals',
                        match_path: 'cheque-withdrawals',
                        permission: ['cheque.withdrawal.view'],
                    },
                    {
                        name: 'Cheque Clearings',
                        icon: <i className="fa-solid fa-check-circle" />,
                        path: '/cheque-clearings',
                        match_path: 'cheque-clearings',
                        permission: ['cheque.clearing.view'],
                    },
                    {
                        name: 'Cheque Bounce',
                        icon: <i className="fa-solid fa-ban" />,
                        path: '/cheque-bounce',
                        match_path: 'cheque-bounce',
                        permission: ['cheque.bounce.view'],
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
