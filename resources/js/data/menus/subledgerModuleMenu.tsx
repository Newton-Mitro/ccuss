import { SidebarItem } from '../../types';

export const subledgerModuleMenu: SidebarItem[] = [
    {
        name: 'Subledger Management',
        icon: <i className="fa-solid fa-cogs" />,
        children_expanded: false,
        permission: ['subledger.view'],
        children: [
            {
                name: 'Subledgers',
                icon: <i className="fa-solid fa-money-bill-wave" />,
                path: '/subledgers',
                match_path: 'subledgers',
                permission: ['subledger.create'],
            },
            {
                name: 'Subledger Accounts',
                icon: <i className="fa-solid fa-percent" />,
                path: '/subledger-accounts',
                match_path: 'subledger-accounts',
                permission: ['subledger.accounts.view'],
            },
        ],
    },
];
