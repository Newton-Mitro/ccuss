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
            new PermissionDefinition('cash_transfers', 'Create Cash Transfers', 'cash_transfers.create', 'create', 'Create cash transfers'),
            new PermissionDefinition('cash_transfers', 'Approve Cash Transfers', 'cash_transfers.approve', 'approve', 'Approve cash transfers'),
            new PermissionDefinition('cash_transfers', 'Complete Cash Transfers', 'cash_transfers.complete', 'complete', 'Complete approved cash transfers'),
            new PermissionDefinition('cash_transfers', 'Cancel Cash Transfers', 'cash_transfers.cancel', 'cancel', 'Cancel pending cash transfers'),
            new PermissionDefinition('cash_counts', 'View Cash Counts', 'cash_counts.view', 'view', 'View cash counts'),
            new PermissionDefinition('cash_counts', 'Create Cash Counts', 'cash_counts.create', 'create', 'Create cash counts'),
            new PermissionDefinition('cash_counts', 'Verify Cash Counts', 'cash_counts.verify', 'verify', 'Verify cash counts'),
            new PermissionDefinition('teller_sessions', 'View Teller Sessions', 'teller_sessions.view', 'view', 'View teller sessions'),
            new PermissionDefinition('teller_sessions', 'Open Teller Sessions', 'teller_sessions.open', 'open', 'Open teller sessions'),
            new PermissionDefinition('teller_sessions', 'Close Teller Sessions', 'teller_sessions.close', 'close', 'Close teller sessions'),
            new PermissionDefinition('petty_cash', 'View Petty Cash', 'petty_cash.view', 'view', 'View petty cash accounts'),
            new PermissionDefinition('petty_cash', 'Create Petty Cash Funds', 'petty_cash.create', 'create', 'Create petty cash funds'),
            new PermissionDefinition('petty_cash', 'Record Petty Cash Expense', 'petty_cash.expense', 'expense', 'Record petty cash expenses'),
            new PermissionDefinition('petty_cash', 'Replenish Petty Cash', 'petty_cash.replenish', 'replenish', 'Replenish petty cash funds'),
            new PermissionDefinition('petty_cash', 'Close Petty Cash Fund', 'petty_cash.close', 'close', 'Close petty cash funds'),
            new PermissionDefinition('banking', 'View Banking', 'banking.view', 'view', 'View bank accounts'),
            new PermissionDefinition('banks', 'View Banks', 'banks.view', 'view', 'View bank records'),
            new PermissionDefinition('banks', 'Create Banks', 'banks.create', 'create', 'Create bank records'),
            new PermissionDefinition('banks', 'Update Banks', 'banks.update', 'update', 'Update bank records'),
            new PermissionDefinition('banks', 'Delete Banks', 'banks.delete', 'delete', 'Delete bank records'),
            new PermissionDefinition('bank_accounts', 'View Bank Accounts', 'bank_accounts.view', 'view', 'View bank accounts'),
            new PermissionDefinition('bank_accounts', 'Create Bank Accounts', 'bank_accounts.create', 'create', 'Create bank accounts'),
            new PermissionDefinition('bank_accounts', 'Update Bank Accounts', 'bank_accounts.update', 'update', 'Update bank accounts'),
            new PermissionDefinition('bank_accounts', 'Delete Bank Accounts', 'bank_accounts.delete', 'delete', 'Delete bank accounts'),
            new PermissionDefinition('bank_transactions', 'View Bank Transactions', 'bank_transactions.view', 'view', 'View bank transactions'),
            new PermissionDefinition('bank_transactions', 'Create Bank Transactions', 'bank_transactions.create', 'create', 'Create bank transactions'),
            new PermissionDefinition('bank_reconciliation', 'View Bank Reconciliation', 'bank_reconciliation.view', 'view', 'View bank reconciliations'),
            new PermissionDefinition('bank_reconciliation', 'Complete Bank Reconciliation', 'bank_reconciliation.complete', 'complete', 'Complete bank reconciliations'),
            new PermissionDefinition('cheques', 'View Cheques', 'cheques.view', 'view', 'View cheque books and cheques'),
            new PermissionDefinition('cheques', 'Issue Cheques', 'cheques.issue', 'issue', 'Issue cheques'),
            new PermissionDefinition('cheques', 'Present Cheques', 'cheques.present', 'present', 'Present cheques'),
            new PermissionDefinition('cheques', 'Clear Cheques', 'cheques.clear', 'clear', 'Clear cheques'),
            new PermissionDefinition('cheques', 'Bounce Cheques', 'cheques.bounce', 'bounce', 'Mark cheques as bounced'),
            new PermissionDefinition('cheques', 'Stop Cheques', 'cheques.stop', 'stop', 'Stop cheque payments'),
            new PermissionDefinition('cheques', 'Cancel Cheques', 'cheques.cancel', 'cancel', 'Cancel cheques'),
            new PermissionDefinition('cheque_books', 'View Cheque Books', 'cheque_books.view', 'view', 'View cheque books'),
            new PermissionDefinition('cheque_books', 'Create Cheque Books', 'cheque_books.create', 'create', 'Create cheque books'),
            new PermissionDefinition('cheque_books', 'Update Cheque Books', 'cheque_books.update', 'update', 'Update cheque books'),
            new PermissionDefinition('cheque_books', 'Delete Cheque Books', 'cheque_books.delete', 'delete', 'Delete cheque books'),
        ];
    }
}