<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class LoanPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition(
                module: 'loans',
                name: 'View Loans',
                slug: 'loans.view',
                action: 'view',
                description: 'View loan records',
            ),

            new PermissionDefinition(
                module: 'loans',
                name: 'Create Loan',
                slug: 'loans.create',
                action: 'create',
                description: 'Create new loans',
            ),

            new PermissionDefinition(
                module: 'loans',
                name: 'Update Loan',
                slug: 'loans.update',
                action: 'update',
                description: 'Update loan information',
            ),

            new PermissionDefinition(
                module: 'loans',
                name: 'Delete Loan',
                slug: 'loans.delete',
                action: 'delete',
                description: 'Delete loan records',
            ),

            new PermissionDefinition(
                module: 'loans',
                name: 'Approve Loan',
                slug: 'loans.approve',
                action: 'approve',
                description: 'Approve loan applications',
            ),

            new PermissionDefinition(
                module: 'loans',
                name: 'Disburse Loan',
                slug: 'loans.disburse',
                action: 'disburse',
                description: 'Disburse approved loans',
            ),

            new PermissionDefinition(
                module: 'loans',
                name: 'Close Loan',
                slug: 'loans.close',
                action: 'close',
                description: 'Close loan accounts',
            ),
        ];
    }
}