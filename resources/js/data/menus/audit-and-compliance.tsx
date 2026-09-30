import { SidebarItem } from '../../types';

export const auditAndCompliance: SidebarItem[] = [
    {
        name: 'Audit & Compliance',
        icon: <i className="fa-solid fa-scale-balanced" />,
        children_expanded: false,
        permission: [],
        children: [
            {
                name: 'Internal Audit',
                icon: <i className="fa-solid fa-user" />,
                path: '/internal-audit',
                match_path: 'internal-audit',
                permission: ['internal-audit.view'],
            },
            {
                name: 'Audit Plans',
                icon: <i className="fa-solid fa-user" />,
                path: '/audit-plans',
                match_path: 'audit-plans',
                permission: ['audit-plans.view'],
            },
            {
                name: 'Audit Findings',
                icon: <i className="fa-solid fa-user" />,
                path: '/audit-findings',
                match_path: 'audit-findings',
                permission: ['audit-findings.view'],
            },
            {
                name: 'Compliance',
                icon: <i className="fa-solid fa-user" />,
                path: '/compliance',
                match_path: 'compliance',
                permission: ['compliance.view'],
            },
            {
                name: 'Risk Management',
                icon: <i className="fa-solid fa-user" />,
                path: '/risk-management',
                match_path: 'risk-management',
                permission: ['risk-management.view'],
            },
            {
                name: 'Approval Logs',
                icon: <i className="fa-solid fa-user" />,
                path: '/approval-logs',
                match_path: 'approval-logs',
                permission: ['approval-logs.view'],
            },
            {
                name: 'Activity Logs',
                icon: <i className="fa-solid fa-file-alt" />,
                path: '/audits',
                match_path: 'audits',
                permission: ['activity_logs.view'],
            },
            {
                name: 'Regulatory Reports',
                icon: <i className="fa-solid fa-user" />,
                path: '/regulatory-reports',
                match_path: 'regulatory-reports',
                permission: ['regulatory-reports.view'],
            },
        ],
    },
];
