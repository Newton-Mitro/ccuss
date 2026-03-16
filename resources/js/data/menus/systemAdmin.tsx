import { SidebarItem } from '../../types';

export const systemAdminMenu: SidebarItem[] = [
    {
        name: 'System Administration',
        icon: <i className="fa-solid fa-building-flag" />,
        children_expanded: false,
        permission: ['organization.view'],
        children: [
            {
                name: 'Companies',
                icon: <i className="fa-solid fa-building-wheat" />,
                path: '/companies',
                match_path: 'companies',
                permission: ['organization.companies.view'],
            },
            {
                name: 'Branches',
                icon: <i className="fa-solid fa-leaf" />,
                path: '/branches',
                match_path: 'branches',
                permission: ['organization.branches.view'],
            },
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
            {
                name: 'Database Backups',
                icon: <i className="fa-solid fa-database"></i>,
                path: '/database/backups',
                match_path: 'database/backups',
                permission: ['settings.report_templates.view'],
            },
        ],
    },
];
