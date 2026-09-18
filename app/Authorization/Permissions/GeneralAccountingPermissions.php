<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class GeneralAccountingPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition('Accounting', 'View Accounting', 'accounting.view', 'view', 'Access General Accounting'),
            new PermissionDefinition('Accounting COA', 'View Chart of Accounts', 'accounting.coa.view', 'view', 'View account groups and ledger accounts'),
            new PermissionDefinition('Accounting COA', 'Create Chart Account', 'accounting.coa.create', 'create', 'Create account groups and ledger accounts'),
            new PermissionDefinition('Accounting COA', 'Update Chart Account', 'accounting.coa.update', 'update', 'Update account groups and ledger accounts'),
            new PermissionDefinition('Accounting COA', 'Delete Chart Account', 'accounting.coa.delete', 'delete', 'Delete account groups and ledger accounts'),
            new PermissionDefinition('Accounting Cost Centers', 'View Cost Centers', 'accounting.cost_centers.view', 'view', 'View cost centers'),
            new PermissionDefinition('Accounting Cost Centers', 'Create Cost Centers', 'accounting.cost_centers.create', 'create', 'Create cost centers'),
            new PermissionDefinition('Accounting Cost Centers', 'Update Cost Centers', 'accounting.cost_centers.update', 'update', 'Update cost centers'),
            new PermissionDefinition('Accounting Cost Centers', 'Delete Cost Centers', 'accounting.cost_centers.delete', 'delete', 'Delete cost centers'),
            new PermissionDefinition('Accounting Fiscal Year', 'View Fiscal Years', 'settings.fiscal_year.view', 'view', 'View fiscal years'),
            new PermissionDefinition('Accounting Fiscal Year', 'Create Fiscal Year', 'settings.fiscal_year.create', 'create', 'Create fiscal years'),
            new PermissionDefinition('Accounting Fiscal Year', 'Update Fiscal Year', 'settings.fiscal_year.update', 'update', 'Update fiscal years'),
            new PermissionDefinition('Accounting Fiscal Year', 'Delete Fiscal Year', 'settings.fiscal_year.delete', 'delete', 'Delete fiscal years'),
            new PermissionDefinition('Accounting Fiscal Year', 'Close Fiscal Year', 'accounting.year_end.close', 'close', 'Close fiscal years'),
            new PermissionDefinition('Accounting Fiscal Period', 'View Fiscal Periods', 'settings.fiscal.view', 'view', 'View fiscal periods'),
            new PermissionDefinition('Accounting Fiscal Period', 'Create Fiscal Period', 'settings.fiscal.create', 'create', 'Create fiscal periods'),
            new PermissionDefinition('Accounting Fiscal Period', 'Update Fiscal Period', 'settings.fiscal.update', 'update', 'Update fiscal periods'),
            new PermissionDefinition('Accounting Fiscal Period', 'Delete Fiscal Period', 'settings.fiscal.delete', 'delete', 'Delete fiscal periods'),
            new PermissionDefinition('Accounting Period End', 'Close Fiscal Period', 'accounting.period_end.close', 'close', 'Close fiscal periods'),
            new PermissionDefinition('Accounting Period End', 'Reopen Fiscal Period', 'accounting.period_end.reopen', 'reopen', 'Reopen fiscal periods'),
            new PermissionDefinition('Accounting Voucher', 'View Vouchers', 'accounting.voucher_entries.view', 'view', 'View vouchers'),
            new PermissionDefinition('Accounting Voucher', 'View Voucher Entry', 'accounting.voucher.view', 'view', 'Access voucher entry'),
            new PermissionDefinition('Accounting Voucher', 'View Journal Vouchers', 'accounting.voucher.journal.view', 'view', 'Create journal vouchers'),
            new PermissionDefinition('Accounting Voucher', 'View Payment Vouchers', 'accounting.voucher.payment.view', 'view', 'Create payment vouchers'),
            new PermissionDefinition('Accounting Voucher', 'View Receipt Vouchers', 'accounting.voucher.receipt.view', 'view', 'Create receipt vouchers'),
            new PermissionDefinition('Accounting Voucher', 'View Contra Vouchers', 'accounting.voucher.contra.view', 'view', 'Create contra vouchers'),
            new PermissionDefinition('Accounting Voucher', 'View Adjustment Vouchers', 'accounting.voucher.adjustment.view', 'view', 'Create adjustment vouchers'),
            new PermissionDefinition('Accounting Voucher', 'View Opening Vouchers', 'accounting.voucher.opening.view', 'view', 'Create opening vouchers'),
            new PermissionDefinition('Accounting Voucher', 'Create Vouchers', 'accounting.voucher.create', 'create', 'Create vouchers'),
            new PermissionDefinition('Accounting Voucher', 'Update Vouchers', 'accounting.voucher.update', 'update', 'Update draft vouchers'),
            new PermissionDefinition('Accounting Voucher', 'Post Vouchers', 'accounting.voucher.post', 'post', 'Post draft vouchers'),
            new PermissionDefinition('Accounting Voucher', 'Cancel Vouchers', 'accounting.voucher.cancel', 'cancel', 'Cancel draft vouchers'),
            new PermissionDefinition('Accounting Voucher', 'Reverse Vouchers', 'accounting.voucher.reverse', 'reverse', 'Reverse posted vouchers'),
            new PermissionDefinition('Accounting Opening Balances', 'View Opening Balances', 'accounting.opening_balances.view', 'view', 'View opening balances'),
            new PermissionDefinition('Accounting Opening Balances', 'Create Opening Balances', 'accounting.opening_balances.create', 'create', 'Apply opening balances'),
            new PermissionDefinition('Accounting Reports', 'View Reports', 'accounting.reports.view', 'view', 'Access financial reports'),
            new PermissionDefinition('Accounting Reports', 'View Trial Balance', 'accounting.trial.view', 'view', 'View trial balance'),
            new PermissionDefinition('Accounting Reports', 'View General Ledger', 'accounting.general_ledger.view', 'view', 'View general ledger'),
            new PermissionDefinition('Accounting Reports', 'View Account Statements', 'accounting.account_statement.view', 'view', 'View account statements'),
            new PermissionDefinition('Accounting Reports', 'View Day Book', 'accounting.day_book.view', 'view', 'View day book'),
            new PermissionDefinition('Accounting Reports', 'View Profit and Loss', 'accounting.profit_loss.view', 'view', 'View profit and loss'),
            new PermissionDefinition('Accounting Reports', 'View Balance Sheet', 'accounting.balance_sheet.view', 'view', 'View balance sheet'),
            new PermissionDefinition('Accounting Reports', 'View Shareholders Equity', 'accounting.shareholders-equity.view', 'view', 'View shareholders equity'),
            new PermissionDefinition('Accounting Reports', 'View Cash Flow', 'accounting.cash_flow.view', 'view', 'View cash flow statement'),
            new PermissionDefinition('Accounting Budgets', 'View Budgets', 'accounting.budgets.view', 'view', 'View budgets'),
            new PermissionDefinition('Accounting Budgets', 'Create Budgets', 'accounting.budgets.create', 'create', 'Create budgets'),
            new PermissionDefinition('Accounting Budgets', 'Update Budgets', 'accounting.budgets.update', 'update', 'Update draft budgets'),
            new PermissionDefinition('Accounting Budgets', 'Delete Budgets', 'accounting.budgets.delete', 'delete', 'Delete draft budgets'),
            new PermissionDefinition('Accounting Budgets', 'Activate Budgets', 'accounting.budgets.activate', 'activate', 'Activate budgets'),
            new PermissionDefinition('Accounting Budgets', 'Close Budgets', 'accounting.budgets.close', 'close', 'Close active budgets'),
            new PermissionDefinition('Accounting Budgets', 'View Budget Entries', 'accounting.budget_entries.view', 'view', 'View budget entries'),
            new PermissionDefinition('Accounting Budgets', 'View Budget vs Actual', 'accounting.budgets.report', 'report', 'View budget versus actual reports'),
            new PermissionDefinition('Accounting Period End', 'View Period-End Operations', 'accounting.period_end.view', 'view', 'Access period-end operations'),
        ];
    }
}
