import { SidebarItem } from '../types';

export const sidebarMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-gauge-high" />,
        path: '/dashboard',
    },
    {
        name: 'Branches',
        icon: <i className="fa-solid fa-network-wired" />,
        path: '/auth/branches',
    },
    {
        name: 'Customer Management',
        icon: <i className="fa-solid fa-users" />,
        children: [
            {
                name: 'Customers',
                icon: <i className="fa-solid fa-users-viewfinder"></i>,
                path: '/auth/customers',
            },
            {
                name: 'Addresses',
                icon: <i className="fa-solid fa-map-location-dot"></i>,
                path: '/auth/addresses',
            },
            {
                name: 'Family Relationships',
                icon: <i className="fa-solid fa-person-breastfeeding"></i>,
                path: '/auth/families',
            },
            {
                name: 'Signatures',
                icon: <i className="fa-solid fa-signature"></i>,
                path: '/auth/signatures',
            },
            {
                name: 'Onlne Users',
                icon: <i className="fa-solid fa-street-view"></i>,
                path: '/auth/online-users',
            },
        ],
    },
    {
        name: 'General Accounting',
        icon: <i className="fa-solid fa-cash-register"></i>,
        children: [
            {
                name: 'Ledgers',
                icon: <i className="fa-solid fa-list-check"></i>,
                path: '/ledgers',
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-cash-register"></i>,
                children: [
                    {
                        name: 'Debit Vouchers',
                        icon: <i className="fa-solid fa-coins"></i>,
                        path: '/debit-vouchers',
                    },
                    {
                        name: 'Credit Vouchers',
                        icon: <i className="fa-solid fa-coins"></i>,
                        path: '/credit-vouchers',
                    },
                    {
                        name: 'Journal Vouchers',
                        icon: <i className="fa-solid fa-coins"></i>,
                        path: '/journal-vouchers',
                    },
                    {
                        name: 'Contra Vouchers',
                        icon: <i className="fa-solid fa-coins"></i>,
                        path: '/contra-vouchers',
                    },
                ],
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-chart-simple"></i>,
                children: [
                    {
                        name: 'Trial Balance',
                        icon: <i className="fa-solid fa-scale-balanced"></i>,
                        path: '/reports/trial-balance',
                    },
                    {
                        name: 'Income Statement',
                        icon: <i className="fa-solid fa-scale-balanced"></i>,
                        path: '/reports/income-statement',
                    },
                    {
                        name: 'Balance Sheet',
                        icon: <i className="fa-solid fa-scale-balanced"></i>,
                        path: '/reports/balance-sheet',
                    },
                    {
                        name: 'Cash Flow Statement',
                        icon: <i className="fa-solid fa-scale-balanced"></i>,
                        path: '/reports/cash-flow-statement',
                    },
                    {
                        name: 'Statement of shareholders Equity',
                        icon: <i className="fa-solid fa-scale-balanced"></i>,
                        path: '/reports/statement-of-shareholders-equity',
                    },
                ],
            },
        ],
    },
    {
        name: 'Manage Deposits',
        icon: <i className="fa-solid fa-sprout" />,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/deposit-policies',
            },
            {
                name: 'Deposit Tenures',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/deposit-tenures',
            },

            {
                name: 'Saving Accounts',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/saving-accounts',
            },
            {
                name: 'Deposit Holders',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/deposit-holders',
            },
            {
                name: 'Deposit Nominees',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/deposit-nominees',
            },
            {
                name: 'Deposit Schedules',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/deposit-schedules',
            },
        ],
    },
    {
        name: 'Share Accounts',
        icon: <i className="fa-solid fa-money-bill-trend-up"></i>,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/cash-collection',
            },
        ],
    },
    {
        name: 'Customer Loans',
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/cash-collection',
            },
        ],
    },

    {
        name: 'Cash and Treasury',
        icon: <i className="fa-solid fa-coins" />,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/cash-collection',
            },
        ],
    },
    {
        name: 'Fixed Assets',
        icon: <i className="fa-solid fa-school" />,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/cash-collection',
            },
        ],
    },
    {
        name: 'Vendors',
        icon: <i className="fa-solid fa-users-between-lines"></i>,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/deposit-policies',
            },
        ],
    },
    {
        name: 'Cheque Book',
        icon: <i className="fa-solid fa-landmark" />,
        path: '/cheque-book',
    },
    {
        name: 'Subsidiary Transactions',
        icon: <i className="fa-solid fa-piggy-bank"></i>,
        children: [
            {
                name: 'Cash Collection',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                path: '/cash-collection',
            },
        ],
    },
    {
        name: 'HR Management',
        icon: <i className="fa-solid fa-user-tie"></i>,
        children: [
            {
                name: 'Employees',
                icon: <i className="fa-solid fa-user-tie"></i>,
                path: '/employees',
            },
            {
                name: 'Leaves',
                icon: <i className="fa-solid fa-user-tie"></i>,
                path: '/leaves',
            },
            {
                name: 'Attendances',
                icon: <i className="fa-solid fa-user-tie"></i>,
                path: '/attendances',
            },
        ],
    },
    {
        name: 'User Auth',
        icon: <i className="fa-solid fa-user-gear" />,
        children: [
            {
                name: 'All Users',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users',
            },
            {
                name: 'Roles',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/roles',
            },
            {
                name: 'Assign Roles',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/permissions',
            },
            {
                name: 'Assign Permissions',
                icon: <i className="fa-solid fa-user-gear" />,
                path: '/users/permissions',
            },
        ],
    },
    {
        name: 'Audit Logs',
        icon: <i className="fa-solid fa-list-check" />,
        path: '/audit-logs',
    },
    {
        name: 'Settings',
        icon: <i className="fa-solid fa-gear" />,
        path: '/settings/profile',
    },
];
