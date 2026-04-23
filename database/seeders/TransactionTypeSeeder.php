<?php
namespace Database\Seeders;

use App\GeneralAccounting\Models\TransactionType;
use Illuminate\Database\Seeder;

class TransactionTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [

            // 💰 Cash
            ['code' => 'cash_deposit', 'name' => 'Cash Deposit', 'category' => 'cash', 'is_cash' => true, 'direction' => 'inflow'],
            ['code' => 'cash_withdrawal', 'name' => 'Cash Withdrawal', 'category' => 'cash', 'is_cash' => true, 'direction' => 'outflow'],

            // 🏦 Deposit
            ['code' => 'account_transfer', 'name' => 'Account Transfer', 'category' => 'deposit'],
            ['code' => 'account_closure', 'name' => 'Account Closure', 'category' => 'deposit'],

            // 📉 Loan
            ['code' => 'loan_disbursement', 'name' => 'Loan Disbursement', 'category' => 'loan', 'direction' => 'outflow'],
            ['code' => 'loan_repayment', 'name' => 'Loan Repayment', 'category' => 'loan', 'direction' => 'inflow'],

            // 🧾 Vendor
            ['code' => 'vendor_payment', 'name' => 'Vendor Payment', 'category' => 'vendor', 'direction' => 'outflow'],

            // 💸 Fees
            ['code' => 'fee_charge', 'name' => 'Fee Charge', 'category' => 'fee', 'direction' => 'inflow'],

            // 🔁 Internal
            ['code' => 'vault_transfer', 'name' => 'Vault Transfer', 'category' => 'internal'],

            // ⚙️ System
            ['code' => 'interest_posting', 'name' => 'Interest Posting', 'category' => 'system', 'is_system' => true],
            ['code' => 'adjustment', 'name' => 'Adjustment Entry', 'category' => 'system', 'requires_approval' => true],
            ['code' => 'reversal', 'name' => 'Reversal Entry', 'category' => 'system', 'is_system' => true],
        ];

        foreach ($types as $type) {
            TransactionType::updateOrCreate(
                ['code' => $type['code']],
                array_merge([
                    'is_cash' => false,
                    'affects_balance' => true,
                    'requires_approval' => false,
                    'is_system' => false,
                    'direction' => 'both',
                ], $type)
            );
        }
    }
}