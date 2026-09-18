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
            new PermissionDefinition('branch_days', 'Open Branch Day', 'branch_days.open', 'open', 'Open a branch business day'),
            new PermissionDefinition('branch_days', 'Close Branch Day', 'branch_days.close', 'close', 'Close a branch business day'),
            new PermissionDefinition('cash_management', 'View Cash Management', 'cash_management.view', 'view', 'Access vaults, tellers, and teller sessions'),
            new PermissionDefinition('cash_management', 'Create Cash Management', 'cash_management.create', 'create', 'Create vaults and tellers'),
            new PermissionDefinition('cash_management', 'Update Cash Management', 'cash_management.update', 'update', 'Update vaults and tellers'),
            new PermissionDefinition('cash_management', 'Delete Cash Management', 'cash_management.delete', 'delete', 'Delete vaults and tellers'),
            new PermissionDefinition('cash_transactions', 'Create Cash Transactions', 'cash_transactions.create', 'create', 'Create cash receipts, payments, transfers, and adjustments'),
            new PermissionDefinition('cash_transactions', 'View Cash Transactions', 'cash_transactions.view', 'view', 'View cash receipts, payments, transfers, and adjustments'),
            new PermissionDefinition('cash_transactions', 'Post Cash Transactions', 'cash_transactions.post', 'post', 'Post cash transactions'),
            new PermissionDefinition('cash_transactions', 'Reverse Cash Transactions', 'cash_transactions.reverse', 'reverse', 'Reverse cash transactions'),
            new PermissionDefinition('cash_transfers', 'View Cash Transfers', 'cash_transfers.view', 'view', 'View cash transfers'),
            new PermissionDefinition('cash_transfers', 'Approve Cash Transfers', 'cash_transfers.approve', 'approve', 'Approve cash transfers'),
            new PermissionDefinition('cash_counts', 'View Cash Counts', 'cash_counts.view', 'view', 'View cash counts'),
            new PermissionDefinition('cash_counts', 'Create Cash Counts', 'cash_counts.create', 'create', 'Create cash counts'),
            new PermissionDefinition('cash_counts', 'Verify Cash Counts', 'cash_counts.verify', 'verify', 'Verify cash counts'),
            new PermissionDefinition('petty_cash', 'View Petty Cash', 'petty_cash.view', 'view', 'View petty cash accounts'),
            new PermissionDefinition('banking', 'View Banking', 'banking.view', 'view', 'View bank accounts'),
            new PermissionDefinition('banks', 'View Banks', 'banks.view', 'view', 'View bank records'),
            new PermissionDefinition('cheques', 'View Cheques', 'cheques.view', 'view', 'View cheque books and cheques'),
        ];
    }
}