<?php

namespace Database\Seeders;

use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\Vault;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationStructureSeeder extends Seeder
{
    private array $dhakaBranches = [
        'Dhaka Main Branch',
        'Nodda Branch',
        'Uttara Branch',
        'Mirpur Branch',
        'Mohammadpur Branch',
        'Savar Branch',
        'Shadhonpara Branch',
        'Monipuripara Branch',
        'Narayanganj Branch',
        'Mohakhali Branch',
        'Pagar Branch',
    ];

    public function run(): void
    {
        // 1. Organization (use factory but controlled)
        $organization = Organization::factory()->create([
            'code' => 'ORG001',
            'name' => 'Demo Microfinance Ltd',
            'short_name' => 'DML',
        ]);

        // 2. Branches (use factory but override names)
        $branches = collect($this->dhakaBranches)->map(function ($branchName, $index) use ($organization) {
            return Branch::factory()->create([
                'organization_id' => $organization->id,
                'name' => $branchName,
                'code' => 'BR-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
            ]);
        });

        $this->command->info('✅ Organization with branches created.');

        // -------------------------------
        // 3. Create Vault per Branch
        // -------------------------------
        foreach ($branches as $branch) {
            Vault::firstOrCreate(
                [
                    'branch_id' => $branch->id,
                ],
                [
                    'name' => $branch->name . ' Main Vault',
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('✅ Vault created for each branch.');

        // -------------------------------
        // 4. Default System Users
        // -------------------------------
        $defaultUsers = [
            ['name' => 'Super Admin', 'email' => 'super.admin@email.com'],
        ];

        $mainBranch = $branches->first(); // safer than hardcoding

        foreach ($defaultUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'organization_id' => $organization->id,
                    'branch_id' => $mainBranch->id,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            $roleModels = Role::where('slug', 'system_administrator')->first();

            if ($roleModels) {
                $user->roles()->sync([
                    $roleModels->id,
                ]);
            }

            Teller::firstOrCreate(
                [
                    'user_id' => $user->id,
                ],
                [
                    'branch_id' => $mainBranch->id,
                    'code' => 'TLR-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'name' => $userData['name'],
                    'max_cash_limit' => 500000,
                    'max_transaction_limit' => 100000,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('✅ Core admin users created.');
    }
}