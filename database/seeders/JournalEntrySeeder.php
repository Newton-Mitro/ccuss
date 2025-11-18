<?php

namespace Database\Seeders;

use App\Accounting\GlAccount\Models\GlAccount;
use App\Accounting\Voucher\Models\JournalEntry;
use App\Accounting\Voucher\Models\JournalLine;
use App\Branch\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class JournalEntrySeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        $branches = Branch::pluck('id')->toArray();
        $users = User::pluck('id')->toArray();
        $glAccounts = GlAccount::pluck('id')->toArray();

        // Create 20 journal entries
        for ($i = 0; $i < 20; $i++) {
            $journalEntry = JournalEntry::create([
                'tx_code' => $faker->randomElement(['PAY_VOUCHER', 'REC_VOUCHER', 'JOURNAL']),
                'tx_ref' => $faker->regexify('[A-Z0-9]{6,10}'),
                'posted_at' => $faker->dateTimeThisYear(),
                'branch_id' => $faker->optional()->randomElement($branches),
                'user_id' => $faker->optional()->randomElement($users),
                'memo' => $faker->sentence(),
            ]);

            // Add 2–5 lines for each entry
            $lineCount = rand(2, 5);
            for ($j = 0; $j < $lineCount; $j++) {
                $debit = $faker->randomFloat(2, 0, 1000);
                $credit = $faker->randomFloat(2, 0, 1000);

                // Ensure either debit or credit has a value, but not both zero
                if ($debit == 0 && $credit == 0) {
                    $debit = $faker->randomFloat(2, 1, 1000);
                }

                JournalLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'gl_account_id' => $faker->randomElement($glAccounts),
                    'subledger_type' => $faker->optional()->randomElement([
                        'DEPOSIT',
                        'LOAN',
                        'SHARE',
                        'INSURANCE',
                        'CASH',
                        'FIXED_ASSET',
                        'PAYROLL',
                        'VENDOR',
                        'FEE',
                        'INTEREST',
                        'PROTECTION_PREMIUM',
                        'PROTECTION_RENEWAL',
                        'ADVANCE_DEPOSIT'
                    ]),
                    'subledger_id' => $faker->optional()->numberBetween(1, 50),
                    'associate_ledger_type' => $faker->optional()->randomElement([
                        'FEE',
                        'FINE',
                        'PROVISION',
                        'INTEREST',
                        'DIVIDEND',
                        'REBATE',
                        'PROTECTION_PREMIUM',
                        'PROTECTION_RENEWAL'
                    ]),
                    'associate_ledger_id' => $faker->optional()->numberBetween(1, 50),
                    'debit' => $debit,
                    'credit' => $credit,
                ]);
            }
        }
    }
}
