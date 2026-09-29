import { SidebarItem } from '../../types';

export const creditAndRecovery: SidebarItem[] = [
    {
        name: 'Credit & Recovery',
        icon: <i className="fa-solid fa-hand-holding-dollar" />,
        permission: ['financial.loan-applications.view'],
        children_expanded: false,
        children: [
            {
                name: 'Loan Applications',
                icon: <i className="fa-solid fa-file-signature" />,
                path: '/loan-applications',
                match_path: 'loan-applications',
                permission: ['financial.loan-applications.view'],
            },
            {
                name: 'Loan Accounts',
                icon: <i className="fa-solid fa-money-check-dollar" />,
                path: '/loan-accounts',
                match_path: 'loan-accounts',
                permission: ['financial.accounts.view'],
            },
            {
                name: 'Disbursement Entry',
                icon: <i className="fa-solid fa-arrow-up-right-dots" />,
                path: '/financial-transactions/loan-disbursement/create',
                match_path: 'financial-transactions/loan-disbursement',
                permission: ['financial.transactions.create'],
            },
        ],
    },
];
