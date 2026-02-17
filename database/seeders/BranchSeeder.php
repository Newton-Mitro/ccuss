<?php

namespace Database\Seeders;

use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure at least one user exists before seeding
        if (!User::exists()) {
            User::factory()->count(5)->create();
        }

        Branch::factory()
            ->count(count: 10)
            ->create();

        $this->command->info('✅ 10 Branch records have been seeded successfully.');
    }
}
