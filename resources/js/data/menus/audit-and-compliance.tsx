import { SidebarItem } from '../../types';

export const auditAndCompliance: SidebarItem[] = [
    {
        name: 'Audit & Compliance',
        icon: <i className="fa-solid fa-scale-balanced" />,
        children_expanded: false,
        permission: [],
        children: [
            // Internal Audit
            {
                name: 'Internal Audit',
                icon: <i className="fa-solid fa-magnifying-glass-chart" />,
                children_expanded: false,
                permission: [],
                children: [
                    {
                        name: 'Audit Dashboard',
                        icon: <i className="fa-solid fa-gauge-high" />,
                        path: '/internal-audit',
                        match_path: 'internal-audit',
                        permission: ['internal-audit.view'],
                    },
                    {
                        name: 'Audit Plans',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/audit-plans',
                        match_path: 'audit-plans',
                        permission: ['audit-plans.view'],
                    },
                    {
                        name: 'Audit Engagements',
                        icon: <i className="fa-solid fa-clipboard-check" />,
                        path: '/audit-engagements',
                        match_path: 'audit-engagements',
                        permission: ['audit-engagements.view'],
                    },
                    {
                        name: 'Working Papers',
                        icon: <i className="fa-solid fa-file-lines" />,
                        path: '/audit-working-papers',
                        match_path: 'audit-working-papers',
                        permission: ['audit-working-papers.view'],
                    },
                    {
                        name: 'Audit Findings',
                        icon: (
                            <i className="fa-solid fa-triangle-exclamation" />
                        ),
                        path: '/audit-findings',
                        match_path: 'audit-findings',
                        permission: ['audit-findings.view'],
                    },
                    {
                        name: 'Corrective Actions',
                        icon: <i className="fa-solid fa-list-check" />,
                        path: '/audit-corrective-actions',
                        match_path: 'audit-corrective-actions',
                        permission: ['audit-corrective-actions.view'],
                    },
                    {
                        name: 'Audit Follow-ups',
                        icon: <i className="fa-solid fa-arrows-rotate" />,
                        path: '/audit-follow-ups',
                        match_path: 'audit-follow-ups',
                        permission: ['audit-follow-ups.view'],
                    },
                ],
            },

            // Compliance
            {
                name: 'Compliance',
                icon: <i className="fa-solid fa-shield-halved" />,
                children_expanded: false,
                permission: [],
                children: [
                    {
                        name: 'Compliance Dashboard',
                        icon: <i className="fa-solid fa-gauge-high" />,
                        path: '/compliance',
                        match_path: 'compliance',
                        permission: ['compliance.view'],
                    },
                    {
                        name: 'Requirements',
                        icon: <i className="fa-solid fa-file-circle-check" />,
                        path: '/compliance-requirements',
                        match_path: 'compliance-requirements',
                        permission: ['compliance-requirements.view'],
                    },
                    {
                        name: 'Assessments',
                        icon: <i className="fa-solid fa-clipboard-list" />,
                        path: '/compliance-assessments',
                        match_path: 'compliance-assessments',
                        permission: ['compliance-assessments.view'],
                    },
                    {
                        name: 'Compliance Actions',
                        icon: <i className="fa-solid fa-circle-check" />,
                        path: '/compliance-actions',
                        match_path: 'compliance-actions',
                        permission: ['compliance-actions.view'],
                    },
                ],
            },

            // Risk Management
            {
                name: 'Risk Management',
                icon: <i className="fa-solid fa-chart-line" />,
                children_expanded: false,
                permission: [],
                children: [
                    {
                        name: 'Risk Dashboard',
                        icon: <i className="fa-solid fa-gauge-high" />,
                        path: '/risk-management',
                        match_path: 'risk-management',
                        permission: ['risk-management.view'],
                    },
                    {
                        name: 'Risk Register',
                        icon: <i className="fa-solid fa-book-open" />,
                        path: '/risks',
                        match_path: 'risks',
                        permission: ['risks.view'],
                    },
                    {
                        name: 'Risk Assessments',
                        icon: <i className="fa-solid fa-gauge-high" />,
                        path: '/risk-assessments',
                        match_path: 'risk-assessments',
                        permission: ['risk-assessments.view'],
                    },
                    {
                        name: 'Risk Mitigations',
                        icon: <i className="fa-solid fa-shield-heart" />,
                        path: '/risk-mitigations',
                        match_path: 'risk-mitigations',
                        permission: ['risk-mitigations.view'],
                    },
                ],
            },

            // Governance
            {
                name: 'Governance',
                icon: <i className="fa-solid fa-landmark" />,
                children_expanded: false,
                permission: [],
                children: [
                    {
                        name: 'Approval Logs',
                        icon: <i className="fa-solid fa-file-signature" />,
                        path: '/approval-logs',
                        match_path: 'approval-logs',
                        permission: ['approval-logs.view'],
                    },
                    {
                        name: 'Activity Logs',
                        icon: <i className="fa-solid fa-clock-rotate-left" />,
                        path: '/audits',
                        match_path: 'audits',
                        permission: ['activity_logs.view'],
                    },
                ],
            },

            // Regulatory Reporting
            {
                name: 'Regulatory Reporting',
                icon: <i className="fa-solid fa-building-columns" />,
                children_expanded: false,
                permission: [],
                children: [
                    {
                        name: 'Report Templates',
                        icon: <i className="fa-solid fa-file-lines" />,
                        path: '/regulatory-reports',
                        match_path: 'regulatory-reports',
                        permission: ['regulatory-reports.view'],
                    },
                    {
                        name: 'Reports',
                        icon: <i className="fa-solid fa-chart-column" />,
                        path: '/regulatory-reports/generated',
                        match_path: 'regulatory-reports/generated',
                        permission: ['regulatory-reports.view'],
                    },
                    {
                        name: 'Submissions',
                        icon: <i className="fa-solid fa-paper-plane" />,
                        path: '/regulatory-report-submissions',
                        match_path: 'regulatory-report-submissions',
                        permission: ['regulatory-report-submissions.view'],
                    },
                ],
            },
        ],
    },
];
