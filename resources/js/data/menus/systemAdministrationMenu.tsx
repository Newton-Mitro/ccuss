import { SidebarItem } from '../../types';

export const systemAdministrationMenu: SidebarItem[] = [
    {
        name: 'System Administration',
        icon: <i className="fa-solid fa-building-flag" />,
        children_expanded: false,
        permission: ['organization.view'],
        children: [
            {
                name: 'Organizational Setup',
                icon: <i className="fa-solid fa-building"></i>,
                children_expanded: false,
                permission: ['organization.view'],
                children: [
                    {
                        name: 'Organizations',
                        icon: <i className="fa-solid fa-building-wheat" />,
                        path: '/organizations',
                        match_path: 'organizations',
                        permission: ['organization.view'],
                    },
                    {
                        name: 'Branches',
                        icon: <i className="fa-solid fa-leaf" />,
                        path: '/branches',
                        match_path: 'branches',
                        permission: ['organization.branches.view'],
                    },
                ],
            },
            {
                name: 'User, Role & Permissions',
                icon: <i className="fa-solid fa-users"></i>,
                children_expanded: false,
                permission: ['organization.view'],
                children: [
                    {
                        name: 'Users',
                        icon: <i className="fa-solid fa-user" />,
                        path: '/users',
                        match_path: 'users',
                        permission: ['organization.users.view'],
                    },
                    {
                        name: 'Role Permissions',
                        icon: <i className="fa-solid fa-user" />,
                        path: '/roles/permissions',
                        match_path: 'role-permissions',
                        permission: ['organization.role-permissions.view'],
                    },
                    {
                        name: 'User Roles',
                        icon: <i className="fa-solid fa-user" />,
                        path: '/user-roles',
                        match_path: 'user-roles',
                        permission: ['organization.user-roles.view'],
                    },
                ],
            },
            {
                name: 'Audit & Backup',
                icon: <i className="fa-solid fa-clipboard-list" />,
                children_expanded: false,
                permission: ['audit.view'],
                children: [
                    {
                        name: 'Activity Logs',
                        icon: <i className="fa-solid fa-file-alt" />,
                        path: '/audit-logs',
                        match_path: 'audit-logs',
                        permission: ['audit.logs.view'],
                    },
                    {
                        name: 'SMS Logs',
                        icon: <i className="fa-solid fa-sms" />,
                        path: '/sms-logs',
                        match_path: 'sms-logs',
                        permission: ['sms.logs.view'],
                    },
                    {
                        name: 'Email Logs',
                        icon: <i className="fa-solid fa-envelope-open-text" />,
                        path: '/email-logs',
                        match_path: 'email-logs',
                        permission: ['email.logs.view'],
                    },
                    {
                        name: 'Database Backups',
                        icon: <i className="fa-solid fa-database"></i>,
                        path: '/database/backups',
                        match_path: 'database/backups',
                        permission: ['settings.report_templates.view'],
                    },
                ],
            },
        ],
    },
];
