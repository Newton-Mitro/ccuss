<?php

namespace Database\Seeders;

use App\UserRolePermissions\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
            ['email' => 'test.user@email.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::factory(10)->create();

        $this->call([
            PermissionSeeder::class,
            BranchSeeder::class,
            CustomerSeeder::class,
            AccountSeeder::class,
            VoucherEntrySeeder::class,
        ]);

    }
}
