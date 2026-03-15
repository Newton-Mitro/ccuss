import { SidebarItem } from '../../types';

export const settingsMenu: SidebarItem[] = [
    {
        name: 'Settings',
        icon: <i className="fa-solid fa-gear" />,
        children_expanded: false,
        permission: ['settings.view'],
        children: [
            {
                name: 'Profile',
                icon: <i className="fa-solid fa-user-cog" />,
                path: '/settings/profile',
                match_path: 'settings',
                permission: ['settings.profile.view'],
            },
            {
                name: 'System Settings',
                icon: <i className="fa-solid fa-sliders" />,
                path: '/system-settings',
                match_path: 'system-settings',
                permission: ['settings.system.view'],
            },
            {
                name: 'Report Templates',
                icon: <i className="fa-solid fa-file-lines" />,
                path: '/report-templates',
                match_path: 'report-templates',
                permission: ['settings.report_templates.view'],
            },
        ],
    },
];
