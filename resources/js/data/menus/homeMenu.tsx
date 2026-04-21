import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';

export const homeMenu: SidebarItem[] = [
    {
        name: 'User Home',
        icon: <i className="fa-solid fa-building-columns" />,
        permission: ['banks.view'],
        path: route('auth.home'),
        match_path: 'dashboard',
    },
];
