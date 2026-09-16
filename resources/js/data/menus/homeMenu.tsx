import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';

export const homeMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-building-columns" />,
        permission: ['banks.view'],
        path: route('dashboard'),
        match_path: 'dashboard',
    },
];
