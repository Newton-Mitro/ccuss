import { SidebarItem } from '../../types';

export const depositAccounts: SidebarItem[] = [
    {
        name: 'Savings & Deposits',
        icon: <i className="fa-solid fa-piggy-bank" />,
        permission: ['financial.accounts.view'],
        children_expanded: false,
        children: [
            {
                name: 'Savings Accounts',
                icon: <i className="fa-solid fa-piggy-bank" />,
                path: '/financial-accounts/savings',
                match_path: 'financial-accounts/savings',
                permission: ['financial.accounts.view'],
            },
            {
                name: 'Shares & Memberships',
                icon: <i className="fa-solid fa-chart-pie" />,
                path: '/financial-accounts/share',
                match_path: 'financial-accounts/share',
                permission: ['financial.accounts.view'],
            },
            {
                name: 'Fixed Deposits',
                icon: <i className="fa-solid fa-lock" />,
                path: '/financial-accounts/fixed',
                match_path: 'financial-accounts/fixed',
                permission: ['financial.accounts.view'],
            },
            {
                name: 'Recurring Deposits',
                icon: <i className="fa-solid fa-rotate" />,
                path: '/financial-accounts/recurring',
                match_path: 'financial-accounts/recurring',
                permission: ['financial.accounts.view'],
            },
            {
                name: 'Account Statements',
                icon: <i className="fa-solid fa-file-lines" />,
                path: '/financial-account-statements',
                match_path: 'financial-account-statements',
                permission: ['financial.accounts.view'],
            },
        ],
    },
];
