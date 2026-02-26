<?php

namespace Database\Seeders;

use App\Accounting\Models\LedgerAccountBalance;
use App\Accounting\Models\FiscalPeriod;
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
            $fiscalPeriods = FiscalPeriod::where('is_open', true)->pluck('id')->all();
            $fiscalPeriodId = $fiscalPeriods[0];

            /* ===================== LEDGERS ===================== */

            // Assets
            $cashInHand = LedgerAccount::where('code', '1111')->firstOrFail();
            $cashInBank = LedgerAccount::where('code', '1112')->firstOrFail();

            // Liabilities & Equity
            $memberDeposits = LedgerAccount::where('code', '2010')->firstOrFail();
            $capital = LedgerAccount::where('code', '3100')->firstOrFail();
            $retainedEarnings = LedgerAccount::where('code', '3020')->firstOrFail();

            // Expenses / Income
            $salaryExpense = LedgerAccount::where('code', '5020')->firstOrFail();
            $officeExpense = LedgerAccount::where('code', '5030')->firstOrFail();
            $loanInterestIncome = LedgerAccount::where('code', '4020')->firstOrFail();

            /* ===================== OPENING BALANCES ===================== */

            // Define opening balances: ledger_id => amount
            $openingBalances = [
                $cashInHand->id => 20000,
                $cashInBank->id => 40000,
                $memberDeposits->id => 30000,
                $retainedEarnings->id => 10000,
            ];

            // Step 1: calculate totals
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

            // Step 2: balance difference via Capital / Retained Earnings
            $diff = $totalDebit - $totalCredit;
            if ($diff > 0) {
                // debit > credit, add credit to Capital
                $openingBalances[$capital->id] = $diff;
            } elseif ($diff < 0) {
                // credit > debit, add debit to Capital
                $openingBalances[$capital->id] = abs($diff);
            }

            /* ===================== CREATE VOUCHER ===================== */

            $openingVoucher = Voucher::create([
                'voucher_date' => $fiscalYear->start_date ?? now(),
                'voucher_type' => 'OPENING_BALANCE',
                'voucher_no' => 'OB-0001',
                'narration' => 'Opening balances for fiscal year ' . $fiscalYear->code,
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriodId,

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            /* ===================== CREATE VOUCHER LINES ===================== */

            foreach ($openingBalances as $ledgerId => $amount) {
                $account = LedgerAccount::find($ledgerId);

                // Assign debit / credit correctly
                $debit = in_array($account->type, ['ASSET', 'EXPENSE']) ? $amount : 0;
                $credit = in_array($account->type, ['LIABILITY', 'EQUITY', 'INCOME']) ? $amount : 0;

                VoucherLine::create([
                    'voucher_id' => $openingVoucher->id,
                    'ledger_account_id' => $account->id,
                    'debit' => $debit,
                    'credit' => $credit,
                ]);

                // Update account balances
                LedgerAccountBalance::updateOrCreate(
                    ['ledger_account_id' => $account->id, 'fiscal_period_id' => $fiscalPeriodId],
                    [
                        'opening_balance' => $amount,
                        'debit_total' => 0,
                        'credit_total' => 0,
                        'closing_balance' => $debit - $credit,
                    ]
                );
            }
            /* ==========================================================
             | 5️⃣ PETTY CASH — OFFICE EXPENSE
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'PETTY_CASH',
                'voucher_no' => 'PC-4001',
                'narration' => 'Tea, snacks and miscellaneous expenses',
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $officeExpense->id,
                    'debit' => 800,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInHand->id,
                    'debit' => 0,
                    'credit' => 800,
                ],
            ]);

            /* ==========================================================
             | 6️⃣ CONTRA — CASH TO BANK
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CONTRA',
                'voucher_no' => 'CNTR-5001',
                'narration' => 'Cash deposited into bank',
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'debit' => 15000,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInHand->id,
                    'debit' => 0,
                    'credit' => 15000,
                ],
            ]);

            /* ==========================================================
             | 7️⃣ BANK RECEIPT — MEMBER DEPOSIT
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CREDIT_OR_RECEIPT',
                'voucher_no' => 'RCPT-1002',
                'narration' => 'Member savings deposited via bank',
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'debit' => 25000,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $memberDeposits->id,
                    'debit' => 0,
                    'credit' => 25000,
                ],
            ]);

            /* ==========================================================
             | 8️⃣ JOURNAL — EXPENSE ACCRUAL
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'JOURNAL_OR_NON_CASH',
                'voucher_no' => 'JRNL-3002',
                'narration' => 'Office expense accrued',
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $officeExpense->id,
                    'debit' => 4000,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $memberDeposits->id,
                    'debit' => 0,
                    'credit' => 4000,
                ],
            ]);

            /* ==========================================================
             | 9️⃣ JOURNAL — EXPENSE DISTRIBUTION
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'JOURNAL_OR_NON_CASH',
                'voucher_no' => 'JRNL-3003',
                'narration' => 'Expense distribution',
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $salaryExpense->id,
                    'debit' => 7000,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $officeExpense->id,
                    'debit' => 3000,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'debit' => 0,
                    'credit' => 10000,
                ],
            ]);

            /* ==========================================================
                | 🔟 BANK RECEIPT — LOAN INTEREST INCOME
                ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CREDIT_OR_RECEIPT',
                'voucher_no' => 'INC-7001',
                'narration' => 'Loan interest received from member',
                'status' => Voucher::STATUS_POSTED,

                'branch_id' => Arr::random($branches),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),

                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            VoucherLine::insert([
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $cashInBank->id,
                    'debit' => 15000,
                    'credit' => 0,
                ],
                [
                    'voucher_id' => $voucher->id,
                    'ledger_account_id' => $loanInterestIncome->id,
                    'debit' => 0,
                    'credit' => 15000,
                ],
            ]);
        });

        $this->command->info('✅ Real Voucher Entries created');
    }
}