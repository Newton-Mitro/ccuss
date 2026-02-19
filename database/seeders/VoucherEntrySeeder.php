<?php

namespace Database\Seeders;

use App\Accounting\Models\Account;
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
        $branches = Branch::pluck('id')->all();
        $users = User::pluck('id')->all();
        $accounts = Account::pluck('id')->all();
        $fiscalYears = FiscalYear::pluck('id')->all();
        $fiscalPeriods = FiscalPeriod::pluck('id')->all();

        Voucher::factory()
            ->count(20)
            ->state(fn() => [
                'branch_id' => Arr::random($branches),
                'created_by' => Arr::random($users),
                'fiscal_year_id' => Arr::random($fiscalYears),
                'fiscal_period_id' => Arr::random($fiscalPeriods),
                'status' => 'DRAFT',
            ])
            ->create()
            ->each(function (Voucher $voucher) use ($accounts) {

                // 🔒 Always even → always balanced
                $pairCount = rand(1, 3); // 2–6 lines
    
                for ($i = 0; $i < $pairCount; $i++) {

                    $amount = fake()->randomFloat(2, 100, 5000);

                    $debitAccount = Arr::random($accounts);
                    $creditAccount = Arr::random($accounts);

                    // 🔹 Debit line
                    VoucherLine::factory()->create([
                        'voucher_id' => $voucher->id,
                        'account_id' => $debitAccount,
                        'debit' => $amount,
                        'credit' => 0,
                    ]);

                    // 🔹 Credit line (optionally subledgered)
                    VoucherLine::factory()->create([
                        'voucher_id' => $voucher->id,
                        'account_id' => $creditAccount,
                        'debit' => 0,
                        'credit' => $amount,
                        'subledger_type' => fake()->optional()->randomElement([
                            'App\\Accounting\\Models\\DepositAccount',
                            'App\\Accounting\\Models\\LoanAccount',
                            'App\\Accounting\\Models\\Vendor',
                        ]),
                        'subledger_id' => fake()->optional()->numberBetween(1, 50),
                    ]);
                }
            });
    }
}
