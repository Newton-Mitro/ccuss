import { SidebarItem } from '../types';

export const sidebarMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-gauge-high" />,
        path: '/dashboard',
    },
    {
        name: 'Branch Management',
        icon: <i className="fa-solid fa-network-wired" />,
        children: [
            { name: 'Branches', path: '/branches' },
            { name: 'New Branch', path: '/branches/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Customers',
        icon: <i className="fa-solid fa-users" />,
        children: [
            { name: 'Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'General Ledgers',
        icon: <i className="fa-solid fa-cash-register"></i>,
        children: [
            { name: 'Ledgers', path: '/ledgers' },
            { name: 'New Ledger', path: '/ledgers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Manage Savings',
        icon: <i className="fa-solid fa-sprout" />,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Manage Shares',
        icon: <i className="fa-solid fa-money-bill-trend-up"></i>,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Manage Loans',
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Manage Cash',
        icon: <i className="fa-solid fa-coins" />,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Asset Management',
        icon: <i className="fa-solid fa-school" />,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Vendor Management',
        icon: <i className="fa-solid fa-users-between-lines"></i>,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Cheque Management',
        icon: <i className="fa-solid fa-landmark" />,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'HR Management',
        icon: <i className="fa-solid fa-user-tie"></i>,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Loan Applications',
        icon: <i className="fa-solid fa-paperclip" />,
        children: [
            { name: 'All Customers', path: '/customers' },
            { name: 'New Customer', path: '/customers/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Users',
        icon: <i className="fa-solid fa-user-gear" />,
        children: [
            { name: 'All Users', path: '/users' },
            { name: 'New User', path: '/users/create' },
            {
                name: 'Roles & Permissions',
                children: [
                    { name: 'Roles', path: '/users/roles' },
                    { name: 'Permissions', path: '/users/permissions' },
                ],
            },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Audit Logs',
        icon: <i className="fa-solid fa-list-check" />,
        children: [
            { name: 'All Users', path: '/users' },
            { name: 'New User', path: '/users/create' },
            {
                name: 'Reports',
                children: [
                    { name: 'Monthly', path: '/reports/monthly' },
                    { name: 'Annual', path: '/reports/annual' },
                ],
            },
        ],
    },
    {
        name: 'Settings',
        icon: <i className="fa-solid fa-gear" />,
        path: '/settings/profile',
    },
];
