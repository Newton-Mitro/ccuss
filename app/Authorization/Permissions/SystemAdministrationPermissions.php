<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class SystemAdministrationPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition(
                module: 'users',
                name: 'View Users',
                slug: 'users.view',
                action: 'view',
                description: 'View user records',
            ),

            new PermissionDefinition(
                module: 'users',
                name: 'Create User',
                slug: 'users.create',
                action: 'create',
                description: 'Create new users',
            ),

            new PermissionDefinition(
                module: 'users',
                name: 'Update User',
                slug: 'users.update',
                action: 'update',
                description: 'Update user records',
            ),

            new PermissionDefinition(
                module: 'users',
                name: 'Delete User',
                slug: 'users.delete',
                action: 'delete',
                description: 'Delete user records',
            ),

            new PermissionDefinition(
                module: 'users',
                name: 'Search Users',
                slug: 'users.search',
                action: 'search',
                description: 'Search user records',
            ),

            new PermissionDefinition(
                module: 'role_permissions',
                name: 'View Role Permissions',
                slug: 'role_permissions.view',
                action: 'view',
                description: 'View role permission assignments',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'role_permissions',
                name: 'Update Role Permissions',
                slug: 'role_permissions.update',
                action: 'update',
                description: 'Update role permission assignments',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'activity_logs',
                name: 'View Activity Logs',
                slug: 'activity_logs.view',
                action: 'view',
                description: 'View system activity logs',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'database_backups',
                name: 'View Database Backups',
                slug: 'database_backups.view',
                action: 'view',
                description: 'View database backup history',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'database_backups',
                name: 'Delete Database Backup',
                slug: 'database_backups.delete',
                action: 'delete',
                description: 'Delete database backup records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'organizations',
                name: 'View Organizations',
                slug: 'organizations.view',
                action: 'view',
                description: 'View organization records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'organizations',
                name: 'Create Organization',
                slug: 'organizations.create',
                action: 'create',
                description: 'Create new organizations',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'organizations',
                name: 'Update Organization',
                slug: 'organizations.update',
                action: 'update',
                description: 'Update organization records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'organizations',
                name: 'Delete Organization',
                slug: 'organizations.delete',
                action: 'delete',
                description: 'Delete organization records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'branches',
                name: 'View Branches',
                slug: 'branches.view',
                action: 'view',
                description: 'View branch records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'branches',
                name: 'Create Branch',
                slug: 'branches.create',
                action: 'create',
                description: 'Create new branches',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'branches',
                name: 'Update Branch',
                slug: 'branches.update',
                action: 'update',
                description: 'Update branch records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'branches',
                name: 'Delete Branch',
                slug: 'branches.delete',
                action: 'delete',
                description: 'Delete branch records',
                forAdmin: true,
            ),
        ];
    }
}