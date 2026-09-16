<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class GeneralAccountingPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition('accounting', 'View Accounting', 'accounting.view', 'view', 'Access General Accounting'),
            new PermissionDefinition('accounting_coa', 'View Chart of Accounts', 'accounting.coa.view', 'view', 'View account groups and ledger accounts'),
            new PermissionDefinition('accounting_coa', 'Create Chart Account', 'accounting.coa.create', 'create', 'Create account groups and ledger accounts'),
            new PermissionDefinition('accounting_coa', 'Update Chart Account', 'accounting.coa.update', 'update', 'Update account groups and ledger accounts'),
            new PermissionDefinition('accounting_coa', 'Delete Chart Account', 'accounting.coa.delete', 'delete', 'Delete account groups and ledger accounts'),
            new PermissionDefinition('accounting_cost_centers', 'View Cost Centers', 'accounting.cost_centers.view', 'view', 'View cost centers'),
            new PermissionDefinition('accounting_cost_centers', 'Create Cost Centers', 'accounting.cost_centers.create', 'create', 'Create cost centers'),
            new PermissionDefinition('accounting_cost_centers', 'Update Cost Centers', 'accounting.cost_centers.update', 'update', 'Update cost centers'),
            new PermissionDefinition('accounting_cost_centers', 'Delete Cost Centers', 'accounting.cost_centers.delete', 'delete', 'Delete cost centers'),
            new PermissionDefinition('accounting_fiscal_year', 'View Fiscal Years', 'settings.fiscal_year.view', 'view', 'View fiscal years'),
            new PermissionDefinition('accounting_fiscal_year', 'Create Fiscal Year', 'settings.fiscal_year.create', 'create', 'Create fiscal years'),
            new PermissionDefinition('accounting_fiscal_year', 'Update Fiscal Year', 'settings.fiscal_year.update', 'update', 'Update fiscal years'),
            new PermissionDefinition('accounting_fiscal_year', 'Delete Fiscal Year', 'settings.fiscal_year.delete', 'delete', 'Delete fiscal years'),
            new PermissionDefinition('accounting_fiscal_year', 'Close Fiscal Year', 'accounting.year_end.close', 'close', 'Close fiscal years'),
            new PermissionDefinition('accounting_fiscal_period', 'View Fiscal Periods', 'settings.fiscal.view', 'view', 'View fiscal periods'),
            new PermissionDefinition('accounting_fiscal_period', 'Create Fiscal Period', 'settings.fiscal.create', 'create', 'Create fiscal periods'),
            new PermissionDefinition('accounting_fiscal_period', 'Update Fiscal Period', 'settings.fiscal.update', 'update', 'Update fiscal periods'),
            new PermissionDefinition('accounting_fiscal_period', 'Delete Fiscal Period', 'settings.fiscal.delete', 'delete', 'Delete fiscal periods'),
            new PermissionDefinition('accounting_period_end', 'Close Fiscal Period', 'accounting.period_end.close', 'close', 'Close fiscal periods'),
            new PermissionDefinition('accounting_period_end', 'Reopen Fiscal Period', 'accounting.period_end.reopen', 'reopen', 'Reopen fiscal periods'),
            new PermissionDefinition('accounting_voucher', 'View Vouchers', 'accounting.voucher_entries.view', 'view', 'View vouchers'),
            new PermissionDefinition('accounting_voucher', 'View Voucher Entry', 'accounting.voucher.view', 'view', 'Access voucher entry'),
            new PermissionDefinition('accounting_voucher', 'View Journal Vouchers', 'accounting.voucher.journal.view', 'view', 'Create journal vouchers'),
            new PermissionDefinition('accounting_voucher', 'View Payment Vouchers', 'accounting.voucher.payment.view', 'view', 'Create payment vouchers'),
            new PermissionDefinition('accounting_voucher', 'View Receipt Vouchers', 'accounting.voucher.receipt.view', 'view', 'Create receipt vouchers'),
            new PermissionDefinition('accounting_voucher', 'View Contra Vouchers', 'accounting.voucher.contra.view', 'view', 'Create contra vouchers'),
            new PermissionDefinition('accounting_voucher', 'View Adjustment Vouchers', 'accounting.voucher.adjustment.view', 'view', 'Create adjustment vouchers'),
            new PermissionDefinition('accounting_voucher', 'View Opening Vouchers', 'accounting.voucher.opening.view', 'view', 'Create opening vouchers'),
            new PermissionDefinition('accounting_voucher', 'Create Vouchers', 'accounting.voucher.create', 'create', 'Create vouchers'),
            new PermissionDefinition('accounting_voucher', 'Update Vouchers', 'accounting.voucher.update', 'update', 'Update draft vouchers'),
            new PermissionDefinition('accounting_voucher', 'Post Vouchers', 'accounting.voucher.post', 'post', 'Post draft vouchers'),
            new PermissionDefinition('accounting_voucher', 'Cancel Vouchers', 'accounting.voucher.cancel', 'cancel', 'Cancel draft vouchers'),
            new PermissionDefinition('accounting_voucher', 'Reverse Vouchers', 'accounting.voucher.reverse', 'reverse', 'Reverse posted vouchers'),
            new PermissionDefinition('accounting_opening_balances', 'View Opening Balances', 'accounting.opening_balances.view', 'view', 'View opening balances'),
            new PermissionDefinition('accounting_opening_balances', 'Create Opening Balances', 'accounting.opening_balances.create', 'create', 'Apply opening balances'),
            new PermissionDefinition('accounting_reports', 'View Reports', 'accounting.reports.view', 'view', 'Access financial reports'),
            new PermissionDefinition('accounting_reports', 'View Trial Balance', 'accounting.trial.view', 'view', 'View trial balance'),
            new PermissionDefinition('accounting_reports', 'View General Ledger', 'accounting.general_ledger.view', 'view', 'View general ledger'),
            new PermissionDefinition('accounting_reports', 'View Account Statements', 'accounting.account_statement.view', 'view', 'View account statements'),
            new PermissionDefinition('accounting_reports', 'View Day Book', 'accounting.day_book.view', 'view', 'View day book'),
            new PermissionDefinition('accounting_reports', 'View Profit and Loss', 'accounting.profit_loss.view', 'view', 'View profit and loss'),
            new PermissionDefinition('accounting_reports', 'View Balance Sheet', 'accounting.balance_sheet.view', 'view', 'View balance sheet'),
            new PermissionDefinition('accounting_reports', 'View Shareholders Equity', 'accounting.shareholders-equity.view', 'view', 'View shareholders equity'),
            new PermissionDefinition('accounting_reports', 'View Cash Flow', 'accounting.cash_flow.view', 'view', 'View cash flow statement'),
            new PermissionDefinition('accounting_budgets', 'View Budgets', 'accounting.budgets.view', 'view', 'View budgets'),
            new PermissionDefinition('accounting_budgets', 'Create Budgets', 'accounting.budgets.create', 'create', 'Create budgets'),
            new PermissionDefinition('accounting_budgets', 'Update Budgets', 'accounting.budgets.update', 'update', 'Update draft budgets'),
            new PermissionDefinition('accounting_budgets', 'Delete Budgets', 'accounting.budgets.delete', 'delete', 'Delete draft budgets'),
            new PermissionDefinition('accounting_budgets', 'Activate Budgets', 'accounting.budgets.activate', 'activate', 'Activate budgets'),
            new PermissionDefinition('accounting_budgets', 'Close Budgets', 'accounting.budgets.close', 'close', 'Close active budgets'),
            new PermissionDefinition('accounting_budgets', 'View Budget Entries', 'accounting.budget_entries.view', 'view', 'View budget entries'),
            new PermissionDefinition('accounting_budgets', 'View Budget vs Actual', 'accounting.budgets.report', 'report', 'View budget versus actual reports'),
            new PermissionDefinition('accounting_period_end', 'View Period-End Operations', 'accounting.period_end.view', 'view', 'Access period-end operations'),
        ];
    }
}
