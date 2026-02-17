<?php

namespace Database\Seeders;

use App\Accounting\Models\Account;
use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class VoucherEntrySeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        $branches = Branch::pluck('id')->toArray();
        $users = User::pluck('id')->toArray();
        $accounts = Account::pluck('id')->toArray();

        // Create 20 vouchers
        for ($i = 0; $i < 20; $i++) {

            $voucher = Voucher::create([
                'voucher_date' => $faker->dateTimeThisYear(),
                'voucher_type' => $faker->randomElement([
                    'CASH_RECEIPT',
                    'CASH_PAYMENT',
                    'JOURNAL',
                ]),
                'voucher_no' => 'V-' . strtoupper(Str::random(8)),
                'reference' => $faker->optional()->regexify('[A-Z0-9]{6,10}'),

                'branch_id' => $faker->optional()->randomElement($branches),
                'created_by' => $faker->randomElement($users),
                'approved_by' => null,
                'approved_at' => null,

                'narration' => $faker->sentence(),
                'status' => 'DRAFT',
            ]);

            // Each voucher must have at least 2 lines
            $lineCount = rand(2, 5);

            for ($j = 0; $j < $lineCount; $j++) {

                $amount = $faker->randomFloat(2, 100, 5000);

                // Enforce debit XOR credit
                $isDebit = $j % 2 === 0;

                VoucherLine::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $faker->randomElement($accounts),

                    'subledger_type' => $faker->optional()->randomElement([
                        'App\\Accounting\\Models\\DepositAccount',
                        'App\\Accounting\\Models\\LoanAccount',
                        'App\\Accounting\\Models\\Vendor',
                    ]),
                    'subledger_id' => $faker->optional()->numberBetween(1, 50),

                    'associate_ledger_id' => $faker->optional()->numberBetween(1, 50),
                    'narration' => $faker->optional()->sentence(),

                    'debit' => $isDebit ? $amount : 0,
                    'credit' => $isDebit ? 0 : $amount,
                ]);
            }
        }
    }
}
