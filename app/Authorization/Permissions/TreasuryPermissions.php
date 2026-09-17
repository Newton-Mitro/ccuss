<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class TreasuryPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition('treasury', 'View Treasury', 'treasury.view', 'view', 'Access treasury and cash operations'),
            new PermissionDefinition('branch_days', 'View Branch Days', 'branch_days.view', 'view', 'View branch business days'),
            new PermissionDefinition('cash_management', 'View Cash Management', 'cash_management.view', 'view', 'Access vaults, tellers, and teller sessions'),
            new PermissionDefinition('cash_transactions', 'Create Cash Transactions', 'cash_transactions.create', 'create', 'Create cash receipts, payments, transfers, and adjustments'),
            new PermissionDefinition('petty_cash', 'View Petty Cash', 'petty_cash.view', 'view', 'View petty cash accounts'),
            new PermissionDefinition('banking', 'View Banking', 'banking.view', 'view', 'View bank accounts'),
            new PermissionDefinition('banks', 'View Banks', 'banks.view', 'view', 'View bank records'),
            new PermissionDefinition('cheques', 'View Cheques', 'cheques.view', 'view', 'View cheque books and cheques'),
        ];
    }
}