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
                icon: <i className="fa-solid fa-chart-pie"></i>,
                path: '/admin-dashboard',
                match_path: 'admin-dashboard',
            },
        ],
    },
    {
        name: 'Media and Files',
        icon: <i className="fa-solid fa-photo-film"></i>,
        path: '/auth/media',
        match_path: 'media',
    },
    {
        name: 'Organizational Structure',
        icon: <i className="fa-solid fa-building-flag"></i>,
        children: [
            {
                name: 'Branches',
                icon: <i className="fa-solid fa-location-dot" />,
                path: '/auth/branches',
                match_path: 'branches',
            },
            {
                name: 'Fiscal Years',
                icon: <i className="fa-solid fa-map-location-dot" />,
                path: '/auth/fiscal-years',
                match_path: 'fiscal-years',
            },
            {
                name: 'Fiscal Periods',
                icon: <i className="fa-solid fa-person-breastfeeding" />,
                path: '/auth/fiscal-periods',
                match_path: 'fiscal-periods',
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
                path: '/auth/customers',
                match_path: 'customers',
            },
            {
                name: 'Customer Addresses',
                icon: <i className="fa-solid fa-map-location-dot" />,
                path: '/auth/addresses',
                match_path: 'addresses',
            },
            {
                name: 'Customer Family Relations',
                icon: <i className="fa-solid fa-person-breastfeeding" />,
                path: '/auth/family-relations',
                match_path: 'family-relations',
            },
            {
                name: 'Customer Signatures',
                icon: <i className="fa-solid fa-signature" />,
                path: '/auth/signatures',
                match_path: 'signatures',
            },
            {
                name: 'Customer Introducers',
                icon: <i className="fa-solid fa-people-arrows"></i>,
                path: '/auth/introducers',
                match_path: 'introducers',
            },
            {
                name: 'Customer KYC Verification',
                icon: <i className="fa-solid fa-user-check"></i>,
                path: '/auth/kyc-verification',
                match_path: 'kyc-verification',
            },
            {
                name: 'Online Service Users',
                icon: <i className="fa-solid fa-street-view" />,
                path: '/auth/online-service-users',
                match_path: 'online-service-users',
            },
        ],
    },
    {
        name: 'General Accounting',
        icon: <i className="fa-solid fa-cash-register" />,
        children: [
            {
                name: 'Ledgers',
                icon: <i className="fa-solid fa-list-check" />,
                path: '/auth/gl_accounts',
                match_path: 'gl_accounts',
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-coins" />,
                path: '/auth/vouchers/list',
                match_path: 'vouchers/list',
            },
            {
                name: 'Voucher Entrys',
                icon: <i className="fa-solid fa-cash-register" />,
                children: [
                    {
                        name: 'Debit Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/auth/vouchers/debit/create',
                        match_path: 'debit/create',
                    },
                    {
                        name: 'Credit Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/auth/vouchers/credit/create',
                        match_path: 'credit/create',
                    },
                    {
                        name: 'Journal Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/auth/vouchers/journal/create',
                        match_path: 'journal/create',
                    },
                    {
                        name: 'Contra Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/auth/vouchers/contra/create',
                        match_path: 'contra/create',
                    },
                ],
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-simple" />,
                children: [
                    {
                        name: 'Trial Balance',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/reports/trial-balance',
                        match_path: 'trial-balance',
                    },
                    {
                        name: 'Income Statement',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/reports/income-statement',
                        match_path: 'income-statement',
                    },
                    {
                        name: 'Balance Sheet',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/reports/balance-sheet',
                        match_path: 'balance-sheet',
                    },
                    {
                        name: 'Cash Flow Statement',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/reports/cash-flow-statement',
                        match_path: 'cash-flow-statement',
                    },
                    {
                        name: 'Statement of Shareholders Equity',
                        icon: <i className="fa-solid fa-scale-balanced" />,
                        path: '/reports/statement-of-shareholders-equity',
                        match_path: 'statement-of-shareholders-equity',
                    },
                ],
            },
        ],
    },
    {
        name: 'Deposit Product Mgmt.',
        icon: <i className="fa-solid fa-sprout" />,
        children: [
            {
                name: 'Deposit Products',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Tenure Wise Interest Rates',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Opening Policies',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/saving-accounts',
                match_path: 'saving-accounts',
            },
            {
                name: 'Transaction Policies',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-holders',
                match_path: 'deposit-holders',
            },
            {
                name: 'Interest Policies',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-nominees',
                match_path: 'deposit-nominees',
            },
            {
                name: 'Closing Policies',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-schedules',
                match_path: 'deposit-schedules',
            },
            {
                name: 'Fine Policies',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-schedules',
                match_path: 'deposit-schedules',
            },
            {
                name: 'Product Ldeger Mappings',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-schedules',
                match_path: 'deposit-schedules',
            },
        ],
    },
    {
        name: 'Deposit Account Mgmt.',
        icon: <i className="fa-solid fa-sprout" />,
        children: [
            {
                name: 'Deposit Accounts',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Deposit Schedules',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Customer Cheque Books',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Passbook Printing',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
        ],
    },
    {
        name: 'Loan Product Mgmt.',
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        children: [
            {
                name: 'Loan Products',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Interest Policies',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Fine Policies',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/saving-accounts',
                match_path: 'saving-accounts',
            },
            {
                name: 'Approval Policies',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-holders',
                match_path: 'deposit-holders',
            },
            {
                name: 'Charge Policies',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-nominees',
                match_path: 'deposit-nominees',
            },
            {
                name: 'Repayment Policies',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-schedules',
                match_path: 'deposit-schedules',
            },
        ],
    },
    {
        name: 'Loan Account Mgmt.',
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        children: [
            {
                name: 'Loan Accounts',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Loan Schedules',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Loan Collaters',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/saving-accounts',
                match_path: 'saving-accounts',
            },
        ],
    },
    {
        name: 'Loan Application Mgmt.',
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        children: [
            {
                name: 'Loan Applications',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Surity Requests',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Collaterals',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/saving-accounts',
                match_path: 'saving-accounts',
            },
        ],
    },
    {
        name: 'Cash & Treasury Mgmt.',
        icon: <i className="fa-solid fa-cash-register"></i>,
        children: [
            {
                name: 'Cash at Hand',
                icon: <i className="fa-solid fa-hand-holding-dollar"></i>,
                path: '/employees',
                match_path: 'employees',
            },
            {
                name: 'Petty Cash',
                icon: <i className="fa-solid fa-coins"></i>,
                path: '/attendances',
                match_path: 'attendances',
            },
            {
                name: 'Cash at Bank',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/leaves',
                match_path: 'leaves',
            },
            {
                name: 'Bank Cheque Books',
                icon: <i className="fa-solid fa-money-check-dollar"></i>,
                path: '/cheque-book',
                match_path: 'cheque-book',
            },
        ],
    },
    {
        name: 'HR Mgmt.',
        icon: <i className="fa-solid fa-user-tie" />,
        children: [
            {
                name: 'Employees',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/employees',
                match_path: 'employees',
            },
            {
                name: 'Leaves',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/leaves',
                match_path: 'leaves',
            },
            {
                name: 'Attendances',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/attendances',
                match_path: 'attendances',
            },
            {
                name: 'Holidays',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/holidays',
                match_path: 'holidays',
            },
            {
                name: 'Shifts',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/shifts',
                match_path: 'shifts',
            },
            {
                name: 'Overtime',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/overtimes',
                match_path: 'overtimes',
            },
            {
                name: 'Deductions',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/deductions',
                match_path: 'deductions',
            },
            {
                name: 'Payslips',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/payslips',
                match_path: 'payslips',
            },
            {
                name: 'Payroll',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/payroll',
                match_path: 'payroll',
            },
            {
                name: 'Payroll Items',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/payroll-items',
                match_path: 'payroll-items',
            },
            {
                name: 'Payroll Templates',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/payroll-templates',
                match_path: 'payroll-templates',
            },
            {
                name: 'Payroll Settings',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/payroll-settings',
                match_path: 'payroll-settings',
            },
            {
                name: 'Payroll Reports',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/payroll-reports',
                match_path: 'payroll-reports',
            },
        ],
    },

    {
        name: 'Procurement Mgmt.',
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        children: [
            {
                name: 'Loan Accounts',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Fixed Assets Mgmt.',
                icon: <i className="fa-solid fa-user-gear" />,
                children: [
                    {
                        name: 'Asset Categories',
                        icon: <i className="fa-solid fa-user-gear" />,
                        path: '/users',
                        match_path: 'users',
                    },
                ],
            },
        ],
    },
    {
        name: 'User Auth Mgmt.',
        icon: <i className="fa-solid fa-user-gear" />,
        children: [
            {
                name: 'Roles',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/roles',
                match_path: 'roles',
            },
            {
                name: 'Assign Role Permissions',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/role-permissions',
                match_path: 'role-permissions',
            },
            {
                name: 'Users',
                icon: <i className="fa-solid fa-user-gear" />,
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
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/user-permissions',
                match_path: 'user-permissions',
            },
        ],
    },
    {
        name: 'Audit Trails',
        icon: <i className="fa-solid fa-user-gear" />,
        children: [
            {
                name: 'Audit Logs',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/user-permissions',
                match_path: 'user-permissions',
            },
            {
                name: 'Activity Logs',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/user-permissions',
                match_path: 'user-permissions',
            },
            {
                name: 'Visits Logs',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/user-permissions',
                match_path: 'user-permissions',
            },
        ],
    },
    {
        name: 'User Settings',
        icon: <i className="fa-solid fa-gear" />,
        children: [
            {
                name: 'User Settings',
                icon: <i className="fa-solid fa-gear" />,
                path: '/settings/profile',
                match_path: 'settings',
            },
            {
                name: 'Application Settings',
                icon: <i className="fa-solid fa-gear" />,
                path: '/settings/application',
                match_path: 'application',
            },
        ],
    },
];
