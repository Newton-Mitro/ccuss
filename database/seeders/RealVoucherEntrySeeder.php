<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\FinanceAndAccounting\Models\LedgerAccountBalance;
use App\FinanceAndAccounting\Models\Voucher;
use App\FinanceAndAccounting\Models\VoucherLine;
use App\FinanceAndAccounting\Models\FiscalPeriod;
use App\FinanceAndAccounting\Models\FiscalYear;
use App\FinanceAndAccounting\Models\InstrumentType;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\CustomerModule\Models\Customer;

class RealVoucherEntrySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            // ===================== CONTEXT =====================
            $organizationId = $branch->organization_id ?? $branch->organization->id ?? 1;
            $user = User::first() ?? User::factory()->create();
            $branch = Branch::first() ?? Branch::factory()->create();
            $fiscalYear = FiscalYear::where('is_active', true)->firstOrFail();
            $fiscalPeriod = FiscalPeriod::where('is_open', true)->firstOrFail();
            $customer = Customer::first() ?? Customer::factory()->create();

            // Instruments
            $cashInstrument = InstrumentType::where('code', 'CASH')->first();
            $bankTransferInstrument = InstrumentType::where('code', 'BANK_TRANSFER')->first();

            // ===================== LEDGERS =====================
            $cashInHand = LedgerAccount::where('code', '1111')->firstOrFail();
            $cashInBank = LedgerAccount::where('code', '1112')->firstOrFail();
            $savingsDeposit = LedgerAccount::where('code', '2011')->firstOrFail();
            $shareCapital = LedgerAccount::where('code', '3010')->firstOrFail();
            $retainedEarnings = LedgerAccount::where('code', '3020')->firstOrFail();
            $salaryExpense = LedgerAccount::where('code', '5101')->firstOrFail();
            $officeExpense = LedgerAccount::where('code', '5102')->firstOrFail();
            $loanInterestIncome = LedgerAccount::where('code', '4101')->firstOrFail();

            // ===================== OPENING BALANCES =====================
            $openingBalances = [
                $cashInHand->id => 20000,
                $cashInBank->id => 40000,
                $savingsDeposit->id => 30000,
                $retainedEarnings->id => 10000,
                $shareCapital->id => 0, // will adjust for difference
            ];

            $totalDebit = $openingBalances[$cashInHand->id] + $openingBalances[$cashInBank->id] + $openingBalances[$savingsDeposit->id];
            $totalCredit = $openingBalances[$retainedEarnings->id];

            $diff = $totalDebit - $totalCredit;
            if ($diff > 0) {
                $openingBalances[$shareCapital->id] = $diff;
            }

            $openingVoucher = Voucher::create([
                'organization_id' => $organizationId,
                'voucher_date' => $fiscalYear->start_date,
                'voucher_type' => 'OPENING_BALANCE',
                'voucher_no' => 'OB-0001',
                'narration' => 'Opening balances for ' . $fiscalYear->code,
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => max($totalDebit, $totalCredit),
                'branch_id' => $branch->id,
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriod->id,
                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);

            // Create VoucherLines and LedgerAccountBalances explicitly
            VoucherLine::create([
                'voucher_entry_id' => $openingVoucher->id,
                'ledger_account_id' => $cashInHand->id,
                'particulars' => 'Opening balance - Cash In Hand',
                'debit' => 20000,
                'credit' => 0,
                'dr_cr' => 'DR',
            ]);
            LedgerAccountBalance::updateOrCreate(
                ['organization_id' => $organizationId, 'ledger_account_id' => $cashInHand->id, 'fiscal_period_id' => $fiscalPeriod->id],
                ['organization_id' => $organizationId, 'opening_balance' => 20000, 'debit_total' => 0, 'credit_total' => 0, 'closing_balance' => 20000]
            );

            VoucherLine::create([
                'voucher_entry_id' => $openingVoucher->id,
                'ledger_account_id' => $cashInBank->id,
                'particulars' => 'Opening balance - Cash In Bank',
                'debit' => 40000,
                'credit' => 0,
                'dr_cr' => 'DR',
            ]);
            LedgerAccountBalance::updateOrCreate(
                ['organization_id' => $organizationId, 'ledger_account_id' => $cashInBank->id, 'fiscal_period_id' => $fiscalPeriod->id],
                ['organization_id' => $organizationId, 'opening_balance' => 40000, 'debit_total' => 0, 'credit_total' => 0, 'closing_balance' => 40000]
            );

            VoucherLine::create([
                'voucher_entry_id' => $openingVoucher->id,
                'ledger_account_id' => $savingsDeposit->id,
                'particulars' => 'Opening balance - Savings Deposit',
                'debit' => 30000,
                'credit' => 0,
                'dr_cr' => 'DR',
            ]);
            LedgerAccountBalance::updateOrCreate(
                ['organization_id' => $organizationId, 'ledger_account_id' => $savingsDeposit->id, 'fiscal_period_id' => $fiscalPeriod->id],
                ['organization_id' => $organizationId, 'opening_balance' => 30000, 'debit_total' => 0, 'credit_total' => 0, 'closing_balance' => 30000]
            );

            VoucherLine::create([
                'voucher_entry_id' => $openingVoucher->id,
                'ledger_account_id' => $retainedEarnings->id,
                'particulars' => 'Opening balance - Retained Earnings',
                'debit' => 0,
                'credit' => 10000,
                'dr_cr' => 'CR',
            ]);
            LedgerAccountBalance::updateOrCreate(
                ['organization_id' => $organizationId, 'ledger_account_id' => $retainedEarnings->id, 'fiscal_period_id' => $fiscalPeriod->id],
                ['organization_id' => $organizationId, 'opening_balance' => 10000, 'debit_total' => 0, 'credit_total' => 0, 'closing_balance' => -10000]
            );

            VoucherLine::create([
                'voucher_entry_id' => $openingVoucher->id,
                'ledger_account_id' => $shareCapital->id,
                'particulars' => 'Opening balance - Share Capital',
                'debit' => 0,
                'credit' => $diff,
                'dr_cr' => 'CR',
            ]);
            LedgerAccountBalance::updateOrCreate(
                ['organization_id' => $organizationId, 'ledger_account_id' => $shareCapital->id, 'fiscal_period_id' => $fiscalPeriod->id],
                ['organization_id' => $organizationId, 'opening_balance' => $diff, 'debit_total' => 0, 'credit_total' => 0, 'closing_balance' => -$diff]
            );

            // ===================== REAL TRANSACTIONS =====================
            // 1. Office petty cash
            Voucher::create([
                'organization_id' => $organizationId,
                'voucher_date' => now(),
                'voucher_type' => 'DEBIT_OR_PAYMENT',
                'voucher_no' => 'PC-4001',
                'narration' => 'Office petty expenses',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 800,
                'branch_id' => $branch->id,
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriod->id,
                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ])->lines()->createMany([
                        [
                            'ledger_account_id' => $officeExpense->id,
                            'particulars' => 'Office expenses',
                            'debit' => 800,
                            'credit' => 0,
                            'dr_cr' => 'DR',
                            'instrument_type_id' => $cashInstrument->id ?? null,
                        ],
                        [
                            'ledger_account_id' => $cashInHand->id,
                            'particulars' => 'Cash paid',
                            'debit' => 0,
                            'credit' => 800,
                            'dr_cr' => 'CR',
                            'instrument_type_id' => $cashInstrument->id ?? null,
                        ],
                    ]);

            // 2. Cash deposit to bank
            Voucher::create([
                'organization_id' => $organizationId,
                'voucher_date' => now(),
                'voucher_type' => 'CONTRA',
                'voucher_no' => 'CNTR-5001',
                'narration' => 'Cash deposited to bank',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 15000,
                'branch_id' => $branch->id,
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriod->id,
                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ])->lines()->createMany([
                        [
                            'ledger_account_id' => $cashInBank->id,
                            'particulars' => 'Cash deposited',
                            'debit' => 15000,
                            'credit' => 0,
                            'dr_cr' => 'DR',
                            'instrument_type_id' => $bankTransferInstrument->id ?? null,
                        ],
                        [
                            'ledger_account_id' => $cashInHand->id,
                            'particulars' => 'Cash transferred',
                            'debit' => 0,
                            'credit' => 15000,
                            'dr_cr' => 'CR',
                            'instrument_type_id' => $bankTransferInstrument->id ?? null,
                        ],
                    ]);

            // 3. Member savings deposit
            Voucher::create([
                'organization_id' => $organizationId,
                'voucher_date' => now(),
                'voucher_type' => 'CREDIT_OR_RECEIPT',
                'voucher_no' => 'RCPT-1002',
                'narration' => 'Member savings deposit',
                'status' => Voucher::STATUS_POSTED,
                'reference' => random_int(100000, 999999),
                'total_amount' => 25000,
                'branch_id' => $branch->id,
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriod->id,
                'created_by' => $user->id,
                'posted_by' => $user->id,
                'posted_at' => now(),
            ])->lines()->createMany([
                        [
                            'ledger_account_id' => $cashInBank->id,
                            'particulars' => 'Bank received',
                            'debit' => 25000,
                            'credit' => 0,
                            'dr_cr' => 'DR',
                            'subledger_id' => $customer->id,
                            'subledger_type' => Customer::class,
                            'instrument_type_id' => $bankTransferInstrument->id ?? null,
                        ],
                        [
                            'ledger_account_id' => $savingsDeposit->id,
                            'particulars' => 'Savings deposit',
                            'debit' => 0,
                            'credit' => 25000,
                            'dr_cr' => 'CR',
                            'subledger_id' => $customer->id,
                            'subledger_type' => Customer::class,
                        ],
                    ]);

            $this->command->info('✅ Real Voucher Entries Seeded Safely without loops or dynamic failures!');
        });
    }
}