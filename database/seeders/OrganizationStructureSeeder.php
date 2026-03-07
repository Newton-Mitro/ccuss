<?php

namespace Database\Seeders;

use App\Branch\Models\Organization;
use Illuminate\Database\Seeder;
use App\Branch\Models\Branch;

class OrganizationStructureSeeder extends Seeder
{
    public function run(): void
    {
        Organization::factory()
            ->has(Branch::factory()->count(10))
            ->create([
                'code' => 'ORG001',
                'name' => 'Demo Microfinance Ltd',
                'short_name' => 'DML'
            ]);

        $this->command->info('✅ Organization with 10 branches created.');
    }
}