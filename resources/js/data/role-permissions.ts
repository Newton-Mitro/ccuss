// admin has full access
export const adminPermissions = [
    // Organization & Structure
    'organization.view',
    'organization.create',
    'organization.edit',
    'organization.delete',
    'branch.view',
    'branch.create',
    'branch.edit',
    'branch.delete',
    'user.view',
    'user.create',
    'user.edit',
    'user.delete',
    'role.view',
    'role.create',
    'role.edit',
    'role.delete',
    'permission.view',

    // Customers & Members
    'customer.view',
    'customer.create',
    'customer.edit',
    'customer.delete',
    'customer.address.view',
    'customer.address.create',
    'customer.address.edit',
    'customer.address.delete',
    'customer.family.view',
    'customer.family.create',
    'customer.family.edit',
    'customer.family.delete',
    'customer.signature.view',
    'customer.signature.upload',
    'customer.introducer.view',
    'customer.introducer.create',
    'customer.online_client.view',
    'member.view',
    'member.create',
    'member.edit',
    'member.delete',
    'member.documents.view',
    'member.nominee.view',
    'member.nominee.create',
    'member.nominee.edit',
    'member.nominee.delete',

    // Products
    'deposit_product.view',
    'deposit_product.create',
    'deposit_product.edit',
    'deposit_product.delete',
    'loan_product.view',
    'loan_product.create',
    'loan_product.edit',
    'loan_product.delete',
    'share_product.view',
    'share_product.create',
    'share_product.edit',
    'share_product.delete',

    // Accounts
    'account.view',
    'account.create',
    'account.edit',
    'account.delete',
    'account.statement.view',
    'account.joint_holder.view',
    'account.joint_holder.add',
    'account.joint_holder.remove',

    // Transactions
    'transaction.deposit.create',
    'transaction.withdraw.create',
    'transaction.transfer.create',
    'transaction.journal.create',
    'transaction.history.view',

    // Loans
    'loan.view',
    'loan.application.view',
    'loan.application.create',
    'loan.application.edit',
    'loan.application.approve',
    'loan.disbursement.create',
    'loan.repayment.create',
    'loan.schedule.view',
    'loan.penalty.view',
    'loan.penalty.apply',

    // Interest & Charges
    'deposit.interest.post',
    'loan.interest.post',
    'penalty.view',
    'penalty.apply',
    'service_charge.view',
    'service_charge.apply',

    // Cash & Teller
    'cash.tellers.view',
    'cash.tellers.create',
    'cash.drawers.view',
    'cash.transactions.create',
    'cash.transactions.view',
    'cash.balancing.view',
    'cash.petty.view',

    // Banking
    'bank.account.view',
    'bank.account.create',
    'bank.transfer.create',
    'bank.reconciliation.view',

    // Accounting / GL
    'ledger.view',
    'ledger.create',
    'ledger.edit',
    'ledger.delete',
    'voucher.view',
    'voucher.create',
    'voucher.approve',
    'voucher.post',
    'voucher.cancel',
    'trial_balance.view',
    'profit_loss.view',
    'balance_sheet.view',
    'cash_flow.view',
    'shareholders_equity.view',

    // Assets
    'fixed_asset.view',
    'fixed_asset.create',
    'fixed_asset.edit',
    'depreciation.view',
    'depreciation.post',

    // Payroll
    'employee.view',
    'employee.create',
    'payroll.process',
    'salary.payment.create',

    // Reports
    'report.member.view',
    'report.account.view',
    'report.loan.view',
    'report.financial.view',
    'report.cash.view',

    // Audit & Logs
    'audit_log.view',
    'activity_log.view',

    // Settings
    'system.setting.view',
    'system.setting.edit',
    'fiscal_year.view',
    'accounting_period.view',
    'report_template.view',
];

// teller role
export const tellerPermissions = [
    'cash.tellers.view',
    'cash.drawers.view',
    'cash.transactions.create',
    'cash.balancing.view',
    'cash.petty.view',
    'transaction.deposit.create',
    'transaction.withdraw.create',
    'transaction.transfer.create',
    'transaction.history.view',
];

// accountant / GL
export const accountantPermissions = [
    'ledger.view',
    'ledger.create',
    'ledger.edit',
    'ledger.delete',
    'voucher.view',
    'voucher.create',
    'voucher.approve',
    'voucher.post',
    'voucher.cancel',
    'trial_balance.view',
    'profit_loss.view',
    'balance_sheet.view',
    'cash_flow.view',
    'shareholders_equity.view',
    'deposit.interest.post',
    'loan.interest.post',
    'penalty.apply',
    'service_charge.apply',
];

// loan officer
export const loanOfficerPermissions = [
    'loan.application.create',
    'loan.application.view',
    'loan.application.edit',
    'loan.application.approve',
    'loan.disbursement.create',
    'loan.repayment.create',
    'loan.schedule.view',
    'loan.penalty.apply',
    'loan.penalty.view',
];

// customer service
export const customerServicePermissions = [
    'customer.view',
    'customer.create',
    'customer.edit',
    'customer.address.*',
    'customer.family.*',
    'customer.signature.*',
    'member.view',
    'member.create',
    'member.edit',
    'member.documents.view',
    'member.nominee.*',
];

// branch manager / supervisor
export const branchManagerPermissions = [
    'cash.tellers.view',
    'cash.drawers.view',
    'cash.balancing.view',
    'transaction.deposit.create',
    'transaction.withdraw.create',
    'transaction.transfer.create',
    'transaction.history.view',
    'voucher.approve',
    'loan.application.approve',
    'report.*',
];

// auditor / compliance
export const auditorPermissions = [
    'audit_log.view',
    'activity_log.view',
    'report.*',
    'ledger.view',
    'voucher.view',
    'trial_balance.view',
    'profit_loss.view',
    'balance_sheet.view',
];

// payroll officer
export const payrollPermissions = [
    'employee.view',
    'employee.create',
    'payroll.process',
    'salary.payment.create',
];

// IT / system admin
export const itAdminPermissions = [
    'system.setting.*',
    'report_template.*',
    'fiscal_year.*',
    'accounting_period.*',
    'user.*',
    'role.*',
    'permission.view',
];
