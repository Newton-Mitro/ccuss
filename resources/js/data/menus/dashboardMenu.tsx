import { SidebarItem } from '../../types';

export const dashboardMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-university" />,
        children_expanded: false,
        permission: ['bank.view'],
        children: [
            {
                name: 'Home',
                icon: <i className="fa-solid fa-building-columns" />,
                permission: ['banks.view'],
                path: '/dashboard',
                match_path: 'dashboard',
            },
        ],
    },
];
