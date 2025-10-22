import { SidebarItem } from '../types';

export const sidebarMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-gauge-high" />,
        path: '/dashboard',
    },
    {
        name: 'Branchs',
        icon: <i className="fa-solid fa-network-wired" />,
        children: [
            {
                name: 'Branches',
                icon: <i className="fa-solid fa-network-wired" />,
                path: '/branches',
            },
            {
                name: 'New Branch',
                icon: <i className="fa-solid fa-network-wired" />,
                path: '/branches/create',
            },
        ],
    },
    {
        name: 'Customer Management',
        icon: <i className="fa-solid fa-users" />,
        children: [
            {
                name: 'Customers',
                icon: <i className="fa-solid fa-users" />,
                path: '/auth/customers',
            },
            {
                name: 'Signatures',
                icon: <i className="fa-solid fa-users" />,
                path: '/auth/customers/signatures',
            },
        ],
    },
    {
        name: 'General Accounting',
        icon: <i className="fa-solid fa-cash-register"></i>,
        children: [
            {
                name: 'Ledgers',
                icon: <i className="fa-solid fa-cash-register"></i>,
                path: '/ledgers',
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-cash-register"></i>,
                children: [
                    {
                        name: 'Debit Vouchers',
                        icon: <i className="fa-solid fa-cash-register"></i>,
                        path: '/reports/monthly',
                    },
                    {
                        name: 'Credit Vouchers',
                        icon: <i className="fa-solid fa-cash-register"></i>,
                        path: '/reports/annual',
                    },
                    {
                        name: 'Journal Vouchers',
                        icon: <i className="fa-solid fa-cash-register"></i>,
                        path: '/reports/annual',
                    },
                    {
                        name: 'Contra Vouchers',
                        icon: <i className="fa-solid fa-cash-register"></i>,
                        path: '/reports/annual',
                    },
                ],
            },
            {
                name: 'Reports',
                icon: <i className="fa-solid fa-cash-register"></i>,
                children: [
                    {
                        name: 'Monthly',
                        icon: <i className="fa-solid fa-cash-register"></i>,
                        path: '/reports/monthly',
                    },
                    {
                        name: 'Annual',
                        icon: <i className="fa-solid fa-cash-register"></i>,
                        path: '/reports/annual',
                    },
                ],
            },
        ],
    },

    {
        name: 'Subsidiary Accounting',
        icon: <i className="fa-solid fa-piggy-bank"></i>,
        children: [
            {
                name: 'Saving Accounts',
                icon: <i className="fa-solid fa-sprout" />,
                children: [
                    {
                        name: 'All Customers',
                        icon: <i className="fa-solid fa-sprout" />,
                        path: '/customers',
                    },
                    {
                        name: 'New Customer',
                        icon: <i className="fa-solid fa-sprout" />,
                        path: '/customers/create',
                    },
                ],
            },
            {
                name: 'Share Accounts',
                icon: <i className="fa-solid fa-money-bill-trend-up"></i>,
                children: [
                    {
                        name: 'All Customers',
                        icon: (
                            <i className="fa-solid fa-money-bill-trend-up"></i>
                        ),
                        path: '/customers',
                    },
                    {
                        name: 'New Customer',
                        icon: (
                            <i className="fa-solid fa-money-bill-trend-up"></i>
                        ),
                        path: '/customers/create',
                    },
                ],
            },
            {
                name: 'Customer Loans',
                icon: <i className="fa-solid fa-sack-dollar"></i>,
                children: [
                    {
                        name: 'Loan Accounts',
                        icon: <i className="fa-solid fa-sack-dollar"></i>,
                        path: '/customers',
                    },
                    {
                        name: 'Loan Applications',
                        icon: <i className="fa-solid fa-paperclip" />,
                        path: '/customers',
                    },
                ],
            },

            {
                name: 'Cash and Treasury',
                icon: <i className="fa-solid fa-coins" />,
                children: [
                    {
                        name: 'All Customers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/customers',
                    },
                    {
                        name: 'New Customer',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/customers/create',
                    },
                ],
            },
            {
                name: 'Fixed Assets',
                icon: <i className="fa-solid fa-school" />,
                children: [
                    {
                        name: 'All Customers',
                        icon: <i className="fa-solid fa-school" />,
                        path: '/customers',
                    },
                    {
                        name: 'New Customer',
                        icon: <i className="fa-solid fa-school" />,
                        path: '/customers/create',
                    },
                ],
            },
            {
                name: 'Vendors',
                icon: <i className="fa-solid fa-users-between-lines"></i>,
                children: [
                    {
                        name: 'All Customers',
                        icon: (
                            <i className="fa-solid fa-users-between-lines"></i>
                        ),
                        path: '/customers',
                    },
                    {
                        name: 'New Customer',
                        icon: (
                            <i className="fa-solid fa-users-between-lines"></i>
                        ),
                        path: '/customers/create',
                    },
                ],
            },
            {
                name: 'Cheque Book',
                icon: <i className="fa-solid fa-landmark" />,
                children: [
                    {
                        name: 'All Customers',
                        icon: <i className="fa-solid fa-landmark" />,
                        path: '/customers',
                    },
                    {
                        name: 'New Customer',
                        icon: <i className="fa-solid fa-landmark" />,
                        path: '/customers/create',
                    },
                ],
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-piggy-bank"></i>,
                children: [
                    {
                        name: 'Cash Collection',
                        icon: <i className="fa-solid fa-piggy-bank"></i>,
                        path: '/customers',
                    },
                    {
                        name: 'Payments',
                        icon: <i className="fa-solid fa-piggy-bank"></i>,
                        path: '/customers/create',
                    },
                ],
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
                path: '/customers',
            },
            {
                name: 'Leaves',
                icon: <i className="fa-solid fa-user-tie"></i>,
                path: '/customers/create',
            },
            {
                name: 'Attendances',
                icon: <i className="fa-solid fa-user-tie"></i>,
                path: '/customers/create',
            },
        ],
    },
    {
        name: 'Users',
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
        path: '/settings/profile',
    },
    {
        name: 'Settings',
        icon: <i className="fa-solid fa-gear" />,
        path: '/settings/profile',
    },
];
