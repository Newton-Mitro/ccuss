import { SidebarItem } from '../types';

export const sidebarMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-gauge-high" />,
        children: [
            {
                name: 'User Dashboard',
                icon: <i className="fa-solid fa-gauge-high" />,
                path: '/dashboard',
                match_path: 'dashboard',
            },
            {
                name: 'Admin Dashboard',
                icon: <i className="fa-solid fa-chart-pie" />,
                path: '/admin-dashboard',
                match_path: 'admin-dashboard',
            },
        ],
    },
    {
        name: 'Organizational Structure',
        icon: <i className="fa-solid fa-building-flag" />,
        children: [
            {
                name: 'Branches',
                icon: <i className="fa-solid fa-location-dot" />,
                path: '/branches',
                match_path: 'branches',
            },
        ],
    },
    {
        name: 'Customer Mgmt.',
        icon: <i className="fa-solid fa-users" />,
        children: [
            {
                name: 'Customers',
                icon: <i className="fa-solid fa-users-viewfinder" />,
                path: '/customers',
                match_path: 'customers',
            },
            {
                name: 'Addresses',
                icon: <i className="fa-solid fa-map-location-dot" />,
                path: '/addresses',
                match_path: 'addresses',
            },
            {
                name: 'Family Relations',
                icon: <i className="fa-solid fa-person-breastfeeding" />,
                path: '/family-relations',
                match_path: 'family-relations',
            },
            {
                name: 'Signatures',
                icon: <i className="fa-solid fa-signature" />,
                path: '/customer/signatures',
                match_path: 'signatures',
            },
            {
                name: 'Introducers',
                icon: <i className="fa-solid fa-people-arrows" />,
                path: '/introducers',
                match_path: 'introducers',
            },
            {
                name: 'Online Service Clients',
                icon: <i className="fa-solid fa-street-view" />,
                path: '/online-service-clients',
                match_path: 'online-service-clients',
            },
        ],
    },

    {
        name: 'Saving Deposit Mgmt.',
        icon: <i className="fa-solid fa-sack-dollar" />,
        children: [
            {
                name: 'Deposit Product Mgmt.',
                icon: <i className="fa-solid fa-box-archive" />,
                children: [
                    {
                        name: 'Deposit Products',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/deposit-policies',
                        match_path: 'deposit-policies',
                    },
                    {
                        name: 'Tenure Wise Interest Rates',
                        icon: <i className="fa-solid fa-calendar-days" />,
                        path: '/deposit-tenures',
                        match_path: 'deposit-tenures',
                    },
                    {
                        name: 'Opening Policies',
                        icon: <i className="fa-solid fa-file-circle-plus" />,
                        path: '/saving-ledger_accounts',
                        match_path: 'saving-ledger_accounts',
                    },
                    {
                        name: 'Transaction Policies',
                        icon: <i className="fa-solid fa-exchange-alt" />,
                        path: '/deposit-holders',
                        match_path: 'deposit-holders',
                    },
                    {
                        name: 'Interest Policies',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/deposit-nominees',
                        match_path: 'deposit-nominees',
                    },
                    {
                        name: 'Closing Policies',
                        icon: <i className="fa-solid fa-file-circle-check" />,
                        path: '/deposit-schedules',
                        match_path: 'deposit-schedules',
                    },
                    {
                        name: 'Fine Policies',
                        icon: <i className="fa-solid fa-gavel" />,
                        path: '/deposit-fines',
                        match_path: 'deposit-fines',
                    },
                    {
                        name: 'Product Ledger Mappings',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/deposit-ledger-mappings',
                        match_path: 'deposit-ledger-mappings',
                    },
                ],
            },
            {
                name: 'Deposit Account Mgmt.',
                icon: <i className="fa-solid fa-landmark" />,
                children: [
                    {
                        name: 'Deposit Accounts',
                        icon: <i className="fa-solid fa-piggy-bank" />,
                        path: '/deposit-ledger_accounts',
                        match_path: 'deposit-ledger_accounts',
                    },
                    {
                        name: 'Deposit Schedules',
                        icon: <i className="fa-solid fa-calendar-alt" />,
                        path: '/deposit-schedules',
                        match_path: 'deposit-schedules',
                    },
                    {
                        name: 'Customer Cheque Books',
                        icon: <i className="fa-solid fa-book-open" />,
                        path: '/customer-cheque-books',
                        match_path: 'customer-cheque-books',
                    },
                    {
                        name: 'Passbook Printing',
                        icon: <i className="fa-solid fa-print" />,
                        path: '/passbook-printing',
                        match_path: 'passbook-printing',
                    },
                ],
            },
        ],
    },
    {
        name: 'Membership Mgmt.',
        icon: <i className="fa-solid fa-id-card" />,
        children: [
            {
                name: 'Member List',
                icon: <i className="fa-solid fa-id-card" />,
                path: '/member-list',
                match_path: 'member-list',
            },
        ],
    },
    {
        name: 'Share Capital Mgmt.',
        icon: <i className="fa-solid fa-coins" />,
        children: [
            {
                name: 'Share Accounts',
                icon: <i className="fa-solid fa-layer-group" />,
                match_path: '/share-capital/ledger_accounts',
            },
            {
                name: 'Share Ledger',
                icon: <i className="fa-solid fa-book" />,
                match_path: '/share-capital/ledger',
            },
            {
                name: 'Dividends',
                icon: <i className="fa-solid fa-percent" />,
                path: '/share-dividends',
                match_path: 'share-dividends',
            },
        ],
    },
    {
        name: 'Loan Mgmt.',
        icon: <i className="fa-solid fa-hand-holding-dollar" />,
        children: [
            {
                name: 'Loan Product Mgmt.',
                icon: <i className="fa-solid fa-box-archive" />,
                children: [
                    {
                        name: 'Loan Products',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/loan-products',
                        match_path: 'loan-products',
                    },
                    {
                        name: 'Interest Policies',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/loan-interest-policies',
                        match_path: 'loan-interest-policies',
                    },
                    {
                        name: 'Fine Policies',
                        icon: <i className="fa-solid fa-gavel" />,
                        path: '/loan-fine-policies',
                        match_path: 'loan-fine-policies',
                    },
                    {
                        name: 'Approval Policies',
                        icon: <i className="fa-solid fa-check-circle" />,
                        path: '/loan-approval-policies',
                        match_path: 'loan-approval-policies',
                    },
                    {
                        name: 'Charge Policies',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/loan-charge-policies',
                        match_path: 'loan-charge-policies',
                    },
                    {
                        name: 'Repayment Policies',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/loan-repayment-policies',
                        match_path: 'loan-repayment-policies',
                    },
                ],
            },
            {
                name: 'Loan Account Mgmt.',
                icon: <i className="fa-solid fa-landmark" />,
                children: [
                    {
                        name: 'Loan Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/loan-ledger_accounts',
                        match_path: 'loan-ledger_accounts',
                    },
                    {
                        name: 'Loan Schedules',
                        icon: <i className="fa-solid fa-calendar-alt" />,
                        path: '/loan-schedules',
                        match_path: 'loan-schedules',
                    },
                    {
                        name: 'Loan Collaterals',
                        icon: <i className="fa-solid fa-building-columns" />,
                        path: '/loan-collaterals',
                        match_path: 'loan-collaterals',
                    },
                ],
            },
            {
                name: 'Loan Application Mgmt.',
                icon: <i className="fa-solid fa-file-invoice" />,
                children: [
                    {
                        name: 'Loan Applications',
                        icon: <i className="fa-solid fa-file-signature" />,
                        path: '/loan-applications',
                        match_path: 'loan-applications',
                    },
                    {
                        name: 'Surety Requests',
                        icon: <i className="fa-solid fa-handshake" />,
                        path: '/surety-requests',
                        match_path: 'surety-requests',
                    },
                    {
                        name: 'Collaterals',
                        icon: <i className="fa-solid fa-building-columns" />,
                        path: '/application-collaterals',
                        match_path: 'application-collaterals',
                    },
                ],
            },
        ],
    },
    {
        name: 'Cash & Treasury Mgmt.',
        icon: <i className="fa-solid fa-cash-register" />,
        children: [
            {
                name: 'Cash at Hand',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                children: [
                    {
                        name: 'Cash In Hand',
                        icon: <i className="fa-solid fa-hand-holding-dollar" />,
                        path: '/cash-in-hand',
                        match_path: 'cash-in-hand',
                    },
                    {
                        name: 'Cash Receipts',
                        icon: <i className="fa-solid fa-receipt" />,
                        path: '/cash-receipts',
                        match_path: 'cash-receipts',
                    },
                    {
                        name: 'Cash Payments',
                        icon: <i className="fa-solid fa-money-bill-wave" />,
                        path: '/cash-payments',
                        match_path: 'cash-payments',
                    },
                ],
            },
            {
                name: 'Petty Cash',
                icon: <i className="fa-solid fa-coins" />,
                children: [
                    {
                        name: 'Cash Book',
                        icon: <i className="fa-solid fa-book" />,
                        path: '/cash-book',
                        match_path: 'cash-book',
                    },
                    {
                        name: 'Petty Cash Vouchers',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/petty-cash-vouchers',
                        match_path: 'petty-cash-vouchers',
                    },
                ],
            },
            {
                name: 'Cash at Bank',
                icon: <i className="fa-solid fa-piggy-bank" />,
                children: [
                    {
                        name: 'Bank Accounts',
                        icon: <i className="fa-solid fa-university" />,
                        path: '/bank-ledger_accounts',
                        match_path: 'bank-ledger_accounts',
                    },
                    {
                        name: 'Bank Cheque Books',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/cheque-book',
                        match_path: 'cheque-book',
                    },
                    {
                        name: 'Bank Reconciliation',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/bank-reconciliation',
                        match_path: 'bank-reconciliation',
                    },
                    {
                        name: 'Fund Transfers',
                        icon: (
                            <i className="fa-solid fa-arrow-right-arrow-left" />
                        ),
                        path: '/fund-transfers',
                        match_path: 'fund-transfers',
                    },
                ],
            },
        ],
    },
    {
        name: 'General Accounting',
        icon: <i className="fa-solid fa-calculator" />,
        children: [
            {
                name: 'Fiscal Years',
                icon: <i className="fa-solid fa-calendar-check" />,
                path: '/fiscal-years',
                match_path: 'fiscal-years',
            },
            {
                name: 'Fiscal Periods',
                icon: <i className="fa-solid fa-calendar-day" />,
                path: '/fiscal-periods',
                match_path: 'fiscal-periods',
            },
            {
                name: 'Ledger Accounts',
                icon: <i className="fa-solid fa-book-open" />,
                path: '/ledger_accounts',
                match_path: 'ledger_accounts',
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-list-check" />,
                path: '/vouchers',
                match_path: 'vouchers',
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-simple" />,
                children: [
                    {
                        name: 'Trial Balance',
                        icon: <i className="fa-solid fa-balance-scale" />,
                        path: '/reports/trial-balance',
                        match_path: 'trial-balance',
                    },
                    {
                        name: 'Income Statement',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/reports/profit-loss',
                        match_path: 'profit-loss',
                    },
                    {
                        name: 'Balance Sheet',
                        icon: <i className="fa-solid fa-landmark" />,
                        path: '/reports/balance-sheet',
                        match_path: 'balance-sheet',
                    },
                    {
                        name: 'Cash Flow Statement',
                        icon: <i className="fa-solid fa-water" />,
                        path: '/reports/cash-flow',
                        match_path: 'cash-flow',
                    },
                    {
                        name: 'Shareholders Equity',
                        icon: <i className="fa-solid fa-users" />,
                        path: '/reports/shareholders-equity',
                        match_path: 'shareholders-equity',
                    },
                ],
            },
        ],
    },
    {
        name: 'Daily Transactions',
        icon: <i className="fa-solid fa-cash-register" />,
        children: [
            {
                name: 'Daily Collections',
                icon: <i className="fa-solid fa-hand-holding-dollar" />,
                path: '/daily-collections',
                match_path: 'daily-collections',
            },
            {
                name: 'Daily Payments',
                icon: <i className="fa-solid fa-money-bill-transfer" />,
                path: '/daily-payments',
                match_path: 'daily-payments',
            },
            {
                name: 'Incoming Transfers',
                icon: <i className="fa-solid fa-right-to-bracket" />,
                path: '/incoming-transfers',
                match_path: 'incoming-transfers',
            },
            {
                name: 'Outgoing Transfers',
                icon: <i className="fa-solid fa-right-from-bracket" />,
                path: '/outgoing-transfers',
                match_path: 'outgoing-transfers',
            },
        ],
    },
    {
        name: 'Procurement Mgmt.',
        icon: <i className="fa-solid fa-sack-dollar" />,
        children: [
            {
                name: 'Purchase Orders',
                icon: <i className="fa-solid fa-file-invoice" />,
                path: '/procurement/purchase-orders',
                match_path: 'purchase-orders',
            },
            {
                name: 'Suppliers',
                icon: <i className="fa-solid fa-truck" />,
                path: '/procurement/suppliers',
                match_path: 'suppliers',
            },
            {
                name: 'Purchase Requisitions',
                icon: <i className="fa-solid fa-list-check" />,
                path: '/procurement/requisitions',
                match_path: 'requisitions',
            },
            {
                name: 'Procurement Reports',
                icon: <i className="fa-solid fa-chart-line" />,
                path: '/procurement/reports',
                match_path: 'procurement-reports',
            },
        ],
    },
    {
        name: 'Fixed Asset Mgmt.',
        icon: <i className="fa-solid fa-boxes-stacked" />,
        children: [
            {
                name: 'Assets',
                icon: <i className="fa-solid fa-box" />,
                path: '/assets',
                match_path: 'assets',
            },
            {
                name: 'Asset Assignment & Tracking',
                icon: <i className="fa-solid fa-location-dot" />,
                path: '/assets/assignment-tracking',
                match_path: 'asset-assignment',
            },
            {
                name: 'Asset Depreciation',
                icon: <i className="fa-solid fa-percent" />,
                path: '/assets/depreciation',
                match_path: 'asset-depreciation',
            },
            {
                name: 'Asset Reports',
                icon: <i className="fa-solid fa-chart-pie" />,
                path: '/assets/reports',
                match_path: 'asset-reports',
            },
        ],
    },
    {
        name: 'Human Resource Mgmt.',
        icon: <i className="fa-solid fa-users-between-lines" />,
        children: [
            {
                name: 'Employee Mgmt.',
                icon: <i className="fa-solid fa-user-group" />,
                children: [
                    {
                        name: 'Employees',
                        icon: <i className="fa-solid fa-user" />,
                        path: '/employees',
                        match_path: 'employees',
                    },
                    {
                        name: 'Recruitment',
                        icon: <i className="fa-solid fa-user-plus" />,
                        path: '/recruitment',
                        match_path: 'recruitment',
                    },
                    {
                        name: 'Performance',
                        icon: <i className="fa-solid fa-chart-line" />,
                        path: '/performance',
                        match_path: 'performance',
                    },
                    {
                        name: 'Training',
                        icon: <i className="fa-solid fa-chalkboard-teacher" />,
                        path: '/training',
                        match_path: 'training',
                    },
                ],
            },
            {
                name: 'Time Mgmt.',
                icon: <i className="fa-solid fa-clock" />,
                children: [
                    {
                        name: 'Leaves',
                        icon: <i className="fa-solid fa-calendar-minus" />,
                        path: '/leaves',
                        match_path: 'leaves',
                    },
                    {
                        name: 'Attendances',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/attendances',
                        match_path: 'attendances',
                    },
                    {
                        name: 'Holidays',
                        icon: <i className="fa-solid fa-tree" />,
                        path: '/holidays',
                        match_path: 'holidays',
                    },
                    {
                        name: 'Shifts',
                        icon: <i className="fa-solid fa-hourglass-half" />,
                        path: '/shifts',
                        match_path: 'shifts',
                    },
                    {
                        name: 'Overtime',
                        icon: <i className="fa-solid fa-stopwatch" />,
                        path: '/overtimes',
                        match_path: 'overtimes',
                    },
                    {
                        name: 'Deductions',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/deductions',
                        match_path: 'deductions',
                    },
                ],
            },
            {
                name: 'Payroll',
                icon: <i className="fa-solid fa-money-bill-wave" />,
                children: [
                    {
                        name: 'Payslips',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/payslips',
                        match_path: 'payslips',
                    },
                    {
                        name: 'Payroll Items',
                        icon: <i className="fa-solid fa-list-check" />,
                        path: '/payroll-items',
                        match_path: 'payroll-items',
                    },
                    {
                        name: 'Payroll Templates',
                        icon: <i className="fa-solid fa-file-circle-plus" />,
                        path: '/payroll-templates',
                        match_path: 'payroll-templates',
                    },
                    {
                        name: 'Payroll Settings',
                        icon: <i className="fa-solid fa-gear" />,
                        path: '/payroll-settings',
                        match_path: 'payroll-settings',
                    },
                    {
                        name: 'Payroll Reports',
                        icon: <i className="fa-solid fa-chart-pie" />,
                        path: '/payroll-reports',
                        match_path: 'payroll-reports',
                    },
                ],
            },
        ],
    },

    {
        name: 'User, Role & Permissions',
        icon: <i className="fa-solid fa-user-gear" />,
        children: [
            {
                name: 'Roles',
                icon: <i className="fa-solid fa-user-shield" />,
                path: '/users/roles',
                match_path: 'roles',
            },
            {
                name: 'Assign Role Permissions',
                icon: <i className="fa-solid fa-user-lock" />,
                path: '/users/role-permissions',
                match_path: 'role-permissions',
            },
            {
                name: 'Users',
                icon: <i className="fa-solid fa-user" />,
                path: '/users',
                match_path: 'users',
            },
            {
                name: 'Assign User Roles',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/user-roles',
                match_path: 'user-roles',
            },
            {
                name: 'Assign User Permissions',
                icon: <i className="fa-solid fa-key" />,
                path: '/users/user-permissions',
                match_path: 'user-permissions',
            },
        ],
    },
    {
        name: 'Alerts & Notifications',
        icon: <i className="fa-solid fa-bell" />, // Main icon for the menu
        children: [
            {
                name: 'System Alerts',
                icon: <i className="fa-solid fa-exclamation-triangle" />,
                path: '/system-alerts',
                match_path: 'system-alerts',
            },
            {
                name: 'User Notifications',
                icon: <i className="fa-solid fa-envelope" />,
                path: '/user-notifications',
                match_path: 'user-notifications',
            },
            {
                name: 'Message Center',
                icon: <i className="fa-solid fa-comments" />,
                path: '/message-center',
                match_path: 'message-center',
            },
        ],
    },
    {
        name: 'SMS & Email Queues',
        icon: <i className="fa-solid fa-envelope-circle-check" />,
        children: [
            {
                name: 'SMS Queue',
                icon: <i className="fa-solid fa-sms" />,
                children: [
                    {
                        name: 'Transaction SMS',
                        icon: <i className="fa-solid fa-money-bill-wave" />,
                        path: '/sms-queue/transactions',
                        match_path: 'sms-queue/transactions',
                    },
                    {
                        name: 'Account Statement SMS',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/sms-queue/account-statements',
                        match_path: 'sms-queue/account-statements',
                    },
                ],
            },
            {
                name: 'Email Queue',
                icon: <i className="fa-solid fa-envelope" />,
                children: [
                    {
                        name: 'Transaction Emails',
                        icon: <i className="fa-solid fa-money-bill" />,
                        path: '/email-queue/transactions',
                        match_path: 'email-queue/transactions',
                    },
                    {
                        name: 'Account Statement Emails',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/email-queue/account-statements',
                        match_path: 'email-queue/account-statements',
                    },
                ],
            },
        ],
    },
    {
        name: 'Audit Trails',
        icon: <i className="fa-solid fa-clipboard-list" />,
        children: [
            {
                name: 'Audit Logs',
                icon: <i className="fa-solid fa-file-alt" />,
                path: '/audit-logs',
                match_path: 'audit-logs',
            },
            {
                name: 'Activity Logs',
                icon: <i className="fa-solid fa-list-check" />,
                path: '/activity-logs',
                match_path: 'activity-logs',
            },
            {
                name: 'Visit Logs',
                icon: <i className="fa-solid fa-map-marker-alt" />,
                path: '/visit-logs',
                match_path: 'visit-logs',
            },
        ],
    },
    {
        name: 'Settings',
        icon: <i className="fa-solid fa-gear" />,
        path: '/settings/profile',
        match_path: 'settings',
    },
];
