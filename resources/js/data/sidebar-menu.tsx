import { SidebarItem } from '../types';

export const sidebarMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-gauge-high" />,
        path: '/dashboard',
        match_path: 'dashboard',
    },
    {
        name: 'Branches',
        icon: <i className="fa-solid fa-location-dot" />,
        path: '/auth/branches',
        match_path: 'branches',
    },
    {
        name: 'Media',
        icon: <i className="fa-solid fa-photo-film"></i>,
        path: '/auth/media',
        match_path: 'media',
    },
    {
        name: 'Customer Management',
        icon: <i className="fa-solid fa-users" />,
        children: [
            {
                name: 'Customers',
                icon: <i className="fa-solid fa-users-viewfinder" />,
                path: '/auth/customers',
                match_path: 'customers',
            },
            {
                name: 'Addresses',
                icon: <i className="fa-solid fa-map-location-dot" />,
                path: '/auth/addresses',
                match_path: 'addresses',
            },
            {
                name: 'Family Relations',
                icon: <i className="fa-solid fa-person-breastfeeding" />,
                path: '/auth/family-relations',
                match_path: 'family-relations',
            },
            {
                name: 'Signatures',
                icon: <i className="fa-solid fa-signature" />,
                path: '/auth/signatures',
                match_path: 'signatures',
            },
            {
                name: 'Online Client',
                icon: <i className="fa-solid fa-street-view" />,
                path: '/auth/online-clients',
                match_path: 'online-clients',
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
                path: '/auth/gl-accounts',
                match_path: 'gl-accounts',
            },
            {
                name: 'Vouchers',
                icon: <i className="fa-solid fa-cash-register" />,
                children: [
                    {
                        name: 'Debit Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/debit-vouchers',
                        match_path: 'debit-vouchers',
                    },
                    {
                        name: 'Credit Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/credit-vouchers',
                        match_path: 'credit-vouchers',
                    },
                    {
                        name: 'Journal Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/journal-vouchers',
                        match_path: 'journal-vouchers',
                    },
                    {
                        name: 'Contra Vouchers',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/contra-vouchers',
                        match_path: 'contra-vouchers',
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
        name: 'Manage Deposits',
        icon: <i className="fa-solid fa-sprout" />,
        children: [
            {
                name: 'Deposit Policies',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-policies',
                match_path: 'deposit-policies',
            },
            {
                name: 'Deposit Tenures',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-tenures',
                match_path: 'deposit-tenures',
            },
            {
                name: 'Saving Accounts',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/saving-accounts',
                match_path: 'saving-accounts',
            },
            {
                name: 'Deposit Holders',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-holders',
                match_path: 'deposit-holders',
            },
            {
                name: 'Deposit Nominees',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-nominees',
                match_path: 'deposit-nominees',
            },
            {
                name: 'Deposit Schedules',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/deposit-schedules',
                match_path: 'deposit-schedules',
            },
        ],
    },
    {
        name: 'Cheque Book',
        icon: <i className="fa-solid fa-landmark" />,
        path: '/cheque-book',
        match_path: 'cheque-book',
    },
    {
        name: 'HR Management',
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
        ],
    },
    {
        name: 'User Auth',
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
        name: 'Settings',
        icon: <i className="fa-solid fa-gear" />,
        path: '/settings/profile',
        match_path: 'settings',
    },
];
