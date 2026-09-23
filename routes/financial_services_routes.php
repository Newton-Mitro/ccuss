<?php

use App\FinancialServices\Controllers\FinancialProductController;
use App\FinancialServices\Controllers\FinancialAccountController;
use App\FinancialServices\Controllers\FinancialTransactionController;
use App\FinancialServices\Controllers\FinancialProductPolicyController;
use App\FinancialServices\Controllers\FinancialReportController;
use App\FinancialServices\Controllers\LoanApplicationController;
use App\FinancialServices\Controllers\AccountDefaultRuleController;
use App\FinancialServices\Controllers\AccountFineController;
use App\FinancialServices\Controllers\InterestProvisionController;
use App\FinancialServices\Controllers\DividendController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::resource('financial-products', FinancialProductController::class)
        ->except(['create', 'show'])
        ->names([
            'index' => 'financial-products.index',
            'store' => 'financial-products.store',
            'edit' => 'financial-products.edit',
            'update' => 'financial-products.update',
            'destroy' => 'financial-products.destroy',
        ]);

    Route::get('/financial-products/create', [FinancialProductController::class, 'create'])
        ->name('financial-products.create');
    Route::get('/financial-products/{financial_product}', [FinancialProductController::class, 'show'])
        ->name('financial-products.show');
    Route::post('/financial-products/{financial_product}/account-mappings', [FinancialProductController::class, 'storeMapping'])
        ->name('financial-products.account-mappings.store');
    Route::put('/financial-products/{financial_product}/account-mappings/{mapping}', [FinancialProductController::class, 'updateMapping'])
        ->name('financial-products.account-mappings.update');
    Route::delete('/financial-products/{financial_product}/account-mappings/{mapping}', [FinancialProductController::class, 'destroyMapping'])
        ->name('financial-products.account-mappings.destroy');
    Route::get('/financial-product-policies', [FinancialProductPolicyController::class, 'index'])
        ->name('financial-product-policies.index');
    Route::get('/financial-products/{financial_product}/policy/edit', [FinancialProductPolicyController::class, 'edit'])
        ->name('financial-product-policies.edit');
    Route::post('/financial-products/{financial_product}/policy', [FinancialProductPolicyController::class, 'store'])
        ->name('financial-product-policies.store');
    Route::get('/account-default-rules', [AccountDefaultRuleController::class, 'index'])->name('account-default-rules.index');
    Route::post('/account-default-rules', [AccountDefaultRuleController::class, 'store'])->name('account-default-rules.store');
    Route::put('/account-default-rules/{account_default_rule}', [AccountDefaultRuleController::class, 'update'])->name('account-default-rules.update');
    Route::delete('/account-default-rules/{account_default_rule}', [AccountDefaultRuleController::class, 'destroy'])->name('account-default-rules.destroy');
    Route::get('/interest-provisions', [InterestProvisionController::class, 'index'])->name('interest-provisions.index');
    Route::post('/interest-provisions/calculate', [InterestProvisionController::class, 'calculate'])->name('interest-provisions.calculate');
    Route::post('/interest-provisions/{interest_provision}/approve', [InterestProvisionController::class, 'approve'])->name('interest-provisions.approve');
    Route::post('/interest-provisions/{interest_provision}/reject', [InterestProvisionController::class, 'reject'])->name('interest-provisions.reject');
    Route::post('/interest-provisions/{interest_provision}/post', [InterestProvisionController::class, 'post'])->name('interest-provisions.post');
    Route::get('/dividends', [DividendController::class, 'index'])->name('dividends.index');
    Route::post('/dividends', [DividendController::class, 'store'])->name('dividends.store');
    Route::post('/dividends/{share_dividend_declaration}/calculate', [DividendController::class, 'calculate'])->name('dividends.calculate');
    Route::post('/dividends/{share_dividend_declaration}/approve', [DividendController::class, 'approve'])->name('dividends.approve');
    Route::post('/dividend-allocations/{share_dividend_allocation}/post', [DividendController::class, 'post'])->name('dividend-allocations.post');
    Route::get('/account-fines', [AccountFineController::class, 'index'])->name('account-fines.index');
    Route::post('/account-fines/{account_fine}/waive', [AccountFineController::class, 'waive'])->name('account-fines.waive');

    Route::get('/financial-accounts', [FinancialAccountController::class, 'index'])->name('financial-accounts.index');
    Route::get('/financial-accounts/category/{category}', [FinancialAccountController::class, 'categoryIndex'])
        ->where('category', 'SAVINGS|SHARE|FIXED_DEPOSIT|RECURRING_DEPOSIT|LOAN')
        ->name('financial-accounts.category');
    Route::get('/financial-accounts/create', [FinancialAccountController::class, 'create'])->name('financial-accounts.create');
    Route::post('/financial-accounts', [FinancialAccountController::class, 'store'])->name('financial-accounts.store');
    Route::get('/financial-accounts/{financial_account}', [FinancialAccountController::class, 'show'])->name('financial-accounts.show');
    Route::post('/financial-accounts/{financial_account}/activate', [FinancialAccountController::class, 'activate'])->name('financial-accounts.activate');
    Route::post('/financial-accounts/{financial_account}/close', [FinancialAccountController::class, 'close'])->name('financial-accounts.close');
    Route::post('/financial-accounts/{financial_account}/nominees', [FinancialAccountController::class, 'storeNominee'])->name('financial-accounts.nominees.store');
    Route::put('/financial-accounts/{financial_account}/nominees/{nominee}', [FinancialAccountController::class, 'updateNominee'])->name('financial-accounts.nominees.update');
    Route::delete('/financial-accounts/{financial_account}/nominees/{nominee}', [FinancialAccountController::class, 'destroyNominee'])->name('financial-accounts.nominees.destroy');
    Route::post('/financial-accounts/{financial_account}/holders', [FinancialAccountController::class, 'storeHolder'])->name('financial-accounts.holders.store');
    Route::put('/financial-accounts/{financial_account}/holders/{holder}', [FinancialAccountController::class, 'updateHolder'])->name('financial-accounts.holders.update');
    Route::delete('/financial-accounts/{financial_account}/holders/{holder}', [FinancialAccountController::class, 'destroyHolder'])->name('financial-accounts.holders.destroy');
    Route::post('/financial-accounts/{financial_account}/membership', [FinancialAccountController::class, 'storeShareAccount'])->name('financial-accounts.membership.store');
    Route::put('/financial-accounts/{financial_account}/membership/{shareAccount}', [FinancialAccountController::class, 'updateShareAccount'])->name('financial-accounts.membership.update');
    Route::post('/financial-accounts/{financial_account}/fixed-deposit', [FinancialAccountController::class, 'storeFixedDeposit'])->name('financial-accounts.fixed-deposit.store');
    Route::post('/financial-accounts/{financial_account}/recurring-deposit', [FinancialAccountController::class, 'storeRecurringDeposit'])->name('financial-accounts.recurring-deposit.store');
    Route::post('/financial-accounts/{financial_account}/recurring-deposit/{recurringDeposit}/installments/{installment}/miss', [FinancialAccountController::class, 'markRecurringInstallmentMissed'])->name('financial-accounts.recurring-deposit.installments.miss');
    Route::post('/financial-accounts/{financial_account}/recurring-deposit/{recurringDeposit}/installments/{installment}/waive', [FinancialAccountController::class, 'waiveRecurringInstallment'])->name('financial-accounts.recurring-deposit.installments.waive');
    Route::post('/financial-accounts/{financial_account}/recurring-deposit/{recurringDeposit}/installments/{installment}/pay', [FinancialAccountController::class, 'payRecurringInstallment'])->name('financial-accounts.recurring-deposit.installments.pay');
    Route::get('/financial-account-statements', [FinancialAccountController::class, 'statement'])->name('financial-account-statements.index');

    Route::get('/financial-transactions', [FinancialTransactionController::class, 'index'])->name('financial-transactions.index');
    Route::get('/financial-transactions/{workflow}/create', [FinancialTransactionController::class, 'workflow'])
        ->where('workflow', 'transfer|loan-disbursement|loan-repayment|fine-payment')
        ->name('financial-transactions.workflow');
    Route::post('/financial-transactions/transfer', [FinancialTransactionController::class, 'storeTransfer'])
        ->name('financial-transactions.transfer.store');
    Route::post('/financial-transactions/loan-disbursement', [FinancialTransactionController::class, 'storeLoanDisbursement'])
        ->name('financial-transactions.loan-disbursement.store');
    Route::post('/financial-transactions/loan-repayment', [FinancialTransactionController::class, 'storeLoanRepayment'])
        ->name('financial-transactions.loan-repayment.store');
    Route::post('/financial-transactions/fine-payment', [FinancialTransactionController::class, 'storeFinePayment'])
        ->name('financial-transactions.fine-payment.store');
    Route::post('/financial-transactions', [FinancialTransactionController::class, 'store'])->name('financial-transactions.store');
    Route::get('/financial-transactions/{financial_transaction}', [FinancialTransactionController::class, 'show'])->name('financial-transactions.show');
    Route::post('/financial-transactions/{financial_transaction}/post', [FinancialTransactionController::class, 'post'])->name('financial-transactions.post');
    Route::post('/financial-transactions/{financial_transaction}/reverse', [FinancialTransactionController::class, 'reverse'])->name('financial-transactions.reverse');

    Route::get('/financial-services', [FinancialReportController::class, 'dashboard'])->name('financial-services.dashboard');
    Route::get('/loan-applications', [LoanApplicationController::class, 'index'])->name('loan-applications.index');
    Route::get('/loan-applications/create', [LoanApplicationController::class, 'create'])->name('loan-applications.create');
    Route::post('/loan-applications', [LoanApplicationController::class, 'store'])->name('loan-applications.store');
    Route::get('/loan-applications/{loan_application}', [LoanApplicationController::class, 'show'])->name('loan-applications.show');
    Route::post('/loan-applications/{loan_application}/submit', [LoanApplicationController::class, 'submit'])->name('loan-applications.submit');
    Route::post('/loan-applications/{loan_application}/review', [LoanApplicationController::class, 'review'])->name('loan-applications.review');
    Route::post('/loan-applications/{loan_application}/approve', [LoanApplicationController::class, 'approve'])->name('loan-applications.approve');
    Route::post('/loan-applications/{loan_application}/reject', [LoanApplicationController::class, 'reject'])->name('loan-applications.reject');
    Route::post('/loan-applications/{loan_application}/create-account', [LoanApplicationController::class, 'createLoanAccount'])->name('loan-applications.create-account');
    Route::post('/loan-applications/{loan_application}/schedule', [LoanApplicationController::class, 'generateSchedule'])->name('loan-applications.schedule.generate');
    Route::post('/loan-applications/{loan_application}/arrears/assess', [LoanApplicationController::class, 'assessArrears'])->name('loan-applications.arrears.assess');
    Route::post('/loan-applications/{loan_application}/arrears/{arrear}/resolve', [LoanApplicationController::class, 'resolveArrear'])->name('loan-applications.arrears.resolve');
    Route::post('/loan-applications/{loan_application}/collaterals', [LoanApplicationController::class, 'storeCollateral'])->name('loan-applications.collaterals.store');
    Route::post('/loan-applications/{loan_application}/collaterals/{collateral}/verify', [LoanApplicationController::class, 'verifyCollateral'])->name('loan-applications.collaterals.verify');
    Route::post('/loan-applications/{loan_application}/collaterals/{collateral}/release', [LoanApplicationController::class, 'releaseCollateral'])->name('loan-applications.collaterals.release');
    Route::post('/loan-applications/{loan_application}/guarantors', [LoanApplicationController::class, 'storeGuarantor'])->name('loan-applications.guarantors.store');
    Route::post('/loan-applications/{loan_application}/guarantors/{guarantor}/decide', [LoanApplicationController::class, 'decideGuarantor'])->name('loan-applications.guarantors.decide');
    Route::post('/loan-applications/{loan_application}/protection', [LoanApplicationController::class, 'storeProtection'])->name('loan-applications.protection.store');
    Route::post('/loan-applications/{loan_application}/protection/activate', [LoanApplicationController::class, 'activateProtection'])->name('loan-applications.protection.activate');
    Route::post('/loan-applications/{loan_application}/protection/cancel', [LoanApplicationController::class, 'cancelProtection'])->name('loan-applications.protection.cancel');
    Route::get('/financial-reports/product-summary', [FinancialReportController::class, 'productSummary'])->name('financial-reports.product-summary');
    Route::get('/financial-reports/account-balances', [FinancialReportController::class, 'accountBalances'])->name('financial-reports.account-balances');
    Route::get('/financial-reports/transactions', [FinancialReportController::class, 'transactions'])->name('financial-reports.transactions');

});