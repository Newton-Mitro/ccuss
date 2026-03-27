<?php

namespace Database\Seeders;

use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\Vault;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationStructureSeeder extends Seeder
{
    public function run(): void
    {
        // -------------------------------
        // 1. Create Organization + Branches
        // -------------------------------
        $organization = Organization::factory()
            ->has(Branch::factory()->count(10))
            ->create([
                'code' => 'ORG001',
                'name' => 'Demo Microfinance Ltd',
                'short_name' => 'DML'
            ]);

        $branches = $organization->branches;

        $this->command->info('✅ Organization with 10 branches created.');

        // -------------------------------
        // 2. Create Vault per Branch
        // -------------------------------
        foreach ($branches as $branch) {
            Vault::create([
                'branch_id' => $branch->id,
                'name' => $branch->name . ' Main Vault',
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Vault created for each branch.');

        // -------------------------------
        // 3. Default System Users
        // -------------------------------
        $defaultUsers = [
            ['name' => 'Super Admin', 'email' => 'super.admin@email.com'],
            ['name' => 'HR Admin', 'email' => 'hr.admin@email.com'],
            ['name' => 'Vault Admin', 'email' => 'vault.admin@email.com'],
            ['name' => 'Account Admin', 'email' => 'account.admin@email.com'],
            ['name' => 'Accountant', 'email' => 'accountant@email.com'],
        ];

        $customerId = 1;

        foreach ($defaultUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'organization_id' => $organization->id,
                    'branch_id' => 1,
                    'customer_id' => $customerId++,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }

        Teller::create([
            'user_id' => 1,
            'branch_id' => $branch->id,
            'code' => 'TLR-' . $branch->id . '-' . str_pad(9999, 3, '0', STR_PAD_LEFT),
            'name' => 'Super Admin',
            'max_cash_limit' => 500000,
            'max_transaction_limit' => 100000,
            'is_active' => true,
        ]);

        $this->command->info('✅ Core admin users created.');

        // -------------------------------
        // 4. Create Tellers per Branch
        // -------------------------------
        foreach ($branches as $branch) {

            // Create 3–5 tellers per branch
            $tellersCount = rand(3, 5);

            for ($i = 1; $i <= $tellersCount; $i++) {

                // Create user for teller
                $user = User::factory()->create([
                    'organization_id' => $organization->id,
                    'branch_id' => $branch->id,
                    'customer_id' => $customerId++,
                ]);

                // Create teller linked to user
                Teller::create([
                    'user_id' => $user->id,
                    'branch_id' => $branch->id,
                    'code' => 'TLR-' . $branch->id . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'name' => $user->name,
                    'max_cash_limit' => 500000,
                    'max_transaction_limit' => 100000,
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('✅ Tellers created for each branch.');

        // -------------------------------
        // 5. Optional: Add Special Roles
        // -------------------------------
        User::firstOrCreate(
            ['email' => 'teller@email.com'],
            [
                'name' => 'Main Teller',
                'organization_id' => $organization->id,
                'branch_id' => $branches->first()->id,
                'customer_id' => $customerId++,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'collector@email.com'],
            [
                'name' => 'Cash Collector',
                'organization_id' => $organization->id,
                'branch_id' => $branches->first()->id,
                'customer_id' => $customerId++,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Additional operational users created.');
    }
}