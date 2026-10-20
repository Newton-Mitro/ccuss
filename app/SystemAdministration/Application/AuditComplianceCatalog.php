<?php

namespace App\SystemAdministration\Application;

final class AuditComplianceCatalog
{
    public static function registers(): array
    {
        return [
            'audit-plans' => [
                'kind' => 'AUDIT_PLAN',
                'path' => 'audit-plans',
                'title' => 'Audit Plans',
                'singular' => 'Audit Plan',
                'area' => 'Internal Audit',
                'description' => 'Plan audit coverage, scope, and scheduled review work.',
            ],
            'audit-engagements' => [
                'kind' => 'AUDIT_ENGAGEMENT',
                'path' => 'audit-engagements',
                'title' => 'Audit Engagements',
                'singular' => 'Audit Engagement',
                'area' => 'Internal Audit',
                'description' => 'Coordinate audit assignments and fieldwork.',
            ],
            'audit-working-papers' => [
                'kind' => 'AUDIT_WORKING_PAPER',
                'path' => 'audit-working-papers',
                'title' => 'Working Papers',
                'singular' => 'Working Paper',
                'area' => 'Internal Audit',
                'description' => 'Track evidence and documentation collected during audit work.',
            ],
            'audit-findings' => [
                'kind' => 'AUDIT_FINDING',
                'path' => 'audit-findings',
                'title' => 'Audit Findings',
                'singular' => 'Audit Finding',
                'area' => 'Internal Audit',
                'description' => 'Record observations, risks, and recommendations from audits.',
            ],
            'audit-corrective-actions' => [
                'kind' => 'AUDIT_CORRECTIVE_ACTION',
                'path' => 'audit-corrective-actions',
                'title' => 'Corrective Actions',
                'singular' => 'Corrective Action',
                'area' => 'Internal Audit',
                'description' => 'Assign and track actions to resolve audit findings.',
            ],
            'audit-follow-ups' => [
                'kind' => 'AUDIT_FOLLOW_UP',
                'path' => 'audit-follow-ups',
                'title' => 'Audit Follow-ups',
                'singular' => 'Audit Follow-up',
                'area' => 'Internal Audit',
                'description' => 'Monitor the progress and closure of audit recommendations.',
            ],
            'compliance-requirements' => [
                'kind' => 'COMPLIANCE_REQUIREMENT',
                'path' => 'compliance-requirements',
                'title' => 'Requirements',
                'singular' => 'Compliance Requirement',
                'area' => 'Compliance',
                'description' => 'Maintain regulatory and internal compliance obligations.',
            ],
            'compliance-assessments' => [
                'kind' => 'COMPLIANCE_ASSESSMENT',
                'path' => 'compliance-assessments',
                'title' => 'Assessments',
                'singular' => 'Compliance Assessment',
                'area' => 'Compliance',
                'description' => 'Assess controls and evidence against compliance requirements.',
            ],
            'compliance-actions' => [
                'kind' => 'COMPLIANCE_ACTION',
                'path' => 'compliance-actions',
                'title' => 'Compliance Actions',
                'singular' => 'Compliance Action',
                'area' => 'Compliance',
                'description' => 'Track remediation and other compliance obligations.',
            ],
            'risks' => [
                'kind' => 'RISK',
                'path' => 'risks',
                'title' => 'Risk Register',
                'singular' => 'Risk',
                'area' => 'Risk Management',
                'description' => 'Identify and monitor operational, financial, and compliance risks.',
            ],
            'risk-assessments' => [
                'kind' => 'RISK_ASSESSMENT',
                'path' => 'risk-assessments',
                'title' => 'Risk Assessments',
                'singular' => 'Risk Assessment',
                'area' => 'Risk Management',
                'description' => 'Document risk likelihood, impact, and assessment outcomes.',
            ],
            'risk-mitigations' => [
                'kind' => 'RISK_MITIGATION',
                'path' => 'risk-mitigations',
                'title' => 'Risk Mitigations',
                'singular' => 'Risk Mitigation',
                'area' => 'Risk Management',
                'description' => 'Manage controls and mitigation activities for identified risks.',
            ],
            'regulatory-reports' => [
                'kind' => 'REGULATORY_TEMPLATE',
                'path' => 'regulatory-reports',
                'title' => 'Report Templates',
                'singular' => 'Report Template',
                'area' => 'Regulatory Reporting',
                'description' => 'Maintain regulatory reporting templates and instructions.',
            ],
            'regulatory-reports-generated' => [
                'kind' => 'REGULATORY_REPORT',
                'path' => 'regulatory-reports/generated',
                'permission' => 'regulatory-reports',
                'title' => 'Generated Reports',
                'singular' => 'Regulatory Report',
                'area' => 'Regulatory Reporting',
                'description' => 'Track generated regulatory reports and their review status.',
            ],
            'regulatory-report-submissions' => [
                'kind' => 'REGULATORY_SUBMISSION',
                'path' => 'regulatory-report-submissions',
                'title' => 'Submissions',
                'singular' => 'Report Submission',
                'area' => 'Regulatory Reporting',
                'description' => 'Record regulatory submissions, deadlines, and acknowledgements.',
            ],
        ];
    }

    public static function dashboards(): array
    {
        return [
            'internal-audit' => [
                'title' => 'Internal Audit',
                'description' => 'Plan and monitor audit work, findings, and follow-ups.',
                'area' => 'Internal Audit',
                'kinds' => [
                    'AUDIT_PLAN',
                    'AUDIT_ENGAGEMENT',
                    'AUDIT_WORKING_PAPER',
                    'AUDIT_FINDING',
                    'AUDIT_CORRECTIVE_ACTION',
                    'AUDIT_FOLLOW_UP',
                ],
                'registers' => [
                    'audit-plans',
                    'audit-engagements',
                    'audit-working-papers',
                    'audit-findings',
                    'audit-corrective-actions',
                    'audit-follow-ups',
                ],
            ],
            'compliance' => [
                'title' => 'Compliance Dashboard',
                'description' => 'Monitor obligations, assessments, and remediation work.',
                'area' => 'Compliance',
                'kinds' => [
                    'COMPLIANCE_REQUIREMENT',
                    'COMPLIANCE_ASSESSMENT',
                    'COMPLIANCE_ACTION',
                ],
                'registers' => [
                    'compliance-requirements',
                    'compliance-assessments',
                    'compliance-actions',
                ],
            ],
            'risk-management' => [
                'title' => 'Risk Management',
                'description' => 'Review the risk register, assessments, and mitigation plans.',
                'area' => 'Risk Management',
                'kinds' => ['RISK', 'RISK_ASSESSMENT', 'RISK_MITIGATION'],
                'registers' => ['risks', 'risk-assessments', 'risk-mitigations'],
            ],
        ];
    }

    public static function statuses(): array
    {
        return [
            'DRAFT',
            'PLANNED',
            'OPEN',
            'IN_PROGRESS',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'COMPLIANT',
            'NON_COMPLIANT',
            'MITIGATING',
            'SUBMITTED',
            'ACCEPTED',
            'COMPLETED',
            'CLOSED',
        ];
    }

    public static function priorities(): array
    {
        return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    }
}
