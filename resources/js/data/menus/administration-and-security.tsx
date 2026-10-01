import { SidebarItem } from '../../types';

export const administrationAndSecurity: SidebarItem[] = [
    {
        name: 'Administration & Security',
        icon: <i className="fa-solid fa-shield-halved" />,
        children_expanded: false,
        permission: [],
        children: [
            {
                name: 'Dashboard',
                icon: <i className="fa-solid fa-gauge-high" />,
                path: '/admin-dashboard',
                match_path: 'admin-dashboard',
                permission: [
                    'organizations.view',
                    'users.view',
                    'role_permissions.view',
                    'activity_logs.view',
                    'database_backups.view',
                ],
            },
            {
                name: 'Users',
                icon: <i className="fa-solid fa-users" />,
                path: '/users',
                match_path: 'users',
                permission: ['users.view'],
            },
            {
                name: 'Role & Permissions',
                icon: <i className="fa-solid fa-user-shield" />,
                path: '/roles/permissions',
                match_path: 'roles/permissions',
                permission: ['role_permissions.view'],
            },

            {
                name: 'Notifications',
                icon: <i className="fa-solid fa-bell" />,
                path: '/notifications',
                match_path: 'notifications',
                permission: ['notifications.view'],
            },
            {
                name: 'Database Backups',
                icon: <i className="fa-solid fa-database"></i>,
                path: '/database/backups',
                match_path: 'database/backups',
                permission: ['database_backups.view'],
            },
        ],
    },
];
