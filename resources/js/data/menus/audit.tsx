import { SidebarItem } from '../../types';

export const auditMenu: SidebarItem[] = [
    {
        name: 'Audit & Logs',
        icon: <i className="fa-solid fa-clipboard-list" />,
        children_expanded: false,
        permission: ['audit.view'],
        children: [
            {
                name: 'Audit Logs',
                icon: <i className="fa-solid fa-file-alt" />,
                path: '/audit-logs',
                match_path: 'audit-logs',
                permission: ['audit.logs.view'],
            },
            {
                name: 'Activity Logs',
                icon: <i className="fa-solid fa-file-alt" />,
                path: '/activity-logs',
                match_path: 'activity-logs',
                permission: ['audit.activity.view'],
            },
        ],
    },
];
