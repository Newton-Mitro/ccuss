<?php

namespace Database\Seeders;

use App\UserRolePermissions\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'super.admin@email.com'],
            [
                'name' => 'Super Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'hr.admin@email.com'],
            [
                'name' => 'HR Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'teller@email.com'],
            [
                'name' => 'Teller',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'collector@email.com'],
            [
                'name' => 'Cash Collector',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'vault.admin@email.com'],
            [
                'name' => 'Vault Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'account.admin@email.com'],
            [
                'name' => 'Account Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'accountant@email.com'],
            [
                'name' => 'Accountant',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'test.user@email.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            FiscalYearSeeder::class,
            PermissionSeeder::class,
            BranchSeeder::class,
            CustomerSeeder::class,
            InstrumentTypeSeeder::class,
            ChartOfAccountsSeeder::class,
            RealVoucherEntrySeeder::class
        ]);

    }
}
