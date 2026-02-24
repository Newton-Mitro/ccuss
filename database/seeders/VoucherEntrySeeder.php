<?php

namespace Database\Seeders;

use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\FiscalPeriod;
use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class VoucherEntrySeeder extends Seeder
{
    public function run(): void
    {
        // Grab available branches, users, fiscal year, and open periods
        $branches = Branch::pluck('id')->all();
        $users = User::pluck('id')->all();
        $fiscalYear = FiscalYear::where('is_active', true)->first();
        $fiscalPeriods = FiscalPeriod::where('is_open', true)->pluck('id')->all();

        // Grab leaf accounts (non-control, active, with parent)
        $ledgerAccounts = LedgerAccount::query()
            ->whereNotNull('parent_id')
            ->where('is_control_account', false)
            ->where('is_active', true)
            ->pluck('id')
            ->all();

        if (
            empty($branches) ||
            empty($users) ||
            !$fiscalYear ||
            empty($fiscalPeriods) ||
            empty($ledgerAccounts)
        ) {
            $this->command?->warn('RealVoucherSeeder skipped: missing prerequisite data.');
            return;
        }

        // Create 50 realistic vouchers
        Voucher::factory()
            ->count(50)
            ->state(fn() => [
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => Arr::random($fiscalPeriods),
                'status' => 'POSTED', // ensure included in reports
            ])
            ->create()
            ->each(function (Voucher $voucher) use ($ledgerAccounts) {

                // Each voucher has 1–3 debit/credit pairs
                $pairs = rand(1, 3);

                for ($i = 0; $i < $pairs; $i++) {
                    $amount = fake()->randomFloat(2, 100, 5000);

                    // Random leaf accounts
                    $debitAccount = Arr::random($ledgerAccounts);
                    $creditAccount = Arr::random($ledgerAccounts);

                    // Debit line
                    VoucherLine::factory()
                        ->debit($amount)
                        ->create([
                            'voucher_id' => $voucher->id,
                            'ledger_account_id' => $debitAccount,
                        ]);

                    // Credit line
                    VoucherLine::factory()
                        ->credit($amount)
                        ->create([
                            'voucher_id' => $voucher->id,
                            'ledger_account_id' => $creditAccount,
                        ]);
                }
            });

        $this->command?->info('✅ Realistic vouchers seeded.');
    }
}