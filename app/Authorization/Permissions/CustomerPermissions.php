<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class CustomerPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition(
                module: 'customers',
                name: 'View Customers',
                slug: 'customers.view',
                action: 'view',
                description: 'View customer records',
            ),

            new PermissionDefinition(
                module: 'customers',
                name: 'Create Customer',
                slug: 'customers.create',
                action: 'create',
                description: 'Create new customer records',
            ),

            new PermissionDefinition(
                module: 'customers',
                name: 'Update Customer',
                slug: 'customers.update',
                action: 'update',
                description: 'Update customer records',
            ),

            new PermissionDefinition(
                module: 'customers',
                name: 'Delete Customer',
                slug: 'customers.delete',
                action: 'delete',
                description: 'Delete customer records',
            ),
        ];
    }
}