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
                name: 'Fiscal Periods',
                icon: <i className="fa-solid fa-calendar-days" />,
                path: '/fiscal-periods',
                match_path: 'fiscal-periods',
                permission: ['settings.fiscal.view'],
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
                        path: '/accounting/voucher_entries/cash',
                        match_path:
                            'finance-and-accounting/voucher_entries/cash',
                        permission: ['accounting.voucher.cash.view'],
                        description:
                            'Record cash receipts or payments using voucher_entries.',
                    },
                    {
                        name: 'Bank Voucher',
                        icon: <i className="fa-solid fa-university" />,
                        path: '/accounting/voucher_entries/bank',
                        match_path:
                            'finance-and-accounting/voucher_entries/bank',
                        permission: ['accounting.voucher.bank.view'],
                        description:
                            'Record bank voucher_entries using voucher_entries.',
                    },
                    {
                        name: 'Journal Voucher',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/accounting/voucher_entries/journal',
                        match_path:
                            'finance-and-accounting/voucher_entries/journal',
                        permission: ['accounting.voucher.journal.view'],
                        description:
                            'Record general journal entries via voucher_entries.',
                    },
                    {
                        name: 'Payment Voucher',
                        icon: <i className="fa-solid fa-credit-card" />,
                        path: '/accounting/voucher_entries/payment',
                        match_path:
                            'finance-and-accounting/voucher_entries/payment',
                        permission: ['accounting.voucher.payment.view'],
                        description:
                            'Record payments to vendors or third parties.',
                    },
                ],
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-book-open-reader" />,
                path: '/accounting/voucher_entries',
                match_path: 'finance-and-accounting/voucher_entries',
                permission: ['accounting.voucher_entries.view'],
                description:
                    'View and manage all voucher_entries (cash, bank, journal, payment).',
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
                name: 'Ledger Statement',
                icon: <i className="fa-solid fa-scale-balanced" />,
                path: '/accounting/ledger-statement',
                match_path: 'finance-and-accounting/ledger-statement',
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
                            'Snapshot of assets, liabilities, and equity derived from posted voucher_entries.',
                    },
                    {
                        name: 'Shareholders Equity',
                        icon: <i className="fa-solid fa-user-group" />,
                        path: '/accounting/financial-reports/shareholders-equity',
                        match_path:
                            'finance-and-accounting/financial-reports/shareholders-equity',
                        permission: ['accounting.shareholders-equity.view'],
                        description:
                            'Track capital contributions, retained earnings, and equity movements from voucher_entries.',
                    },
                ],
            },
        ],
    },
];
