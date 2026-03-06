<?php

namespace Database\Seeders;

use App\Branch\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {

        Branch::factory()
            ->count(count: 10)
            ->create();

        $this->command->info('✅ 10 Branch records have been seeded successfully.');
    }
}
