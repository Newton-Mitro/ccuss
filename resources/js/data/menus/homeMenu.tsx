import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';

export const homeMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-house" />,
        path: route('dashboard'),
        match_path: 'dashboard',
    },
    {
        name: 'Organizations',
        icon: <i className="fa-solid fa-building-wheat" />,
        path: '/organizations',
        match_path: 'organizations',
        permission: ['organizations.view'],
    },
];
