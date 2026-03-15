<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

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