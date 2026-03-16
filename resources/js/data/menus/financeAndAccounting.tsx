import { SidebarItem } from '../../types';

export const financeAndAccountingMenu: SidebarItem[] = [
    {
        name: 'Finance & Accounting',
        icon: <i className="fa-solid fa-book-open" />,
        children_expanded: false,
        permission: ['accounting.view'],
        children: [
            {
                name: 'Fiscal Years',
                icon: <i className="fa-solid fa-calendar" />,
                path: '/fiscal-years',
                match_path: 'fiscal-years',
                permission: ['settings.fiscal_year.view'],
            },
            {
                name: 'Accounting Periods',
                icon: <i className="fa-solid fa-calendar-days" />,
                path: '/accounting-periods',
                match_path: 'accounting-periods',
                permission: ['settings.accounting_period.view'],
            },
            {
                name: 'Chart of Accounts',
                icon: <i className="fa-solid fa-list" />,
                path: '/accounting/chart-of-accounts',
                match_path: 'finance-and-accounting/chart-of-accounts',
                permission: ['accounting.coa.view'],
                description:
                    'Define and manage all accounts (Assets, Liabilities, Equity, Revenue, Expenses).',
            },
            {
                name: 'Voucher Entry',
                icon: <i className="fa-solid fa-receipt" />,
                children_expanded: false,
                permission: ['accounting.voucher.view'],
                children: [
                    {
                        name: 'Cash Voucher',
                        icon: <i className="fa-solid fa-money-bill-wave" />,
                        path: '/accounting/vouchers/cash',
                        match_path: 'finance-and-accounting/vouchers/cash',
                        permission: ['accounting.voucher.cash.view'],
                        description:
                            'Record cash receipts or payments using vouchers.',
                    },
                    {
                        name: 'Bank Voucher',
                        icon: <i className="fa-solid fa-university" />,
                        path: '/accounting/vouchers/bank',
                        match_path: 'finance-and-accounting/vouchers/bank',
                        permission: ['accounting.voucher.bank.view'],
                        description: 'Record bank transactions using vouchers.',
                    },
                    {
                        name: 'Journal Voucher',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/accounting/vouchers/journal',
                        match_path: 'finance-and-accounting/vouchers/journal',
                        permission: ['accounting.voucher.journal.view'],
                        description:
                            'Record general journal entries via vouchers.',
                    },
                    {
                        name: 'Payment Voucher',
                        icon: <i className="fa-solid fa-credit-card" />,
                        path: '/accounting/vouchers/payment',
                        match_path: 'finance-and-accounting/vouchers/payment',
                        permission: ['accounting.voucher.payment.view'],
                        description:
                            'Record payments to vendors or third parties.',
                    },
                ],
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-book-open-reader" />,
                path: '/accounting/vouchers',
                match_path: 'finance-and-accounting/vouchers',
                permission: ['accounting.vouchers.view'],
                description:
                    'View and manage all vouchers (cash, bank, journal, payment).',
            },
            {
                name: 'General Ledger',
                icon: <i className="fa-solid fa-book-open-reader" />,
                path: '/accounting/general-ledger',
                match_path: 'finance-and-accounting/general-ledger',
                permission: ['accounting.gl.view'],
                description:
                    'View account balances consolidated from posted vouchers.',
            },
            {
                name: 'Trial Balance',
                icon: <i className="fa-solid fa-scale-balanced" />,
                path: '/accounting/trial-balance',
                match_path: 'finance-and-accounting/trial-balance',
                permission: ['accounting.trial.view'],
                description:
                    'Verify total debits equal total credits; catch errors before reports.',
            },
            {
                name: 'Financial Reports',
                icon: <i className="fa-solid fa-file-invoice-dollar" />,
                children_expanded: false,
                permission: ['accounting.reports.view'],
                children: [
                    {
                        name: 'Profit & Loss',
                        icon: <i className="fa-solid fa-chart-line" />,
                        path: '/accounting/financial-reports/profit-loss',
                        match_path:
                            'finance-and-accounting/financial-reports/profit-loss',
                        permission: ['accounting.profit_loss.view'],
                        description:
                            'Summarizes revenues and expenses to calculate net profit/loss.',
                    },
                    {
                        name: 'Balance Sheet',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/accounting/financial-reports/balance-sheet',
                        match_path:
                            'finance-and-accounting/financial-reports/balance-sheet',
                        permission: ['accounting.balance_sheet.view'],
                        description:
                            'Snapshot of assets, liabilities, and equity derived from posted vouchers.',
                    },
                    {
                        name: 'Shareholders Equity',
                        icon: <i className="fa-solid fa-user-group" />,
                        path: '/accounting/financial-reports/shareholders-equity',
                        match_path:
                            'finance-and-accounting/financial-reports/shareholders-equity',
                        permission: ['accounting.shareholders-equity.view'],
                        description:
                            'Track capital contributions, retained earnings, and equity movements from vouchers.',
                    },
                ],
            },
        ],
    },
];
