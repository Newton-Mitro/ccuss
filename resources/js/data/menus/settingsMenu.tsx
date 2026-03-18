import { SidebarItem } from '../../types';

export const settingsMenu: SidebarItem[] = [
    {
        name: 'Settings',
        icon: <i className="fa-solid fa-user-cog" />,
        path: '/settings/profile',
        match_path: 'settings',
        permission: ['settings.profile.view'],
    },
];
