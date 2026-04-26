import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';

export const generalAccountingMenu: SidebarItem[] = [
    {
        name: 'General Accounting',
        icon: <i className="fa-solid fa-book-open" />,
        children_expanded: false,
        permission: ['accounting.view'],
        children: [
            {
                name: 'Fiscal Years',
                icon: <i className="fa-solid fa-calendar" />,
                path: route('fiscal-years.index'),
                match_path: 'fiscal-years',
                permission: ['settings.fiscal_year.view'],
            },
            {
                name: 'Fiscal Periods',
                icon: <i className="fa-solid fa-calendar-days" />,
                path: route('fiscal-periods.index'),
                match_path: 'fiscal-periods',
                permission: ['settings.fiscal.view'],
            },
            {
                name: 'Chart of Accounts',
                icon: <i className="fa-solid fa-list" />,
                path: route('ledger-accounts.index'),
                match_path: 'ledger-accounts',
                permission: ['accounting.coa.view'],
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
                        match_path: 'general-accounting/voucher_entries/cash',
                        permission: ['accounting.voucher.cash.view'],
                    },
                    {
                        name: 'Bank Voucher',
                        icon: <i className="fa-solid fa-university" />,
                        path: '/accounting/voucher_entries/bank',
                        match_path: 'general-accounting/voucher_entries/bank',
                        permission: ['accounting.voucher.bank.view'],
                    },
                    {
                        name: 'Journal Voucher',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/accounting/voucher_entries/journal',
                        match_path:
                            'general-accounting/voucher_entries/journal',
                        permission: ['accounting.voucher.journal.view'],
                    },
                    {
                        name: 'Payment Voucher',
                        icon: <i className="fa-solid fa-credit-card" />,
                        path: '/accounting/voucher_entries/payment',
                        match_path:
                            'general-accounting/voucher_entries/payment',
                        permission: ['accounting.voucher.payment.view'],
                    },
                ],
            },
            {
                name: 'Voucher Entries',
                icon: <i className="fa-solid fa-book-open-reader" />,
                path: '/accounting/voucher_entries',
                match_path: 'general-accounting/voucher_entries',
                permission: ['accounting.voucher_entries.view'],
            },
            {
                name: 'Trial Balance',
                icon: <i className="fa-solid fa-scale-balanced" />,
                path: route('financial-reports.trial-balance'),
                match_path: 'accounting/trial-balance',
                permission: ['accounting.trial.view'],
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
                        path: route('financial-reports.profit-loss'),
                        match_path: 'accounting/financial-reports/profit-loss',
                        permission: ['accounting.profit_loss.view'],
                    },
                    {
                        name: 'Balance Sheet',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: route('financial-reports.balance-sheet'),
                        match_path:
                            'accounting/financial-reports/balance-sheet',
                        permission: ['accounting.balance_sheet.view'],
                    },
                    {
                        name: 'Shareholders Equity',
                        icon: <i className="fa-solid fa-user-group" />,
                        path: route('financial-reports.shareholders-equity'),
                        match_path:
                            'accounting/financial-reports/shareholders-equity',
                        permission: ['accounting.shareholders-equity.view'],
                    },
                    {
                        name: 'Cash Flow Statement',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: route('financial-reports.cash-flow'),
                        match_path: 'accounting/financial-reports/cash-flow',
                        permission: ['accounting.cash_flow.view'],
                    },
                ],
            },
        ],
    },
];
