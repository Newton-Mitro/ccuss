<?php

namespace Database\Seeders;

use App\Accounting\Models\LedgerAccountBalance;
use App\Accounting\Models\AccountingPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class RealVoucherEntrySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /* ===================== CONTEXT ===================== */

            $user = User::first() ?? User::factory()->create();

            $branches = Branch::pluck('id')->all();

            $fiscalYear = FiscalYear::where('is_active', true)->firstOrFail();

            $fiscalPeriod = AccountingPeriod::where('is_open', true)->firstOrFail();


            /* ===================== LEDGERS ===================== */

            // Assets
            $cashInHand = LedgerAccount::where('code', '1111')->firstOrFail();
            $cashInBank = LedgerAccount::where('code', '1112')->firstOrFail();

            // Liabilities
            $savingsDeposit = LedgerAccount::where('code', '2011')->firstOrFail();

            // Equity
            $shareCapital = LedgerAccount::where('code', '3010')->firstOrFail();
            $retainedEarnings = LedgerAccount::where('code', '3020')->firstOrFail();

            // Expenses
            $salaryExpense = LedgerAccount::where('code', '5101')->firstOrFail();
            $officeExpense = LedgerAccount::where('code', '5102')->firstOrFail();

            // Income
            $loanInterestIncome = LedgerAccount::where('code', '4101')->firstOrFail();


            /* ===================== OPENING BALANCES ===================== */

            $openingBalances = [
                $cashInHand->id => 20000,
                $cashInBank->id => 40000,
                $savingsDeposit->id => 30000,
                $retainedEarnings->id => 10000,
            ];

            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($openingBalances as $ledgerId => $amount) {

                $account = LedgerAccount::find($ledgerId);

                if (in_array($account->type, ['ASSET', 'EXPENSE'])) {
                    $totalDebit += $amount;
                } else {
                    $totalCredit += $amount;
                }
            }

            $diff = $totalDebit - $totalCredit;

            if ($diff > 0) {
                $openingBalances[$shareCapital->id] = $diff;
            }

            /* ===================== OPENING BALANCE VOUCHER ===================== */

            $openingVoucher = Voucher::create([
                'voucher_date' => $fiscalYear->start_date,
                'voucher_type' => 'OPENING_BALANCE',
                'voucher_no' => 'OB-0001',
                'narration' => 'Opening balances for ' . $fiscalYear->code,
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => max($totalDebit, $totalCredit),

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'accounting_period_id' => $fiscalPeriod->id,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);


            foreach ($openingBalances as $ledgerId => $amount) {

                $account = LedgerAccount::find($ledgerId);

                $debit = in_array($account->type, ['ASSET', 'EXPENSE']) ? $amount : 0;
                $credit = in_array($account->type, ['LIABILITY', 'EQUITY', 'INCOME']) ? $amount : 0;

                VoucherLine::create([
                    'voucher_id' => $openingVoucher->id,
                    'ledger_account_id' => $ledgerId,
                    'particulars' => 'Opening balance - ' . $account->name,
                    'debit' => $debit,
                    'credit' => $credit,
                    'dr_cr' => $debit > 0 ? 'DR' : 'CR',
                ]);

                LedgerAccountBalance::updateOrCreate(
                    [
                        'ledger_account_id' => $ledgerId,
                        'accounting_period_id' => $fiscalPeriod->id
                    ],
                    [
                        'opening_balance' => $amount,
                        'debit_total' => 0,
                        'credit_total' => 0,
                        'closing_balance' => $debit - $credit,
                    ]
                );
            }


            /* ==========================================================
             1️⃣ PETTY CASH EXPENSE
            ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'DEBIT_OR_PAYMENT',
                'voucher_no' => 'PC-4001',
                'narration' => 'Office petty expenses',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 800,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'accounting_period_id' => $fiscalPeriod->id,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $officeExpense->id,
                    'particulars' => 'Office expenses',
                    'debit' => 800,
                    'credit' => 0,
                    'dr_cr' => 'DR',
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInHand->id,
                    'particulars' => 'Cash paid',
                    'debit' => 0,
                    'credit' => 800,
                    'dr_cr' => 'CR',
                ],
            ]);


            /* ==========================================================
             2️⃣ CONTRA (CASH → BANK)
            ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CONTRA',
                'voucher_no' => 'CNTR-5001',
                'narration' => 'Cash deposited to bank',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 15000,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'accounting_period_id' => $fiscalPeriod->id,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'particulars' => 'Cash deposited',
                    'debit' => 15000,
                    'credit' => 0,
                    'dr_cr' => 'DR',
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInHand->id,
                    'particulars' => 'Cash transferred',
                    'debit' => 0,
                    'credit' => 15000,
                    'dr_cr' => 'CR',
                ],
            ]);


            /* ==========================================================
             3️⃣ MEMBER SAVINGS DEPOSIT
            ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CREDIT_OR_RECEIPT',
                'voucher_no' => 'RCPT-1002',
                'narration' => 'Member savings deposit',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 25000,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'accounting_period_id' => $fiscalPeriod->id,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'particulars' => 'Bank received',
                    'debit' => 25000,
                    'credit' => 0,
                    'dr_cr' => 'DR',
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $savingsDeposit->id,
                    'particulars' => 'Savings deposit',
                    'debit' => 0,
                    'credit' => 25000,
                    'dr_cr' => 'CR',
                ],
            ]);


            /* ==========================================================
             4️⃣ SALARY PAYMENT
            ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'DEBIT_OR_PAYMENT',
                'voucher_no' => 'PAY-6001',
                'narration' => 'Salary payment',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 7000,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'accounting_period_id' => $fiscalPeriod->id,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $salaryExpense->id,
                    'particulars' => 'Salary expense',
                    'debit' => 7000,
                    'credit' => 0,
                    'dr_cr' => 'DR',
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'particulars' => 'Bank payment',
                    'debit' => 0,
                    'credit' => 7000,
                    'dr_cr' => 'CR',
                ],
            ]);


            /* ==========================================================
             5️⃣ LOAN INTEREST RECEIVED
            ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CREDIT_OR_RECEIPT',
                'voucher_no' => 'INC-7001',
                'narration' => 'Loan interest received',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 15000,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'accounting_period_id' => $fiscalPeriod->id,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'particulars' => 'Interest received',
                    'debit' => 15000,
                    'credit' => 0,
                    'dr_cr' => 'DR',
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $loanInterestIncome->id,
                    'particulars' => 'Loan interest income',
                    'debit' => 0,
                    'credit' => 15000,
                    'dr_cr' => 'CR',
                ],
            ]);
        });

        $this->command->info('✅ Real Voucher Entries Seeded Successfully');
    }
}