import { SidebarItem } from '../../types';

export const reportsMenu: SidebarItem[] = [
    {
        name: 'Reports',
        icon: <i className="fa-solid fa-chart-column" />,
        children_expanded: false,
        permission: ['reports.view'],
        children: [
            {
                name: 'Member Reports',
                icon: <i className="fa-solid fa-users" />,
                path: '/reports/members',
                match_path: 'reports/members',
                permission: ['reports.members.view'],
            },
            {
                name: 'Account Reports',
                icon: <i className="fa-solid fa-wallet" />,
                path: '/reports/accounts',
                match_path: 'reports/accounts',
                permission: ['reports.accounts.view'],
            },
            {
                name: 'Loan Reports',
                icon: <i className="fa-solid fa-landmark" />,
                path: '/reports/loans',
                match_path: 'reports/loans',
                permission: ['reports.loans.view'],
            },
            {
                name: 'Financial Reports',
                icon: <i className="fa-solid fa-chart-line" />,
                path: '/reports/financial',
                match_path: 'reports/financial',
                permission: ['reports.financial.view'],
            },
            {
                name: 'Cash Reports',
                icon: <i className="fa-solid fa-cash-register" />,
                path: '/reports/cash',
                match_path: 'reports/cash',
                permission: ['reports.cash.view'],
            },
        ],
    },
];
