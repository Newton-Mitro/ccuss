<?php

namespace Database\Seeders;

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
            $users = User::pluck('id')->all();

            $fiscalYear = FiscalYear::where('is_active', true)->first();
            $fiscalPeriods = FiscalPeriod::where('is_open', true)->pluck('id')->all();

            /* ===================== LEDGERS ===================== */

            // Assets
            $cashInHand = LedgerAccount::where('code', '1111')->first();
            $cashInBank = LedgerAccount::where('code', '1112')->first();

            // Expenses
            $salaryExpense = LedgerAccount::where('code', '5020')->first();
            $officeExpense = LedgerAccount::where('code', '5030')->first();

            // Income
            $loanInterestIncome = LedgerAccount::where('code', '4020')->first();

            // Liabilities
            $memberDeposits = LedgerAccount::where('code', '2010')->first();

            // Equity
            $capital = LedgerAccount::where('code', '3100')->first();

            /* ==========================================================
             | 0️⃣ OPENING BALANCE — START CLEAN & BALANCED
             ========================================================== */

            $openingVoucher = Voucher::create([
                'voucher_date' => $fiscalYear->start_date ?? now(),
                'voucher_type' => 'JOURNAL_OR_NON_CASH',
                'voucher_no' => 'OPEN-0001',
                'narration' => 'Opening balances for fiscal year',
                'status' => 'POSTED',
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriods[0],
            ]);

            VoucherLine::create([
                'voucher_id' => $openingVoucher->id,
                'ledger_account_id' => $cashInHand->id,
                'debit' => 20000,
                'credit' => 0,
                'particulars' => 'Opening cash in hand',
            ]);

            VoucherLine::create([
                'voucher_id' => $openingVoucher->id,
                'ledger_account_id' => $cashInBank->id,
                'debit' => 40000,
                'credit' => 0,
                'particulars' => 'Opening cash in bank',
            ]);

            VoucherLine::create([
                'voucher_id' => $openingVoucher->id,
                'ledger_account_id' => $capital->id,
                'debit' => 0,
                'credit' => 60000,
                'particulars' => 'Opening capital',
            ]);

            /* ==========================================================
             | 5️⃣ PETTY CASH — OFFICE EXPENSE
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'PETTY_CASH',
                'voucher_no' => 'PC-4001',
                'narration' => 'Tea, snacks and miscellaneous expenses',
                'status' => 'POSTED',
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $officeExpense->id,
                'debit' => 800,
                'credit' => 0,
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $cashInHand->id,
                'debit' => 0,
                'credit' => 800,
            ]);

            /* ==========================================================
             | 6️⃣ CONTRA — CASH TO BANK
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CONTRA',
                'voucher_no' => 'CNTR-5001',
                'narration' => 'Cash deposited into bank',
                'status' => 'POSTED',
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $cashInBank->id,
                'debit' => 15000,
                'credit' => 0,
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $cashInHand->id,
                'debit' => 0,
                'credit' => 15000,
            ]);

            /* ==========================================================
             | 7️⃣ BANK RECEIPT — MEMBER DEPOSIT
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'CREDIT_OR_RECEIPT',
                'voucher_no' => 'RCPT-1002',
                'narration' => 'Member savings deposited via bank',
                'status' => 'POSTED',
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $cashInBank->id,
                'debit' => 25000,
                'credit' => 0,
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $memberDeposits->id,
                'debit' => 0,
                'credit' => 25000,
            ]);

            /* ==========================================================
             | 8️⃣ JOURNAL — EXPENSE ACCRUAL
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'JOURNAL_OR_NON_CASH',
                'voucher_no' => 'JRNL-3002',
                'narration' => 'Office expense accrued',
                'status' => 'POSTED',
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $officeExpense->id,
                'debit' => 4000,
                'credit' => 0,
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $memberDeposits->id,
                'debit' => 0,
                'credit' => 4000,
            ]);

            /* ==========================================================
             | 9️⃣ JOURNAL — EXPENSE DISTRIBUTION
             ========================================================== */

            $voucher = Voucher::create([
                'voucher_date' => now(),
                'voucher_type' => 'JOURNAL_OR_NON_CASH',
                'voucher_no' => 'JRNL-3003',
                'narration' => 'Expense distribution',
                'status' => 'POSTED',
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $salaryExpense->id,
                'debit' => 7000,
                'credit' => 0,
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $officeExpense->id,
                'debit' => 3000,
                'credit' => 0,
            ]);

            VoucherLine::create([
                'voucher_id' => $voucher->id,
                'ledger_account_id' => $cashInBank->id,
                'debit' => 0,
                'credit' => 10000,
            ]);
        });
    }
}