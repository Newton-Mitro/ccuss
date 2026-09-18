<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class SystemAdministrationPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition(
                module: 'Users',
                name: 'View Users',
                slug: 'users.view',
                action: 'view',
                description: 'View user records',
            ),

            new PermissionDefinition(
                module: 'Users',
                name: 'Create User',
                slug: 'users.create',
                action: 'create',
                description: 'Create new users',
            ),

            new PermissionDefinition(
                module: 'Users',
                name: 'Update User',
                slug: 'users.update',
                action: 'update',
                description: 'Update user records',
            ),

            new PermissionDefinition(
                module: 'Users',
                name: 'Delete User',
                slug: 'users.delete',
                action: 'delete',
                description: 'Delete user records',
            ),

            new PermissionDefinition(
                module: 'Users',
                name: 'Search Users',
                slug: 'users.search',
                action: 'search',
                description: 'Search user records',
            ),

            new PermissionDefinition(
                module: 'Role Permissions',
                name: 'View Role Permissions',
                slug: 'role_permissions.view',
                action: 'view',
                description: 'View role permission assignments',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Role Permissions',
                name: 'Update Role Permissions',
                slug: 'role_permissions.update',
                action: 'update',
                description: 'Update role permission assignments',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Activity Logs',
                name: 'View Activity Logs',
                slug: 'activity_logs.view',
                action: 'view',
                description: 'View system activity logs',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Database Backups',
                name: 'View Database Backups',
                slug: 'database_backups.view',
                action: 'view',
                description: 'View database backup history',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Database Backups',
                name: 'Delete Database Backup',
                slug: 'database_backups.delete',
                action: 'delete',
                description: 'Delete database backup records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Organizations',
                name: 'View Organizations',
                slug: 'organizations.view',
                action: 'view',
                description: 'View organization records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Organizations',
                name: 'Update Organization',
                slug: 'organizations.update',
                action: 'update',
                description: 'Update organization records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Branches',
                name: 'View Branches',
                slug: 'branches.view',
                action: 'view',
                description: 'View branch records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Branches',
                name: 'Create Branch',
                slug: 'branches.create',
                action: 'create',
                description: 'Create new branches',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Branches',
                name: 'Update Branch',
                slug: 'branches.update',
                action: 'update',
                description: 'Update branch records',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'Branches',
                name: 'Delete Branch',
                slug: 'branches.delete',
                action: 'delete',
                description: 'Delete branch records',
                forAdmin: true,
            ),
        ];
    }
}