import { SidebarItem } from '../../types';

export const systemAdministrationMenu: SidebarItem[] = [
    {
        name: 'System Administration',
        icon: <i className="fa-solid fa-building-flag" />,
        children_expanded: false,
        permission: ['organizations.view'],
        children: [
            {
                name: 'Organizations',
                icon: <i className="fa-solid fa-building-wheat" />,
                path: '/organizations',
                match_path: 'organizations',
                permission: ['organizations.view'],
            },
            {
                name: 'User, Role & Permissions',
                icon: <i className="fa-solid fa-users"></i>,
                children_expanded: false,
                permission: ['users.view', 'role_permissions.view'],
                children: [
                    {
                        name: 'Users',
                        icon: <i className="fa-solid fa-user" />,
                        path: '/users',
                        match_path: 'users',
                        permission: ['users.view'],
                    },
                    {
                        name: 'Role Permissions',
                        icon: <i className="fa-solid fa-user" />,
                        path: '/roles/permissions',
                        match_path: 'roles/permissions',
                        permission: ['role_permissions.view'],
                    },
                ],
            },
            {
                name: 'Audit & Backup',
                icon: <i className="fa-solid fa-clipboard-list" />,
                children_expanded: false,
                permission: ['activity_logs.view', 'database_backups.view'],
                children: [
                    {
                        name: 'Activity Logs',
                        icon: <i className="fa-solid fa-file-alt" />,
                        path: '/audits',
                        match_path: 'audits',
                        permission: ['activity_logs.view'],
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
        ],
    },
];
