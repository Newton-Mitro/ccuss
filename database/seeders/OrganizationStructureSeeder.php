<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationStructureSeeder extends Seeder
{
    public function run(): void
    {
        // Create the organization with 10 branches
        $organization = Organization::factory()
            ->has(Branch::factory()->count(10))
            ->create([
                'code' => 'ORG001',
                'name' => 'Demo Microfinance Ltd',
                'short_name' => 'DML'
            ])
            ->first();

        $branches = $organization->branches;

        $this->command->info('✅ Organization with 10 branches created.');

        // Default users to create
        $defaultUsers = [
            ['name' => 'Super Admin', 'email' => 'super.admin@email.com'],
            ['name' => 'HR Admin', 'email' => 'hr.admin@email.com'],
            ['name' => 'Teller', 'email' => 'teller@email.com'],
            ['name' => 'Cash Collector', 'email' => 'collector@email.com'],
            ['name' => 'Vault Admin', 'email' => 'vault.admin@email.com'],
            ['name' => 'Account Admin', 'email' => 'account.admin@email.com'],
            ['name' => 'Accountant', 'email' => 'accountant@email.com'],
            ['name' => 'Test User', 'email' => 'test.user@email.com'],
        ];

        // Assign each user to a random branch
        foreach ($defaultUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'organization_id' => $organization->id,
                    'branch_id' => $branches->random()->id,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('✅ Default users created and assigned to branches.');
    }
}