<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;
use App\SystemAdministration\Application\AuditComplianceCatalog;

final class AuditCompliancePermissions
{
    public static function definitions(): array
    {
        $definitions = [
            new PermissionDefinition(
                module: 'Internal Audit',
                name: 'View Internal Audit Dashboard',
                slug: 'internal-audit.view',
                action: 'view',
                description: 'View internal audit portfolio and activity',
            ),
            new PermissionDefinition(
                module: 'Compliance',
                name: 'View Compliance Dashboard',
                slug: 'compliance.view',
                action: 'view',
                description: 'View compliance portfolio and activity',
            ),
            new PermissionDefinition(
                module: 'Risk Management',
                name: 'View Risk Management Dashboard',
                slug: 'risk-management.view',
                action: 'view',
                description: 'View risk portfolio and activity',
            ),
            new PermissionDefinition(
                module: 'Governance',
                name: 'View Approval Logs',
                slug: 'approval-logs.view',
                action: 'view',
                description: 'View recorded approval and submission decisions',
            ),
        ];

        $seen = [];

        foreach (AuditComplianceCatalog::registers() as $routeName => $register) {
            $permissionPrefix = $register['permission'] ?? $routeName;
            $module = $register['area'].' · '.$register['title'];

            foreach ([
                'view' => 'View',
                'create' => 'Create',
                'update' => 'Update',
                'delete' => 'Archive',
            ] as $action => $label) {
                $slug = "{$permissionPrefix}.{$action}";
                if (isset($seen[$slug])) {
                    continue;
                }

                $seen[$slug] = true;
                $definitions[] = new PermissionDefinition(
                    module: $module,
                    name: "{$label} {$register['singular']}",
                    slug: $slug,
                    action: $action,
                    description: "{$label} {$register['singular']} records",
                );
            }
        }

        return $definitions;
    }
}
